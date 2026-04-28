#/usr/bin/env bash

png () {
  middle=$(($3 / 2))
  center=$((middle - 1))

  convert -size "$3x$3" xc:transparent \
    -fill $1 \
    -draw "circle $center.5,$center.5 $middle,0" \
    -define icon:auto-resize "$2@$4x.png"
}

circle () {
  # Cover every DPI suffix Electron's nativeImage resolves:
  # https://www.electronjs.org/docs/latest/api/native-image
  # Pixel sizes are round(10 * scale); 1.25x and 1.33x both land on 13.
  png $1 $2 10 1
  png $1 $2 13 1.25
  png $1 $2 13 1.33
  png $1 $2 14 1.4
  png $1 $2 15 1.5
  png $1 $2 18 1.8
  png $1 $2 20 2
  png $1 $2 25 2.5
  png $1 $2 30 3
  png $1 $2 40 4
  png $1 $2 50 5
  # Unsuffixed base PNG so Electron's nativeImage HiDPI resolver picks
  # the sibling @Nx variants automatically.
  cp "$2@1x.png" "$2.png"
}

circle "rgb(50,215,75)" green
circle "rgb(255,69,58)" red
circle "rgb(255,214,10)" yellow
circle "rgb(130,130,130)" gray
