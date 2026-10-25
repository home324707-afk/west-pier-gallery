(()=>{const W=window.WORKS||[],lb=document.getElementById('lb');let i=0;
const $=id=>document.getElementById(id);
function show(n){i=(n+W.length)%W.length;const w=W[i];$('lbimg').src=w.src;$('lbimg').alt=w.alt;$('lbt').textContent=w.t;$('lbo').innerHTML='Originally: '+w.o;$('lbc').textContent=w.c;
$('lbl').innerHTML=`<a href="${w.lu}">${w.l}</a> · <a href="${w.p}">source</a> · <a href="work/${String(w.n).padStart(2,'0')}.html">Discuss this view →</a>`;
if(W[i+1]){const p=new Image();p.src=W[(i+1)%W.length].src}}
function open(n){show(n);lb.classList.add('open');document.body.style.overflow='hidden';$('lbx').focus()}
function close(){lb.classList.remove('open');document.body.style.overflow=''}
document.querySelectorAll('.card').forEach(c=>{c.addEventListener('click',()=>open(+c.dataset.i));c.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open(+c.dataset.i)}})});
$('lbx').onclick=close;$('lbp').onclick=()=>show(i-1);$('lbn').onclick=()=>show(i+1);
lb.addEventListener('click',e=>{if(e.target===lb||e.target.tagName==='FIGURE')close()});
document.addEventListener('keydown',e=>{if(!lb.classList.contains('open'))return;if(e.key==='Escape')close();if(e.key==='ArrowLeft')show(i-1);if(e.key==='ArrowRight')show(i+1)});
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
