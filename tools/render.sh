#!/bin/bash
# Resumable render step (the cloud machine can restart): serves dist/, renders the clips still missing.
# Usage: tools/render.sh x|cg169|cg23 [render|encode]
cd /home/claude/apagalo
curl -s -o /dev/null http://127.0.0.1:8765/web/index.html || (cd dist && setsid python3 -m http.server 8765 --bind 127.0.0.1 >/dev/null 2>&1 < /dev/null &)
sleep 1
ONE_CLIP=1 PROFILE=$1 timeout 560 python3 tools/video.py ${2:-render}
