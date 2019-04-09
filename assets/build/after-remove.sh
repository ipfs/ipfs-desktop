#!/bin/bash

# Remove broken link to ipfs-desktop binary
test -e '/usr/local/bin/${executable}' || rm -f '/usr/local/bin/${executable}'

# Remove broken link to ipfs binary
test -e '/usr/local/bin/ipfs' || rm -f '/usr/local/bin/ipfs'

