from os.path import join as path_join
from tempfile import TemporaryDirectory
from unittest import TestCase
from unittest.mock import patch, MagicMock

from pogui.pogui import Api
from pogui.config import Config


@patch('pogui.pogui.window', autoSpec=True)
@patch('pogui.pogui.AsyncListManifests', autoSpec=True)
class ApiTest(TestCase):
    def setUp(self):
        self.tempdir = TemporaryDirectory()
        self.config = Config(path_join(self.tempdir.name, 'config.yml'))
        self.mock_cli = MagicMock()

    def test_list_manifests_on_init(self, mock_async_list, mock_window):
        mock_async_list.return_value = mock_async_list

        self.config.lpush('fs', 'foobar')
        self.api = Api(self.config)
        self.api.cli = self.mock_cli

        mock_async_list.assert_called_once_with(['foobar', 'local'])
