(()=>{const W=window.WORKS||[],lb=document.getElementById('lb');let i=0;
const $=id=>document.getElementById(id);
function show(n){i=(n+W.length)%W.length;const w=W[i],pg=`work/${String(w.n).padStart(2,"0")}.html`;$('lbimg').src=w.src;$('lbimg').alt='Brighton West Pier, No. '+w.n;
const fig=$('lbimg').parentNode;fig.querySelectorAll('canvas').forEach(c=>c.remove());
/* blind: the viewer shows the picture and its number only; who made it is on the work page */
$('lbk').textContent='';$('lbk').className='';$('lbt').textContent='No. '+w.n;$('lbo').textContent='';$('lbc').textContent='';
$('lbl').innerHTML=`<a href="${pg}">Open it: who made it, licence, your guess →</a>`;
const pv=$('lbwall');if(pv)pv.innerHTML='';const lw=document.querySelector('.lbwall');if(lw)lw.hidden=true;
if(W[i+1]){const p=new Image();p.src=W[(i+1)%W.length].src}}
let opener=null;function open(n){opener=document.activeElement;show(n);lb.classList.add('open');document.body.style.overflow='hidden';$('lbx').focus()}
function close(){lb.classList.remove('open');document.body.style.overflow='';lb.querySelectorAll('canvas.lbanim').forEach(c=>c.remove());if(opener&&opener.focus)opener.focus({preventScroll:true})}
document.querySelectorAll('.card').forEach(c=>{c.addEventListener('click',()=>open(+c.dataset.i));c.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open(+c.dataset.i)}})});
$('lbx').onclick=close;$('lbp').onclick=()=>show(i-1);$('lbn').onclick=()=>show(i+1);
lb.addEventListener('click',e=>{if(e.target===lb||e.target.tagName==='FIGURE')close()});
document.addEventListener('keydown',e=>{if(!lb.classList.contains('open'))return;if(e.key==='Escape')close();if(e.key==='ArrowLeft')show(i-1);if(e.key==='ArrowRight')show(i+1)});
// filter: all / guess / human / ai / guest
document.querySelectorAll('.filter button[data-f]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.filter button[data-f]').forEach(x=>x.classList.toggle('on',x===b));const f=b.dataset.f;
document.querySelectorAll('.famfilter button').forEach(x=>x.classList.remove('on'));document.querySelectorAll('.card').forEach(c=>{c.hidden=f==='machine'?c.dataset.kind==='human':(f==='human'||f==='ai'||f==='guest')&&c.dataset.kind!==f;c.classList.remove('revealed')})}));
// AI by kind: show one family (click again to show all)
function fam(k){document.querySelectorAll('.filter button[data-f]').forEach(x=>x.classList.toggle('on',!k&&x.dataset.f==='all'));
document.querySelectorAll('.famfilter button').forEach(x=>x.classList.toggle('on',x.dataset.fam===k));document.querySelectorAll('.card').forEach(c=>{c.hidden=!!k&&c.dataset.fam!==k})}
document.querySelectorAll('.famfilter button').forEach(b=>b.addEventListener('click',()=>{const k=b.classList.contains('on')?'':b.dataset.fam;fam(k);history.replaceState(null,'',k?'?fam='+k+'#views':location.pathname)}));
const qf=new URLSearchParams(location.search).get('fam');if(qf&&document.querySelector(`.famfilter button[data-fam="${CSS.escape(qf)}"]`))fam(qf);
// murmuration: a few hundred starlings following a wandering attractor
const cv=document.getElementById('murm');if(!cv||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
const cx=cv.getContext('2d');let Wd,Ht;const B=[];
const DPR=Math.min(devicePixelRatio||1,1.5),NB=innerWidth<700?170:380;
function rs(){Wd=cv.width=cv.offsetWidth*DPR;Ht=cv.height=cv.offsetHeight*DPR}rs();addEventListener('resize',rs);
for(let k=0;k<NB;k++)B.push({x:Math.random()*Wd,y:Math.random()*Ht*.6,vx:0,vy:0,ph:Math.random()*6.28,ox:(Math.random()+Math.random()-1),oy:(Math.random()+Math.random()-1)});
let t=0,on=true,raf=0;new IntersectionObserver(es=>es.forEach(e=>{on=e.isIntersecting;go()})).observe(cv);document.addEventListener('visibilitychange',go);
function go(){cancelAnimationFrame(raf);if(on&&!document.hidden)raf=requestAnimationFrame(f)}
/* each starling is pulled towards its own spot in a loose cloud that follows a wandering attractor: it swirls and stretches like a murmuration */
function f(){t+=.004;const ax=Wd*(.5+.34*Math.sin(t*1.3)+.1*Math.sin(t*3.1)),ay=Ht*(.3+.14*Math.cos(t*1.7)+.05*Math.sin(t*4.3)),sx=Wd*.13,sy=Ht*.07,bw=(innerWidth<700?3.6:4.4)*DPR;
cx.clearRect(0,0,Wd,Ht);
for(const b of B){const tx=ax+b.ox*sx*(1+.4*Math.sin(t*5+b.ph)),ty=ay+b.oy*sy*(1+.4*Math.cos(t*4+b.ph)),dx=tx-b.x,dy=ty-b.y,d=Math.hypot(dx,dy)+1;
b.vx=b.vx*.95+dx/d*.5;b.vy=b.vy*.95+dy/d*.5;b.x+=b.vx;b.y+=b.vy;const h=(1+1.3*Math.abs(Math.sin(t*140+b.ph)))*DPR;
cx.fillStyle='rgba(255,236,214,.28)';cx.fillRect(b.x+DPR*.6,b.y+DPR*.6,bw,h);cx.fillStyle='rgba(8,10,14,.92)';cx.fillRect(b.x,b.y,bw,h)}
raf=requestAnimationFrame(f)}go();
})();
const qk=new URLSearchParams(location.search).get('f');if(qk){const b=document.querySelector(`.filter button[data-f="${CSS.escape(qk)}"]`);if(b)b.click()}

(()=>{const c0=document.querySelector('.card');if(!c0)return;const g=c0.parentElement,mix=[...g.querySelectorAll(':scope>.card')],bs=document.querySelectorAll('.order button[data-o]');bs.forEach(b=>b.addEventListener('click',()=>{bs.forEach(x=>x.classList.toggle('on',x===b));(b.dataset.o==='num'?[...mix].sort((x,y)=>x.dataset.n-y.dataset.n):mix).forEach(c=>g.appendChild(c))}))})();

/* show only the first 24 pictures until asked; any filter, order or deep link shows all */
(()=>{const g=document.getElementById('gallery'),b=document.getElementById('showall');if(!g)return;
const all=()=>{g.classList.remove('collapsed');if(b)b.parentNode.hidden=true};
if(b)b.addEventListener('click',all);
document.querySelectorAll('.filter button,.famfilter button').forEach(x=>x.addEventListener('click',all));
const q=new URLSearchParams(location.search);if(q.get('f')||q.get('fam'))all()})();
