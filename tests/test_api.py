from os.path import join as path_join
from tempfile import TemporaryDirectory
from unittest import TestCase
from unittest.mock import patch, MagicMock

import webview

from pogui.config import Config
from pogui.pogui import Api, load_page_data


@patch('pogui.pogui.window', autoSpec=True)
class ApiTest(TestCase):
    def setUp(self):
        self.tempdir = TemporaryDirectory()
        self.config = Config(path_join(self.tempdir.name, 'config.yml'))
        self.mock_cli = MagicMock()

        patcher = patch('pogui.pogui.AsyncListManifests', autoSpec=True)
        self.mock_async_list = patcher.start()
        self.mock_async_list.return_value = self.mock_async_list
        self.addCleanup(patcher.stop)

        self.api = Api(self.config)
        self.api.cli = self.mock_cli

    def tearDown(self):
        with self.tempdir:
            pass

    def test_list_manifests_on_init(self, mock_window):
        self.mock_async_list.assert_called_once_with(['local'])  # from setUp()
        self.mock_async_list.reset_mock()

        self.config.lpush('fs', 'foobar')
        self.api = Api(self.config)
        self.api.cli = self.mock_cli

        self.mock_async_list.assert_any_call(['foobar', 'local'])

    def test_addFS(self, mock_window):
        res = self.api.addFS(('s3', 'bucket'))
        self.assertEqual(res, ['s3:bucket'])

        res = self.api.addFS(('s3', 'another'))
        self.assertEqual(res, ['s3:another', 's3:bucket'])

    def test_removeFS(self, mock_window):
        res = self.api.removeFS('s3:bucket')
        self.assertEqual(res, [])

        self.api.addFS(('s3', 'bucket'))
        self.api.addFS(('s3', 'another'))
        self.api.addFS(('b2', 'hello'))

        res = self.api.removeFS('s3:bucket')
        self.assertEqual(res, ['b2:hello', 's3:another'])

        res = self.api.removeFS('b2:hello')
        self.assertEqual(res, ['s3:another'])

    def test_listFS(self, mock_window):
        res = self.api.listFS()
        self.assertEqual(res, [])

        self.api.addFS(('s3', 'bucket'))
        res = self.api.listFS()
        self.assertEqual(res, ['s3:bucket'])

        self.api.addFS(('s3', 'two'))
        res = self.api.listFS()
        self.assertEqual(res, ['s3:bucket', 's3:two'])

    def test_updateKeyfilesDir(self, mock_window):
        keyfiles = ['key.encrypt', 'key.decrypt', 'foofile']
        for fn in keyfiles:
            with open(path_join(self.tempdir.name, fn), 'wt'):
                pass
        mock_window.create_file_dialog.return_value = (self.tempdir.name,)

        expected = [
            f'{self.tempdir.name}/{fn}' for fn in sorted(keyfiles)
        ]
        self.assertEqual(self.api.updateKeyfilesDir(), expected)
        self.assertEqual(self.config.get('keyfiles'), expected)
        self.api.cli.set_keyfiles.assert_called_once_with(*expected)

        mock_window.create_file_dialog.assert_called_once_with(webview.FOLDER_DIALOG)

    def test_updateKeyfilesDir_cancel(self, mock_window):
        mock_window.create_file_dialog.return_value = tuple()

        self.assertEqual(self.api.updateKeyfilesDir(), [])
        self.assertEqual(self.config.get('keyfiles'), None)
        self.assertEqual(self.api.cli.set_keyfiles.call_count, 0)
        mock_window.create_file_dialog.assert_called_once_with(webview.FOLDER_DIALOG)

    def test_removeKeyfile(self, mock_window):
        keyfiles = ['key.encrypt', 'key.decrypt', 'foofile']
        self.config['keyfiles'] = keyfiles

        new_keyfiles = ['key.decrypt', 'key.encrypt']
        self.assertEqual(self.api.removeKeyfile('foofile'), new_keyfiles)
        self.assertEqual(self.config.get('keyfiles'), new_keyfiles)
        self.api.cli.set_keyfiles.assert_called_once_with(*new_keyfiles)

    def test_zoom(self, mock_window):
        self.assertEqual(self.api.zoom(), 100)

        self.config['zoom'] = 150
        self.assertEqual(self.api.zoom(), 150)

    def test_zoomChange(self, mock_window):
        self.assertEqual(self.api.zoomChange(10), 110)  # from default
        self.assertEqual(self.api.zoomChange(10), 120)
        self.assertEqual(self.api.zoomChange(10), 130)
        self.assertEqual(self.api.zoomChange(-10), 120)
        self.assertEqual(self.api.zoomChange(-20), 100)
        self.assertEqual(self.api.zoomChange(-10), 90)
        self.assertEqual(self.config.get('zoom'), 90)

    def test_zoomReset(self, mock_window):
        self.config['zoom'] = 150
        self.assertEqual(self.api.zoomReset(), 100)
        self.assertEqual(self.config.get('zoom'), None)

    def test_waitForManifests(self, mock_window):
        # part of the startup routine. Expects AsyncListManifests to be running
        self.mock_async_list.wait.return_value = ['foo', 'bar']

        self.assertEqual(self.api.waitForManifests(), ['foo', 'bar'])
        self.mock_async_list.wait.assert_called_once_with()

    def test_listManifests(self, mock_window):
        self.mock_async_list.reset_mock()
        self.mock_async_list.wait.return_value = ['foo', 'bar']
        self.config.lpush('fs', 'foobar')

        self.assertEqual(self.api.listManifests(), ['foo', 'bar'])
        self.mock_async_list.assert_called_once_with(['foobar', 'local'])
        self.mock_async_list.wait.assert_called_once_with()

    def test_scanManifest(self, mock_window):
        self.api.cli.dumpManifest.return_value = {'path/foo/a.txt': ['blobA', 'blobB']}

        res = self.api.scanManifest('s3:bucket/my.mfn')
        self.assertEqual(res, [
            {'path': ''},
            {'path': 'path/'},
            {'path': 'path/foo/'},
            {'extra_details': 'blobA, blobB', 'num_blobs': 2, 'path': 'path/foo/a.txt'},
        ])
        self.api.cli.dumpManifest.assert_called_once_with('s3://bucket/my.mfn')

    @patch('pogui.pogui.system_open_folder', autospec=True)
    def test__backgroundProgress(self, mock_system_open, mock_window):
        progress_iter = [{'current': 1, 'total': 1, 'filename': 'foobar'}]

        self.api._backgroundProgress(progress_iter, 'download.mfn', dest_path='/home')

        mock_window.evaluate_js.assert_called_once_with("ProgressBar.update('download.mfn', '100.00%');")
        mock_system_open.assert_called_once_with('/home')

    @patch('pogui.pogui.system_open_folder', autospec=True)
    def test__backgroundProgress_upload(self, mock_system_open, mock_window):
        progress_iter = [{'current': 1, 'total': 2, 'filename': 'foobar'}]

        self.api._backgroundProgress(progress_iter, 'upload-1',)

        mock_window.evaluate_js.assert_called_once_with("ProgressBar.update('upload-1', '50.00%');")
        self.assertEqual(mock_system_open.call_count, 0)

    @patch('pogui.pogui.Thread', autospec=True)
    def test_downloadArchive(self, mock_thread, mock_window):
        mock_window.create_file_dialog.return_value = ('/home/user/',)
        self.api.cli.decrypt.return_value = iter([
            {'current': 1, 'total': 2, 'filename': 'foo'},
            {'current': 2, 'total': 2, 'filename': 'bar'},
        ])

        res = self.api.downloadArchive('s3:bucket/dir/file.mfn')
        self.assertEqual(res, {'current': 1, 'total': 2, 'filename': 'foo'})
        mock_thread.assert_called_once_with(target=self.api._backgroundProgress, kwargs={
            'status_iter': self.api.cli.decrypt.return_value,
            'mfn': 's3:bucket/dir/file.mfn',
            'dest_path': '/home/user/',
        })

        mock_window.create_file_dialog.assert_called_once_with(webview.FOLDER_DIALOG)
        self.api.cli.decrypt.assert_called_once_with('s3://bucket/dir/file.mfn', cwd='/home/user/')

    @patch('pogui.pogui.Thread', autospec=True)
    def test_downloadArchive_cancel(self, mock_thread, mock_window):
        mock_window.create_file_dialog.return_value = tuple()

        res = self.api.downloadArchive('s3:bucket/dir/file.mfn')
        self.assertEqual(res, None)
        self.assertEqual(mock_thread.call_count, 0)

        mock_window.create_file_dialog.assert_called_once_with(webview.FOLDER_DIALOG)
        self.assertEqual(self.api.cli.decrypt.call_count, 0)

    @patch('pogui.pogui.Thread', autospec=True)
    def test_createArchive(self, mock_thread, mock_window):
        self.api.cli.encrypt.return_value = iter([
            {'current': 1, 'total': 2, 'filename': 'foo'},
            {'current': 2, 'total': 2, 'filename': 'bar'},
        ])

        res = self.api.createArchive((['foo', 'bar'], ['s3:bucket1', 'b2:bucket2']))
        self.assertEqual(res, {'current': 1, 'total': 2, 'filename': 'foo'})

        mock_thread.assert_called_once_with(target=self.api._backgroundProgress, kwargs={
            'status_iter': self.api.cli.encrypt.return_value,
            'mfn': 'create-archive',
        })

    def test_getLocalFolders(self, mock_window):
        mock_window.create_file_dialog.return_value = ['foo', 'bar']

        self.assertEqual(self.api.getLocalFolders(), ['foo', 'bar'])
        mock_window.create_file_dialog.assert_called_once_with(webview.FOLDER_DIALOG, allow_multiple=True)

    def test_getLocalFiles(self, mock_window):
        mock_window.create_file_dialog.return_value = ['foo', 'bar']

        self.assertEqual(self.api.getLocalFiles(), ['foo', 'bar'])
        mock_window.create_file_dialog.assert_called_once_with(webview.OPEN_DIALOG, allow_multiple=True)

    @patch('pogui.pogui.on_closed', autospec=True)
    def test_emergencyExit(self, mock_on_closed, mock_window):
        self.api.emergencyExit()
        mock_on_closed.assert_called_once_with()

    def test_load_page_data(self, mock_window):
        '''
        JS we feed into the page on startup
        '''
        load_page_data(mock_window)

        mock_window.evaluate_js.assert_any_call('Page.pyinit("waitForManifests");')
        mock_window.evaluate_js.assert_any_call('Page.pyinit("listFS");')
        mock_window.evaluate_js.assert_any_call('Page.pyinit("listKeyfiles");')
