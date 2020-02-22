from os.path import dirname


def _dirname(path):
    if path.endswith('/'):
        path = path[:-1]
    path = dirname(path)
    if not path or path == '/':
        return path
    else:
        return path + '/'


def backfill_parent_dirs(paths):
    paths = list(paths)
    all_paths = set(paths)
    for p in paths:
        while p and p != '/':
            p = _dirname(p)
            if p in all_paths:
                break
            all_paths.add(p)
    return sorted(all_paths)


def split_fs_path(full_url):
    url_tokens = full_url.split('/', 1)
    path = url_tokens[1] if len(url_tokens) > 1 else None

    fs_tokens = url_tokens[0].split(':', 1)
    fs = fs_tokens[0]
    bucket = fs_tokens[1] if len(fs_tokens) > 1 else ''
    return fs, bucket, path


def join_fs_path(fs, bucket, path):
    full = f'{fs}://{bucket}/'
    if path:
        full += f'{path}'
    return full
