#!/usr/bin/env bash
# usage: diff.sh <reference-dir> <candidate-dir> <diff-output-dir>
set -u
reference=$1; candidate=$2; diffs=$3
mkdir -p "$diffs"
total=0; identical=0
for ref in "$reference"/*.png; do
  name=$(basename "$ref"); total=$((total+1))
  pixels=$(magick compare -metric AE -fuzz 2% "$ref" "$candidate/$name" "$diffs/$name" 2>&1 >/dev/null | awk '{print $1}')
  [ "$pixels" = "0" ] && identical=$((identical+1))
  printf '%s %8s px (%5.2f%%)\n' "$name" "$pixels" "$(echo "$pixels / 7560" | bc -l)"
done
echo "identical: $identical / $total"
