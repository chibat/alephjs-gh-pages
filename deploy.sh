#!/bin/sh

set -e

aleph build
touch docs/.nojekyll
git add .
git commit -m 'deploy'
git push

