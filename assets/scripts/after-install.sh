#!/bin/bash

set -e

bin="/usr/local/bin/ipfs"
location=$(cd $(dirname $(test -L "$0" && readlink "$0" || echo "$0"))/../.. && pwd -P)
ipfs="$location/assets/bin/ipfs.sh"

if [ ! -f $bin ]; then
  ln -sf $ipfs $bin
fi
