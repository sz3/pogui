from setuptools import setup, find_packages


setup(
    name='pogui',
    license='MIT',
    url='https://github.com/sz3/pogui',
    version='0.0.1',

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
        'pogcli==0.1.2',
        'PyQtWebEngine',
        'PyQt5',
        'pywebview',
        'pyyaml',
    ],

    description='Pog User Interface',
    long_description=(
        'File encryption and backup UI.'
    ),

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
