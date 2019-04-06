#!/bin/bash

resources=$(dirname "$(dirname "$(test -L "$0" && readlink "$0" || echo "$0")")")
ipfs="$resources/app.asar.unpacked/node_modules/go-ipfs-dep/go-ipfs/ipfs"

exec "$ipfs" "$@"
