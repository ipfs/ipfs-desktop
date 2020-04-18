#!/usr/bin/env bash

dir="$(dirname "$(test -L "$0" && readlink "$0" || echo "$0")")"

if [ -f ~/.ipfs-desktop/IPFS_PATH ]; then
  export IPFS_PATH="$(cat ~/.ipfs-desktop/IPFS_PATH)"
fi

# Get the full path of the app directory (resolving the symlink if needed)
app=$(dirname "$(dirname "$(dirname "$dir")")")

# Get the full path to ipfs binary bundled with ipfs-desktop
ipfs="$(cat ~/.ipfs-desktop/IPFS_EXEC)"

exec "$ipfs" "$@"
