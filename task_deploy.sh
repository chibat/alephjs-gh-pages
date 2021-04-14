#!/bin/sh

set -e

./task_build.sh
touch docs/.nojekyll
git add .
git commit -m 'deploy'
git push

