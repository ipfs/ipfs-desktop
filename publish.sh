#!/bin/bash
set -e

# Pre-requisites:
#   GITHUB_TOKEN must be set
#   tag must be set

LAST_BUILD="https://ci.ipfs.team/job/IPFS%20Shipyard/job/ipfs-desktop/job/master/lastSuccessfulBuild/artifact/out/make/*zip*/make.zip"

# Install GHR if not present
if ! [ -x "$(command -v ghr)" ]; then
    go get -u github.com/tcnksm/ghr
fi

# Get the latest successfull build and unzip it
curl -o latest.zip "$LAST_BUILD"
unzip -o latest.zip -d dist/

cd dist

# Remove nupkg, releases and flattens the directory.
find . -type f -name '*.nupkg' -delete
find . -type f -name 'RELEASES' -delete
find . -type d -empty -delete
find . -mindepth 2 -type f -exec mv -i '{}' . ';'

ghr -u ipfs-shipyard -r ipfs-desktop "$tag" .
