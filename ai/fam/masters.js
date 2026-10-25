/* Family: after the masters. The machine paints the pier in the manner of painters it has read about, stroke by stroke, from code: no image of
   theirs is used or copied. Homages, credited as such, and wholly original pixels. styles: turner, constable, monet, seurat, whistler, vangogh,
   hokusai, rothko, mondrian. p: {seed, style} */
(()=>{const{pier,off,noise}=WPAI.util;
const mix=(a,b,k)=>a.map((v,i)=>v+(b[i]-v)*k),cl=v=>Math.max(0,Math.min(255,v|0)),rgb=(c,a=1)=>`rgba(${cl(c[0])},${cl(c[1])},${cl(c[2])},${a})`;
function pmask(s,base,sc){const w=s.W/4|0,h=s.H/4|0,m=off(w,h);pier(m.getContext('2d'),w,h,h*base,sc,s.p.seed,'#fff');const d=m.getContext('2d').getImageData(0,0,w,h).data;
  return(u,v)=>{const i=((Math.min(h-1,v*h|0))*w+Math.min(w-1,u*w|0))*4+3;return d[i]/255}}
const F={ // colour field, stroke direction, stroke size (fraction of W), alpha, strokes per frame, shape
 turner:{bg:[214,190,140],col(s,u,v){const d=Math.hypot(u-.6,(v-.42)*1.4),sw=s.n(u*3+d*4,v*3)*.3;let c=mix([255,248,220],[232,180,90],Math.min(1,d*2.2+sw));c=mix(c,[120,128,140],Math.max(0,d*1.6-.6));
   if(v>.6)c=mix(c,[150,120,80],.35);return mix(c,[70,50,40],s.m(u,v)*.7)},dir(s,u,v){return Math.atan2(v-.42,u-.6)+1.4+s.n(u*4,v*4)},sz:.05,a:.12,n:40,shape:'smear',po:.22,pc:'#4a3426'},
 constable:{bg:[120,150,190],col(s,u,v){if(v<.62){const cl2=s.n(u*4+s.T*.00002,v*6)+.4*s.n(u*12,v*14)-v*.5;return cl2>.55?mix([250,248,240],[150,150,160],(v)*1.2):mix([90,130,190],[160,180,210],v*1.5)}
   return mix(v<.86?[70,95,105]:[150,130,95],[40,35,30],s.m(u,v))},dir(s,u,v){return v<.62?s.n(u*5,v*5)*2-1:0},sz:.018,a:.7,n:60,shape:'dab',fleck:1,po:.75,pc:'#2a241e'},
 monet:{bg:[120,130,150],col(s,u,v){const sun=Math.hypot(u-.68,(v-.32)*1.6);let c=mix([235,140,90],[110,125,150],Math.min(1,v*.9+.25));if(sun<.035)c=[245,110,45];
   if(v>.55){c=mix([70,95,120],[100,120,145],s.n(u*20,v*30));if(Math.abs(u-.68)<.03+.05*(v-.55)&&s.n(u*60,v*80)>.45)c=[240,120,60]}return mix(c,[45,50,75],s.m(u,v)*.85)},dir(){return 0},sz:.022,a:.6,n:70,shape:'dash',po:.45,pc:'#2d3150'},
 seurat:{bg:[240,236,220],col(s,u,v){let c=v<.55?[150,190,230]:v<.75?[60,150,160]:[220,190,120];c=mix(c,[80,60,120],s.m(u,v));const comp=s.rnd()<.25;return comp?[255-c[0]*.6,255-c[1]*.6,255-c[2]*.6]:c},dir(){return 0},sz:.006,a:.9,n:260,shape:'dot',po:.3,pc:'#3c2c60'},
 whistler:{bg:[38,66,76],col(s,u,v){let c=mix([60,98,106],[26,48,58],v);c=mix(c,[12,20,28],s.m(u,v)*.8);return mix(c,[60,90,95],s.n(u*2,v*10)*.3)},dir(){return 0},sz:.08,a:.08,n:30,shape:'smear',fire:1,po:.6,pc:'#0e171e'},
 vangogh:{bg:[30,50,110],col(s,u,v){if(v>.62)return mix(mix([30,60,120],[60,100,160],s.n(u*15,v*20)),[15,15,25],s.m(u,v));let c=mix([40,70,150],[90,140,200],s.n(u*6,v*6));
   for(const st of s.stars){const d=Math.hypot(u-st[0],(v-st[1])*.6);if(d<st[2])c=mix([250,230,120],c,d/st[2])}return mix(c,[20,25,30],s.m(u,v))},
   dir(s,u,v){let a=0;for(const st of s.sw){const dx=u-st[0],dy=v-st[1];a+=Math.atan2(dy,dx)*Math.exp(-(dx*dx+dy*dy)/.02)}return a+1.57+s.n(u*3,v*3)},sz:.016,a:.9,n:90,shape:'thick',po:.7,pc:'#0d0f18'}};
WPAI.register('f-masters',{fps:30,init(s){const{W,H,p}=s;s.n=noise(p.seed);s.T=0;const pb=p.style==='turner'?.66:.68,ps=p.style==='constable'?.7:1.1;s.m=pmask(s,pb,ps);s.pc=off(W,H);pier(s.pc.getContext('2d'),W,H,H*pb,ps,p.seed,(F[p.style]||{}).pc||'#15141a');
  s.stars=[...Array(9)].map(()=>[s.rnd(),s.rnd()*.4,.02+s.rnd()*.03]);s.sw=[[.3,.25],[.62,.18],[.8,.35]];s.buf=off(W,H);s.bx=s.buf.getContext('2d');s.k=0;s.fw=[];this.wash(s)},
 wash(s){const f=F[s.p.style];if(!f)return;s.bx.fillStyle=rgb(f.bg);s.bx.fillRect(0,0,s.W,s.H);s.k=0},
 frame(s,t){const{x,W,H,p}=s;s.T=t;s.k++;if(p.style==='hokusai')return this.hokusai(s,t);if(p.style==='rothko')return this.rothko(s,t);if(p.style==='mondrian')return this.mondrian(s,t);
  const f=F[p.style],b=s.bx,R=s.rnd;if(s.k>(p.life||1400)&&!s.still)this.wash(s);const grow=Math.max(.35,1-s.k/900);
  for(let i=0;i<f.n*(s.full?1.6:1);i++){const u=R(),v=R(),c=f.col(s,u,v),a=f.dir(s,u,v),L=f.sz*W*(f.shape==='dot'?1:grow)*(.6+R()*.8),X=u*W,Y=v*H;b.fillStyle=rgb(c,f.a);b.strokeStyle=rgb(c,f.a);
   if(f.shape==='dot'){b.beginPath();b.arc(X,Y,L,0,6.283);b.fill()}
   else{b.save();b.translate(X,Y);b.rotate(a);if(f.shape==='thick'){b.lineCap='round';b.lineWidth=L*.35;b.beginPath();b.moveTo(-L,0);b.quadraticCurveTo(0,L*.25,L,0);b.stroke();b.strokeStyle='rgba(10,15,30,.25)';b.lineWidth=1;b.stroke()}
    else if(f.shape==='dash'){b.fillRect(-L,-L*.12,L*2,L*.24)}else if(f.shape==='dab'){b.beginPath();b.ellipse(0,0,L,L*.45,0,0,6.283);b.fill()}else{b.beginPath();b.ellipse(0,0,L*1.6,L*.35,0,0,6.283);b.fill()}b.restore()}}
  if(f.fleck&&R()<.6){b.fillStyle='rgba(255,255,250,.85)';b.fillRect(R()*W,R()*H*.6,2,2)}
  x.drawImage(s.buf,0,0);if(f.po){x.globalAlpha=f.po;x.drawImage(s.pc,0,0);x.globalAlpha=1}
  if(f.fire){if(R()<.04)s.fw.push({x:W*(.2+R()*.6),y:H*(.15+R()*.2),t0:t});s.fw=s.fw.filter(q=>t-q.t0<5000);for(const q of s.fw){const u=(t-q.t0)/5000;for(let k=0;k<14;k++){const a=k/14*6.283+q.x,r=W*.04*Math.sqrt(u);x.fillStyle=`rgba(240,200,110,${(1-u)*.9})`;x.fillRect(q.x+Math.cos(a)*r,q.y+Math.sin(a)*r+u*u*H*.25,2,2)}}}},
 hokusai(s,t){const{x,W,H}=s;x.fillStyle='#ece0c4';x.fillRect(0,0,W,H);x.fillStyle='#d9c9a6';for(let i=0;i<40;i++)x.fillRect((i*97)%W,(i*53)%H,W*.3,1);
  const hz=H*.72;x.fillStyle='#1d3557';x.fillRect(0,hz,W,H-hz);pier(x,W,H,hz+H*.02,.45,s.p.seed,'#2a2a2a');
  const rock=Math.sin(t*.0008)*.04,cx=W*(.36+rock),top=H*(.12+rock*.5);x.fillStyle='#24476b';x.beginPath();x.moveTo(-W*.05,H);x.bezierCurveTo(W*.05,H*.6,cx-W*.25,top,cx,top);x.bezierCurveTo(cx+W*.18,top-H*.02,cx+W*.24,top+H*.2,cx+W*.12,top+H*.22);
  x.bezierCurveTo(cx+W*.06,top+H*.12,cx-W*.02,top+H*.18,cx+W*.02,top+H*.35);x.bezierCurveTo(cx+W*.1,H*.75,cx+W*.35,H*.85,W*.7,H);x.closePath();x.fill();
  x.strokeStyle='#e9f1f5';x.lineWidth=Math.max(1,W/500);for(let k=0;k<9;k++){const u=k/9;x.beginPath();x.moveTo(cx-W*.2*(1-u)+W*.02,top+H*(.05+u*.5));x.bezierCurveTo(cx-W*.1,top+H*.1*u,cx+W*.1,top+H*.05,cx+W*.1+u*W*.02,top+H*.22);x.stroke()}
  x.fillStyle='#f5f7f8';for(let k=0;k<26;k++){const a=k/26,px=cx+W*.12*Math.cos(a*3.2-.4)+W*.04,py=top+H*.1+H*.12*Math.sin(a*3.2-.4);const ph=Math.sin(t*.004+k)*W*.006;
   x.beginPath();x.arc(px+ph,py,W*.009,0,6.283);x.fill();x.beginPath();x.arc(px+ph+W*.01,py+H*.012,W*.005,0,6.283);x.fill()}
  for(let k=0;k<40;k++){x.fillRect((k*137+t*.05)%W,(k*71+t*.08)%(H*.6),2,2)}
  x.fillStyle='#b8322a';x.fillRect(W*.84,H*.06,W*.1,H*.2);x.fillStyle='#ece0c4';x.font=`${W*.018}px Fraunces,serif`;x.save();x.translate(W*.89,H*.09);for(const[i,w]of['West','Pier','No.','∞'].entries())x.fillText(w,-x.measureText(w).width/2,i*W*.022+W*.015);x.restore()},
 rothko(s,t){const{x,W,H,p}=s,b=Math.sin(t*.0005)*.5+.5,C=p.pal||[[110,20,18],[200,80,30],[40,20,30]];x.fillStyle=rgb(mix(C[0],[0,0,0],.3));x.fillRect(0,0,W,H);
  const bands=[[.06,.42,C[1]],[.48,.24,C[0]],[.75,.2,C[2]]];for(const[y,h,c]of bands)for(let k=0;k<14;k++){const g=k*W*.004;x.fillStyle=rgb(mix(c,[255,230,200],b*.08),.11);x.fillRect(W*.07+g,H*y+g,W*.86-2*g,H*(h+b*.01)-2*g)}
  x.strokeStyle=rgb(mix(C[2],[0,0,0],.5),.6);x.lineWidth=Math.max(1,W/900);const py=H*.86;x.beginPath();for(let X=W*.25;X<W*.75;X+=W*.012){x.moveTo(X,py);x.lineTo(X,py+H*.06)}x.moveTo(W*.25,py);x.lineTo(W*.75,py);x.stroke()},
 mondrian(s,t){const{x,W,H,p}=s;if(!s.g){const R=s.rnd,xs=[0,.12,.3,.45,.52,.68,.8,.93,1].map(v=>v*W),ys=[0,.2,.42,.55,.7,1].map(v=>v*H);s.g={xs,ys,cells:[]};
   for(let j=0;j<ys.length-1;j++)for(let i=0;i<xs.length-1;i++){const r=R();s.g.cells.push({i,j,c:r<.14?'#d62a1e':r<.26?'#f2c61f':r<.36?'#1e4f9c':'#f1efe8',fall:0,v:0})}}
  const{xs,ys,cells}=s.g,cyc=(t%40000)/40000,sea=H*(1-.25*Math.max(0,Math.sin(cyc*6.283)));x.fillStyle='#f1efe8';x.fillRect(0,0,W,H);
  const lw=Math.max(4,W/90);cells.forEach((c,k)=>{const drop=Math.max(0,cyc*cells.length*1.4-((k*7)%cells.length))*.06;const dy=Math.min(H,drop*drop*H*.3);
   x.fillStyle=c.c;x.fillRect(xs[c.i]+lw/2,ys[c.j]+lw/2+dy,xs[c.i+1]-xs[c.i]-lw,ys[c.j+1]-ys[c.j]-lw)});
  x.fillStyle='#111';for(const X of xs)x.fillRect(X-lw/2,0,lw,H);for(const Y of ys)x.fillRect(0,Y-lw/2,W,lw);
  x.fillStyle='rgba(30,79,156,.92)';x.fillRect(0,sea,W,H-sea);x.fillStyle='#111';x.fillRect(0,sea-lw/2,W,lw)}});
})();
