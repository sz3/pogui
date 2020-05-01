import webbrowser
from glob import iglob
from os.path import join as path_join, abspath, dirname
from threading import Thread

import webview
from pog.cli import PogCli
from pog.fs.pogfs import get_cloud_fs

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


def blob_details(path, blobs):
    if not path or path.endswith('/'):
        return {}
    blobs = blobs or []
    shortened = [name[:10] + '…' if len(name) > 10 else name for name in blobs]
    return {
        'num_blobs': len(blobs),
        'extra_details': ', '.join(shortened),
    }


class Api():
    def __init__(self, config):
        self.config = config
        self._refresh_list_manifests()
        self._progress_count = 0

    def _cli(self):
        cli = PogCli()
        cli.set_keyfiles(*self.config.get('keyfiles', []))
        return cli

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

    def updateKeyfilesDir(self, __=None):
        path = window.create_file_dialog(webview.FOLDER_DIALOG)
        if not path:
            return self.listKeyfiles()
        path = path[0]

        keyfiles = sorted([f for f in iglob(path_join(path, '*'))])
        self.config['keyfiles'] = keyfiles
        return keyfiles

    def removeKeyfile(self, path):
        self.config.lpop('keyfiles', path)
        return self.listKeyfiles()

    def listKeyfiles(self, __=None):
        return self.config.get('keyfiles', [])

    def zoom(self, __=None):
        return self.config.get('zoom', 100)

    def zoomChange(self, amount):
        new_zoom = self.zoom() + amount;
        self.config['zoom'] = new_zoom
        return new_zoom

    def zoomReset(self, __=None):
        self.config.unset('zoom')
        return self.zoom()

    def listManifests(self, __=None):
        self._refresh_list_manifests()
        return self.waitForManifests()

    def waitForManifests(self, __=None):
        return self.list_manifests.wait()

    def scanManifest(self, mfn):
        fs_name, bucket, path = split_fs_path(mfn)
        mfn = join_fs_path(fs_name, bucket, path)

        blobs = self._cli().dumpManifest(mfn)
        paths = backfill_parent_dirs(blobs.keys())
        return [{'path': p, **blob_details(p, blobs.get(p))} for p in paths]

    def _backgroundProgress(self, status_iter, progress_id, dest_path=None):
        for info in status_iter:
            # need to snapshot these better
            percent = info['current'] * 100 / info['total']
            window.evaluate_js("ProgressBar.update('{}', '{:.2f}%');".format(progress_id, percent))

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

        cli = self._cli()
        status_iter = cli.decrypt(real_mfn_path, cwd=path)
        first_chunk = next(status_iter)

        self._progress_count += 1
        progress_id = f'{mfn}.{self._progress_count}'
        Thread(
            target=self._backgroundProgress,
            kwargs={'status_iter': status_iter, 'progress_id': progress_id, 'dest_path': path}
        ).start()

        first_chunk['progress_id'] = progress_id
        return first_chunk

    def downloadFile(self, params):
        mfn, filename = params
        print('download {} {}'.format(mfn, filename))
        return True

    def deleteArchive(self, mfn):
        print('remove {}'.format(mfn))
        fs_name, bucket, path = split_fs_path(mfn)
        fs = get_cloud_fs(fs_name)(bucket)
        fs.remove_file(path)
        return True

    def createArchive(self, params):
        paths, destinations = params
        cli = self._cli()
        status_iter = cli.encrypt(paths, destinations)
        first_chunk = next(status_iter)

        self._progress_count += 1
        progress_id = f'NewArchive.{self._progress_count}'
        Thread(
            target=self._backgroundProgress,
            kwargs={'status_iter': status_iter, 'progress_id': progress_id}
        ).start()

        first_chunk['progress_id'] = progress_id
        return first_chunk

    def getLocalFolders(self, __=None):
        folder_paths = window.create_file_dialog(webview.FOLDER_DIALOG, allow_multiple=True)
        return folder_paths

    def getLocalFiles(self, __=None):
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
        'zoom',
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
