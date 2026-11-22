/* Framework-neutral Rua published-content overlay. Source HTML/CSS remain the fallback. */
(async()=>{
 const key=document.currentScript?.dataset.ruaPage; // Deferred scripts can retain currentScript.
 if(!key)return;
 const timeout=()=>AbortSignal.timeout(5000);
 try{
  const config=await fetch('/public/rua-config.json',{signal:timeout()}).then(r=>{if(!r.ok)throw Error();return r.json()});
  const base=new URL(config.publicApiUrl);if(base.protocol!=='https:'&&base.hostname!=='127.0.0.1')return;
  const [bindings,response]=await Promise.all([
   fetch('/public/rua-bindings.json',{signal:timeout()}).then(r=>r.json()),
   fetch(new URL('/api/public/studio/stacked-burger-bar/pages/'+key,base),{signal:timeout()})
  ]);
  if(!response.ok)return;
  const content=await response.json();if(content.registryId!=='stacked-burger-bar@1.0.0')return;
  const page=bindings[key];const block=content.data?.content?.find(c=>c.type===page?.type);
  if(!block||!page)return;
  function apply(){
   for(const binding of page.bindings){
    const node=document.querySelector(binding.selector),value=block.props?.values?.[binding.key];
    if(!node||typeof value!=='string'||value.length>20000)continue;
    if(binding.attribute){
     if(['href','src'].includes(binding.attribute)){
      try{const url=new URL(value,location.href);if(!['https:','http:','mailto:','tel:'].includes(url.protocol))continue;if(binding.attribute==='src'&&url.origin!==location.origin)continue}catch{continue}
     }
     if(node.getAttribute(binding.attribute)!==value)node.setAttribute(binding.attribute,value);
    }else{const text=node.childNodes[binding.textIndex];if(text?.nodeType===3&&text.textContent!==value)text.textContent=value}
   }
  }
  apply();
  const target=document.querySelector('[data-source]');
  if(target&&!target.childNodes.length){const observer=new MutationObserver(()=>{if(target.childNodes.length){observer.disconnect();apply()}});observer.observe(target,{childList:true});setTimeout(()=>observer.disconnect(),10000)}
 }catch{/* Original source content remains intact when Hub is unavailable. */}
})();
(async()=>{
 try{
  const config=await fetch('/public/rua-config.json',{signal:AbortSignal.timeout(5000)}).then(r=>r.json());
  const response=await fetch(new URL('/api/public/studio/stacked-burger-bar/state',config.publicApiUrl),{signal:AbortSignal.timeout(5000)});
  if(!response.ok)return;const state=await response.json();
  if(!['maintenance','restricted'].includes(state.mode))return;
  const main=document.createElement('main');main.style.cssText='max-width:640px;margin:15vh auto;padding:24px;font-family:system-ui';
  const title=document.createElement('h1');title.textContent='We will be back shortly';
  const message=document.createElement('p');message.textContent=state.message||'Please check back soon.';
  main.append(title,message);document.body.replaceChildren(main);
 }catch{/* Availability state is best effort; source content remains the fallback. */}
})();
