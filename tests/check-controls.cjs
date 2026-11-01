/* Deterministic event-contract tests for the shared lower blank reset. */
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
class Target{
 constructor(){this.events={};this.classList={add(){},remove(){}};this.textContent='点空白复位';this.dataset={};}
 addEventListener(t,f,o={}){(this.events[t]??=new Set()).add(f);o.signal?.addEventListener('abort',()=>this.events[t].delete(f),{once:true});}
 emit(t,e={}){for(const f of this.events[t]||[])f(e)}
 closest(){return null}contains(t){return t===this||t===blank||t===control}
 querySelector(q){return q==='[data-reset-area]'?area:feedback}
}
const document=new Target(),window=new Target(),root=new Target(),area=new Target(),feedback=new Target(),blank=new Target(),control=new Target();control.closest=()=>control;
let resets=0,pauses=0,cancels=0,time=0;
vm.runInNewContext(fs.readFileSync(require('path').join(__dirname,'../runtime/touch-controls.js'),'utf8'),{window,document,AbortController,performance:{now:()=>time},setTimeout:()=>1,clearTimeout(){}});
window.SciControls.mount(root,{reset:()=>resets++,pause:()=>pauses++,cancelGesture:()=>cancels++});
const event=(target=blank,id=1,x=10)=>({target,pointerId:id,clientX:x,clientY:10,button:0,isPrimary:id===1});
const down=e=>{document.emit('pointerdown',e);area.emit('pointerdown',e)};
for(const kind of ['tap','control','drag','long','multi','scroll','cancel','leave','release-outside']){
 const before=resets;down(event(kind==='control'?control:blank));
 if(kind==='drag')document.emit('pointermove',event(blank,1,30));
 if(kind==='long')time+=600;
 if(kind==='multi')document.emit('pointerdown',event(control,2));
 if(kind==='scroll')document.emit('scroll');
 if(kind==='cancel')document.emit('pointercancel',event());
 if(kind==='leave')area.emit('pointerleave');
 document.emit('pointerup',event(kind==='release-outside'?new Target():blank));
 document.emit('pointerup',event(blank,2));
 assert.equal(resets,before+(kind==='tap'?1:0),kind);
}
root.emit('keydown',{key:'r',target:control,preventDefault(){}});assert.equal(resets,1,'typing in control does not reset');
root.emit('keydown',{key:'r',target:blank,preventDefault(){}});assert.equal(resets,2,'keyboard reset');
document.hidden=true;document.emit('visibilitychange');assert.equal(pauses,1);document.hidden=false;document.emit('visibilitychange');assert.equal(pauses,1,'return does not start anything');
root.sciDisposeControls();const before=resets;down(event());document.emit('pointerup',event());assert.equal(resets,before,'disposed listener removed');
console.log('PASS shared reset: blank, controls, drag, long, multi, scroll, cancel, leave, outside, keyboard, lifecycle');
