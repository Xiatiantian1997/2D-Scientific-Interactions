/* Scientific component behavior. Models own state; themes own appearance. */
(()=>{
'use strict';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const modulo=(v,p)=>((v%p)+p)%p;
window.SciControls={mount(root,{controls,pause=()=>{},cancelGesture=()=>{},transport,graph}){
 const host=root.querySelector('[data-controls]'), abort=new AbortController(), signal=abort.signal;
 if(!host)throw Error('An experiment requires a data-controls host');
 const listen=(node,type,fn,options={})=>node.addEventListener(type,fn,{...options,signal});
 const make=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
 const groups=new Map();
 const refresh=[],resets=new Map(),values=new Map(),pointers=new Set();let syncing=false,gesture=null;
 const sync=()=>{if(syncing)return;syncing=true;try{refresh.forEach(f=>f());}finally{syncing=false;}};
 root.sciSync=sync;host.className='sci-panel';
 // A pointer must remain a short, single-pointer tap. A vertical swipe belongs to scrolling.
 function bindGesture(el,{axis='x',accept=()=>true,start=()=>{},move=()=>{},tap=()=>{},end=()=>{},cancel=()=>{}}){
  let g=null;
  const discard=()=>{if(g){g=null;cancel();}if(gesture===discard)gesture=null;};
  listen(el,'pointerdown',e=>{if(!e.isPrimary||e.button>0||pointers.size>1||!accept(e))return;g={id:e.pointerId,x:e.clientX,y:e.clientY,t:performance.now(),moved:false};gesture=discard;start(e);});
  listen(document,'pointermove',e=>{if(!g||g.id!==e.pointerId)return;const dx=e.clientX-g.x,dy=e.clientY-g.y;if(axis==='x'&&!g.moved&&Math.abs(dy)>8&&Math.abs(dy)>Math.abs(dx)){discard();return;}if(Math.abs(dx)>6||(axis==='free'&&Math.abs(dy)>6)||g.moved){g.moved=true;move(e,dx);}}, {capture:true});
  listen(document,'pointerup',e=>{if(!g||g.id!==e.pointerId)return;const q=g;g=null;gesture=null;if(q.moved)end(e);else if(performance.now()-q.t<500&&Math.hypot(e.clientX-q.x,e.clientY-q.y)<=8)tap(e);else cancel();sync();},{capture:true});
  listen(document,'pointercancel',discard,{capture:true});
  return discard;
 }
 listen(document,'pointerdown',e=>{pointers.add(e.pointerId);if(pointers.size>1){gesture?.();cancelGesture();}},{capture:true});
 for(const type of ['pointerup','pointercancel'])listen(document,type,e=>pointers.delete(e.pointerId));
 const stopAll=()=>{gesture?.();pointers.clear();cancelGesture();pause();sync();};
 listen(document,'scroll',()=>{gesture?.();cancelGesture();},{capture:true});
 listen(window,'blur',stopAll);listen(document,'visibilitychange',()=>{if(document.hidden)stopAll();});
 for(const c of controls){
  const field=make('div','sci-field');field.dataset.scope=c.key;field.tabIndex=0;
  const heading=make('div','sci-heading'),label=make('span','sci-label',c.label),out=make('output','sci-value');heading.append(label,out);field.append(heading);
  const input=c.input;let get=c.get,set=c.set;
  if(input){get=()=>Number(input.value);set=v=>{input.value=v;input.dispatchEvent(new Event('input',{bubbles:true}));};}
  const read=()=>get?.();values.set(c.key,read);
  function apply(v){const resume=transport?.isPlaying();set(v);if(resume&&!c.transport&&!transport.isPlaying())transport.toggle();sync();}
  const defaultValue=c.defaultValue??c.items?.[0]?.[0];
  if(c.kind==='action'){
   const button=make('button','sci-button',c.text);button.type='button';listen(button,'click',()=>{c.act();sync();});field.append(button);out.hidden=true;
  }else if(c.kind==='choice'){
   const button=make('button','sci-button');button.type='button';button.setAttribute('aria-label',c.label+'：点击切换');
   listen(button,'click',()=>{const i=c.items.findIndex(a=>a[0]===read());apply(c.items[(i+1)%c.items.length][0]);});field.append(button);out.hidden=true;
   refresh.push(()=>{button.textContent=c.items.find(a=>a[0]===read())?.[1]??String(read());button.dataset.value=read();button.setAttribute('aria-label',c.label+'：'+button.textContent+'，点击切换');});
  }else{
   const min=c.min??Number(input.min),max=c.max??Number(input.max),step=c.step??Number(input.step||1);
   // Existing native inputs are the model's adapter; all visible controls share this runtime.
   if(input){input.hidden=true;input.tabIndex=-1;input.setAttribute('aria-hidden','true');field.append(input);}
   const track=make('div',c.kind==='wheel'?'sci-wheel':'sci-slider');track.tabIndex=0;track.setAttribute('role','slider');track.setAttribute('aria-label',c.label);track.setAttribute('aria-valuemin',min);track.setAttribute('aria-valuemax',max);field.append(track);
   const fill=make('span','sci-fill'),strip=make('span','sci-strip');track.append(fill,strip);
   let origin=0,wasPlaying=false,didPause=false,raw=0;
   const normalize=v=>c.period?min+modulo(v-min,c.period):clamp(v,min,max);
   const update=v=>{raw=v;const n=normalize(v);set(c.discrete?normalize(Math.round(v)):Math.round(n/step)*step);sync();};
   const isWheel=c.kind==='wheel',stops=c.stops||[];
   const formatted=v=>(Math.round(v*100)/100)+(c.unit||'');
   const next=()=>{const current=read(),n=stops.find(v=>v>current+1e-7);apply(n??stops[0]);};
   const toggle=()=>{c.transport?.toggle();sync();};
   bindGesture(track,{
    start:()=>{origin=read();raw=origin;wasPlaying=!!c.transport?.isPlaying();didPause=false;},
    move:(e,dx)=>{if(!didPause){if(c.transport)pause();didPause=true;}const width=track.getBoundingClientRect().width;update(origin+(isWheel?-dx/Math.max(60,width/3)*(stops[1]-stops[0]||1):dx/width*(max-min)));},
    tap:e=>{if(isWheel){const b=track.getBoundingClientRect(),part=(e.clientX-b.left)/b.width;if(c.transport&&(part<.3||part>.7))toggle();else next();}else if(c.transport)toggle();else{const b=track.getBoundingClientRect();update(min+(e.clientX-b.left)/b.width*(max-min));}},
    end:()=>{if(isWheel){const current=normalize(raw),near=(c.period?[...stops,stops[0]+c.period]:stops).reduce((a,v)=>Math.abs(v-current)<Math.abs(a-current)?v:a,stops[0]);const gap=stops[1]-stops[0]||1;if(c.discrete)update(Math.round(raw));else if(Math.abs(near-current)<=gap*.14)update(near);}
     if(wasPlaying&&!c.transport.isPlaying())c.transport.toggle();},
    cancel:()=>{if(didPause&&c.transport)pause();}
   });
   listen(track,'keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End',' '].includes(e.key)){e.preventDefault();if(e.key===' '){if(c.transport)toggle();else if(isWheel)next();return;}update(e.key==='Home'?min:e.key==='End'?max:read()+(e.key==='ArrowRight'?1:-1)*(isWheel?(stops[1]-stops[0]||1):step));}});
   refresh.push(()=>{const v=read();out.textContent=formatted(v);track.setAttribute('aria-valuenow',v);track.setAttribute('aria-valuetext',formatted(v));track.dataset.playing=String(!!c.transport?.isPlaying());track.style.setProperty('--sci-progress',100*clamp((v-min)/(max-min),0,1)+'%');
    if(isWheel){const gap=stops[1]-stops[0]||1,index=Math.floor((v-min)/gap),fraction=(v-min)/gap-index;strip.replaceChildren();for(let i=-2;i<=2;i++){const item=make('span','sci-tick',formatted(normalize(min+(index+i)*gap)));item.style.transform=`translateX(${(i-fraction)*100}%)`;strip.append(item);}fill.hidden=true;}
   });
  }
  if(c.kind!=='action'){
   const hint=make('span','sci-hint','点本区空白复位');field.append(hint);
   const reset=()=>{cancelGesture();apply(defaultValue);field.classList.remove('sci-flash');void field.offsetWidth;field.classList.add('sci-flash');field.setAttribute('aria-label',c.label+'，已复位');};resets.set(c.key,reset);
   // Reset only when down and up are on this field's actual blank background.
   let blank=false;bindGesture(field,{accept:e=>e.target===field,start:e=>{blank=true;},tap:e=>{if(blank&&e.target===field)reset();},move:()=>{blank=false;},cancel:()=>{blank=false;}});
   listen(field,'keydown',e=>{if(e.key==='Escape'&&!e.target.closest('input,textarea,[contenteditable=true]')){e.stopPropagation();reset();}});
  }
  const family=['action','choice'].includes(c.kind)?'buttons':c.kind==='wheel'?'wheels':'sliders';if(!groups.has(family)){const group=make('div','sci-group');group.dataset.family=family;groups.set(family,group);host.append(group);}groups.get(family).append(field);
 }
 // Graph taps pause/play; existing model-specific drags still edit the same state.
 if(graph&&transport){
  let before=false,oldDown=graph.onpointerdown,oldMove=graph.onpointermove,oldUp=graph.onpointerup;
  graph.onpointerdown=graph.onpointermove=graph.onpointerup=null;
  let event=null,started=false;
  bindGesture(graph,{axis:root.id==='complex-wave'?'free':'x',start:e=>{before=transport.isPlaying();event=e;started=false;},move:e=>{if(!started){started=true;pause();oldDown?.call(graph,event);}oldMove?.call(graph,e);},tap:()=>transport.toggle(),end:e=>{oldUp?.call(graph,e);cancelGesture();if(before&&!transport.isPlaying())transport.toggle();},cancel:()=>cancelGesture()});
 }
 root.sciApi={getState:()=>({...root.dataset}),getControl:key=>values.get(key)?.(),reset:key=>{if(!resets.has(key))throw Error('A valid local scope is required');resets.get(key)();},pause:()=>{pause();sync();},controls:controls.map(c=>({key:c.key,kind:c.kind||'slider',playable:!!c.transport,defaultValue:c.defaultValue??c.items?.[0]?.[0]}))};
 root.sciDisposeControls=()=>{abort.abort();pause();delete root.sciSync;};sync();return root.sciApi;
}};
})();
