import json
from collections import defaultdict
from glob import iglob
from os.path import join as path_join, isdir, dirname, basename
from subprocess import STDOUT

import webview

from pog.cli import PogCli
from pog.fs.pogfs import get_cloud_fs

"""
An example of serverless app architecture
"""
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
    all_paths = set(paths)
    for p in paths:
        while p:
            p = _dirname(p)
            if p in all_paths:
                break
            all_paths.add(p)
    return sorted(all_paths)


class Config():
    DEFAULT_PATH = '.pogui.cfg'

    def __init__(self, path=None):
        self.path = path or self.DEFAULT_PATH
        self.content = {}
        self.load()

    def load(self):
        try:
            with open(self.path, 'rt') as f:
                self.content = json.load(f)
        except FileNotFoundError:
            pass
        return self

    def save(self):
        with open(self.path, 'wt') as f:
            json.dump(self.content, f)

    def __setitem__(self, key, value):
        self.content[key] = value
        self.save()

    def __getitem__(self, key):
        return self.content.get(key)


# can also do window.evaluate_js('Page.doThing({})')
class Api():
    def __init__(self):
        self.cli = PogCli(kwargs={'stderr': STDOUT})
        self.config = Config()
        self.cli.set_keyfiles(self.config['keyfiles'])

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
        where = where or "test"
        fs = get_cloud_fs(where)()

        all_files = backfill_parent_dirs(fs.list_files(recursive=True))
        res = [{'path': f} for f in all_files]
        return res

    def scanManifest(self, mfn):
        blobs = self.cli.dumpManifest(mfn)
        paths = backfill_parent_dirs(blobs.keys())
        return [{'path': p, 'blobs': blobs.get(p)} for p in paths]

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

    def getManifestFiles(self, __):
        print("Getting dem manifests {}".format(__))
        file_types = ('Pog Manifest Files (*.mfn)',)
        result = window.create_file_dialog(webview.OPEN_DIALOG, allow_multiple=True, file_types=file_types)

        print("got {}".format(result))
        mfninfo = {}
        for mfn in result:
            mfninfo[mfn] = self.cli.dumpManifest(mfn)
        print('send it: {}'.format(mfninfo))
        return mfninfo

    def dragDrop(self, mfn):
        print('dragDrop mfn %s' % mfn)

    def editItem(self, item):
        print('Edited item %s' % item)

    def toggleItem(self, item):
        print('Toggled item %s' % item)

    def toggleFullscreen(self, param):
        webview.windows[0].toggle_fullscreen()


def load_page_data(window):
    window.evaluate_js(
        r"""
        Page.pyinit();
        """
    )


def main():
    global window
    api = Api()
    window = webview.create_window('PogUI', 'web/index.html', js_api=api, min_size=(600, 450), text_select=True)
    webview.start(load_page_data, window)


if __name__ == '__main__':
    main()
