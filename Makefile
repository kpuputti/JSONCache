SRC_DIR=src
BUILD_DIR=build

VERSION=$(shell cat VERSION)

SOURCE_FILE=${SRC_DIR}/jsoncache.js
OUTPUT_FILE=${BUILD_DIR}/jsoncache-${VERSION}.min.js

JSMIN=java -jar ~/programs/closure-compiler/compiler.jar

PHANTOMJS=phantomjs

all: clean minify set_version

minify: ${SOURCE_FILE}
	@ echo "\nMinifying source file."
	${JSMIN} --js ${SOURCE_FILE} --js_output_file ${OUTPUT_FILE}

set_version: minify
	@ echo "Setting build version to ${VERSION}"
	@ sed -i "s/#VERSION#/${VERSION}/g" ${OUTPUT_FILE}

test_dev:
	@ echo "\n== Development tests =="
	${PHANTOMJS} tests/run-jasmine.js file://$(shell pwd)/tests/development-jasmine.html

test_prod: all
	@ echo "\n== Production tests =="
	${PHANTOMJS} tests/run-jasmine.js file://$(shell pwd)/tests/production-jasmine.html

test: test_dev test_prod

clean:
	rm -f ${BUILD_DIR}/*
