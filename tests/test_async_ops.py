from unittest import TestCase
from unittest.mock import patch

from pogui.lib.async_ops import AsyncListManifests


@patch('pog.fs.pogfs.localfs', autoSpec=True)
@patch('pog.fs.pogfs.b2fs', autoSpec=True)
@patch('pog.fs.pogfs.s3fs', autoSpec=True)
class AsyncListManifestsTest(TestCase):
    def setUp(self):
        pass

    def tearDown(self):
        pass

    def test_it(self, mock_s3, mock_b2, mock_local):
        mock_s3.return_value = mock_s3
        mock_s3.list_files.return_value = ['1.txt', '2.txt', 'path/to/3.txt']

        mock_b2.return_value = mock_b2
        mock_b2.list_files.return_value = ['a.txt', 'b.txt', 'mydir/c.txt']

        mock_local.return_value = mock_local
        mock_local.list_files.return_value = ['foo/', 'bar.txt']

        alm = AsyncListManifests(['s3:foo', 'b2:mybucket', 'kaboom:onoes', 'local'])
        res = alm.wait()

        self.assertEqual(res, [
            {'path': ''},
            {'path': 's3:foo/'},
            {'path': 's3:foo/1.txt'},
            {'path': 's3:foo/2.txt'},
            {'path': 's3:foo/path/'},
            {'path': 's3:foo/path/to/'},
            {'path': 's3:foo/path/to/3.txt'},
            {'path': 'b2:mybucket/'},
            {'path': 'b2:mybucket/a.txt'},
            {'path': 'b2:mybucket/b.txt'},
            {'path': 'b2:mybucket/mydir/'},
            {'path': 'b2:mybucket/mydir/c.txt'},
            {'path': 'local/'},
            {'path': 'local/bar.txt'},
            {'path': 'local/foo/'},
        ])

        mock_s3.assert_called_once_with('foo', root=None)
        mock_s3.list_files.assert_called_once_with(pattern='*.mfn')
        mock_b2.assert_called_once_with('mybucket', root=None)
        mock_b2.list_files.assert_called_once_with(pattern='*.mfn')
        mock_local.assert_called_once_with('', root=None)
        mock_local.list_files.assert_called_once_with(pattern='*.mfn', recursive=True)
