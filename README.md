[![Build Status](https://travis-ci.org/sz3/pogui.svg?branch=master)](https://travis-ci.org/sz3/pogui)
[![Coverage Status](https://coveralls.io/repos/github/sz3/pogui/badge.svg?branch=master)](https://coveralls.io/github/sz3/pogui?branch=master)
[![PyPI Version](https://img.shields.io/pypi/v/pogui.svg)](https://pypi.python.org/pypi/pogui)
[![Supported Python versions](https://img.shields.io/pypi/pyversions/pogui.svg)](https://pypi.python.org/pypi/pogui)

## PogUI

A desktop application for encrypting and/or backing up files. Uses [pog](https://github.com/sz3/pog) under the hood, as the name suggests.

pogui is beta software! But it does mostly work, so there's that!

## Installation

Use `pip`:
```
pip install pogui
```

on linux:
```
pip install pogui[qt]
```

From source,
```
python setup.py build
python setup.py install
```

For linux source build, `PyQtWebEngine` should be installed. For example, by:
```
pip install PyQt5 PyQtWebEngine
```

## Usage

`pogui`
or
`python -m pogui.pogui`

