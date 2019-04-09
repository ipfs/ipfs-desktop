#!/bin/bash

set -e

ln -sf '/opt/${productFilename}/${executable}' '/usr/local/bin/${executable}'

if [ ! -f /usr/local/bin/ipfs ]; then
  ln -sf '/opt/${productFilename}/resources/bin/ipfs.sh' '/usr/local/bin/ipfs'
fi
