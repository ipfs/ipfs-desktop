#!/usr/bin/env bash

dir="$(dirname "$(test -L "$0" && readlink "$0" || echo "$0")")"

if [ -f "$dir/IPFS_PATH" ]; then
  export IPFS_PATH="$(cat "$dir/IPFS_PATH")"
fi

# Get the full path of the app directory (resolving the symlink if needed)
app=$(dirname "$(dirname "$(dirname "$dir")")")
# Get the full path to ipfs binary bundled with ipfs-desktop
ipfs="$app/node_modules/go-ipfs-dep/go-ipfs/ipfs"

exec "$ipfs" "$@"
