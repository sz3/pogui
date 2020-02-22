import itertools
from multiprocessing.dummy import Pool as ThreadPool

from pog.fs.pogfs import get_cloud_fs

from pogui.lib.path_tools import backfill_parent_dirs, split_fs_path


class AsyncListManifests():
    def __init__(self, locations):
        self.total = []
        self.pool = ThreadPool(4)
        self.waiter = self.pool.map_async(self._list_manifests, locations, callback=self._collect_result)

    def _list_manifests(self, loc):
        print('list manifests {}'.format(loc))
        fs_name, bucket, path = split_fs_path(loc)
        try:
            fs = get_cloud_fs(fs_name)(bucket, root=path)
            kw = {'recursive': True} if fs_name == 'local' else {}
            all_files = backfill_parent_dirs(fs.list_files(pattern='*.mfn', **kw))
        except Exception as e:
            print('ListManifests failed for {} -- {}'.format(loc, str(e)))
            return []
        return [{'path': f'{loc}/{filename}'} for filename in all_files]

    def _collect_result(self, res):
        self.total = list(itertools.chain(*res))
        if self.total:
            self.total = [{'path': ''}] + self.total

    def wait(self):
        self.waiter.wait()
        self.pool.close()
        self.pool.join()
        return self.total