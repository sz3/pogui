import webbrowser
from glob import iglob
from os.path import join as path_join, abspath, dirname
from threading import Thread

import webview
from pog.cli import PogCli

from pogui.config import Config
from pogui.lib.async_ops import AsyncListManifests
from pogui.lib.path_tools import backfill_parent_dirs, split_fs_path, join_fs_path


INDEX_HTML = path_join(dirname(abspath(__file__)), 'web', 'index.html')
window = None


def system_open_folder(path):
    # https://stackoverflow.com/questions/6631299/python-opening-a-folder-in-explorer-nautilus-mac-thingie/16204023
    webbrowser.open(abspath(path))


def on_closed():
    # workaround: sometimes pywebview doesn't close the parent app when the window is closed
    import os
    os._exit(1)


def blob_details(blobs):
    blobs = blobs or []
    shortened = [name[:10] + '…' if len(name) > 10 else name for name in blobs]
    return {
        'num_blobs': len(blobs),
        'extra_details': ', '.join(shortened),
    }


class Api():
    def __init__(self, config):
        self.cli = PogCli()
        self.config = config
        self.cli.set_keyfiles(*self.config.get('keyfiles', []))
        self._refresh_list_manifests()

    def _refresh_list_manifests(self):
        locations = self.config.get('fs', []) + ['local']
        self.list_manifests = AsyncListManifests(locations)

    def addFS(self, params):
        fs_name, bucket = params
        fs_path = '{}:{}'.format(fs_name.lower(), bucket)
        self.config.lpush('fs', fs_path)
        return self.listFS()

    def removeFS(self, fs_path):
        self.config.lpop('fs', fs_path)
        return self.listFS()

    def listFS(self, __=None):
        return self.config.get('fs', [])

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
        self.config.lpop('keyfiles', path)
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

    window = webview.create_window('PogUI', INDEX_HTML, js_api=api, min_size=(600, 450), text_select=True)
    window.closed += on_closed
    webview.start(load_page_data, window, debug=config.get('debug', False))


if __name__ == '__main__':
    main()
