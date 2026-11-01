/* Shared lower control-area behavior. Load before legacy fragments. */
(()=>{
'use strict';
window.SciControls={
play(button,running,rest='播放'){
 button.textContent=running?'Ⅱ':'▶';
 button.setAttribute('aria-label',running?'暂停':rest);
 button.setAttribute('aria-pressed',String(running));
},
mount(root,{reset,pause=()=>{},cancelGesture=()=>{}}){
 const area=root.querySelector('[data-reset-area]');
 if(!area)throw Error('Missing lower control area');
 const feedback=area.querySelector('[data-feedback]');
 const prompt=feedback.textContent,abort=new AbortController(),signal=abort.signal;
 let candidate=null,timer=0,flash=0;const pointers=new Set();
 const ignore=t=>t.closest('button,input,select,textarea,a,label,summary,[role="button"]');
 const clear=()=>{candidate=null;};
 const listen=(el,type,fn,options={})=>el.addEventListener(type,fn,{...options,signal});
 const restore=()=>{cancelGesture();reset();clearTimeout(timer);clearTimeout(flash);area.classList.add('flash');feedback.textContent='已复位 ✓';flash=setTimeout(()=>area.classList.remove('flash'),180);timer=setTimeout(()=>feedback.textContent=prompt,900);};
 listen(document,'pointerdown',e=>{pointers.add(e.pointerId);if(pointers.size>1){clear();cancelGesture();}},{capture:true});
 listen(area,'pointerdown',e=>{if(e.button>0||!e.isPrimary||pointers.size>1||ignore(e.target)){clear();return;}candidate={id:e.pointerId,x:e.clientX,y:e.clientY,t:performance.now()};});
 listen(document,'pointermove',e=>{if(candidate&&candidate.id===e.pointerId&&Math.hypot(e.clientX-candidate.x,e.clientY-candidate.y)>8)clear();},{capture:true});
 listen(document,'pointerup',e=>{const c=candidate;clear();pointers.delete(e.pointerId);if(c&&c.id===e.pointerId&&area.contains(e.target)&&!ignore(e.target)&&performance.now()-c.t<500&&Math.hypot(e.clientX-c.x,e.clientY-c.y)<=8)restore();},{capture:true});
 listen(document,'pointercancel',e=>{pointers.delete(e.pointerId);clear();cancelGesture();},{capture:true});
 listen(area,'pointerleave',clear);listen(area,'lostpointercapture',clear);
 listen(document,'scroll',clear,{capture:true});
 listen(document,'visibilitychange',()=>{clear();pointers.clear();cancelGesture();if(document.hidden)pause();});
 listen(window,'blur',()=>{clear();pointers.clear();cancelGesture();pause();});
 listen(root,'keydown',e=>{if(e.key.toLowerCase()==='r'&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!e.target.closest('input,textarea,select,[contenteditable="true"]')){e.preventDefault();restore();}});
 root.tabIndex=0;
 root.sciApi={reset:restore,pause,getState:()=>({...root.dataset})};
 root.sciDisposeControls=()=>{abort.abort();clearTimeout(timer);clearTimeout(flash);pause();};
 return root.sciApi;
}
};
})();
