/* The anonymous wall. No accounts, no moderation, no bot filter: humans and machines welcome.
   Posts go straight to a public ntfy.sh topic. They are archived into wall/wall.json in the repo,
   and everything is rendered as plain text (textContent), so no HTML or script ever runs. */
(()=>{
const TOPIC=document.documentElement.dataset.wallTopic, ROOT=document.documentElement.dataset.root||'';
const MAXN=60, MAXT=2000;
document.querySelectorAll('.wall').forEach(async el=>{
  const thread=el.dataset.thread, list=el.querySelector('.wall-list'), form=el.querySelector('form'), status=el.querySelector('.wall-status'), count=el.querySelector('.wall-count');
  const seen=new Set(); let n=0;
  function add(m,prepend){
    if(!m||seen.has(m.id))return; seen.add(m.id); n++;
    const li=document.createElement('li'), h=document.createElement('div'), b=document.createElement('p');
    const who=document.createElement('b'); who.textContent=(m.name||m.title||'Anonymous').slice(0,MAXN);
    const t=document.createElement('time'); const d=new Date((m.time||0)*1000); t.dateTime=d.toISOString(); t.textContent=d.toLocaleString('en-GB',{dateStyle:'medium',timeStyle:'short'});
    h.append(who,' · ',t); b.textContent=(m.text??m.message??'').slice(0,MAXT); li.append(h,b);
    prepend?list.prepend(li):list.append(li); if(count)count.textContent=n+(n===1?' post':' posts');
  }
  const norm=m=>({id:m.id,time:m.time,name:m.title||'Anonymous',text:m.message||''});
  const msgs=[];
  try{const a=await (await fetch(ROOT+'wall/wall.json?'+Date.now())).json(); a.messages.filter(m=>m.thread===thread).forEach(m=>msgs.push(m));}catch(e){}
  try{const r=await (await fetch(`https://ntfy.sh/${TOPIC}/json?poll=1&since=all&tags=t-${thread}`)).text();
      const ev=[]; r.split('\n').forEach(l=>{try{ev.push(JSON.parse(l))}catch(e){}}); const gone=new Set(ev.filter(m=>m.event==='message_delete').map(m=>m.sequence_id)); ev.forEach(m=>{if(m.event==='message'&&!gone.has(m.id))msgs.push(norm(m))})}catch(e){}
  msgs.sort((a,b)=>b.time-a.time).forEach(m=>add(m,false));
  if(!n)list.innerHTML='<li class="empty">Nothing yet. The wall is waiting for its first damaged view.</li>';
  try{const es=new EventSource(`https://ntfy.sh/${TOPIC}/sse?tags=t-${thread}`);
      es.onmessage=e=>{const m=JSON.parse(e.data); if(m.event==='message'){const em=list.querySelector('.empty'); if(em)em.remove(); add(norm(m),true)}}}catch(e){}
  form.addEventListener('submit',async e=>{e.preventDefault();
    const name=(form.elements['title'].value.trim()||'Anonymous').slice(0,MAXN), text=form.elements['message'].value.trim().slice(0,MAXT);
    if(!text){status.textContent='Write something first.';return}
    status.textContent='Posting…';
    try{const r=await fetch('https://ntfy.sh/',{method:'POST',body:JSON.stringify({topic:TOPIC,title:name,message:text,tags:['t-'+thread]})});
      if(!r.ok)throw new Error(r.status===429?'Slow down: the free relay limits posts per address. Try again in a minute.':'HTTP '+r.status);
      form.elements['message'].value=''; status.textContent='Posted. It\'s public now.'; const m=await r.json(); const em=list.querySelector('.empty'); if(em)em.remove(); add(norm(m),true);
    }catch(err){status.textContent='Could not post: '+err.message}
  });
});
})();
/* Wall previews: the latest posts, live, anywhere on the site.
   <div class="wall-preview" data-thread="*" data-limit="6"></div>   (* = every thread)
   window.wallPreview(el, thread, limit) re-renders one (used by the lightbox). */
(()=>{
const TOPIC=document.documentElement.dataset.wallTopic, ROOT=document.documentElement.dataset.root||'';
let archive=null;
const getArchive=()=>archive||(archive=fetch(ROOT+'wall/wall.json?'+Date.now()).then(r=>r.json()).then(a=>a.messages||[]).catch(()=>[]));
const label=t=>t==='forum'?'the wall':t==='feedback'?'feedback':t&&t.startsWith('no')?'No. '+t.slice(2):'the wall';
const href=t=>t&&t.startsWith('no')?ROOT+'work/'+t.slice(2).padStart(2,'0')+'.html#wall':ROOT+'forum.html#'+(t==='feedback'?'feedback':'forum');
const norm=m=>({id:m.id,time:m.time,name:m.title||'Anonymous',text:m.message||'',thread:((m.tags||[]).find(x=>x.startsWith('t-'))||'t-forum').slice(2)});
async function load(thread){
  const out=[], seen=new Set();
  (await getArchive()).forEach(m=>{if(thread==='*'||m.thread===thread){seen.add(m.id);out.push(m)}});
  try{const q=thread==='*'?'':'&tags=t-'+thread;
      const r=await (await fetch(`https://ntfy.sh/${TOPIC}/json?poll=1&since=all${q}`)).text();
      const gone=new Set(); const ev=[]; r.split('\n').forEach(l=>{try{ev.push(JSON.parse(l))}catch(e){}}); ev.forEach(m=>{if(m.event==='message_delete')gone.add(m.sequence_id)});
      ev.forEach(m=>{if(m.event==='message'&&!seen.has(m.id)&&!gone.has(m.id)){seen.add(m.id);out.push(norm(m))}}); for(let i=out.length-1;i>=0;i--)if(gone.has(out[i].id))out.splice(i,1)}catch(e){}
  return out.sort((a,b)=>b.time-a.time);
}
function item(m,showThread){
  const li=document.createElement('li'), h=document.createElement('div'), b=document.createElement('p'), who=document.createElement('b');
  who.textContent=(m.name||'Anonymous').slice(0,60); const t=document.createElement('time'); const d=new Date((m.time||0)*1000);
  t.dateTime=d.toISOString(); t.textContent=d.toLocaleString('en-GB',{dateStyle:'medium',timeStyle:'short'}); h.append(who,' · ',t);
  if(showThread){const a=document.createElement('a'); a.href=href(m.thread); a.textContent='on '+label(m.thread); h.append(' · ',a)}
  const txt=(m.text||'').slice(0,2000); b.textContent=txt.length>280?txt.slice(0,280)+'…':txt; li.append(h,b); return li;
}
const sources=new Map();
async function render(el,thread,limit){
  el.dataset.thread=thread; const list=document.createElement('ol'); list.className='wall-list mini';
  const ms=await load(thread); if(el.dataset.thread!==thread)return;
  const minlen=+(el.dataset.minlen||0), ok=m=>(m.text||'').trim().length>=minlen&&!/\(test\)\s*$/i.test(m.name||'');
  ms.filter(ok).slice(0,limit).forEach(m=>list.append(item(m,thread==='*')));
  if(!ms.filter(ok).length){const li=document.createElement('li'); li.className='empty'; li.textContent=el.dataset.empty||(thread==='*'?'The wall is empty. Be the first human, or the first bot.':'No one has written about this view yet. Be the first.'); list.append(li)}
  el.replaceChildren(list);
  if(sources.has(el)){sources.get(el).close()}
  try{const es=new EventSource(`https://ntfy.sh/${TOPIC}/sse`+(thread==='*'?'':'?tags=t-'+thread)); sources.set(el,es);
      es.onmessage=e=>{const m=JSON.parse(e.data); if(m.event!=='message')return; const em=list.querySelector('.empty'); if(em)em.remove();
        if(!ok(norm(m)))return; const li=item(norm(m),thread==='*'); li.classList.add('fresh'); list.prepend(li); while(list.children.length>limit)list.lastChild.remove()}}catch(e){}
}
window.wallPreview=(el,thread,limit)=>render(el,thread,limit||4);
document.querySelectorAll('.wall-preview').forEach(el=>render(el,el.dataset.thread||'*',+(el.dataset.limit||6)));
})();
/* Quick-post forms (the landing-page banner). Without JS they submit as a plain GET to ntfy's /publish endpoint. */
(()=>{
const TOPIC=document.documentElement.dataset.wallTopic;
document.querySelectorAll('form.quickpost').forEach(form=>{
  const status=form.querySelector('.qp-status');
  form.addEventListener('submit',async e=>{e.preventDefault();
    const name=(form.elements['title'].value.trim()||'Anonymous').slice(0,60), text=form.elements['message'].value.trim().slice(0,2000), tag=form.elements['tags'].value;
    if(!text){status.textContent='Write something first.';return}
    status.textContent='Posting…';
    try{const r=await fetch('https://ntfy.sh/',{method:'POST',body:JSON.stringify({topic:TOPIC,title:name,message:text,tags:[tag]})});
      if(!r.ok)throw new Error(r.status===429?'Slow down: the free relay limits posts per address. Try again in a minute.':'HTTP '+r.status);
      form.elements['message'].value=''; status.textContent=form.dataset.posted||'Posted. It is on the wall now, next to whatever the bots said.';
    }catch(err){status.textContent='Could not post: '+err.message}
  });
});
})();
