#!/usr/bin/env python3
"""Regenerate distributable examples from fragments; no hand-edited copies."""
from pathlib import Path
import json
from build_lesson import ROOT,build,THEMES
out=ROOT/'examples';out.mkdir(exist_ok=True)
for p in sorted((ROOT/'fragments').glob('*.html')):
 (out/p.name).write_text(build([p],title=p.stem))
(out/'composition-check.html').write_text(build([ROOT/'fragments/sampling-distribution.html',ROOT/'fragments/quantum-linked.html',ROOT/'fragments/sampling-distribution.html',ROOT/'fragments/resistor-coupling.html',ROOT/'fragments/resistor-coupling.html'],title='同页独立实例检查'))
(ROOT/'evidence').mkdir(exist_ok=True)
(ROOT/'evidence/themes.json').write_text(json.dumps(THEMES))

(ROOT/'evidence/ui-override.html').write_text(build([ROOT/'fragments/diffusion-lens.html'],ui_css='summary{border-radius:20px}'))

