from os.path import join as path_join
from tempfile import TemporaryDirectory
from unittest import TestCase
from unittest.mock import patch, MagicMock

import webview

from pogui.pogui import Api
from pogui.config import Config


@patch('pogui.pogui.window', autoSpec=True)
@patch('pogui.pogui.AsyncListManifests', autoSpec=True)
class ApiTest(TestCase):
    def setUp(self):
        self.tempdir = TemporaryDirectory()
        self.config = Config(path_join(self.tempdir.name, 'config.yml'))
        self.mock_cli = MagicMock()

        self.api = Api(self.config)
        self.api.cli = self.mock_cli

    def tearDown(self):
        with self.tempdir:
            pass

    def test_list_manifests_on_init(self, mock_async_list, mock_window):
        mock_async_list.return_value = mock_async_list

        self.config.lpush('fs', 'foobar')
        self.api = Api(self.config)
        self.api.cli = self.mock_cli

        mock_async_list.assert_called_once_with(['foobar', 'local'])

    def test_addFS(self, mock_async_list, mock_window):
        res = self.api.addFS(('s3', 'bucket'))
        self.assertEqual(res, ['s3:bucket'])

        res = self.api.addFS(('s3', 'another'))
        self.assertEqual(res, ['s3:another', 's3:bucket'])

    def test_removeFS(self, mock_async_list, mock_window):
        res = self.api.removeFS('s3:bucket')
        self.assertEqual(res, [])

        self.api.addFS(('s3', 'bucket'))
        self.api.addFS(('s3', 'another'))
        self.api.addFS(('b2', 'hello'))

        res = self.api.removeFS('s3:bucket')
        self.assertEqual(res, ['b2:hello', 's3:another'])

        res = self.api.removeFS('b2:hello')
        self.assertEqual(res, ['s3:another'])

    def test_listFS(self, mock_async_list, mock_window):
        res = self.api.listFS()
        self.assertEqual(res, [])

        self.api.addFS(('s3', 'bucket'))
        res = self.api.listFS()
        self.assertEqual(res, ['s3:bucket'])

        self.api.addFS(('s3', 'two'))
        res = self.api.listFS()
        self.assertEqual(res, ['s3:bucket', 's3:two'])

    def test_updateKeyfilesDir(self, mock_async_list, mock_window):
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

    def test_updateKeyfilesDir_cancel(self, mock_async_list, mock_window):
        mock_window.create_file_dialog.return_value = tuple()

        self.assertEqual(self.api.updateKeyfilesDir(), [])
        self.assertEqual(self.config.get('keyfiles'), None)
        self.assertEqual(self.api.cli.set_keyfiles.call_count, 0)
        mock_window.create_file_dialog.assert_called_once_with(webview.FOLDER_DIALOG)

    def test_removeKeyfile(self, mock_async_list, mock_window):
        keyfiles = ['key.encrypt', 'key.decrypt', 'foofile']
        self.config['keyfiles'] = keyfiles

        new_keyfiles = ['key.decrypt', 'key.encrypt']
        self.assertEqual(self.api.removeKeyfile('foofile'), new_keyfiles)
        self.assertEqual(self.config.get('keyfiles'), new_keyfiles)
        self.api.cli.set_keyfiles.assert_called_once_with(*new_keyfiles)
