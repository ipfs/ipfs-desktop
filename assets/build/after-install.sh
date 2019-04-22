#!/bin/bash

set -e

DIR='/opt/${productFilename}'

if [ ! -z $SNAP ]; then
  DIR=$SNAP
fi

ln -sf "$DIR/${executable}" '/usr/local/bin/${executable}'

if [ ! -f /usr/local/bin/ipfs ]; then
  ln -sf "$DIR/resources/bin/ipfs.sh" '/usr/local/bin/ipfs'
fi
