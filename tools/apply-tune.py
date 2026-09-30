# Writes the thresholds suggested by tools/tune-route.ts (--json=file) into the level files (src/sim/campaign/*.ts):
# `stars: [a, b]` and `minSaved: c` of the level with each id. Usage: python3 tools/apply-tune.py file.json
import glob
import json
import re
import sys

sug = json.load(open(sys.argv[1]))
for path in glob.glob('src/sim/campaign/*.ts'):
    src = open(path).read()
    changed = False
    for lid, v in sug.items():
        m = re.search(r"id: '" + re.escape(lid) + r"',", src)
        if not m:
            continue
        start = m.end()
        end = src.find("\n  L(", start)
        end = len(src) if end < 0 else end
        block = src[start:end]
        nb = re.sub(r"stars: \[[0-9.]+, [0-9.]+\]", f"stars: [{v['stars'][0]}, {v['stars'][1]}]", block, count=1)
        nb = re.sub(r"minSaved: [0-9.]+", f"minSaved: {v['minSaved']}", nb, count=1)
        if nb != block:
            src = src[:start] + nb + src[end:]
            changed = True
            print(lid, v['minSaved'], v['stars'])
    if changed:
        open(path, 'w').write(src)
