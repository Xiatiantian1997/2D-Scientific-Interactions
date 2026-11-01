/* Real Chromium checks. npm install --no-save playwright && npx playwright install chromium */
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const base=path.resolve(__dirname,'..');
(async()=>{
 const browser=await chromium.launch({headless:true});const errors=[],findings=[];fs.mkdirSync(path.join(base,'evidence'),{recursive:true});
 const names=fs.readdirSync(path.join(base,'fragments')).filter(x=>x.endsWith('.html'));
 const css=fs.readFileSync(path.join(base,'runtime/host.css'),'utf8'),helper=fs.readFileSync(path.join(base,'runtime/touch-controls.js'),'utf8');
 const themes=JSON.parse(fs.readFileSync(path.join(base,'evidence/themes.json'),'utf8'));
 for(const width of [320,360,736]){
  const page=await browser.newPage({viewport:{width,height:1000},deviceScaleFactor:1});page.on('pageerror',e=>errors.push(e.message));
  for(const name of names){try{
   const src=fs.readFileSync(path.join(base,'fragments',name),'utf8');
   const tokens=Object.entries(themes.warm).map(([k,v])=>`--${k}:${v}`).join(';');
   await page.setContent(`<style>${css}:root{${tokens}}</style><script>${helper}</script>${src}`);await page.waitForTimeout(80);
   const root=page.locator('section').first();
   assert(await root.evaluate(e=>!!e.sciApi),name+' API initialized');
   for(const theme of Object.keys(themes)){
    await page.evaluate(tokens=>{for(const[k,v]of Object.entries(tokens))document.documentElement.style.setProperty('--'+k,v)},themes[theme]);
    const issues=await page.evaluate(()=>{
     const out=[];
     if(document.documentElement.scrollWidth>innerWidth+1)out.push('horizontal page overflow');
     const controls=document.querySelector('[data-reset-area],[data-controls]');
     const lastSvg=[...document.querySelectorAll('section svg')].at(-1);
     if(controls&&lastSvg&&controls.getBoundingClientRect().top<lastSvg.getBoundingClientRect().bottom-1)out.push('controls precede last graph');
     for(const svg of document.querySelectorAll('section svg')){
      const box=svg.getBoundingClientRect();
      for(const t of svg.querySelectorAll('text')){
       const r=t.getBoundingClientRect();
       if(r.left<box.left-1||r.right>box.right+1||r.top<box.top-1||r.bottom>box.bottom+1)out.push('clipped text: '+t.textContent);
       if(parseFloat(getComputedStyle(t).fontSize)*box.width/svg.viewBox.baseVal.width<17.8)out.push('small text: '+t.textContent);
      }
     }
     return out;
    });
    findings.push(...issues.map(x=>`${name} width=${width} ${theme}: ${x}`));
   }
   // Native disclosure has an intrinsic-width, keyboard-operable toggle.
   const summary=page.locator('summary');
   if(await summary.count()){
    const before=await summary.boundingBox(),areaBox=await page.locator('[data-reset-area]').boundingBox();
    assert(before.width<areaBox.width-30,'disclosure is not a full-width hit target');assert(before.height>=44);
    await summary.click();assert(await page.locator('details').evaluate(e=>e.open));
    const after=await summary.boundingBox();assert.equal(before.width,after.width);
    await summary.press('Enter');assert.equal(await page.locator('details').evaluate(e=>e.open),false);
   }
   // Model controls remain local, returns are deterministic, reset geometry is fixed.
   const range=page.locator('input[type=range]').first();const initial=await root.evaluate(e=>({...e.dataset}));
   await range.evaluate(e=>{e.value=e.max;e.dispatchEvent(new Event('input',{bubbles:true}))});
   const changed=await root.evaluate(e=>({...e.dataset}));
   assert.notDeepEqual(changed,initial,name+' range changes state');
   // Endpoints stress text lengths and model invariants.
   const state=await root.evaluate(e=>({...e.dataset}));
   if(name==='resistor-coupling.html'){assert(Math.abs(+state.power-(+state.voltage)*(+state.current))<1e-9);assert.equal(+state.voltage,6);}
   if(name==='complex-wave.html')assert(Math.abs(state.real**2+state.imag**2-1)<1e-9);
   if(name==='diffusion-exchange.html')assert.equal(+state.total,100);
   if(name==='diffusion-lens.html')assert.equal(+state.count,160);
   if(name==='potential-force.html')assert.equal(+state.energy,3.125);
   if(name==='wave-addition.html')assert.equal(+state.amplitude,2);
   if(name==='quantum-linked.html')assert.equal(+state.energy,16);
   if(name==='sampling-distribution.html')assert.equal(JSON.parse(state.bins).reduce((a,b)=>a+b),1000);
   // Physical click on lower blank space invokes reset, not only API calls.
   const area=page.locator('[data-reset-area],[data-controls]').first();
   await area.scrollIntoViewIfNeeded();
   await area.click({position:{x:5,y:5}});await page.waitForTimeout(30);
   const after=await root.evaluate(e=>({...e.dataset}));assert.notDeepEqual(after,changed,name+' lower blank resets');
   const play=page.locator('[data-play]');
   if(await play.count()){
    const rect=await play.boundingBox();await play.click();await page.waitForTimeout(80);
    const rect2=await play.boundingBox();assert.equal(rect.width,rect2.width,name+' play width');assert.equal(rect.height,rect2.height,name+' play height');
    await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
    const paused=await root.evaluate(e=>({...e.dataset}));await page.waitForTimeout(100);assert.deepEqual(await root.evaluate(e=>({...e.dataset})),paused,name+' hidden pauses');
    await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});
    await page.waitForTimeout(100);assert.deepEqual(await root.evaluate(e=>({...e.dataset})),paused,name+' no autoresume');
   }
   // Test all comparison modes without changing unrelated range values.
   const modes=page.locator('button[data-mode]');for(let i=0;i<await modes.count();i++){await modes.nth(i).click();assert.equal(await modes.nth(i).getAttribute('aria-pressed'),'true');}
   await page.evaluate(tokens=>{for(const[k,v]of Object.entries(tokens))document.documentElement.style.setProperty('--'+k,v)},themes.warm);
   await page.screenshot({path:path.join(base,'evidence',`${name}-${width}.png`),fullPage:true});
   console.log('PASS behavior',name,width);
   }catch(e){errors.push(name+' '+width+': '+e.message);console.error('CASE FAIL',name,width,e.message);}
  }
  await page.close();
 }
 // Multiple iframe instances retain state during theme changes.
 const page=await browser.newPage();await page.goto('file://'+path.join(base,'examples/composition-check.html'));await page.waitForTimeout(150);
 assert.equal(page.frames().length,6,'composition contains five isolated examples');
 const oldA=page.frames()[4],oldB=page.frames()[5];await oldA.locator('input').evaluate(e=>{e.value=12;e.dispatchEvent(new Event('input'))});assert.equal(await oldA.locator('section').getAttribute('data-resistance'),'12');assert.equal(await oldB.locator('section').getAttribute('data-resistance'),'6','duplicate legacy ID stays isolated');
 const frame=page.frames()[1];await frame.locator('input').first().evaluate(e=>{e.value=100;e.dispatchEvent(new Event('input'))});
 const old=await frame.locator('section').evaluate(e=>({...e.dataset}));await page.locator('select').selectOption('dark');await page.waitForTimeout(50);
 assert.deepEqual(await frame.locator('section').evaluate(e=>({...e.dataset})),old,'theme preserves state');
 await page.goto('file://'+path.join(base,'evidence/ui-override.html'));await page.waitForTimeout(100);const uiFrame=page.frames()[1];assert.equal(await uiFrame.locator('summary').evaluate(e=>getComputedStyle(e).borderRadius),'20px','lecture UI overrides fragment defaults');
 await browser.close();fs.writeFileSync(path.join(base,'evidence/browser-report.json'),JSON.stringify({errors,findings},null,2));
 console.log('LAYOUT FINDINGS',JSON.stringify(findings));console.log('BEHAVIOR FINDINGS',JSON.stringify(errors));assert.deepEqual(errors,[],'runtime errors');assert.deepEqual(findings,[],'layout review findings');console.log('PASS all browser checks');
})().catch(e=>{console.error(e);process.exit(1)});
