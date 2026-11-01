/* node tests/check-additions.cjs [optional output directory for SVG evidence]
 * Executes actual fragment JS in a minimal DOM. Not a real browser/touch test.
 */
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),path=require('path');
class El{
 constructor(tag='div'){this.tag=tag;this.attrs={};this.dataset={};this.children=[];this.clientWidth=320;this.isConnected=true;this.value='1';this.textContent='';this.classList={add(){},remove(){}};this.nodes={};}
 setAttribute(k,v){this.attrs[k]=v}appendChild(e){this.children.push(e)}replaceChildren(){this.children=[]}
 querySelector(q){return this.nodes[q]??=new El(q==='svg'?'svg':'div')}
}
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
function xml(e){return `<${e.tag} ${Object.entries(e.attrs).map(([k,v])=>`${k}="${esc(v)}"`).join(' ')}>${esc(e.textContent)}${e.children.map(xml).join('')}</${e.tag}>`}
const result=[];
for(const kind of ['sampling-distribution','quantum-linked']){
 const filename=path.join(__dirname,'../fragments',kind+'.html'),html=fs.readFileSync(filename,'utf8'),script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
 assert(!/id="/.test(html),'new examples must not use fixed IDs');
 const roots=[new El(),new El()],timers=new Map(),listeners={},obs=[];let id=0,clock=0;
 const document={querySelectorAll:()=>roots,createElementNS:(_,t)=>new El(t),hidden:false,addEventListener:(t,f)=>(listeners[t]??=new Set()).add(f),removeEventListener:(t,f)=>listeners[t]?.delete(f)};
 const context={document,Math,performance:{now:()=>clock},setInterval:f=>{timers.set(++id,f);return id},clearInterval:i=>timers.delete(i),setTimeout:()=>++id,clearTimeout(){},ResizeObserver:class{constructor(f){obs.push(f)}observe(){}disconnect(){}}};
 vm.runInNewContext(script,context);const [a,b]=roots,range=a.querySelector('input'),area=a.querySelector('[data-controls]');
 const set=v=>{range.value=v;range.oninput()};
 const snap=()=>JSON.stringify({bins:a.dataset.bins,mean:a.dataset.mean,energy:a.dataset.energy});
 set(kind==='sampling-distribution'?50:4);const saved=snap();assert.equal(b.dataset.value,'1','second instance remains unchanged');
 set(1);set(kind==='sampling-distribution'?50:4);assert.equal(snap(),saved,'prefix/state roundtrip exact');
 vm.runInNewContext(script,context);assert.equal(snap(),saved,'double init does not reset state');assert.equal(obs.length,2);
 if(kind==='sampling-distribution'){
  for(const n of [1,2,10,50,1000]){set(n);const bins=JSON.parse(a.dataset.bins);assert.equal(bins.reduce((x,y)=>x+y),n);const mean=bins.reduce((s,c,i)=>s+c*(i-3),0)/n;assert.equal(+a.dataset.mean,mean)}
  const svg=a.querySelector('svg');assert.equal(svg.children.filter(e=>e.tag==='circle').length,0,'no unexplained dot');assert.equal(svg.children.filter(e=>'data-latest-bin' in e.attrs).length,1,'one latest-result column');
  let old=snap();a.querySelector('[data-batch]').onclick();assert.notEqual(snap(),old);assert.equal(a.dataset.value,'1000');
  set(1);a.querySelector('[data-step]').onclick();assert.equal(a.dataset.value,'2');
  a.querySelector('[data-play]').onclick();const before=+a.dataset.value;[...timers.values()][0]();assert.equal(+a.dataset.value,before+1,'play adds exactly one observation per tick');let guard=0;while(timers.size&&guard++<1000){for(const f of [...timers.values()])f()}assert.equal(a.dataset.value,'1000');assert.equal(timers.size,0,'play finishes');
  set(20);a.querySelector('[data-play]').onclick();document.hidden=true;for(const f of listeners.visibilitychange)f();assert.equal(timers.size,0);assert.equal(a.dataset.value,'20');document.hidden=false;
  // Exact theoretical probabilities from all 64 outcomes.
  const counts=Array(7).fill(0);for(let i=0;i<64;i++)counts[i.toString(2).replaceAll('0','').length]++;
  assert.deepEqual(counts,[1,6,15,20,15,6,1]);assert.equal(counts.reduce((s,c,i)=>s+c*(i-3)**2,0)/64,1.5);
 }else{
  for(let n=1;n<=4;n++){set(n);assert.equal(+a.dataset.energy,n*n);let area=0;for(let i=0;i<10000;i++)area+=2*Math.sin(n*Math.PI*(i+.5)/10000)**2/10000;assert(Math.abs(area-1)<1e-10);assert(Math.abs(Math.sin(n*Math.PI))<1e-12);}
 }
 const blank={closest:()=>null},control={closest:()=>({})},event=(target=blank,x=50,y=80)=>({target,clientX:x,clientY:y,pointerId:1,isPrimary:true,button:0});
 set(3);area.onpointerdown(event());area.onpointerup(event());assert.equal(a.dataset.value,'1');
 for(const kind of ['control','drag','cancel','leave','multi','long','scroll']){set(3);area.onpointerdown(event(kind==='control'?control:blank));if(kind==='drag')area.onpointermove(event(blank,80,80));if(kind==='cancel')area.onpointercancel();if(kind==='leave')area.onpointerleave();if(kind==='multi')area.onpointerdown({...event(),isPrimary:false,pointerId:2});if(kind==='long')clock+=600;if(kind==='scroll')for(const f of listeners.scroll)f();area.onpointerup(event());assert.equal(a.dataset.value,'3',kind+' must not reset')}
 a.onkeydown({key:'r',preventDefault(){}});assert.equal(a.dataset.value,'1');
 for(const width of [320,360,736]){a.querySelector('svg').clientWidth=width;set(kind==='sampling-distribution'?1000:4);for(const f of obs)f();const svg=a.querySelector('svg');assert(svg.attrs.viewBox.startsWith('0 0 '+width));for(const child of svg.children){for(const key of ['x','x1','x2','cx'])if(key in child.attrs)assert(+child.attrs[key]>=0&&+child.attrs[key]<=width,`${kind} ${width} ${key}`)}if(process.argv[2]){fs.mkdirSync(process.argv[2],{recursive:true});let s=xml(svg).replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" ');const colors={'--foreground':'#283b42','--border':'#c2ccca','--viz-series-1':'#438b94','--viz-series-2':'#b58a4b'};for(const[k,v]of Object.entries(colors))s=s.replaceAll(`var(${k})`,v);fs.writeFileSync(path.join(process.argv[2],`${kind}-${width}.svg`),s)}}
 roots.forEach(r=>r.sciDestroy());assert.equal(listeners.scroll.size,0);assert.equal(listeners.visibilitychange.size,0);assert.equal(timers.size,0);
 result.push(kind+': model, return path, two instances, init guard, guarded reset, lifecycle, SVG coordinates PASS');
}
console.log(result.join('\n'));

