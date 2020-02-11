import itertools
import yaml
from multiprocessing.dummy import Pool as ThreadPool
from glob import iglob
from os.path import join as path_join, isdir, dirname

import webview

from pog.cli import PogCli
from pog.fs.pogfs import get_cloud_fs


window = None


def _dirname(path):
    if path.endswith('/'):
        path = path[:-1]
    path = dirname(path)
    if not path or path == '/':
        return path
    else:
        return path + '/'


def backfill_parent_dirs(paths):
    paths = list(paths)
    all_paths = set(paths)
    for p in paths:
        while p:
            p = _dirname(p)
            if p in all_paths:
                break
            all_paths.add(p)
    return sorted(all_paths)


class Config():
    DEFAULT_PATH = '.pogui.yml'

    def __init__(self, path=None):
        self.path = path or self.DEFAULT_PATH
        self.content = {}
        self.load()

    def load(self):
        try:
            with open(self.path, 'rt') as f:
                self.content = yaml.safe_load(f)
        except FileNotFoundError:
            pass
        return self

    def save(self):
        with open(self.path, 'wt') as f:
            yaml.dump(self.content, f)

    def __setitem__(self, key, value):
        self.content[key] = value
        self.save()

    def get(self, key, default=None):
        return self.content.get(key) or default

    def spush(self, key, elem):
        current = self.get(key, [])
        self[key] = current + [elem]

    def spop(self, key, elem):
        current = self.get(key, [])
        current.remove(elem)
        self[key] = current


def split_fs_path(full_url):
    url_tokens = full_url.split('/', 1)
    path = url_tokens[1] if len(url_tokens) > 1 else None

    fs_tokens = url_tokens[0].split(':', 1)
    fs = fs_tokens[0]
    bucket = fs_tokens[1] if len(fs_tokens) > 1 else ''
    return fs, bucket, path


def join_fs_path(fs, bucket, path):
    full = f'{fs}://{bucket}/'
    if path:
        full += f'{path}'
    return full


class ListManifests():
    def __init__(self, locations):
        self.total = []
        self.pool = ThreadPool(4)
        self.waiter = self.pool.map_async(self._list_manifests, locations, callback=self._collect_result)

    def _list_manifests(self, loc):
        print('list manifests {}'.format(loc))
        fs_name, bucket, path = split_fs_path(loc)
        fs = get_cloud_fs(fs_name)(bucket, root=path)
        kw = {'recursive': True} if fs_name == 'local' else {}

        all_files = backfill_parent_dirs(fs.list_files(pattern='*.mfn', **kw))
        return [{'path': f'{loc}/{filename}'} for filename in all_files]

    def _collect_result(self, res):
        self.total = list(itertools.chain(*res))

    def wait(self):
        self.waiter.wait()
        self.pool.close()
        self.pool.join()
        return self.total


# can also do window.evaluate_js('Page.doThing({})')
class Api():
    def __init__(self):
        self.cli = PogCli()
        self.config = Config()
        self.cli.set_keyfiles(self.config.get('keyfiles'))
        self._refresh_list_manifests()

    def _refresh_list_manifests(self):
        locations = self.config.get('fs', []) + ['local']
        self.list_manifests = ListManifests(locations)

    def addFS(self, params):
        fs_name, bucket = params
        fs_path = '{}:{}'.format(fs_name.lower(), bucket)
        self.config.spush('fs', fs_path)
        return self.listFS()

    def removeFS(self, fs_path):
        self.config.spop('fs', fs_path)
        return self.listFS()

    def listFS(self, __=None):
        return sorted(self.config.get('fs', []))

    def updateKeyFilesDir(self, __):
        print("Getting dem keyfiles {}".format(__))
        path = window.create_file_dialog(webview.FOLDER_DIALOG)
        print("got {}".format(path))
        if path:
            path = path[0]

        keyfiles = []
        for f in iglob(path_join(path, '*.encrypt')):
            keyfiles.append(f)
        for f in iglob(path_join(path, '*.decrypt')):
            keyfiles.append(f)
        for f in iglob(path_join(path, '*.keyfile')):
            keyfiles.append(f)

        self.config['keyfiles'] = keyfiles
        self.cli.set_keyfiles(keyfiles)

        return keyfiles

    def scanFiles(self, where=None):
        where = where or "local"
        fs = get_cloud_fs(where)()

        all_files = backfill_parent_dirs(fs.list_files(recursive=True))
        res = [{'path': f} for f in all_files]
        return res

    def listManifests(self, __=None):
        self._refresh_list_manifests()
        return self.waitForManifests()

    def waitForManifests(self, __=None):
        return self.list_manifests.wait()

    def scanManifest(self, mfn):
        fs_name, bucket, path = split_fs_path(mfn)
        mfn = join_fs_path(fs_name, bucket, path)

        blobs = self.cli.dumpManifest(mfn)
        paths = backfill_parent_dirs(blobs.keys())
        return [{'path': p, 'blobs': blobs.get(p)} for p in paths]

    def downloadArchive(self, mfn):
        fs_name, bucket, path = split_fs_path(mfn)
        mfn = join_fs_path(fs_name, bucket, path)

        path = window.create_file_dialog(webview.FOLDER_DIALOG)[0]
        if not path:
            return False

        print('downloadin {} to {}'.format(mfn, path))
        list(self.cli.decrypt(mfn, cwd=path))
        return True

    def downloadFile(self, mfn, filename):
        print('download {} {}'.format(mfn, filename))
        return True

    def getFiles(self, __):
        print("Getting dem files {}".format(__))
        paths = window.create_file_dialog(webview.FOLDER_DIALOG, allow_multiple=True)

        dirs = []
        files = []
        for p in paths:
            for f in iglob(path_join(p, '*')):
                if isdir(f):
                    dirs.append('{}/'.format(f))
                else:
                    files.append(f)

        print("got {}".format(files))
        return sorted(dirs) + sorted(files)

    def dragDrop(self, mfn):
        print('dragDrop mfn %s' % mfn)

    def editItem(self, item):
        print('Edited item %s' % item)

    def toggleItem(self, item):
        print('Toggled item %s' % item)

    def toggleFullscreen(self, param):
        webview.windows[0].toggle_fullscreen()

    def emergencyExit(self, url):
        print('emergency exit -- tried to navigate elsewhere!')
        import os
        os._exit(1)


def load_page_data(window):
    startups = [
        'waitForManifests',
        'listFS',
    ]
    for fun in startups:
        js = 'Page.pyinit("{}");'.format(fun)
        window.evaluate_js(js)


def main():
    global window
    api = Api()
    window = webview.create_window('PogUI', 'web/index.html', js_api=api, min_size=(600, 450), text_select=True)
    webview.start(load_page_data, window, debug=True)


if __name__ == '__main__':
    main()
