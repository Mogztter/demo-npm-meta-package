#!/bin/bash
# Package a distribution as a zip and tar.gz archive

set -e

cd "$(dirname "$0")"

cd ../packages/core
npm run dist
mkdir bin
cd dist/
zip -r ../bin/demo-npm-meta-package.dist.zip .
tar -zcvf ../bin/demo-npm-meta-package.dist.tar.gz .
