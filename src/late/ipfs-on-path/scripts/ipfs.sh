#!/usr/bin/env bash

# Get the full path of the app directory (resolving the symlink if needed)
app=$(dirname "$(dirname "$(dirname "$(dirname "$(dirname "$(test -L "$0" && readlink "$0" || echo "$0")")")")")")
# Get the full path to ipfs binary bundled with ipfs-desktop
ipfs="$app/node_modules/go-ipfs-dep/go-ipfs/ipfs"

exec "$ipfs" "$@"
