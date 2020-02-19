from unittest import TestCase

from pogui.lib.path_tools import backfill_parent_dirs, split_fs_path, join_fs_path


class PathToolsTest(TestCase):
    maxDiff = None

    def setUp(self):
        pass

    def tearDown(self):
        pass

    def test_backfill_parent_dirs(self):
        ''' rather than ask JS to figure out parent directories, we precompute all of them '''
        res = backfill_parent_dirs([
            'long/path/to/file/with/lots/of/directories/hi.txt',
        ])
        self.assertEqual(res, [
            '',
            'long/',
            'long/path/',
            'long/path/to/',
            'long/path/to/file/',
            'long/path/to/file/with/',
            'long/path/to/file/with/lots/',
            'long/path/to/file/with/lots/of/',
            'long/path/to/file/with/lots/of/directories/',
            'long/path/to/file/with/lots/of/directories/hi.txt',
        ])

        res = backfill_parent_dirs([
            'long/path/to/file/with/lots/of/directories/hi.txt',
            'long/path/to/file/fork/bye.txt',
        ])
        self.assertEqual(res, [
            '',
            'long/',
            'long/path/',
            'long/path/to/',
            'long/path/to/file/',
            'long/path/to/file/fork/',
            'long/path/to/file/fork/bye.txt',
            'long/path/to/file/with/',
            'long/path/to/file/with/lots/',
            'long/path/to/file/with/lots/of/',
            'long/path/to/file/with/lots/of/directories/',
            'long/path/to/file/with/lots/of/directories/hi.txt'
        ], res)

        res = backfill_parent_dirs([
            'foo',
            'bar/hello',
        ])
        self.assertEqual(res, ['', 'bar/', 'bar/hello', 'foo'])

        # this one still needs some work
        res = backfill_parent_dirs([
            '/my/directory/',
        ])
        self.assertEqual(res, [
            '',
            '/',
            '/my/',
            '/my/directory/'
        ])

    def test_split_fs_path(self):
        fs, bucket, path = split_fs_path('s3:bucket')
        self.assertEqual((fs, bucket, path), ('s3', 'bucket', None))

        self.assertEqual(split_fs_path('s3:foo'), ('s3', 'foo', None))
        self.assertEqual(split_fs_path('b2:bar'), ('b2', 'bar', None))

        self.assertEqual(split_fs_path('local'), ('local', '', None))
        self.assertEqual(split_fs_path('local:/home/foo'), ('local', '', 'home/foo'))

    def test_join_fs_path(self):
        fs, bucket, path = split_fs_path('s3:foo')
        self.assertEqual(join_fs_path(fs, bucket, path), 's3://foo/')

        cases = {
            's3:bar': 's3://bar/',
            'b2:bucket': 'b2://bucket/',
            'local': 'local:///',
            'local:/root': 'local:///root',
        }
        for i, o in cases.items():
            self.assertEqual(join_fs_path(*split_fs_path(i)), o)
