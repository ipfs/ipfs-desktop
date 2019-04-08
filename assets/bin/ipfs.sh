#!/usr/bin/env bash

# Get the full path of "resources/" directory (resolving the symlink if needed)
resources=$(dirname "$(dirname "$(test -L "$0" && readlink "$0" || echo "$0")")")
# Get the full path to ipfs binary bundled with ipfs-desktop
ipfs="$resources/app.asar.unpacked/node_modules/go-ipfs-dep/go-ipfs/ipfs"

exec "$ipfs" "$@"
