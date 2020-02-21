import yaml


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

    def unset(self, key):
        self.content.pop(key, None)
        self.save()

    def lpush(self, key, elem):
        current = set(self.get(key, []))
        current.add(elem)
        self[key] = sorted(current)

    def lpop(self, key, elem):
        current = set(self.get(key, []))
        current.discard(elem)
        self[key] = sorted(current)
