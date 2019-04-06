#!/bin/bash

set -e

bin="/usr/local/bin/ipfs"
location=$(cd $(dirname $(test -L "$0" && readlink "$0" || echo "$0"))/../.. && pwd -P)
ipfs="$location/assets/bin/ipfs.sh"

if [ -f $bin -a $bin -ef $ipfs ]; then
  rm $bin
fi
