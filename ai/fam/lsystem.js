/* Family: L-systems. Lindenmayer grammars grow from the pier's legs (kelp, coral, barnacle ironwork) or hang from its deck, segment by segment;
   when the growth is complete, a tide line rises and takes it, and it grows again from a new seed.
   p: {seed, rule, iter, ang, roots, dir ('up'|'down'), bg:[top,bottom], ink:[a,b], pier, grow (segments per frame)} */
(()=>{const{pier,off,sky}=WPAI.util;
const R={kelp:{ax:'X',r:{X:'F[+X]F[-X]+X',F:'FF'}},fern:{ax:'X',r:{X:'F+[[X]-X]-F[-FX]+X',F:'FF'}},bush:{ax:'F',r:{F:'FF+[+F-F-F]-[-F+F+F]'}},
 coral:{ax:'F',r:{F:'F[+F]F[-F][F]'}},koch:{ax:'F',r:{F:'F+F-F-F+F'}},arrow:{ax:'A',r:{A:'B-A-B',B:'A+B+A'}},dragon:{ax:'FX',r:{X:'X+YF+',Y:'-FX-Y'}},
 scroll:{ax:'F',r:{F:'F[+F+F+F]F[-F-F]'}}};
function expand(rule,n,cap){let s=R[rule].ax;for(let i=0;i<n;i++){let o='';for(const ch of s){o+=R[rule].r[ch]||ch;if(o.length>cap)break}s=o}return s}
WPAI.register('f-lsystem',{fps:30,init(s){const{W,H,p}=s;s.bg=sky(W,H,[[0,p.bg[0]],[1,p.bg[1]]]);if(p.pier!==false)pier(s.bg.getContext('2d'),W,H,H*.62,1.25,p.seed,p.pierc||'rgba(0,0,0,.55)');
  s.g=off(W,H);s.gx=s.g.getContext('2d');s.str=expand(p.rule,p.iter,60000);s.cycle=0;this.grow(s)},
 grow(s){const{W,H,p}=s,rnd=s.rnd,segs=[];const roots=p.roots||5,deck=H*.62-H*.05*1.25,A=(p.ang||25)*Math.PI/180,wob=(p.wob??1)*.12;
  for(let k=0;k<roots;k++){const x0=W*(.15+.7*(k+.5)/roots)+(rnd()-.5)*W*.04,y0=p.dir==='down'?deck:H;
   let x=0,y=0,a=p.dir==='down'?Math.PI/2:-Math.PI/2,d=0;const st=[],sg=[];
   for(const ch of s.str){if(ch==='F'||ch==='A'||ch==='B'){const j=(rnd()-.5)*wob,nx=x+Math.cos(a+j),ny=y+Math.sin(a+j);sg.push([x,y,nx,ny,d,k]);x=nx;y=ny}
    else if(ch==='+')a+=A*(1+(rnd()-.5)*wob);else if(ch==='-')a-=A*(1+(rnd()-.5)*wob);else if(ch==='['){st.push([x,y,a,d]);d++}else if(ch===']'){[x,y,a,d]=st.pop()}}
   let x1=1e9,x2=-1e9,y1=1e9,y2=-1e9;for(const q of sg){x1=Math.min(x1,q[0],q[2]);x2=Math.max(x2,q[0],q[2]);y1=Math.min(y1,q[1],q[3]);y2=Math.max(y2,q[1],q[3])}
   const hh=(p.h||.6)*H*(.75+rnd()*.4),sc=Math.min(hh/Math.max(1e-6,y2-y1),(p.wd||1.4)*W/roots/Math.max(1e-6,x2-x1)),cx=(x1+x2)/2,
     ox=p.centre?x0-cx*sc:x0,oy=p.dir==='down'?y0-y1*sc:y0-y2*sc;
   for(const q of sg)segs.push([ox+q[0]*sc,oy+q[1]*sc,ox+q[2]*sc,oy+q[3]*sc,q[4],k])}
  if(p.order!=='tree')segs.sort((a,b)=>a[4]-b[4]||0);s.segs=segs;s.i=0;s.tide=0;s.gx.clearRect(0,0,W,H);s.max=Math.max(1,...segs.map(q=>q[4]))},
 frame(s,t){const{x,W,H,p,gx}=s,n=Math.ceil(s.segs.length/(p.frames||240));
  if(s.i<s.segs.length){for(let k=0;k<n&&s.i<s.segs.length;k++,s.i++){const q=s.segs[s.i],u=q[4]/s.max;gx.strokeStyle=u<.5?p.ink[0]:p.ink[1];gx.globalAlpha=.55+.45*(1-u);
    gx.lineWidth=Math.max(.6,(W/700)*(1.6-u));gx.beginPath();gx.moveTo(q[0],q[1]);gx.lineTo(q[2],q[3]);gx.stroke()}gx.globalAlpha=1}
  else if(!s.still){s.tide+=H/500;if(s.tide>H*1.05){s.rnd=WPAI.util.mulberry(p.seed+(++s.cycle)*101);this.grow(s)}}
  x.drawImage(s.bg,0,0);x.drawImage(s.g,0,0);
  if(s.tide>0){const y=H-s.tide;x.fillStyle=p.sea||'rgba(12,30,40,.85)';x.beginPath();x.moveTo(0,H);for(let X=0;X<=W;X+=10)x.lineTo(X,y+Math.sin(X*.02+t*.003)*H*.01);x.lineTo(W,H);x.fill()}}});
})();
