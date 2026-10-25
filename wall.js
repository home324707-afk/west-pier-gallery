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
      r.split('\n').forEach(l=>{try{const m=JSON.parse(l); if(m.event==='message')msgs.push(norm(m))}catch(e){}})}catch(e){}
  msgs.sort((a,b)=>b.time-a.time).forEach(m=>add(m,false));
  if(!n)list.innerHTML='<li class="empty">Nothing yet. The wall is waiting for its first damaged view.</li>';
  try{const es=new EventSource(`https://ntfy.sh/${TOPIC}/sse?tags=t-${thread}`);
      es.onmessage=e=>{const m=JSON.parse(e.data); if(m.event==='message'){const em=list.querySelector('.empty'); if(em)em.remove(); add(norm(m),true)}}}catch(e){}
  form.addEventListener('submit',async e=>{e.preventDefault();
    const name=(form.name.value.trim()||'Anonymous').slice(0,MAXN), text=form.text.value.trim().slice(0,MAXT);
    if(!text){status.textContent='Write something first.';return}
    status.textContent='Posting…';
    try{const r=await fetch('https://ntfy.sh/',{method:'POST',body:JSON.stringify({topic:TOPIC,title:name,message:text,tags:['t-'+thread]})});
      if(!r.ok)throw new Error(r.status===429?'Slow down: the free relay limits posts per address. Try again in a minute.':'HTTP '+r.status);
      form.text.value=''; status.textContent='Posted. It\'s public now.'; const m=await r.json(); const em=list.querySelector('.empty'); if(em)em.remove(); add(norm(m),true);
    }catch(err){status.textContent='Could not post: '+err.message}
  });
});
})();
