/* The West Pier Curator's live generative works. Plain canvas 2D, no libraries.
   Usage: <canvas class="anim" data-anim="murmuration" data-src="img/01.jpg,img/02.jpg"></canvas> on top of a poster <img>.
   Pieces start when scrolled into view, pause off screen, and do not run at all under prefers-reduced-motion (the poster stays).
   To add a piece: WPAI.register('key', {fps, init(s), frame(s, t)}). s = {c, x (ctx), W, H, imgs, rnd, full}. */
(()=>{
const ROOT=document.documentElement.dataset.root||'';
const REDUCE=matchMedia('(prefers-reduced-motion: reduce)').matches;
const P={};
const mulberry=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const load=src=>new Promise(r=>{const i=new Image();i.decoding='async';i.onload=()=>r(i);i.onerror=()=>r(null);i.src=ROOT+src});
function off(W,H){const c=document.createElement('canvas');c.width=W;c.height=H;return c}
function cover(x,img,W,H,a=1){if(!img)return;const s=Math.max(W/img.width,H/img.height),w=img.width*s,h=img.height*s;x.globalAlpha=a;x.drawImage(img,(W-w)/2,(H-h)/2,w,h);x.globalAlpha=1}
function gray(img,cols,rows){const c=off(cols,rows),x=c.getContext('2d');cover(x,img,cols,rows);const d=x.getImageData(0,0,cols,rows).data,g=new Float32Array(cols*rows);
  let lo=255,hi=0;for(let i=0;i<g.length;i++){g[i]=(d[i*4]*.3+d[i*4+1]*.59+d[i*4+2]*.11);lo=Math.min(lo,g[i]);hi=Math.max(hi,g[i])}for(let i=0;i<g.length;i++)g[i]=(g[i]-lo)/(hi-lo+1e-6);return g}
/* procedural pier skeleton (wholly original drawing, same idea as tools/ai_art/common.py) */
function pier(x,W,H,baseY,scale,seed,col){const r=mulberry(seed);x.strokeStyle=col;const lw=Math.max(1,W/520);x.lineWidth=lw;
  const cx=W*.52,cw=W*.34*scale,top=baseY-H*.16*scale,deck=baseY-H*.05*scale,x0=cx-cw/2,x1=cx+cw/2;x.beginPath();
  for(let xx=x0-W*.25;xx<x1+W*.12;xx+=W*.012*scale)if(r()<.9){x.moveTo(xx,deck);x.lineTo(xx,H)}
  x.moveTo(x0,deck);x.lineTo(x1,deck);const ribs=13;
  for(let i=0;i<=ribs;i++){const xx=x0+cw*i/ribs,h=(deck-top)*(.55+.45*Math.sin(Math.PI*i/ribs));if(r()<.92){x.moveTo(xx,deck);x.lineTo(xx,deck-h)}}
  for(let t=0;t<60;t++){const a=x0+cw*t/60,b=x0+cw*(t+1)/60,f=u=>deck-(deck-top)*(.55+.45*Math.sin(Math.PI*u/60));if(r()<.9){x.moveTo(a,f(t));x.lineTo(b,f(t+1))}}
  const ym=deck-(deck-top)*.45;x.moveTo(x0,ym);x.lineTo(x1,ym);
  for(let i=0;i<ribs;i++){const a=x0+cw*i/ribs,b=x0+cw*(i+1)/ribs;if(r()<.8){x.moveTo(a,deck);x.lineTo(b,ym)}if(r()<.8){x.moveTo(a,ym);x.lineTo(b,deck)}}
  x.stroke();x.lineWidth=lw*2;x.beginPath();x.moveTo(x0,deck);x.lineTo(x1,deck);x.stroke()}
function sky(W,H,stops){const c=off(W,H),x=c.getContext('2d'),g=x.createLinearGradient(0,0,0,H);stops.forEach(([p,col])=>g.addColorStop(p,col));x.fillStyle=g;x.fillRect(0,0,W,H);return c}

/* 1. Murmuration: cheap flocking (each bird steers to a drifting attractor plus its neighbours' mean heading on a coarse grid) */
P.murmuration={fps:40,init(s){const{W,H}=s;s.bg=sky(W,H,[[0,'#181c2e'],[.5,'#c46846'],[.72,'#eebe82'],[.745,'#2a3140'],[1,'#10141c']]);
  const bx=s.bg.getContext('2d');bx.fillStyle='rgba(250,210,160,.5)';for(let i=0;i<W*1.2;i++)bx.fillRect(s.rnd()*W,H*.75+s.rnd()*H*.25,2+s.rnd()*14,1);
  pier(bx,W,H,H*.8,1.7,58,'#0e0c10');const N=s.full?1400:520;s.b=[];for(let i=0;i<N;i++)s.b.push({x:W*(.3+.4*s.rnd()),y:H*(.2+.2*s.rnd()),vx:0,vy:0,o:s.rnd()*6.28})},
 frame(s,t){const{x,W,H,b}=s;x.drawImage(s.bg,0,0);const k=t*.00025,G=12,gw=W/G,gh=H/G,gx=new Float32Array(G*G*3);
  const ax=W*(.5+.25*Math.sin(k*1.3)+.08*Math.sin(k*3.7)),ay=H*(.3+.1*Math.cos(k*1.9)+.04*Math.sin(k*5.1));
  for(const p of b){const i=(Math.min(G-1,Math.max(0,p.x/gw|0))+G*Math.min(G-1,Math.max(0,p.y/gh|0)))*3;gx[i]+=p.vx;gx[i+1]+=p.vy;gx[i+2]++}
  x.fillStyle='#0e0c10';const sz=Math.max(1.2,W/700);
  for(const p of b){const i=(Math.min(G-1,Math.max(0,p.x/gw|0))+G*Math.min(G-1,Math.max(0,p.y/gh|0)))*3,n=gx[i+2]||1;
   const tx=ax+Math.sin(p.o+k*7)*W*.12,ty=ay+Math.cos(p.o*1.3+k*5)*H*.07,dx=tx-p.x,dy=ty-p.y,d=Math.hypot(dx,dy)+1;
   p.vx=p.vx*.94+dx/d*.32*W/900+(gx[i]/n-p.vx)*.06;p.vy=p.vy*.94+dy/d*.32*W/900+(gx[i+1]/n-p.vy)*.06;p.x+=p.vx;p.y+=p.vy;
   x.fillRect(p.x,p.y,sz*1.8,sz)}}};

/* 2. Glitch: the sunset photograph flickers through a bad connection */
P.glitch={fps:24,init(s){s.lines=[]},frame(s,t){const{x,W,H,imgs}=s,img=imgs[0];cover(x,img,W,H);const r=s.rnd;
  if(r()<.35){const n=2+r()*8|0;for(let i=0;i<n;i++){const y=r()*H,h=2+r()*H*.06,dx=(r()-.5)*W*.2;x.drawImage(s.c,0,y,W,h,dx,y,W,h)}}
  if(r()<.25){x.globalCompositeOperation='screen';x.globalAlpha=.5;x.drawImage(s.c,(r()-.5)*24,0);x.globalCompositeOperation='multiply';x.fillStyle=`rgb(${r()<.5?255:0},${r()<.5?60:255},255)`;x.fillRect(0,r()*H,W,H*.05);x.globalCompositeOperation='source-over';x.globalAlpha=1}
  if(r()<.05){x.fillStyle='rgba(255,255,255,.08)';for(let y=0;y<H;y+=3)x.fillRect(0,y,W,1)}
  if(r()<.03){const bs=16;for(let i=0;i<40;i++){const sx=r()*W|0,sy=r()*H|0;x.drawImage(s.c,sx,sy,bs,bs,sx+(r()-.5)*bs*4,sy,bs*2,bs)}}}};

/* 3. Rain: Gore's 1913 painting, pixel columns drip downward and slowly dry back */
P.pixelsort={fps:30,init(s){cover(s.x,s.imgs[0],s.W,s.H);s.d=[];for(let i=0;i<(s.full?260:90);i++)s.d.push({x:s.rnd()*s.W|0,y:s.rnd()*s.H,v:1+s.rnd()*4})},
 frame(s,t){const{x,W,H}=s;cover(x,s.imgs[0],W,H,.018);
  for(const d of s.d){const len=6+d.v*5;x.drawImage(s.c,d.x,d.y,2,1,d.x,d.y,2,len);d.y+=d.v*(W/700);if(d.y>H){d.y=s.rnd()*H*.3;d.x=s.rnd()*W|0;d.v=1+s.rnd()*4}}}};

/* 4. Riso: two-colour halftone that breathes and drifts out of register */
P.riso={fps:20,init(s){s.cell=Math.max(7,s.W/110);s.cols=Math.ceil(s.W/s.cell)+2;s.rows=Math.ceil(s.H/s.cell)+2;s.g=gray(s.imgs[0],s.cols,s.rows)},
 frame(s,t){const{x,W,H,cell,cols,rows,g}=s;x.fillStyle='#f3ecdc';x.fillRect(0,0,W,H);x.globalCompositeOperation='multiply';
  const layer=(col,ox,oy,amp,ph)=>{x.fillStyle=col;x.beginPath();for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const v=1-g[i+j*cols];
   const r=cell*.62*Math.sqrt(Math.max(0,v*(1+amp*Math.sin(t*.0012+i*.15+j*.1+ph))));if(r>.4){const px=i*cell+ox+(j%2)*cell*.5,py=j*cell+oy;x.moveTo(px+r,py);x.arc(px,py,r,0,6.283)}}x.fill()};
  layer('#0078bf',0,0,.25,0);layer('#ff48b0',4+3*Math.sin(t*.0007),3+2*Math.cos(t*.0009),.35,2);x.globalCompositeOperation='source-over'}};

/* 5. Forty-six tides: animated swell with hidden-line removal, the pier in rust */
P.tidelines={fps:30,init(s){s.p=off(s.W,s.H);pier(s.p.getContext('2d'),s.W,s.H,s.H*.5,.9,1866,'#c4562b');s.ph=[];for(let i=0;i<46;i++)s.ph.push(s.rnd()*6.28)},
 frame(s,t){const{x,W,H}=s;x.fillStyle='#0a0c0e';x.fillRect(0,0,W,H);x.drawImage(s.p,0,0);const L=46,m=W*.04,step=Math.max(3,W/300);x.lineWidth=Math.max(1,W/800);x.strokeStyle='#e9e4d8';
  for(let i=0;i<L;i++){const base=H*.18+i*(H*.72)/L,ph=s.ph[i];x.beginPath();x.moveTo(m,H);
   for(let X=m;X<=W-m;X+=step){const amp=(6+70*Math.exp(-(((X-W*.52)/(W*.22))**2))*(.4+i/L))*H/1200;
    const y=base-Math.abs(Math.sin(X/(37*W/1600)+ph+t*.0009)*amp*.5+Math.sin(X/(11*W/1600)+ph*2-t*.0017)*amp*.15);x.lineTo(X,y)}
   x.lineTo(W-m,H);x.closePath();x.fillStyle='rgba(10,12,14,.93)';x.fill();x.stroke()}}};

/* 6. Blueprint: a plotter draws the as-found drawing, then the tide wipes it */
P.blueprint={fps:30,init(s){s.T=0},frame(s,t){const{x,W,H}=s,img=s.imgs[0],cyc=14000,u=(t%cyc)/cyc;x.fillStyle='#12346e';x.fillRect(0,0,W,H);
  const reveal=Math.min(1,u/.6);x.save();x.beginPath();x.rect(0,0,W*reveal,H);x.clip();cover(x,img,W,H);x.restore();
  if(u<.6){x.strokeStyle='#ff9b6a';x.lineWidth=2;x.beginPath();x.moveTo(W*reveal,0);x.lineTo(W*reveal,H);x.stroke();x.fillStyle='#ff9b6a';x.fillRect(W*reveal-5,H*(.5+.4*Math.sin(t*.02))-5,10,10)}
  if(u>.75){const k=(u-.75)/.25,yy=H*(1-k);x.fillStyle='rgba(18,52,110,.96)';x.beginPath();x.moveTo(0,H);for(let X=0;X<=W;X+=8)x.lineTo(X,yy+Math.sin(X*.02+t*.004)*10);x.lineTo(W,H);x.fill()}}};

/* 7. ASCII: the photograph typed live, the character ramp rolling like swell */
P.ascii={fps:12,init(s){s.cols=s.full?130:70;s.cw=s.W/s.cols;s.ch=s.cw*1.9;s.rows=Math.ceil(s.H/s.ch);s.g=gray(s.imgs[0],s.cols,s.rows);s.ramp=' .,:;-~=+*ictoIEPR#%@';
  s.x.font=`${s.ch*.95}px "JetBrains Mono",monospace`;s.x.textBaseline='top'},
 frame(s,t){const{x,W,H,cols,rows,g,ramp,cw,ch}=s;x.fillStyle='#0b1418';x.fillRect(0,0,W,H);x.fillStyle='#e9d6b4';const R=ramp.length;
  for(let j=0;j<rows;j++){let line='';for(let i=0;i<cols;i++){const v=g[i+j*cols]+.12*Math.sin(i*.18-t*.003+j*.25);line+=ramp[Math.max(0,Math.min(R-1,v*R|0))]}x.fillText(line,0,j*ch)}}};

/* 8. The storm that never ends: Webb's 1870 painting under a storm seeded by today's date. Every visit and every day differs. */
P.erosion={fps:30,init(s){const day=Math.max(0,Math.floor((Date.now()-Date.UTC(2026,9,25))/864e5));s.day=day;s.rnd=mulberry(day*7919+(Date.now()%100000));
  s.salt=off(s.W,s.H);s.rain=[];for(let i=0;i<(s.full?500:160);i++)s.rain.push({x:s.rnd()*s.W,y:s.rnd()*s.H,v:6+s.rnd()*10})},
 frame(s,t){const{x,W,H}=s,day=s.day;cover(x,s.imgs[0],W,H);const sea=H*(.93-Math.min(.5,.04*day)-.08*(.5-.5*Math.cos(t*.00035)));
  x.fillStyle='rgba(28,58,70,.72)';x.beginPath();x.moveTo(0,H);for(let X=0;X<=W;X+=6)x.lineTo(X,sea+Math.sin(X*.013+t*.0021)*H*.015+Math.sin(X*.041-t*.0033)*H*.007);x.lineTo(W,H);x.fill();
  x.strokeStyle='rgba(240,236,226,.55)';x.lineWidth=1;x.beginPath();for(let X=0;X<=W;X+=6){const y=sea+Math.sin(X*.013+t*.0021)*H*.015+Math.sin(X*.041-t*.0033)*H*.007;X?x.lineTo(X,y):x.moveTo(X,y)}x.stroke();
  const sx=s.salt.getContext('2d');sx.fillStyle='rgba(235,232,222,.7)';for(let i=0;i<3;i++)sx.fillRect(s.rnd()*W,s.rnd()*H,1.5,1.5);x.drawImage(s.salt,0,0);
  x.strokeStyle='rgba(210,220,230,.35)';x.beginPath();for(const r of s.rain){x.moveTo(r.x,r.y);x.lineTo(r.x-r.v*.4,r.y+r.v*1.6);r.y+=r.v;r.x-=r.v*.25;if(r.y>H){r.y=-10;r.x=s.rnd()*W*1.2}}x.stroke();
  x.fillStyle='#f3efe4';x.font=`${Math.max(10,W/70)}px "JetBrains Mono",monospace`;x.fillText(`STORM DAY ${day+1}`,W*.02,W*.035)}};

/* 9. Mosaic that reshuffles: the tiles of 'Everyone who looked' keep trading places and finding their way home */
P.mosaic={fps:30,init(s){s.gx=50;s.gy=Math.round(50*s.imgs[0].height/s.imgs[0].width);s.perm=[...Array(s.gx*s.gy).keys()];s.mv=null;s.next=0},
 frame(s,t){const{x,W,H,gx,gy,perm}=s,img=s.imgs[0],cw=W/gx,ch=H/gy,sw=img.width/gx,sh=img.height/gy,N=gx*gy;
  if(!s.mv&&t>s.next){const a=s.rnd()*N|0,ph=(t/20000)%1;const b=ph<.6?s.rnd()*N|0:perm.indexOf(a);s.mv={a,b,t0:t};}
  for(let k=0;k<N;k++){const src=perm[k];x.drawImage(img,(src%gx)*sw,(src/gx|0)*sh,sw,sh,(k%gx)*cw,(k/gx|0)*ch,cw+.5,ch+.5)}
  if(s.mv){const{a,b,t0}=s.mv,u=Math.min(1,(t-t0)/500),e=u<.5?2*u*u:1-2*(1-u)*(1-u);
   const draw=(from,to,src)=>{const X=((from%gx)+((to%gx)-(from%gx))*e)*cw,Y=((from/gx|0)+((to/gx|0)-(from/gx|0))*e)*ch;x.drawImage(img,(src%gx)*sw,(src/gx|0)*sh,sw,sh,X-cw*.1,Y-ch*.1,cw*1.2,ch*1.2)};
   draw(a,b,perm[a]);draw(b,a,perm[b]);if(u>=1){[perm[a],perm[b]]=[perm[b],perm[a]];s.mv=null;s.next=t+40}}}};

/* 10. The mean of the views: the remixable photographs are averaged in one at a time, then it starts again in a new order */
P.average={fps:30,init(s){s.order=[];s.k=0;s.last=-1e9;s.acc=off(s.W,s.H)},
 frame(s,t){const{x,W,H,imgs}=s,ok=imgs.filter(Boolean);if(!ok.length)return;
  if(t-s.last>700){if(s.k>=ok.length){s.k=0;s.order=[]}if(!s.order.length){s.order=ok.map((_,i)=>i).sort(()=>s.rnd()-.5)}
   const a=s.acc.getContext('2d');cover(a,ok[s.order[s.k]],W,H,1/(s.k+1));s.k++;s.last=t}
  x.drawImage(s.acc,0,0);const u=Math.min(1,(t-s.last)/700);x.fillStyle=`rgba(11,20,24,${.0})`;
  x.fillStyle='#f3efe4';x.font=`${Math.max(10,W/70)}px "JetBrains Mono",monospace`;x.fillText(`MEAN OF ${s.k} / ${ok.length}`,W*.02,W*.035)}};

function mount(c){if(c._wp||REDUCE)return;c._wp=1;const def=P[c.dataset.anim];if(!def)return;
  const full=c.dataset.full==='1',dpr=Math.min(devicePixelRatio||1,full?2:1.5),r=c.getBoundingClientRect(),maxW=full?1400:560;
  const W=Math.round(Math.min(maxW,Math.max(200,r.width*dpr))),H=Math.round(W*(+c.dataset.h||10)/(+c.dataset.w||16));c.width=W;c.height=H;
  const s={c,x:c.getContext('2d'),W,H,full,rnd:mulberry(+(c.dataset.seed||Date.now()%1e6)),imgs:[]},running={v:false};let ready=false,raf=0,last=0;
  Promise.all((c.dataset.src||'').split(',').filter(Boolean).map(load)).then(im=>{s.imgs=im.filter(Boolean);if(c.dataset.src&&!s.imgs.length)return;try{def.init(s)}catch(e){console.warn('WPAI',e);return}ready=true;if(running.v)loop(performance.now())});
  const loop=now=>{if(!running.v||!c.isConnected){if(!c.isConnected)io.disconnect();return}raf=requestAnimationFrame(loop);if(now-last<1000/(def.fps||30))return;last=now;def.frame(s,now);c.classList.add('on')};
  const io=new IntersectionObserver(es=>es.forEach(e=>{running.v=e.isIntersecting&&!document.hidden;if(running.v&&ready){cancelAnimationFrame(raf);loop(performance.now())}}),{rootMargin:'100px'});
  io.observe(c);c._io=io;document.addEventListener('visibilitychange',()=>{if(document.hidden)running.v=false;else{io.unobserve(c);io.observe(c)}})}
window.WPAI={register:(k,d)=>P[k]=d,mount,pieces:P,reduce:REDUCE};
// defer mounting (and image loading) until a canvas first comes near the viewport
const near=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){near.unobserve(e.target);mount(e.target)}}),{rootMargin:'300px'});
const go=()=>{if(!REDUCE)document.querySelectorAll('canvas.anim').forEach(c=>near.observe(c))};
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',go):go();
})();
