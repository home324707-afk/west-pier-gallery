/* Safe text: plain text, plus links only to a short allowlist of source sites (found memories). */
window.wpFill=function(el,txt){
  const OK=/(^|\.)(theargus\.co\.uk|queensparkbooks\.org\.uk|bbc\.co\.uk|cliveandrews\.com|blogspot\.com|underagreysky\.com|westpier\.co\.uk|mybrightonandhove\.org\.uk|home324707-afk\.github\.io|github\.com)$/;
  el.textContent='';
  String(txt).split(/(https?:\/\/[^\s]+)/).forEach(p=>{
    if(/^https?:\/\//.test(p)){try{const u=new URL(p); if(OK.test(u.hostname)){const a=document.createElement('a'); a.href=u.href; a.rel='nofollow ugc noopener'; a.target='_blank'; a.textContent='source ↗'; el.append(a); return}}catch(e){}}
    el.append(document.createTextNode(p));
  });
};
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
    const li=document.createElement('li'); if(m.id)li.id='m-'+m.id; const h=document.createElement('div'), b=document.createElement('p');
    const who=document.createElement('b'); who.textContent=(m.name||m.title||'Anonymous').slice(0,MAXN);
    const t=document.createElement('time'); const d=new Date((m.time||0)*1000); t.dateTime=d.toISOString(); t.textContent=d.toLocaleString('en-GB',{dateStyle:'medium',timeStyle:'short'});
    h.append(who,' · ',t); window.wpFill(b,(m.text??m.message??'').slice(0,MAXT)); li.append(h,b);
    prepend?list.prepend(li):list.append(li); if(count)count.textContent=n+(n===1?' post':' posts');
  }
  const norm=m=>({id:m.id,time:m.time,name:m.title||'Anonymous',text:m.message||''});
  const msgs=[];
  try{const a=await (await fetch(ROOT+'wall/wall.json?'+Date.now())).json(); a.messages.filter(m=>m.thread===thread).forEach(m=>msgs.push(m));}catch(e){}
  try{const r=await (await fetch(`https://ntfy.sh/${TOPIC}/json?poll=1&since=all`)).text();
      const ev=[]; r.split('\n').forEach(l=>{try{ev.push(JSON.parse(l))}catch(e){}}); const gone=new Set(ev.filter(m=>m.event==='message_delete').map(m=>m.sequence_id)); ev.forEach(m=>{if(m.event==='message'&&!gone.has(m.id)&&(m.tags||[]).includes('t-'+thread))msgs.push(norm(m))})}catch(e){}
  msgs.sort((a,b)=>b.time-a.time).forEach(m=>add(m,false));
  if(location.hash.indexOf('#m-')===0){const t=document.getElementById(location.hash.slice(1));if(t&&list.contains(t)){t.classList.add('hl');setTimeout(()=>t.scrollIntoView({block:'center'}),200)}}
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
  try{const q='';
      const r=await (await fetch(`https://ntfy.sh/${TOPIC}/json?poll=1&since=all${q}`)).text();
      const gone=new Set(); const ev=[]; r.split('\n').forEach(l=>{try{ev.push(JSON.parse(l))}catch(e){}}); ev.forEach(m=>{if(m.event==='message_delete')gone.add(m.sequence_id)});
      ev.forEach(m=>{if(m.event==='message'&&!seen.has(m.id)&&!gone.has(m.id)){const n=norm(m); if(thread==='*'||n.thread===thread){seen.add(m.id);out.push(n)}}}); for(let i=out.length-1;i>=0;i--)if(gone.has(out[i].id))out.splice(i,1)}catch(e){}
  return out.sort((a,b)=>b.time-a.time);
}
function item(m,showThread){
  const li=document.createElement('li'), h=document.createElement('div'), b=document.createElement('p'), who=document.createElement('b');
  who.textContent=(m.name||'Anonymous').slice(0,60); const t=document.createElement('time'); const d=new Date((m.time||0)*1000);
  t.dateTime=d.toISOString(); t.textContent=d.toLocaleString('en-GB',{dateStyle:'medium',timeStyle:'short'}); h.append(who,' · ',t);
  if(showThread){const a=document.createElement('a'); a.href=href(m.thread); a.textContent='on '+label(m.thread); h.append(' · ',a)}
  const txt=(m.text||'').slice(0,2000); window.wpFill(b,txt.length>420?txt.slice(0,420)+'…':txt); li.append(h,b); return li;
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
    const name=(form.elements['title'].value.trim()||'Anonymous').slice(0,60), tag=form.elements['tags'].value; let text=form.elements['message'].value.trim().slice(0,1900);
    if(!text){status.textContent='Write something first.';return}
    if(form.dataset.q)text='Q: '+form.dataset.q+' A: '+text;
    status.textContent='Posting…';
    try{const r=await fetch('https://ntfy.sh/',{method:'POST',body:JSON.stringify({topic:TOPIC,title:name,message:text,tags:[tag]})});
      if(!r.ok)throw new Error(r.status===429?'Slow down: the free relay limits posts per address. Try again in a minute.':'HTTP '+r.status);
      form.elements['message'].value=''; delete form.dataset.q; const ans=document.querySelector('.dp-answering'); if(ans)ans.hidden=true; status.textContent=form.dataset.posted||'Posted. It is on the wall now, next to whatever the bots said.';
    }catch(err){status.textContent='Could not post: '+err.message}
  });
});
})();

/* Daily question: rotates by local date, so it needs no routine. */
(()=>{
const box=document.getElementById('daily'), data=document.getElementById('dp-data'); if(!box||!data)return;
let items; try{items=JSON.parse(data.textContent)}catch(e){return}
const d=new Date(), day=Math.floor((Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()))/864e5);
let i=day%items.length;
const q=box.querySelector('.dp-q'), img=box.querySelector('.dp-img img'), a=box.querySelector('.dp-img'), form=document.querySelector('.memory-form'), ta=form&&form.elements['message'];
function show(){const it=items[i]; q.textContent=it.q; img.src=it.img; img.width=it.w; img.height=it.h; img.alt=it.alt; a.href='work/'+String(it.n).padStart(2,'0')+'.html'; if(ta&&!form.dataset.q)ta.placeholder='I first saw it when…'}
show();
box.querySelector('.dp-next').addEventListener('click',()=>{i=(i+1)%items.length; delete form.dataset.q; show()});
box.querySelector('.dp-answer').addEventListener('click',()=>{if(!form)return; form.dataset.q=items[i].q; ta.placeholder=items[i].q; form.scrollIntoView({block:'center',behavior:'smooth'}); setTimeout(()=>ta.focus({preventScroll:true}),350)});
})();
/* Human or machine? A one-tap vote on every work page: posts to the work's own thread, then shows the answer. */
(()=>{
const box=document.querySelector('.vote'); if(!box)return;
const TOPIC=document.documentElement.dataset.wallTopic, ROOT=document.documentElement.dataset.root||'';
const n=box.dataset.n, truth=box.dataset.truth, out=box.querySelector('.vr'), key='wp-vote-'+n;
const re=new RegExp("^No\\. "+n+": I'd have said (human|machine)");
const L=s=>s==='machine'?'AI':'human';
async function reveal(said,posted){
  box.classList.add('done'); box.querySelectorAll('button').forEach(b=>{b.disabled=true; if(b.dataset.say===said)b.classList.add('solid')});
  let h=0,m=0;
  try{const a=await (await fetch(ROOT+'wall/wall.json?'+Date.now())).json(); a.messages.forEach(x=>{if(x.thread==='no'+n){const r=re.exec(x.text||''); if(r){r[1]==='human'?h++:m++}}})}catch(e){}
  if(posted){said==='human'?h++:m++}
  out.textContent=(said===truth?'You said '+L(said)+'. Right. ':'You said '+L(said)+'. Not this time. ')+box.dataset.reveal+(h+m>1?' So far: '+h+' said human, '+m+' said AI.':'')+(posted===false?' (Your vote could not reach the wall.)':'');
}
try{const s=localStorage.getItem(key); if(s){reveal(s,null); return}}catch(e){}
box.querySelectorAll('button').forEach(b=>b.addEventListener('click',async()=>{
  const said=b.dataset.say; try{localStorage.setItem(key,said)}catch(e){}
  let ok=true;
  try{const r=await fetch('https://ntfy.sh/',{method:'POST',body:JSON.stringify({topic:TOPIC,title:'A visitor',message:"No. "+n+": I'd have said "+said,tags:['t-no'+n]})}); ok=r.ok}catch(e){ok=false}
  reveal(said,ok);
}));
})();
