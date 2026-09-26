#!/bin/bash
# Renders clips one by one while there is time left in this call (budget in seconds, default 250 to start a new clip).
cd "$(dirname "$0")/.."
T0=$(date +%s); BUDGET=${2:-250}
while true; do
  tools/render.sh $1 >> build/video/render-$1.log 2>&1
  n=$(ls -d build/video/frames-$1/*/ 2>/dev/null | while read d; do [ -f $d/.done ] && echo x; done | wc -l)
  echo "$(date +%T) done clips: $n"
  [ "$n" -ge 5 ] && break
  [ $(( $(date +%s) - T0 )) -gt $BUDGET ] && break
done
