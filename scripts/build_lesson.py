#!/usr/bin/env python3
"""Package trusted local HTML fragments as isolated examples in one offline lesson.
Usage: python3 scripts/build_lesson.py fragments/a.html fragments/b.html -o lesson.html
Supports independent models; physical coupling must be authored explicitly.
"""
from pathlib import Path
import argparse,html,json
ROOT=Path(__file__).resolve().parents[1]
THEMES={
 'warm':{'background':'#faf6e9','foreground':'#293c42','card':'#fffdf5','muted':'#eee9dc','muted-foreground':'#59676b','border':'#c9ccbf','primary':'#346c79','primary-foreground':'#ffffff','secondary':'#eeeee5','ring':'#346c79','viz-series-1':'#407e8a','viz-series-2':'#aa7739','viz-series-3':'#6e70a1','viz-series-4':'#52836c','viz-series-5':'#9b6877','viz-series-6':'#7b7461'},
 'paper':{'background':'#fcfcfb','foreground':'#273944','card':'#ffffff','muted':'#edf0f2','muted-foreground':'#5a6872','border':'#c8d1d6','primary':'#345d89','primary-foreground':'#ffffff','secondary':'#edf1f5','ring':'#345d89','viz-series-1':'#447eaf','viz-series-2':'#9b742d','viz-series-3':'#8a659b','viz-series-4':'#3e887c','viz-series-5':'#a66568','viz-series-6':'#6d7581'},
 'dark':{'background':'#1e252a','foreground':'#e5eaed','card':'#293138','muted':'#303a42','muted-foreground':'#bbc6ce','border':'#687983','primary':'#b0d2dc','primary-foreground':'#1e252a','secondary':'#36434c','ring':'#b0d2dc','viz-series-1':'#8dc4d1','viz-series-2':'#e0b875','viz-series-3':'#bcacd9','viz-series-4':'#98cdb6','viz-series-5':'#ddacb6','viz-series-6':'#bdc6cf'}
}
CHILD='''<script>
(()=>{const allowed=KEYS;window.addEventListener('message',e=>{if(e.source!==parent||e.data?.type!=='sci-theme')return;for(const[k,v]of Object.entries(e.data.tokens||{}))if(allowed.includes(k)&&/^#[0-9a-f]{6}$/i.test(v))document.documentElement.style.setProperty('--'+k,v);document.documentElement.style.colorScheme=e.data.name==='dark'?'dark':'light'});let last=0;const measure=()=>{const h=Math.ceil(document.body.getBoundingClientRect().height);if(h!==last){last=h;parent.postMessage({type:'sci-height',height:h},'*')}};new ResizeObserver(measure).observe(document.body);measure();})();
</script>'''
def build(paths,theme='warm',title='科学交互讲义'):
 css=(ROOT/'runtime/host.css').read_text();frames=[]
 for i,path in enumerate(paths):
  fragment=Path(path).read_text()
  if '<html' in fragment.lower():raise ValueError('Input must be an HTML fragment: '+str(path))
  tokens=';'.join('--'+k+':'+v for k,v in THEMES[theme].items())
  child='<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+':root{'+tokens+'}</style><body>'+'<script>'+(ROOT/'runtime/touch-controls.js').read_text()+'</script>'+fragment+CHILD.replace('KEYS',json.dumps(list(THEMES[theme])))+'</body></html>'
  frames.append('<iframe title="'+html.escape(Path(path).stem,quote=True)+'" sandbox="allow-scripts" srcdoc="'+html.escape(child,quote=True)+'"></iframe>')
 return '''<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'''+html.escape(title)+'''</title><style>body{margin:auto;max-width:900px;font:18px/1.6 system-ui,sans-serif;padding:16px;background:var(--background);color:var(--foreground)}header{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:16px}h1{font-size:22px;margin:0}select{font:inherit;min-height:44px;color:inherit;background:var(--background);border:1px solid var(--border);border-radius:10px}iframe{display:block;width:100%;height:700px;border:0;margin:0 0 24px}footer{font-size:15px}</style><header><h1>'''+html.escape(title)+'''</h1><label>主题 <select aria-label="主题"><option value="warm">暖纸</option><option value="paper">素纸</option><option value="dark">深色</option></select></label></header><main>'''+''.join(frames)+'''</main><footer>各例独立操作与复位；切换主题保留当前状态。</footer><script>
const themes='''+json.dumps(THEMES)+''';let selected='''+json.dumps(theme)+''';const frames=[...document.querySelectorAll('iframe')],select=document.querySelector('select');select.value=selected;function apply(){const tokens=themes[selected];for(const[k,v]of Object.entries(tokens))document.documentElement.style.setProperty('--'+k,v);for(const f of frames)f.contentWindow.postMessage({type:'sci-theme',name:selected,tokens},'*')}select.onchange=()=>{selected=select.value;apply()};for(const f of frames)f.addEventListener('load',apply);window.addEventListener('message',e=>{const f=frames.find(f=>f.contentWindow===e.source);if(!f||e.data?.type!=='sci-height')return;const h=Number(e.data.height);if(Number.isFinite(h)&&h>=100&&h<=20000)f.style.height=h+'px'});apply();</script></html>'''
if __name__=='__main__':
 a=argparse.ArgumentParser(description=__doc__);a.add_argument('fragments',nargs='+');a.add_argument('-o','--output',required=True);a.add_argument('--theme',choices=THEMES,default='warm');a.add_argument('--title',default='科学交互讲义');v=a.parse_args();out=Path(v.output);out.parent.mkdir(parents=True,exist_ok=True);out.write_text(build(v.fragments,v.theme,v.title));print(str(out))

