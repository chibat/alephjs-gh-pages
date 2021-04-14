#!/bin/sh

set -e

rm -rf .aleph
aleph build
touch docs/.nojekyll
git add .
git commit -m 'deploy'
git push

