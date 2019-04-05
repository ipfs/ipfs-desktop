#/usr/bin/sh

if [[ $(which ipfs | wc -l) -ge 2 ]]; then
  echo "more than two"
else
  $(pwd)/../../node_modules/go-ipfs-dep/go-ipfs/ipfs "$@" 2<&2
fi