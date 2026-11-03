/* Real browser regression: behavior, physical invariants, layout and composition. */
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const base=path.join(__dirname,'..'),evidence=path.join(base,'evidence');
const files=fs.readdirSync(path.join(base,'fragments')).filter(x=>x.endsWith('.html'));
const themes=JSON.parse(fs.readFileSync(path.join(evidence,'themes.json')));
const css=fs.readFileSync(path.join(base,'runtime/host.css'),'utf8'),runtime=fs.readFileSync(path.join(base,'runtime/touch-controls.js'),'utf8');
function html(file,theme='warm'){return `<html><meta charset="utf-8"><style>:root{${Object.entries(themes[theme]).map(([k,v])=>`--${k}:${v}`).join(';')}}${css}</style><body><script>${runtime}</script>${fs.readFileSync(path.join(base,'fragments',file),'utf8')}</body></html>`;}
const scope=k=>`[data-scope="${k}"]`;
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox','--disable-dev-shm-usage']}: {})});
 const report=[];let errors=[];
 for(const file of files){
  const page=await browser.newPage({viewport:{width:360,height:1400},hasTouch:true});page.on('pageerror',e=>errors.push(file+': '+e.message));await page.clock.install();await page.setContent(html(file));await page.clock.runFor(50);
  const controls=await page.evaluate(()=>document.querySelector('section').sciApi.controls);
  assert(controls.length,file+' mounted');assert.equal(await page.locator('[data-play],input[type=checkbox]').count(),0,file+' no extra transport');
  for(const c of controls){
   if(c.kind==='action')continue;
   const track=page.locator(scope(c.key)+' [role=slider]'),button=page.locator(scope(c.key)+' button');
   const before=await page.evaluate(()=>Object.fromEntries(document.querySelector('section').sciApi.controls.map(c=>[c.key,document.querySelector('section').sciApi.getControl(c.key)])));
   if(await track.count())await track.press('ArrowRight');else await button.click();
   // A tap on this field's blank footer resets only its declared value.
   const box=await page.locator(scope(c.key)).boundingBox();await page.mouse.click(box.x+8,box.y+box.height-8);
   const after=await page.evaluate(()=>Object.fromEntries(document.querySelector('section').sciApi.controls.map(c=>[c.key,document.querySelector('section').sciApi.getControl(c.key)])));
   assert(Math.abs(Number(after[c.key])-Number(c.defaultValue))<.011||after[c.key]===c.defaultValue,`${file}:${c.key} local reset ${after[c.key]} != ${c.defaultValue}`);
   for(const other of controls)if(other.key!==c.key&&other.kind!=='action')assert.equal(after[other.key],before[other.key],`${file}:${c.key} preserves ${other.key}`);
   // Text and a canceled/vertical gesture must not reset.
   if(await track.count()){
    await track.press('ArrowRight');const changed=await page.evaluate(k=>document.querySelector('section').sciApi.getControl(k),c.key);
    await page.locator(scope(c.key)+' .sci-label').click();assert.equal(await page.evaluate(k=>document.querySelector('section').sciApi.getControl(k),c.key),changed);
    await page.mouse.move(box.x+8,box.y+box.height-8);await page.mouse.down();await page.mouse.move(box.x+8,box.y+box.height-35);await page.mouse.up();assert.equal(await page.evaluate(k=>document.querySelector('section').sciApi.getControl(k),c.key),changed);
    await page.evaluate(k=>document.querySelector('section').sciApi.reset(k),c.key);
   }
  }
  // Model-specific invariants are checked at multiple values, not just initial state.
  for(const fraction of [.2,.7]){
   await page.evaluate(f=>{const root=document.querySelector('section');for(const el of root.querySelectorAll('input[type=range]')){el.value=+el.min+(+el.max-+el.min)*f;el.dispatchEvent(new Event('input',{bubbles:true}));}},fraction);
   const d=await page.evaluate(()=>({...document.querySelector('section').dataset}));
   if(file==='wave-addition.html')assert(Math.abs(+d.amplitude-2*Math.abs(Math.cos(+d.phase*Math.PI/360)))<1e-8);
   if(file==='complex-wave.html')assert(Math.abs((+d.real)**2 + (+d.imag)**2-1)<1e-8);
   if(file==='diffusion-exchange.html')assert.equal(+d.total,100);
   if(file==='diffusion-lens.html')assert.equal(+d.count,160);
   if(file==='resistor-coupling.html')assert(Math.abs(+d.power-(+d.current)*(+d.voltage))<1e-8);
   if(file==='process-window.html')assert(Math.abs(+d.thickness-(1+.3*(+d.x)+.2*(+d.y)))<1e-8);
   if(file==='wafer-probe.html')assert((+d.x)**2 + (+d.y)**2<=1+1e-8);
   if(file==='quantum-linked.html')assert.equal(+d.energy,(+d.value)**2);
   if(file==='sampling-distribution.html')assert.equal(JSON.parse(d.bins).reduce((a,b)=>a+b,0),+d.value);
   if(file==='wave-speeds.html')assert(Math.abs(+d.vg-2*(+d.vp))<1e-8);
  }
  // Each animated example: no button; same track taps, endpoint returns to start and stops.
  const animated=controls.find(c=>c.playable);
  if(animated){
   const track=page.locator(scope(animated.key)+' [role=slider]');await page.evaluate(k=>document.querySelector('section').sciApi.reset(k),animated.key);
   const b=await track.boundingBox(),tx=animated.kind==='wheel'?b.x+b.width*.12:b.x+b.width*.5;
   await page.mouse.click(tx,b.y+b.height/2);await page.clock.runFor(120);assert.equal(await track.getAttribute('data-playing'),'true',file+' starts');
   await page.mouse.click(tx,b.y+b.height/2);assert.equal(await track.getAttribute('data-playing'),'false',file+' pauses');
   const frozen=await page.evaluate(k=>document.querySelector('section').sciApi.getControl(k),animated.key);await page.clock.runFor(300);assert.equal(await page.evaluate(k=>document.querySelector('section').sciApi.getControl(k),animated.key),frozen,file+' pause retains time');
   await page.mouse.click(tx,b.y+b.height/2);await page.clock.runFor(15500);assert.equal(await track.getAttribute('data-playing'),'false',file+' stops at end');
   const end=await page.evaluate(k=>document.querySelector('section').sciApi.getControl(k),animated.key);assert(Math.abs(end-(file==='sampling-distribution.html'?1:0))<.011,file+' end resets only time');
   await page.mouse.click(tx,b.y+b.height/2);await page.clock.runFor(100);await page.evaluate(()=>window.dispatchEvent(new Event('blur')));assert.equal(await track.getAttribute('data-playing'),'false',file+' blur pauses');
  }
  // Reset all scopes only in test setup; the product exposes no global reset.
  for(const c of controls)if(c.kind!=='action')await page.evaluate(k=>document.querySelector('section').sciApi.reset(k),c.key);
  for(const width of [320,360,736])for(const theme of Object.keys(themes)){
   await page.setViewportSize({width,height:1600});await page.evaluate(tokens=>{for(const[k,v]of Object.entries(tokens))document.documentElement.style.setProperty('--'+k,v)},themes[theme]);await page.clock.runFor(50);
   const layout=await page.evaluate(()=>{const host=document.querySelector('[data-controls]'),svgs=[...document.querySelectorAll('svg')];return{overflow:document.documentElement.scrollWidth>innerWidth+1,below:host.getBoundingClientRect().top>=Math.max(...svgs.map(s=>s.getBoundingClientRect().bottom))-1,buttons:[...document.querySelectorAll('.sci-button')].map(e=>({w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})),font:[...document.querySelectorAll('svg text')].every(e=>parseFloat(getComputedStyle(e).fontSize)>=17.8)}});
   assert(!layout.overflow,file+': '+width+' overflow');assert(layout.below,file+' controls below graphs');assert(layout.font,file+' font');for(const b of layout.buttons)assert(b.h>=44);
   if(width===360&&theme==='warm')await page.screenshot({path:path.join(evidence,file.replace('.html','.png')),fullPage:true});
  }
  assert.equal(errors.length,0,errors.join('\n'));report.push({example:file,behavior:'pass',model:'pass',layouts:9});console.log('PASS',file);await page.close();
 }
 const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto('file://'+path.join(base,'examples/composition-check.html'));await page.waitForTimeout(200);const frames=page.frames().slice(1);assert.equal(frames.length,5);
 const initial=await Promise.all(frames.map(f=>f.evaluate(()=>({...document.querySelector('section').dataset}))));await frames[0].evaluate(()=>document.querySelector('section').sciApi.setValue(321));assert.equal(await frames[2].evaluate(()=>+document.querySelector('section').dataset.value),+initial[2].value);
 await frames[3].locator('[role=slider]').press('ArrowRight');assert.equal(await frames[4].evaluate(()=>+document.querySelector('section').dataset.resistance),3);
 const states=await Promise.all(frames.map(f=>f.evaluate(()=>({...document.querySelector('section').dataset}))));await page.locator('select').selectOption('dark');await page.waitForTimeout(50);assert.deepEqual(await Promise.all(frames.map(f=>f.evaluate(()=>({...document.querySelector('section').dataset})))),states);
 assert.equal(errors.length,0,errors.join('\n'));report.push({composition:'pass',themePreservesState:'pass',realTablet:'not tested'});fs.writeFileSync(path.join(evidence,'browser-results.json'),JSON.stringify(report,null,2));await browser.close();console.log('PASS independent instances and theme preservation');
})().catch(e=>{console.error(e);process.exit(1)});
