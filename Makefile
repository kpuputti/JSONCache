SRC_DIR=src
BUILD_DIR=build

VERSION=$(shell cat VERSION)

SOURCE_FILE=${SRC_DIR}/jsoncache.js
OUTPUT_FILE=${BUILD_DIR}/jsoncache-${VERSION}.min.js

JSMIN=java -jar ~/programs/closure-compiler/compiler.jar


all: clean minify set_version

minify: ${SOURCE_FILE}
	${JSMIN} --js ${SOURCE_FILE} --js_output_file ${OUTPUT_FILE}

set_version: minify
	sed -i "s/#VERSION#/${VERSION}/g" ${OUTPUT_FILE}

clean:
	rm -f ${BUILD_DIR}/*
