from os import path
from setuptools import setup, find_packages


here = path.abspath(path.dirname(__file__))
with open(path.join(here, 'README.md'), encoding='utf-8') as f:
    long_description = f.read()

setup(
    name='pogui',
    license='MIT',
    url='https://github.com/sz3/pogui',
    version='0.0.4',

    entry_points={
        'console_scripts': [
            'pogui = pogui.pogui:main',
        ],
    },

    packages=find_packages(exclude=('tests',)),
    package_data={
        'pogui': ['web/*.js', 'web/*.css', 'web/*.html', 'web/*/*.js', 'web/*/*.css'],
    },

    python_requires='>=3.6',
    install_requires=[
        'b2',
        'boto3',
        'pogcli==0.1.4',
        'pywebview',
        'pyyaml',
    ],
    extras_require={
        'qt': ['PyQt5', 'PyQtWebEngine'],
    },

    description='File encryption and backup GUI',
    long_description=long_description,
    long_description_content_type='text/markdown',

    author="Stephen Zimmerman",
    author_email="sz@galacticicecube.com",

    classifiers=[
        "License :: OSI Approved :: MIT License",
        "Programming Language :: JavaScript",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.6",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
    ],
)
