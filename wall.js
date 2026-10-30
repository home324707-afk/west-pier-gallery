/* Our own early test posts, hidden at display time only. They stay in wall/wall.json and on ntfy, so this is reversible: remove an id to show it again.
   Exact ntfy ids only, plus placeholder names copied from the docs (YOUR_*) and "(test)" names. Nothing is matched by broad text patterns. */
window.wpHiddenIds=new Set(['E528F9lQeMBw','NELUkupkL00F','LW60rH0LvIk1','8aJx8MmNEDrk','qp710DSkINcQ','iKDur4pspJc9','LJOmaAlORDfa','SSHO6pMe1iPz','sdQlZ2PBR7JA','j1T7b79R5VZg']);
window.wpIsTest=m=>window.wpHiddenIds.has(m.id)||/\(test\)\s*$/i.test(m.name||m.title||'')||/^YOUR_/.test(m.name||m.title||'');
/* Safe text: plain text, plus links only to a short allowlist of source sites (found memories). */
window.wpFill=function(el,txt){
  const OK=/(^|\.)(theargus\.co\.uk|queensparkbooks\.org\.uk|bbc\.co\.uk|cliveandrews\.com|blogspot\.com|underagreysky\.com|westpier\.co\.uk|mybrightonandhove\.org\.uk|home324707-afk\.github\.io|github\.com)$/;
  el.textContent='';
  String(txt).split(/(https?:\/\/[^\s]+)/).forEach(p=>{
    if(/^https?:\/\//.test(p)){try{const u=new URL(p); if(OK.test(u.hostname)){const a=document.createElement('a'); a.href=u.href; a.rel='nofollow ugc noopener'; a.target='_blank'; a.textContent='source ↗'; el.append(a); return}}catch(e){}}
    el.append(document.createTextNode(p));
  });
};
/* The open debate. No accounts, no moderation, no bot filter: humans and machines welcome.
   Posts go straight to a public ntfy.sh topic. They are archived into wall/wall.json in the repo,
   and everything is rendered as plain text (textContent), so no HTML or script ever runs.
   One conversation: the debate page reads every thread (the general one, feedback, and the older per-picture ones) and posts to t-forum. */
(()=>{
const TOPIC=document.documentElement.dataset.wallTopic, ROOT=document.documentElement.dataset.root||'';
const MAXN=60, MAXT=2000;
const OKT=t=>t==='forum'||t==='feedback'||/^no\d+$/.test(t||'');   /* t-submit (open-call entries) is not conversation */
const tagOf=m=>{const t=(m.tags||[]).find(x=>/^t-(forum|feedback|no\d+)$/.test(x)); return t?t.slice(2):(m.tags||[]).some(x=>/^t-/.test(x))?'':'forum'};
const isFound=t=>/^Found memory/i.test(t||'');
const pad=n=>String(n).padStart(2,'0');
document.querySelectorAll('.wall').forEach(async el=>{
  const thread=el.dataset.thread, all=el.dataset.read==='*', list=el.querySelector('.wall-list:not(.found-list)'), foundList=el.querySelector('.found-list'), form=el.querySelector('form'), status=el.querySelector('.wall-status'), count=el.querySelector('.wall-count'), fcount=el.querySelector('.found-count');
  const seen=new Set(); let n=0, nf=0;
  function add(m,prepend){
    if(!m||seen.has(m.id))return; seen.add(m.id); if(window.wpIsTest(m))return;
    const txt=(m.text??m.message??'').slice(0,MAXT), found=!!foundList&&isFound(txt), tgt=found?foundList:list;
    const li=document.createElement('li'); if(m.id)li.id='m-'+m.id; const h=document.createElement('div'), b=document.createElement('p');
    const who=document.createElement('b'); who.textContent=(m.name||m.title||'Anonymous').slice(0,MAXN);
    const t=document.createElement('time'); const d=new Date((m.time||0)*1000); t.dateTime=d.toISOString(); t.textContent=d.toLocaleString('en-GB',{dateStyle:'medium',timeStyle:'short'});
    h.append(who,' · ',t);
    const mm=/^no(\d+)$/.exec(m.thread||''); if(all&&mm){const a=document.createElement('a'); a.href=ROOT+'work/'+pad(mm[1])+'.html'; a.textContent='on No. '+mm[1]; h.append(' · ',a)}
    window.wpFill(b,txt); li.append(h,b);
    prepend?tgt.prepend(li):tgt.append(li);
    if(found){nf++; if(fcount)fcount.textContent='('+nf+')'} else {n++; if(count)count.textContent=n+(n===1?' post':' posts')}
  }
  const norm=m=>({id:m.id,time:m.time,name:m.title||'Anonymous',text:m.message||'',thread:tagOf(m)});
  const want=t=>all?OKT(t):t===thread;
  const msgs=[];
  try{const a=await (await fetch(ROOT+'wall/wall.json?'+Date.now())).json(); a.messages.filter(m=>want(m.thread)).forEach(m=>msgs.push(m));}catch(e){}
  try{const r=await (await fetch(`https://ntfy.sh/${TOPIC}/json?poll=1&since=all`)).text();
      const ev=[]; r.split('\n').forEach(l=>{try{ev.push(JSON.parse(l))}catch(e){}}); const gone=new Set(ev.filter(m=>m.event==='message_delete').map(m=>m.sequence_id)); ev.forEach(m=>{if(m.event==='message'&&!gone.has(m.id)&&want(tagOf(m)))msgs.push(norm(m))})}catch(e){}
  msgs.sort((a,b)=>b.time-a.time).forEach(m=>add(m,false));
  if(location.hash.indexOf('#m-')===0){const t=document.getElementById(location.hash.slice(1));if(t&&el.contains(t)){const dt=t.closest('details'); if(dt)dt.open=true; t.classList.add('hl');setTimeout(()=>t.scrollIntoView({block:'center'}),200)}}
  if(!n)list.innerHTML='<li class="empty">Nothing here yet. The first word is yours.</li>';
  try{const es=new EventSource(`https://ntfy.sh/${TOPIC}/sse`+(all?'':`?tags=t-${thread}`));
      es.onmessage=e=>{const m=JSON.parse(e.data); if(m.event==='message'&&want(tagOf(m))){const em=list.querySelector('.empty'); if(em)em.remove(); add(norm(m),true)}}}catch(e){}
  if(form){
    const ta=form.elements['message'], qs=new URLSearchParams(location.search), on=qs.get('on');
    if(on&&/^\d{1,3}$/.test(on)&&ta&&!ta.value){ta.value='On No. '+on+': '; ta.dataset.prefilled='1'}
    if(location.hash==='#join'&&ta&&ta.dataset.prefilled)setTimeout(()=>ta.focus({preventScroll:false}),500);
    form.addEventListener('submit',async e=>{e.preventDefault();
      const name=(form.elements['title'].value.trim()||'Anonymous').slice(0,MAXN); let text=ta.value.trim().slice(0,MAXT-200);
      if(!text||/^On No\. \d+:$/.test(text)){status.textContent='Write something first.';return}
      if(form.dataset.q)text='Q: '+form.dataset.q+' A: '+text;
      status.textContent='Posting…';
      try{const r=await fetch('https://ntfy.sh/',{method:'POST',body:JSON.stringify({topic:TOPIC,title:name,message:text,tags:['t-'+thread]})});
        if(!r.ok)throw new Error(r.status===429?'Slow down: the free relay limits posts per address. Try again in a minute.':'HTTP '+r.status);
        ta.value=''; delete form.dataset.q; ta.placeholder=ta.dataset.ph||ta.placeholder; const ans=document.querySelector('.dp-answering'); if(ans)ans.hidden=true;
        status.textContent='Thank you. Your voice is in the debate now, public for anyone to read.'; const m=await r.json(); const em=list.querySelector('.empty'); if(em)em.remove(); add(norm(m),true);
      }catch(err){status.textContent='Could not post: '+err.message}
    });
  }
});
})();
/* Debate previews: the latest posts, live, anywhere on the site.
   <div class="wall-preview" data-thread="*" data-limit="3" data-skipfound="1"></div>   (* = every conversation thread)
   window.wallPreview(el, thread, limit) re-renders one. */
(()=>{
const TOPIC=document.documentElement.dataset.wallTopic, ROOT=document.documentElement.dataset.root||'';
let archive=null;
const OKT=t=>t==='forum'||t==='feedback'||/^no\d+$/.test(t||'');
const getArchive=()=>archive||(archive=fetch(ROOT+'wall/wall.json?'+Date.now()).then(r=>r.json()).then(a=>a.messages||[]).catch(()=>[]));
const label=t=>t&&t.startsWith('no')?'No. '+t.slice(2):'the debate';
const href=t=>t&&/^no\d+$/.test(t)?ROOT+'work/'+t.slice(2).padStart(2,'0')+'.html':ROOT+'debate.html#conversation';
const tagOf=m=>{const t=(m.tags||[]).find(x=>/^t-(forum|feedback|no\d+)$/.test(x)); return t?t.slice(2):(m.tags||[]).some(x=>/^t-/.test(x))?'':'forum'};
const norm=m=>({id:m.id,time:m.time,name:m.title||'Anonymous',text:m.message||'',thread:tagOf(m)});
async function load(thread){
  const out=[], seen=new Set(), want=t=>thread==='*'?OKT(t):t===thread;
  (await getArchive()).forEach(m=>{if(want(m.thread)){seen.add(m.id);out.push(m)}});
  try{const r=await (await fetch(`https://ntfy.sh/${TOPIC}/json?poll=1&since=all`)).text();
      const gone=new Set(); const ev=[]; r.split('\n').forEach(l=>{try{ev.push(JSON.parse(l))}catch(e){}}); ev.forEach(m=>{if(m.event==='message_delete')gone.add(m.sequence_id)});
      ev.forEach(m=>{if(m.event==='message'&&!seen.has(m.id)&&!gone.has(m.id)){const n=norm(m); if(want(n.thread)){seen.add(m.id);out.push(n)}}}); for(let i=out.length-1;i>=0;i--)if(gone.has(out[i].id))out.splice(i,1)}catch(e){}
  return out.sort((a,b)=>b.time-a.time);
}
function item(m,showThread){
  const li=document.createElement('li'), h=document.createElement('div'), b=document.createElement('p'), who=document.createElement('b');
  who.textContent=(m.name||'Anonymous').slice(0,60); const t=document.createElement('time'); const d=new Date((m.time||0)*1000);
  t.dateTime=d.toISOString(); t.textContent=d.toLocaleString('en-GB',{dateStyle:'medium',timeStyle:'short'}); h.append(who,' · ',t);
  if(showThread&&/^no\d+$/.test(m.thread||'')){const a=document.createElement('a'); a.href=href(m.thread); a.textContent='on '+label(m.thread); h.append(' · ',a)}
  const txt=(m.text||'').slice(0,2000); window.wpFill(b,txt.length>300?txt.slice(0,300)+'…':txt); li.append(h,b); return li;
}
const sources=new Map();
async function render(el,thread,limit){
  el.dataset.thread=thread; const list=document.createElement('ol'); list.className='wall-list mini';
  const ms=await load(thread); if(el.dataset.thread!==thread)return;
  const minlen=+(el.dataset.minlen||0), skip=!!el.dataset.skipfound;
  const ok=m=>(m.text||'').trim().length>=minlen&&!window.wpIsTest(m)&&!(skip&&/^Found memory/i.test(m.text||''));
  const shown=new Set(), fresh=ms.filter(ok).filter(m=>{const k=(m.name||'')+'|'+(m.text||''); if(shown.has(k))return false; shown.add(k); return true});
  fresh.slice(0,limit).forEach(m=>list.append(item(m,thread==='*')));
  if(!fresh.length){const li=document.createElement('li'); li.className='empty'; li.textContent=el.dataset.empty||'Nobody has spoken yet. The first word is yours.'; list.append(li)}
  el.replaceChildren(list);
  if(sources.has(el)){sources.get(el).close()}
  try{const es=new EventSource(`https://ntfy.sh/${TOPIC}/sse`+(thread==='*'?'':'?tags=t-'+thread)); sources.set(el,es);
      es.onmessage=e=>{const m=JSON.parse(e.data); if(m.event!=='message')return; const n=norm(m); if(!(thread==='*'?OKT(n.thread):n.thread===thread)||!ok(n))return; const em=list.querySelector('.empty'); if(em)em.remove();
        const li=item(n,thread==='*'); li.classList.add('fresh'); list.prepend(li); while(list.children.length>limit)list.lastChild.remove()}}catch(e){}
}
window.wallPreview=(el,thread,limit)=>render(el,thread,limit||3);
document.querySelectorAll('.wall-preview').forEach(el=>render(el,el.dataset.thread||'*',+(el.dataset.limit||3)));
})();

/* Today's question: rotates by local date, so it needs no routine. Mostly originality questions, a few memory prompts.
   On the debate page "Answer it" fills the post box; elsewhere it opens the debate page. */
(()=>{
const box=document.getElementById('daily'), data=document.getElementById('dp-data'); if(!box||!data)return;
const ROOT=document.documentElement.dataset.root||'';
let items; try{items=JSON.parse(data.textContent)}catch(e){return}
const d=new Date(), day=Math.floor((Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()))/864e5);
let i=day%items.length;
const q=box.querySelector('.dp-q'), img=box.querySelector('.dp-img img'), a=box.querySelector('.dp-img'), form=document.querySelector('.wall-form'), ta=form&&form.elements['message'];
if(ta)ta.dataset.ph=ta.placeholder;
function show(){const it=items[i]; q.textContent=it.q; img.src=it.img; img.width=it.w; img.height=it.h; img.alt=it.alt; a.href=ROOT+'work/'+String(it.n).padStart(2,'0')+'.html'}
function answer(){if(!form){location.href=ROOT+'debate.html?answer=1#join';return} form.dataset.q=items[i].q; ta.placeholder=items[i].q; form.scrollIntoView({block:'center',behavior:'smooth'}); setTimeout(()=>ta.focus({preventScroll:true}),350)}
show();
box.querySelector('.dp-next').addEventListener('click',()=>{i=(i+1)%items.length; if(form){delete form.dataset.q; ta.placeholder=ta.dataset.ph} show()});
box.querySelector('.dp-answer').addEventListener('click',answer);
if(form&&new URLSearchParams(location.search).get('answer'))setTimeout(answer,600);
/* manifesto questions: "Answer" under each one fills the post box */
document.querySelectorAll('[data-ask]').forEach(b=>b.addEventListener('click',()=>{if(!form)return; form.dataset.q=b.dataset.ask; ta.placeholder=b.dataset.ask; form.scrollIntoView({block:'center',behavior:'smooth'}); setTimeout(()=>ta.focus({preventScroll:true}),350)}));
})();
