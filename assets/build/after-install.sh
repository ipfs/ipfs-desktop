#!/bin/bash

set -e

location='/opt/${productFilename}'

if [ ! -z $SNAP ]; then
  location=$SNAP
fi

ln -sf '${location}/${executable}' '/usr/local/bin/${executable}'

if [ ! -f /usr/local/bin/ipfs ]; then
  ln -sf '${location}/resources/bin/ipfs.sh' '/usr/local/bin/ipfs'
fi
