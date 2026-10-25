(()=>{const W=window.WORKS||[],lb=document.getElementById('lb');let i=0;
const $=id=>document.getElementById(id);
function show(n){i=(n+W.length)%W.length;const w=W[i];$('lbimg').src=w.src;
const fig=$('lbimg').parentNode;fig.querySelectorAll('canvas').forEach(c=>c.remove());
if(w.an&&window.WPAI&&!WPAI.reduce){const c=document.createElement('canvas');c.className='anim lbanim';Object.assign(c.dataset,{anim:w.an,src:w.as_,w:w.w,h:w.h,full:'1'});if(w.pp)c.dataset.p=JSON.stringify(w.pp);fig.append(c);requestAnimationFrame(()=>requestAnimationFrame(()=>WPAI.mount(c)))}
$('lbk').textContent=w.k==='ai'?'AI-made · '+(w.f||'live generative work'):w.k==='guest'?'Guest AI · '+w.gm:'Human-made';$('lbk').className='kindtag '+(w.k==='ai'?'ai':w.k==='guest'?'gu':'hu');$('lbimg').alt=w.alt;$('lbt').textContent=w.t;$('lbo').innerHTML='Originally: '+w.o;$('lbc').textContent=w.c;
$('lbl').innerHTML=`<a href="${w.lu}">${w.l}</a> · <a href="${w.p}">source</a> · <a href="work/${String(w.n).padStart(2,"0")}.html#wall">Discuss this view →</a>`;
const pv=$('lbwall');if(pv&&window.wallPreview){pv.innerHTML='<p class="sig">Reading the wall…</p>';window.wallPreview(pv,'no'+w.n,3)};$('lbw').href=`work/${String(w.n).padStart(2,"0")}.html#wall`;$('lbw').textContent=`Write on the wall for No. ${w.n} →`;
if(W[i+1]){const p=new Image();p.src=W[(i+1)%W.length].src}}
function open(n){show(n);lb.classList.add('open');document.body.style.overflow='hidden';$('lbx').focus()}
function close(){lb.classList.remove('open');document.body.style.overflow=''}
document.querySelectorAll('.card').forEach(c=>{c.addEventListener('click',()=>open(+c.dataset.i));c.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open(+c.dataset.i)}})});
$('lbx').onclick=close;$('lbp').onclick=()=>show(i-1);$('lbn').onclick=()=>show(i+1);
lb.addEventListener('click',e=>{if(e.target===lb||e.target.tagName==='FIGURE')close()});
document.addEventListener('keydown',e=>{if(!lb.classList.contains('open'))return;if(e.key==='Escape')close();if(e.key==='ArrowLeft')show(i-1);if(e.key==='ArrowRight')show(i+1)});
// filter: all / guess / human / ai / guest
document.querySelectorAll('.filter button').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.filter button').forEach(x=>x.classList.toggle('on',x===b));const f=b.dataset.f;
document.body.classList.toggle('guess',f==='guess');document.querySelectorAll('.famfilter button').forEach(x=>x.classList.remove('on'));document.querySelectorAll('.card').forEach(c=>{c.hidden=(f==='human'||f==='ai'||f==='guest')&&c.dataset.kind!==f;c.classList.remove('revealed')})}));
// AI by kind: show one family (click again to show all)
function fam(k){document.body.classList.remove('guess');document.querySelectorAll('.filter button').forEach(x=>x.classList.toggle('on',!k&&x.dataset.f==='all'));
document.querySelectorAll('.famfilter button').forEach(x=>x.classList.toggle('on',x.dataset.fam===k));document.querySelectorAll('.card').forEach(c=>{c.hidden=!!k&&c.dataset.fam!==k})}
document.querySelectorAll('.famfilter button').forEach(b=>b.addEventListener('click',()=>{const k=b.classList.contains('on')?'':b.dataset.fam;fam(k);history.replaceState(null,'',k?'?fam='+k+'#views':location.pathname)}));
const qf=new URLSearchParams(location.search).get('fam');if(qf&&document.querySelector(`.famfilter button[data-fam="${CSS.escape(qf)}"]`))fam(qf);
document.querySelectorAll('.card').forEach(c=>c.addEventListener('click',()=>{if(document.body.classList.contains('guess'))c.classList.add('revealed')}));
// murmuration: a few hundred starlings following a wandering attractor
const cv=document.getElementById('murm');if(!cv||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
const cx=cv.getContext('2d');let Wd,Ht;const B=[];
function rs(){Wd=cv.width=cv.offsetWidth*devicePixelRatio;Ht=cv.height=cv.offsetHeight*devicePixelRatio}rs();addEventListener('resize',rs);
for(let k=0;k<420;k++)B.push({x:Math.random()*Wd,y:Math.random()*Ht*.6,vx:0,vy:0});
let t=0;(function f(){t+=.004;const ax=Wd*(.55+.3*Math.sin(t*1.3)+.1*Math.sin(t*3.1)),ay=Ht*(.32+.14*Math.cos(t*1.7)+.05*Math.sin(t*4.3));
cx.clearRect(0,0,Wd,Ht);cx.fillStyle='rgba(10,12,14,.85)';
for(const b of B){const dx=ax-b.x+Math.sin(b.y*.01+t*9)*60,dy=ay-b.y+Math.cos(b.x*.01+t*7)*40,d=Math.hypot(dx,dy)+1;
b.vx=b.vx*.96+dx/d*.55;b.vy=b.vy*.96+dy/d*.55;b.x+=b.vx;b.y+=b.vy;cx.fillRect(b.x,b.y,2.2*devicePixelRatio,1.4*devicePixelRatio)}
requestAnimationFrame(f)})();
})();
const qk=new URLSearchParams(location.search).get('f');if(qk){const b=document.querySelector(`.filter button[data-f="${CSS.escape(qk)}"]`);if(b)b.click()}
