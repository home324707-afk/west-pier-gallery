/* Name murmuration: each starling is a human artist's name. Real boids (separation, alignment, cohesion)
   plus a slowly wandering attractor and a swirl that changes sign, so the cloud swells, folds and twists.
   Plain JS, no libraries. Names come from the credits (window.MURM_NAMES = [[name, workNo], ...]). */
(()=>{
const cv=document.getElementById('namemurm'),L=window.MURM_NAMES||[];if(!cv||!L.length)return;
const cx=cv.getContext('2d'),box=cv.parentNode,reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const small=innerWidth<700,DPR=Math.min(devicePixelRatio||1,2);
let W=0,H=0;
/* cap the flock; repeat names to fill it if there are few */
const NB=small?95:170,B=[],FONT=s=>`700 ${s.toFixed(2)}px Caveat,"Segoe Print","Bradley Hand",cursive`,INK='#111';
const rnd=(a,b)=>a+Math.random()*(b-a);
function resize(){const r=box.getBoundingClientRect();W=r.width;H=r.height;cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);cx.setTransform(DPR,0,0,DPR,0,0);fonts();if(reduce||!running)draw()}
function fonts(){for(const b of B){b.fs=((small?4.9:5.6)+b.z*(small?1.1:1.5))*Math.max(.8,Math.min(1,1-(b.name.length-9)*.02));cx.font=FONT(b.fs);cx.letterSpacing='0px';b.w=cx.measureText(b.name).width;sprite(b)}}
/* each name is pre-drawn once (subtle white halo, solid black text) so a frame is just drawImage */
function sprite(b){const pw=Math.ceil(b.w+6),ph=Math.ceil(b.fs*1.5+4),c=b.sp||(b.sp=document.createElement('canvas')),g=c.getContext('2d'),s=DPR;c.width=pw*s;c.height=ph*s;g.setTransform(s,0,0,s,0,0);g.font=FONT(b.fs);g.letterSpacing='0px';g.textAlign='center';g.textBaseline='middle';g.lineJoin='round';g.lineWidth=1.5;g.strokeStyle='rgba(255,255,255,.5)';g.strokeText(b.name,pw/2,ph/2);g.fillStyle=INK;g.fillText(b.name,pw/2,ph/2);b.sw=pw;b.sh=ph}
for(let i=0;i<NB;i++){const e=L[i%L.length];B.push({name:e[0],n:e[1],full:e[2]||e[0],x:0,y:0,vx:rnd(-1,1),vy:rnd(-.5,.5),ox:(Math.random()+Math.random()-1)*2,oy:(Math.random()+Math.random()-1)*2,ph:Math.random()*6.28,rot:(Math.random()-.5)*.36,z:Math.random(),w:60,fs:12,hi:0})}
const sepR=small?.9:1,BW=small?84:66;
let t=Math.random()*100,ax=0,ay=0;
function place(){W=W||box.clientWidth;H=H||box.clientHeight;for(const b of B){b.x=W*.5+rnd(-.28,.28)*W;b.y=H*.5+rnd(-.2,.2)*H}}
function step(k){
 t+=.0035*k;
 /* wandering attractor + a breathing "tightness" that makes the flock swell and fold */
 ax=W*(.5+.26*Math.sin(t*1.3)+.08*Math.sin(t*3.1+1));ay=H*(.47+.1*Math.cos(t*1.7)+.04*Math.sin(t*4.3));
 const tight=.5+.5*Math.sin(t*2.2+.6),swirl=Math.sin(t*1.1)*.03,spread=1.15-.5*tight,sxs=1+.4*Math.sin(t*1.9),sys=1+.4*Math.cos(t*2.6+1);
 const R=small?70:95,R2=R*R,maxV=small?1.5:1.9,pull=.0022;
 const n=B.length;
 for(let i=0;i<n;i++){const p=B[i];let cxm=0,cym=0,avx=0,avy=0,c=0,sx=0,sy=0;
  for(let j=0;j<n;j++){if(i===j)continue;const q=B[j],dx=q.x-p.x,dy=q.y-p.y,d2=dx*dx+dy*dy;if(d2>R2*(1+p.z*.4))continue;
   cxm+=q.x;cym+=q.y;avx+=q.vx;avy+=q.vy;c++;
   /* separation uses each name's own width, so labels keep out of each other's way */
   const ex=dx/((p.w+q.w)*.5*.95*sepR),ey=dy/(small?7:8.5),e2=ex*ex+ey*ey;
   if(e2<1&&e2>0){const f=(1-e2)/Math.sqrt(e2);sx-=ex*f;sy-=ey*f}}
  if(c){p.vx+=((cxm/c-p.x)*.0007*(.5+tight)+(avx/c-p.vx)*.045)*k;p.vy+=((cym/c-p.y)*.0007*(.5+tight)+(avy/c-p.vy)*.045)*k}
  p.vx+=sx*.2*k;p.vy+=sy*.3*k;
  const tx=ax+p.ox*W*.2*spread*sxs*(1+.25*Math.sin(t*5+p.ph)),ty=ay+p.oy*H*.2*spread*sys*(1+.25*Math.cos(t*4+p.ph)),dx=tx-p.x,dy=ty-p.y;
  {const ux=ax-p.x,uy=ay-p.y,ud=Math.hypot(ux,uy)+90,g=k*(.7+p.z*.6);p.vx+=dx*pull*.1*g-uy/ud*swirl*g;p.vy+=dy*pull*.1*g+ux/ud*swirl*g}
  /* soft walls keep the flock on the canvas */
  const my=24;
  const lx=p.w*.5+8;if(p.x<lx)p.vx+=(.06+(lx-p.x)*.02)*k;else if(p.x>W-lx)p.vx-=(.06+(p.x-W+lx)*.02)*k;if(p.y<my)p.vy+=(.06+(my-p.y)*.02)*k;else if(p.y>H-BW)p.vy-=(.06+(p.y-H+BW)*.02)*k;
  p.vx+=rnd(-.02,.02)*k;p.vy+=rnd(-.02,.02)*k;
  const v=Math.hypot(p.vx,p.vy),mv=maxV*(.8+p.z*.4);if(v>mv){p.vx*=mv/v;p.vy*=mv/v}}
 for(const p of B){p.x+=p.vx*k;p.y+=p.vy*k;if(p.hi>0)p.hi-=k/90}
}
function draw(){
 cx.clearRect(0,0,W,H);cx.textBaseline='middle';cx.textAlign='center';
 /* the name being pointed at is drawn last, on top */
 for(let pass=0;pass<2;pass++)for(const b of B){if((b.hi>0)!==(pass===1))continue;
  const ang=Math.max(-.12,Math.min(.12,b.vy*.06));
  cx.save();cx.translate(b.x,b.y);cx.rotate(ang+b.rot);
  if(b.hi>0){const h=Math.min(1,b.hi),fs=Math.max(13,b.fs*2.6);cx.font=FONT(fs);cx.letterSpacing='0px';const w=cx.measureText(b.name).width;
   cx.fillStyle=`rgba(255,255,255,${.9*h})`;cx.fillRect(-w/2-6,-fs*.85,w+12,fs*1.7);cx.strokeStyle=`rgba(27,90,146,${.5*h})`;cx.lineWidth=1;cx.strokeRect(-w/2-6,-fs*.85,w+12,fs*1.7);cx.fillStyle='#1b5a92';cx.fillText(b.name,0,0)}
  else cx.drawImage(b.sp,-b.sw/2,-b.sh/2,b.sw,b.sh)
  cx.restore()}
}
let running=false,raf=0,last=0,vis=true;
function frame(ts){raf=0;if(!running)return;const k=Math.min(2.5,(ts-last)/16.67||1);last=ts;step(k);draw();raf=requestAnimationFrame(frame)}
function go(){const want=vis&&!document.hidden&&!reduce;if(want&&!running){running=true;last=performance.now();raf=requestAnimationFrame(frame)}else if(!want&&running){running=false;cancelAnimationFrame(raf)}}
resize();place();
if(document.fonts&&document.fonts.load)document.fonts.load('700 8px Caveat').then(()=>{fonts();if(reduce||!running)draw()}).catch(()=>{});
if(reduce){/* static scattered cloud: run the flock for a while off-screen, then draw once */
 for(let i=0;i<420;i++)step(1);fonts();draw();addEventListener('resize',()=>{resize();for(let i=0;i<120;i++)step(1);draw()})}
else{
 for(let i=0;i<60;i++)step(1);
 addEventListener('resize',resize);
 new IntersectionObserver(es=>{vis=es[0].isIntersecting;go()}).observe(box);
 document.addEventListener('visibilitychange',go);go()}
/* hover or tap a name: it lights up briefly and links to that artist's credit */
function pick(ev){const r=cv.getBoundingClientRect(),x=ev.clientX-r.left,y=ev.clientY-r.top,pad=ev.pointerType==='touch'?10:5;let best=null,bd=1e9;
 for(const b of B){const dx=Math.abs(x-b.x),dy=Math.abs(y-b.y);if(dx<b.w/2+pad&&dy<b.fs*.9+pad){const d=dx+dy-b.z*4;if(d<bd){bd=d;best=b}}}return best}
cv.addEventListener('pointermove',ev=>{if(ev.pointerType==='touch')return;const b=pick(ev);cv.style.cursor=b?'pointer':'';if(b){b.hi=1.6;cv.title=b.full;if(reduce)draw()}else cv.title=''});
cv.addEventListener('click',ev=>{const b=pick(ev);if(!b)return;b.hi=1.6;if(reduce)draw();setTimeout(()=>{location.hash='no'+b.n},ev.pointerType==='touch'||ev.detail===0?220:60)});
})();
