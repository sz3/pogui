from os.path import join as path_join
from tempfile import TemporaryDirectory
from unittest import TestCase

from pogui.config import Config


class ConfigTest(TestCase):
    def setUp(self):
        self.tempdir = TemporaryDirectory()
        self.config_path = path_join(self.tempdir.name, 'config.yaml')

    def tearDown(self):
        with self.tempdir:
            pass

    def test_save_load(self):
        conf = Config(self.config_path)
        self.assertEqual(conf.get('foo'), None)
        self.assertEqual(conf.get('foo', []), [])

        # autosave
        conf['foo'] = 'hello'
        conf['bar'] = True
        conf['number'] = 4

        # autoload on init
        another = Config(self.config_path)
        self.assertEqual(another.get('foo'), 'hello')
        self.assertEqual(another.get('bar'), True)
        self.assertEqual(another.get('number'), 4)

        another['new'] = ['hello']
        another['number'] = 52

        # manual load
        self.assertEqual(conf.get('new'), None)
        conf.load()
        self.assertEqual(conf.get('new'), ['hello'])
        self.assertEqual(conf.get('number'), 52)

    def test_list_ops(self):
        '''
        no dups -- so basically a set
        '''
        conf = Config(self.config_path)
        self.assertEqual(conf.get('list', []), [])

        conf.lpush('list', 'foo')
        conf.lpush('list', 'bar')
        conf.lpush('list', 'zzz')

        another = Config(self.config_path)
        self.assertEqual(another.get('list'), ['bar', 'foo', 'zzz'])

        conf.lpop('list', 'bar')
        conf.lpop('list', 'nothing')

        another.load()
        self.assertEqual(another.get('list'), ['foo', 'zzz'])
