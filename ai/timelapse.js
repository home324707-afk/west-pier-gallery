/* Time-lapse of the West Pier, 1866 to this week. Idea suggested by a visitor.
   Plain canvas 2D, no libraries. Crossfades and slow Ken Burns moves through the gallery's own openly licensed views in date order,
   with dated captions, then slows down and lands on this week's storm. Starts in view, pauses off screen or in a hidden tab,
   click to pause. Under prefers-reduced-motion it draws one still frame (the "now" card) and never animates.
   Data: window.TIMELAPSE = {slides:[{src,y,c,cr}], now:{src,y,c,c2,note,cr}} (built by build.py from data/timelapse.json). */
(()=>{
const T=window.TIMELAPSE,c=document.getElementById('timelapse');if(!T||!c)return;
const ROOT=document.documentElement.dataset.root||'',REDUCE=matchMedia('(prefers-reduced-motion: reduce)').matches;
const x=c.getContext('2d');let W,H;
function size(){const r=c.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);W=c.width=Math.round(Math.min(1600,Math.max(320,r.width*d)));H=c.height=Math.round(W*9/16)}
size();
// schedule: durations in ms. Even pace through history, then it slows down as it reaches the present.
const S=T.slides.map((s,i,a)=>({...s,d:i<a.length-3?3200:[4200,5200,6400][i-(a.length-3)]}));
S.push({...T.now,d:16000,now:1});const XF=1000;let total=0;S.forEach(s=>{s.t0=total;total+=s.d});total+=1600;// + black before looping
const imgs={};function get(s){if(imgs[s.src]!==undefined)return imgs[s.src];imgs[s.src]=null;const i=new Image();i.decoding='async';i.onload=()=>imgs[s.src]=i;i.src=ROOT+s.src;return null}
const ease=u=>u<0?0:u>1?1:u*u*(3-2*u);
function kb(img,u,k,a){if(!img)return;const z=1.04+.10*u,s=Math.max(W/img.width,H/img.height)*z,w=img.width*s,h=img.height*s,dir=k%2?1:-1;
  const ox=(W-w)/2+dir*(w-W)*.45*(u-.5),oy=(H-h)/2+(k%3-1)*(h-H)*.3*(u-.5);x.globalAlpha=a;x.drawImage(img,ox,oy,w,h);x.globalAlpha=1}
const F=(px,f='Space Grotesk',w='400')=>`${w} ${Math.round(px)}px "${f}",system-ui,sans-serif`;
function wrap(t,maxW){const words=t.split(' '),L=[];let line='';for(const w of words){const tt=line?line+' '+w:w;if(x.measureText(tt).width>maxW&&line){L.push(line);line=w}else line=tt}line&&L.push(line);return L}
const yr=s=>{const m=String(s.y).match(/(18|19|20)\d\d/g);return m?+m[m.length-1]:1866};
// the storm (only on the "now" card): drawn in code, clearly not a photograph
const rain=[...Array(260)].map(()=>({x:Math.random(),y:Math.random(),v:.6+Math.random()}));
function storm(t,a){x.fillStyle=`rgba(10,18,26,${.38*a})`;x.fillRect(0,0,W,H);const sea=H*(.80-.03*Math.sin(t*.0011));
  x.fillStyle=`rgba(26,52,64,${.55*a})`;x.beginPath();x.moveTo(0,H);for(let X=0;X<=W;X+=8)x.lineTo(X,sea+Math.sin(X*.011+t*.0026)*H*.02+Math.sin(X*.037-t*.004)*H*.008);x.lineTo(W,H);x.fill();
  x.strokeStyle=`rgba(240,240,232,${.6*a})`;x.lineWidth=Math.max(1,W/900);x.beginPath();for(let X=0;X<=W;X+=8){const y=sea+Math.sin(X*.011+t*.0026)*H*.02+Math.sin(X*.037-t*.004)*H*.008;X?x.lineTo(X,y):x.moveTo(X,y)}x.stroke();
  x.strokeStyle=`rgba(210,222,232,${.35*a})`;x.beginPath();for(const r of rain){const px=r.x*W,py=r.y*H;x.moveTo(px,py);x.lineTo(px-W*.008*r.v,py+H*.03*r.v);r.y+=.018*r.v;r.x-=.004*r.v;if(r.y>1){r.y=-.05;r.x=Math.random()*1.2}}x.stroke();
  if(Math.random()<.004*a){x.fillStyle='rgba(255,255,255,.18)';x.fillRect(0,0,W,H)}}
function draw(t){x.fillStyle='#06142b';x.fillRect(0,0,W,H);const tt=t%total;let cur=S.length-1;for(let i=0;i<S.length;i++)if(tt>=S[i].t0&&tt<S[i].t0+S[i].d){cur=i;break}
  const s=S[cur],u=(tt-s.t0)/s.d;get(s);if(S[cur+1])get(S[cur+1]);
  if(tt>=total-1600){const k=(tt-(total-1600))/1600;return}
  kb(imgs[s.src],s.now?.4+.6*u:u,cur,1);
  const nxt=S[cur+1],inXF=nxt&&tt>s.t0+s.d-XF;if(inXF)kb(imgs[nxt.src],0,cur+1,ease((tt-(s.t0+s.d-XF))/XF));
  const show=inXF&&(tt-(s.t0+s.d-XF))/XF>.5?nxt:s,su=show===s?u:0;
  if(show.now){const a=ease((tt-show.t0)/2500);storm(t,a)}
  // fade out to black at the end
  if(s.now&&u>.9){x.fillStyle=`rgba(6,20,43,${ease((u-.9)/.1)})`;x.fillRect(0,0,W,H)}
  // caption band
  const g=x.createLinearGradient(0,H*.5,0,H);g.addColorStop(0,'rgba(6,20,43,0)');g.addColorStop(1,'rgba(6,20,43,.88)');x.fillStyle=g;x.fillRect(0,H*.5,W,H*.5);
  const m=W*.04,big=W*(show.now?.075:.065);x.textBaseline='alphabetic';
  if(show.now){x.fillStyle='#2a6fa8';x.fillRect(m,m*.8,W*.075,W*.03);x.fillStyle='#fff';x.font=F(W*.017,'JetBrains Mono');x.fillText('NOW',m+W*.012,m*.8+W*.021);
    x.fillStyle='rgba(255,255,255,.9)';x.font=F(W*.015,'JetBrains Mono');x.fillText('UPDATED 25 OCT 2026 · SOURCES BELOW',m+W*.09,m*.8+W*.021)}
  x.fillStyle='#f3efe4';x.font=F(big,'Fraunces','300');x.fillText(show.y,m,H*(show.now?.6:.66));
  x.font=F(W*(show.now?.024:.022));x.fillStyle='#f3efe4';let yy=H*(show.now?.6:.66)+W*.04;
  for(const l of wrap(show.c,W*.78)){x.fillText(l,m,yy);yy+=W*.03}
  if(show.now){const a=ease((tt-show.t0-5000)/1500);x.globalAlpha=a;x.font=F(W*.021,'Fraunces','400');x.fillStyle='#cfe3f5';for(const l of wrap(show.c2,W*.8)){x.fillText(l,m,yy+W*.006);yy+=W*.03}x.globalAlpha=1}
  x.font=F(W*.0115,'JetBrains Mono');x.fillStyle='rgba(243,239,228,.7)';x.textAlign='right';x.fillText(show.cr,W-m,H-W*.05);x.textAlign='left';
  // the time bar: 1866 to 2026, with a tick for each dated view
  const y0=H-W*.022,x0=m,x1=W-m,px=v=>x0+(x1-x0)*(v-1866)/160;x.fillStyle='rgba(243,239,228,.25)';x.fillRect(x0,y0,x1-x0,1.5);
  S.forEach(q=>x.fillRect(px(yr(q))-.5,y0-4,1.5,8));const a=yr(s),b=nxt?yr(nxt):a,p=a+(b-a)*(inXF?ease((tt-(s.t0+s.d-XF))/XF):0);
  x.fillStyle='#9fcdf0';x.beginPath();x.arc(px(p),y0+.75,W*.006,0,6.283);x.fill();
  x.font=F(W*.0105,'JetBrains Mono');x.fillStyle='rgba(243,239,228,.6)';x.fillText('1866',x0,y0-W*.008);x.textAlign='right';x.fillText('2026',x1,y0-W*.008);x.textAlign='left';
  if(rec){x.font=F(W*.0115,'JetBrains Mono');x.fillStyle='rgba(243,239,228,.7)';x.textAlign='right';x.fillText('The Latest Damaged View of the Pier · home324707-afk.github.io/west-pier-gallery',W-m,H-W*.072);x.textAlign='left'}
  else if(paused){x.fillStyle='rgba(6,20,43,.5)';x.fillRect(W-m-W*.05,m*.8,W*.05,W*.03);x.fillStyle='#fff';x.font=F(W*.016,'JetBrains Mono');x.fillText('❚❚',W-m-W*.038,m*.8+W*.021)}}
let rec=false,run=false,paused=false,raf=0,start=null,acc=0,last=0;
function loop(now){if(!run||paused)return;raf=requestAnimationFrame(loop);if(now-last<33)return;if(start===null)start=now-acc;acc=now-start;last=now;draw(acc)}
function go(){cancelAnimationFrame(raf);start=null;if(run&&!paused)raf=requestAnimationFrame(loop)}
if(REDUCE){const s=S[S.length-1],i=new Image();i.onload=()=>{imgs[s.src]=i;draw(s.t0+9000)};i.src=ROOT+s.src;return}
get(S[0]);get(S[1]);
new IntersectionObserver(es=>es.forEach(e=>{run=e.isIntersecting&&!document.hidden;go()}),{threshold:.15}).observe(c);
document.addEventListener('visibilitychange',()=>{run=!document.hidden&&c.getBoundingClientRect().bottom>0&&c.getBoundingClientRect().top<innerHeight;go()});
c.addEventListener('click',()=>{paused=!paused;draw(acc);go()});c.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();c.click()}});
addEventListener('resize',()=>{size();draw(acc)});
window.WPTL={seek:ms=>{acc=ms;draw(ms)},stop:()=>{paused=true;rec=true;cancelAnimationFrame(raf)},total,S};
})();
