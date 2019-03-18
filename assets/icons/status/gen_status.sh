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
  png $1 $2 10 1
  png $1 $2 15 1.5
  png $1 $2 20 2
  png $1 $2 25 2.5
  png $1 $2 30 3
  png $1 $2 40 4
  png $1 $2 50 5
}

circle "rgb(50,215,75)" green
circle "rgb(255,69,58)" red
circle "rgb(255,214,10)" yellow
circle "rgb(130,130,130)" gray
