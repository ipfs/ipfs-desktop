#/usr/bin/sh

script=$(readlink "$0")
path=$(dirname $script)
ipfs="$path/../../node_modules/go-ipfs-dep/go-ipfs/ipfs"

$ipfs "$@" 0<&0 1>&1 2>&2
