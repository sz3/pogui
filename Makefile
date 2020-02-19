.PHONY: pypi clean test js_test

pypi:
	python setup.py sdist
	twine upload dist/*.tar.gz

clean:
	find . -name '*.py[co]' -delete
	find . -name '__pycache__' -delete
	rm -rf build/ dist/ *.egg *.egg-info/

test:
	coverage run -m unittest
	coverage report

js_test:
	node_modules/.bin/node-qunit-phantomjs js_tests/tests.html

