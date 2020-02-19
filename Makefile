.PHONY: clean test js_test

clean:
	find . -name '*.py[co]' -delete
	find . -name '__pycache__' -delete
	rm -rf build/ dist/ *.egg *.egg-info/

test:
	python -m unittest

js_test:
	node_modules/.bin/node-qunit-phantomjs js_tests/tests.html

