#!/bin/sh

set -e

rm -rf .aleph

deno run \
  --allow-net=deno.land,esm.sh \
  --allow-read \
  --allow-write=.aleph,docs \
  --allow-env=ALEPH_DEV,ALEPH_DEV_PORT,ALEPH_VERSION,ALEPH_BUILD_MODE,ALEPH_FRAMEWORK \
  --allow-run=$(which deno) \
  https://deno.land/x/aleph@v0.3.0-alpha.29/cli.ts \
  build

#  --reload \

