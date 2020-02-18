import itertools
import webbrowser
import yaml
from multiprocessing.dummy import Pool as ThreadPool
from threading import Thread
from glob import iglob
from os.path import join as path_join, abspath, dirname

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


def blob_details(blobs):
    blobs = blobs or []
    shortened = [name[:10] + '…' if len(name) > 10 else name for name in blobs]
    return {
        'num_blobs': len(blobs),
        'extra_details': ', '.join(shortened),
    }


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


def system_open_folder(path):
    # https://stackoverflow.com/questions/6631299/python-opening-a-folder-in-explorer-nautilus-mac-thingie/16204023
    webbrowser.open(abspath(path))


class ListManifests():
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

    def wait(self):
        self.waiter.wait()
        self.pool.close()
        self.pool.join()
        return self.total


# can also do window.evaluate_js('Page.doThing({})')
class Api():
    def __init__(self, config):
        self.cli = PogCli()
        self.config = config
        self.cli.set_keyfiles(*self.config.get('keyfiles', []))
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

    def updateKeyFilesDir(self, __=None):
        print("Getting dem keyfiles {}".format(__))
        path = window.create_file_dialog(webview.FOLDER_DIALOG)
        if not path:
            return self.listKeyfiles()
        path = path[0]

        keyfiles = []
        for f in iglob(path_join(path, '*.encrypt')):
            keyfiles.append(f)
        for f in iglob(path_join(path, '*.decrypt')):
            keyfiles.append(f)
        for f in iglob(path_join(path, '*.keyfile')):
            keyfiles.append(f)

        self.config['keyfiles'] = keyfiles
        self.cli.set_keyfiles(*keyfiles)

        return keyfiles

    def removeKeyfile(self, path):
        self.config.spop('keyfiles', path)
        return self.listKeyfiles()

    def listKeyfiles(self, __=None):
        return self.config.get('keyfiles', [])

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
        return [{'path': p, **blob_details(blobs.get(p))} for p in paths]

    def _backgroundProgress(self, status_iter, mfn, dest_path=None):
        for info in status_iter:
            # need to snapshot these better
            percent = info['current'] * 100 / info['total']
            print('giving {} to window'.format(info))
            window.evaluate_js("ProgressBar.update('{}', '{:.2f}%');".format(mfn, percent))

        if dest_path:
            system_open_folder(dest_path)

    def downloadArchive(self, mfn):
        fs_name, bucket, path = split_fs_path(mfn)
        if fs_name == 'local' and path:
            path = abspath(path)
        real_mfn_path = join_fs_path(fs_name, bucket, path)

        path = window.create_file_dialog(webview.FOLDER_DIALOG)
        if not path:
            return None
        path = path[0]

        status_iter = self.cli.decrypt(real_mfn_path, cwd=path)
        first_chunk = next(status_iter)
        Thread(
            target=self._backgroundProgress,
            kwargs={'status_iter': status_iter, 'mfn': mfn, 'dest_path': path}
        ).start()
        return first_chunk

    def downloadFile(self, params):
        mfn, filename = params
        print('download {} {}'.format(mfn, filename))
        return True

    def createArchive(self, params):
        paths, destinations = params
        status_iter = self.cli.encrypt(paths, destinations)
        first_chunk = next(status_iter)
        Thread(
            target=self._backgroundProgress,
            kwargs={'status_iter': status_iter, 'mfn': 'create-archive'}
        ).start()
        return first_chunk

    def getLocalFolders(self, __):
        folder_paths = window.create_file_dialog(webview.FOLDER_DIALOG, allow_multiple=True)
        return folder_paths

    def getLocalFiles(self, __):
        file_paths = window.create_file_dialog(webview.OPEN_DIALOG, allow_multiple=True)
        return file_paths

    def dragDrop(self, mfn):
        print('dragDrop mfn %s' % mfn)

    def emergencyExit(self, url=None):
        print('emergency exit -- tried to navigate elsewhere!')
        on_closed()


def on_closed():
    # workaround: sometimes pywebview doesn't close the parent app when the window is closed
    import os
    os._exit(1)


def load_page_data(window):
    startups = [
        'waitForManifests',
        'listFS',
        'listKeyfiles',
    ]
    for fun in startups:
        js = 'Page.pyinit("{}");'.format(fun)
        window.evaluate_js(js)


def main():
    global window
    config = Config()
    api = Api(config)
    index_html = path_join(dirname(abspath(__file__)), 'web', 'index.html')
    window = webview.create_window('PogUI', index_html, js_api=api, min_size=(600, 450), text_select=True)
    window.closed += on_closed
    webview.start(load_page_data, window, debug=config.get('debug', False))


if __name__ == '__main__':
    main()
