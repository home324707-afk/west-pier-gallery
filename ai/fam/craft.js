/* Family: made by hand (by a machine). Crafts and print processes, simulated in code: a Bayeux-style embroidered frieze, stained glass,
   a cut-paper diorama, a shadow-puppet theatre, a tarot card, an emoji mosaic, cross-stitch, a postage stamp, a neon sign and a woodcut.
   p: {seed, mode, ...}. Wholly original drawing; no image is copied. */
(()=>{const{pier,off,sky,noise,mulberry}=WPAI.util;const TAU=6.283;
const lerp=(a,b,k)=>a+(b-a)*k;
/* a pier as a list of segments in unit space (x 0..1 along, y 0 = deck, negative = up), so crafts can draw it their own way */
function pierSegs(seed,gaps=.15){const r=mulberry(seed),S=[];const legs=34;for(let i=0;i<=legs;i++){const u=i/legs;if(r()<gaps)continue;S.push([u,0,u+(r()-.5)*.004,1,'leg'])}
  for(let i=0;i<legs;i++){const u=i/legs;if(r()<gaps*1.5)continue;S.push([u,0,u+1/legs,0,'deck']);if(r()<.6)S.push([u,0,u+1/legs,.55,'brace'])}
  const a=.62,b=.95,ribs=10;for(let i=0;i<=ribs;i++){const u=a+(b-a)*i/ribs,h=.55+.45*Math.sin(Math.PI*i/ribs);if(r()<.9)S.push([u,0,u,-h*.9,'rib'])}
  for(let i=0;i<24;i++){const u0=a+(b-a)*i/24,u1=a+(b-a)*(i+1)/24,f=u=>-(.55+.45*Math.sin(Math.PI*(u-a)/(b-a)))*.9;if(r()<.88)S.push([u0,f(u0),u1,f(u1),'arch'])}return S}
function drawSegs(x,S,X0,Y0,L,D,col,lw){x.strokeStyle=col;x.lineWidth=lw;x.beginPath();for(const[a,b,c,d]of S){x.moveTo(X0+a*L,Y0+b*D);x.lineTo(X0+c*L,Y0+d*D)}x.stroke()}
const M={};
/* 1. Embroidered frieze: a long linen band, scenes stitched in wool, scrolling past like the Bayeux Tapestry */
M.tapestry={init(s){const{W,H}=s,L=W*4;s.L=L;const c=s.band=off(L,H),x=c.getContext('2d'),r=s.rnd;x.fillStyle='#e9dcc0';x.fillRect(0,0,L,H);
  for(let i=0;i<L*H/60;i++){x.fillStyle=`rgba(120,95,60,${r()*.08})`;x.fillRect(r()*L,r()*H,2,1)}
  const wool=['#b5532f','#c99a3a','#6f7f4e','#2f4a66','#7b2f2a','#3a3530'],st=(x0,y0,x1,y1,col,w=3)=>{const n=Math.max(2,Math.hypot(x1-x0,y1-y0)/(w*1.6));x.strokeStyle=col;x.lineWidth=w;x.lineCap='round';x.beginPath();
   for(let i=0;i<n;i++){const a=i/n,b=(i+.8)/n;x.moveTo(lerp(x0,x1,a)+(r()-.5),lerp(y0,y1,a)+(r()-.5));x.lineTo(lerp(x0,x1,b),lerp(y0,y1,b))}x.stroke()};
  const bh=H*.16;for(const yb of[0,H-bh]){x.fillStyle='rgba(180,150,100,.18)';x.fillRect(0,yb,L,bh);for(let X=0;X<L;X+=bh*1.2){st(X,yb+bh*.15,X+bh*.6,yb+bh*.85,wool[3],2);st(X+bh*.6,yb+bh*.85,X+bh*1.2,yb+bh*.15,wool[3],2);
    const k=(X/(bh*1.2)|0)%4;if(k===0){st(X+bh*.45,yb+bh*.5,X+bh*.75,yb+bh*.4,wool[0],3);st(X+bh*.75,yb+bh*.4,X+bh*.85,yb+bh*.5,wool[0],3)}if(k===2){x.fillStyle=wool[1];x.beginPath();x.arc(X+bh*.6,yb+bh*.5,bh*.12,0,TAU);x.fill()}}}
  const mid0=bh*1.2,mid1=H-bh*1.2,sea=mid1-H*.12,scene=(X,label,fn)=>{fn(X);x.fillStyle=wool[5];x.font=`600 ${H*.055}px Fraunces,serif`;x.fillText(label,X+W*.05,mid0+H*.07)};
  const waves=(X0,X1,col)=>{for(let X=X0;X<X1;X+=H*.06){st(X,sea+H*.02,X+H*.03,sea-H*.01,col,3);st(X+H*.03,sea-H*.01,X+H*.06,sea+H*.02,col,3)}};
  const pierAt=(X,sc,gaps,col)=>{const S=pierSegs(s.p.seed+X|0,gaps),Lp=W*.62*sc,D=(sea-mid0)*.6;for(const[a,b,c,d,k]of S)st(X+a*Lp,sea-H*.12+b*D,X+c*Lp,sea-H*.12+d*D*(k==='leg'?.2:1),k==='arch'||k==='rib'?wool[0]:col,4)};
  const fig=(X,Y,col,arm)=>{st(X,Y,X,Y-H*.07,col,4);x.fillStyle=col;x.beginPath();x.arc(X,Y-H*.085,H*.016,0,TAU);x.fill();st(X,Y-H*.055,X+arm*H*.03,Y-H*.08,col,3);st(X,Y,X-H*.015,Y+H*.03,col,3);st(X,Y,X+H*.015,Y+H*.03,col,3)};
  scene(0,'HIC PONS IN MARE AEDIFICATUR · 1866',X=>{waves(X,X+W,wool[3]);pierAt(X+W*.25,1,0,wool[5]);for(let i=0;i<6;i++)fig(X+W*.08+i*W*.04,sea,wool[i%3],i%2?1:-1)});
  scene(W,'HIC HOMINES AMBULANT ET GAUDENT',X=>{waves(X,X+W,wool[3]);pierAt(X+W*.2,1,0,wool[5]);for(let i=0;i<9;i++)fig(X+W*(.25+i*.05),sea-H*.14,wool[i%4],i%2?1:-1);x.fillStyle=wool[1];x.beginPath();x.arc(X+W*.85,mid0+H*.18,H*.05,0,TAU);x.fill()});
  scene(W*2,'HIC PONS ARDET · MMIII',X=>{waves(X,X+W,wool[3]);pierAt(X+W*.2,1,.25,wool[5]);for(let i=0;i<60;i++){const fx=X+W*(.5+r()*.25),fy=sea-H*(.15+r()*.3);st(fx,fy,fx+(r()-.5)*H*.03,fy-H*.05,r()<.5?wool[0]:wool[1],3)}});
  scene(W*3,'HIC MARE PONTEM CAPIT · MMXXVI',X=>{for(let i=0;i<5;i++)waves(X,X+W,wool[3]),x.translate(0,-H*.035);x.setTransform(1,0,0,1,0,0);pierAt(X+W*.25,1,.55,wool[5]);for(let i=0;i<40;i++){const bx=X+W*(.15+r()*.7),by=mid0+H*(.12+r()*.2);st(bx-H*.012,by,bx,by+H*.008,wool[5],2);st(bx,by+H*.008,bx+H*.012,by,wool[5],2)}})},
 frame(s,t){const{x,W,H}=s,o=(t*W/26000)%(s.L);x.drawImage(s.band,-o,0);if(o>s.L-W)x.drawImage(s.band,s.L-o,0)}};
/* 2. Stained glass: Voronoi panes, leaded, lit by a sun that crosses behind them */
M.glass={init(s){const{W,H}=s,w=W/4|0,h=H/4|0,r=s.rnd,N=s.p.cells||170,P=[];for(let i=0;i<N;i++)P.push([r()*w,r()*h]);
  const pm=off(w,h);pier(pm.getContext('2d'),w,h,h*.62,1.3,s.p.seed,'#fff');const pd=pm.getContext('2d').getImageData(0,0,w,h).data;
  const id=new Int16Array(w*h);for(let y=0;y<h;y++)for(let X=0;X<w;X++){let b=0,bd=1e9;for(let i=0;i<N;i++){const dx=P[i][0]-X,dy=P[i][1]-y,d=dx*dx+dy*dy;if(d<bd){bd=d;b=i}}id[y*w+X]=b}
  const col=P.map(([px,py],i)=>{const v=py/h,inP=pd[((py|0)*w+(px|0))*4+3]>0;if(v>.64)return[[20,90,110],[30,120,130],[15,60,95]][i%3];if(v>.58&&!inP)return[200,120,40];return[[40,60,150],[70,50,140],[30,90,170],[90,70,160]][i%4]});
  const img=new ImageData(w,h),d=img.data;for(let k=0;k<w*h;k++){const i=id[k],c=col[i],X=k%w,y=k/w|0,edge=(X>0&&id[k-1]!==i)||(y>0&&id[k-w]!==i)||(X<w-1&&id[k+1]!==i)||(y<h-1&&id[k+w]!==i);
   const n=.85+.3*Math.random(),inP=pd[k*4+3]>40;d[k*4]=edge||inP?18:c[0]*n;d[k*4+1]=edge||inP?16:c[1]*n;d[k*4+2]=edge||inP?14:c[2]*n;d[k*4+3]=255}
  s.g=off(w,h);s.g.getContext('2d').putImageData(img,0,0)},
 frame(s,t){const{x,W,H}=s;x.imageSmoothingEnabled=true;x.drawImage(s.g,0,0,W,H);const u=(t/30000)%1,sx=W*(-.2+1.4*u),sy=H*(.25+.1*Math.sin(u*Math.PI));
  x.globalCompositeOperation='lighter';const g=x.createRadialGradient(sx,sy,0,sx,sy,W*.45);g.addColorStop(0,'rgba(255,220,150,.55)');g.addColorStop(1,'rgba(255,220,150,0)');x.fillStyle=g;x.fillRect(0,0,W,H);x.globalCompositeOperation='source-over';
  x.strokeStyle='#121010';x.lineWidth=W*.02;x.strokeRect(0,0,W,H);x.fillStyle='rgba(0,0,0,.15)';for(let i=1;i<3;i++)x.fillRect(W*i/3-2,0,4,H)}};
/* 3. Cut paper: layered card, each layer casting a shadow on the one behind, bobbing gently */
M.paper={init(s){const c=s.pc=off(s.W,s.H),cx=c.getContext('2d');pier(cx,s.W,s.H,s.H*.66,1.25,s.p.seed,'#000');cx.globalCompositeOperation='source-in';cx.fillStyle='#22344f';cx.fillRect(0,0,s.W,s.H)},frame(s,t){const{x,W,H}=s,T=t/1000,cols=['#f4e6cf','#ecc9a0','#d79a74','#9c6b6e','#5e5a78','#384a6a','#22344f'];x.fillStyle=cols[0];x.fillRect(0,0,W,H);
  x.fillStyle='#fffaf0';x.shadowColor='rgba(40,30,30,.35)';x.shadowBlur=W*.012;x.shadowOffsetY=W*.004;x.beginPath();x.arc(W*.72,H*.28,H*.11,0,TAU);x.fill();
  for(let L=1;L<cols.length;L++){const k=L/cols.length,base=H*(.45+k*.5),amp=H*.02*(1+k),ph=T*(.3+k*.4)+L;x.fillStyle=cols[L];x.beginPath();x.moveTo(0,H);
   for(let X=0;X<=W;X+=W/120)x.lineTo(X,base+Math.sin(X/W*(3+L)+ph)*amp+Math.sin(X/W*11+L)*amp*.3);x.lineTo(W,H);x.fill();
   if(L===3){x.drawImage(s.pc,0,Math.sin(T*.6)*H*.006)}}
  x.shadowColor='transparent';x.fillStyle='rgba(255,255,255,.05)';for(let i=0;i<400;i++)x.fillRect((i*97)%W,(i*53)%H,1,1)}};
/* 4. Shadow puppets: rods, a lamp-lit screen, a pier that sways on its stick, gulls and a paper sea */
M.shadow={init(s){s.S=pierSegs(s.p.seed,.2)},frame(s,t){const{x,W,H}=s,T=t/1000,fl=.92+.08*Math.sin(T*13)*Math.sin(T*7.3);
  const g=x.createRadialGradient(W*.5,H*.45,0,W*.5,H*.45,W*.6);g.addColorStop(0,`rgba(255,${200*fl|0},${120*fl|0},1)`);g.addColorStop(1,'#5a2a12');x.fillStyle=g;x.fillRect(0,0,W,H);
  x.fillStyle='#0c0806';x.strokeStyle='#0c0806';const sw=Math.sin(T*.7)*.03;x.save();x.translate(W*.5,H*.6);x.rotate(sw);drawSegs(x,s.S,-W*.33,0,W*.66,H*.24,'#0c0806',W*.006);x.restore();
  x.lineWidth=W*.003;x.beginPath();x.moveTo(W*.5,H*.62);x.lineTo(W*.5+Math.sin(sw)*H*.4,H*1.02);x.stroke();
  for(let k=0;k<3;k++){const y=H*(.78+k*.07)+Math.sin(T*(1+k*.3)+k)*H*.02;x.beginPath();x.moveTo(-10,H);for(let X=0;X<=W+20;X+=W/40)x.lineTo(X,y+(((X/(W/40))|0)%2?-H*.025:H*.015));x.lineTo(W+20,H);x.fill()}
  for(let b=0;b<2;b++){const bx=W*(.2+.6*((T*.05+b*.5)%1)),by=H*(.22+b*.08)+Math.sin(T*2+b)*H*.03,f=Math.sin(T*6+b)*H*.04;x.beginPath();x.moveTo(bx-W*.05,by+f);x.quadraticCurveTo(bx-W*.02,by-H*.01,bx,by+H*.01);x.quadraticCurveTo(bx+W*.02,by-H*.01,bx+W*.05,by+f);x.lineTo(bx,by+H*.025);x.fill();x.beginPath();x.moveTo(bx,by+H*.02);x.lineTo(bx+W*.04,H*1.02);x.stroke()}
  x.fillStyle='#5a0f12';x.fillRect(0,0,W*.06,H);x.fillRect(W*.94,0,W*.06,H);x.fillRect(0,0,W,H*.06);x.fillStyle='rgba(0,0,0,.25)';for(let X=0;X<W*.06;X+=W*.012){x.fillRect(X,0,W*.004,H);x.fillRect(W*.94+X,0,W*.004,H)}}};
/* 5. A tarot card: XVI, THE PIER. Lightning, falling starlings, flat colour */
M.tarot={init(s){s.S=pierSegs(s.p.seed,.12);s.b=[...Array(14)].map(()=>[s.rnd(),s.rnd(),s.rnd()*TAU])},frame(s,t){const{x,W,H}=s,T=t/1000,m=W*.07;x.fillStyle='#14110e';x.fillRect(0,0,W,H);
  x.fillStyle='#f3e9d2';x.fillRect(m*.4,m*.4,W-m*.8,H-m*.8);x.strokeStyle='#14110e';x.lineWidth=W*.006;x.strokeRect(m,m,W-2*m,H-2*m);
  const ix=m*1.3,iy=m*2.6,iw=W-2*ix,ih=H-iy-m*2.6;const flash=(T%5)<.15;x.fillStyle=flash?'#fff6c8':'#1f2c4a';x.fillRect(ix,iy,iw,ih*.62);x.fillStyle='#2f6f93';x.fillRect(ix,iy+ih*.62,iw,ih*.38);
  for(let i=0;i<30;i++){x.fillStyle='#f2d14b';const sx=ix+((i*137)%100)/100*iw,sy=iy+((i*61)%60)/100*ih*.6;if(Math.sin(T*3+i)>.3)x.fillRect(sx,sy,W*.006,W*.006)}
  x.save();x.beginPath();x.rect(ix,iy,iw,ih);x.clip();drawSegs(x,s.S,ix+iw*.08,iy+ih*.62,iw*.84,ih*.3,'#14110e',W*.012);drawSegs(x,s.S.filter(q=>q[4]==='arch'||q[4]==='rib'),ix+iw*.08,iy+ih*.62,iw*.84,ih*.3,'#c4562b',W*.006);
  if((T%5)<.4){x.strokeStyle='#f2d14b';x.lineWidth=W*.012;x.beginPath();x.moveTo(ix+iw*.85,iy);x.lineTo(ix+iw*.7,iy+ih*.2);x.lineTo(ix+iw*.8,iy+ih*.25);x.lineTo(ix+iw*.68,iy+ih*.5);x.stroke()}
  for(const b of s.b){const yy=iy+((b[1]+T*.06)%1)*ih*.7,xx=ix+b[0]*iw;x.strokeStyle='#14110e';x.lineWidth=W*.005;x.beginPath();x.moveTo(xx-W*.02,yy);x.lineTo(xx,yy+W*.012*Math.sin(T*8+b[2]));x.lineTo(xx+W*.02,yy);x.stroke()}
  for(let X=ix;X<ix+iw;X+=W*.03){x.strokeStyle='#f3e9d2';x.lineWidth=W*.004;x.beginPath();x.arc(X,iy+ih*.66+Math.sin(X*.05+T*2)*H*.006,W*.012,Math.PI,0);x.stroke()}x.restore();
  x.strokeStyle='#14110e';x.lineWidth=W*.006;x.strokeRect(ix,iy,iw,ih);x.fillStyle='#14110e';x.textAlign='center';x.font=`600 ${W*.075}px Fraunces,serif`;x.fillText('XVI',W/2,iy-m*.5);x.font=`600 ${W*.06}px Fraunces,serif`;x.fillText('THE PIER',W/2,H-m*1.25)}};
/* 6. Emoji mosaic */
M.emoji={init(s){const{W}=s;s.cols=s.p.cols||40;s.cs=W/s.cols;s.rows=Math.ceil(s.H/s.cs);const w=s.cols,h=s.rows,B=off(w*8,h*8);pier(B.getContext('2d'),w*8,h*8,h*8*.62,1.25,s.p.seed,'#fff');const m=off(w,h),mx=m.getContext('2d');mx.imageSmoothingQuality='high';mx.drawImage(B,0,0,w,h);s.m=mx.getImageData(0,0,w,h).data},
 frame(s,t){const{x,W,H,cols,rows,cs,m}=s,T=t/1000;x.fillStyle='#fdfbf6';x.fillRect(0,0,W,H);x.font=`${cs*.86}px "Noto Color Emoji",sans-serif`;x.textBaseline='top';
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const v=j/rows,inP=m[(j*cols+i)*4+3]>60;let e;const wv=Math.sin(i*.5-T*2+j)*.5+.5;
   if(inP)e=j>rows*.62?'🪵':(i+j)%7?'🏚️':'🔩';else if(v>.62)e=wv>.75?'🌊':wv>.4?'🟦':'💧';else if(v<.12)e=Math.sin(i*.3+T*.3)>.2?'☁️':'🌫️';else{const bird=Math.sin(i*.9+T*1.3+j*1.7)>.985;e=bird?'🐦':((i*31+j*17)%23===0&&Math.sin(T*2+i)>.9)?'⚡':'⬛'}
   if(v>=.12&&v<=.62&&!inP&&e==='⬛'){x.fillStyle=`hsl(${215+v*40},35%,${18+v*30}%)`;x.fillRect(i*cs,j*cs,cs,cs);continue}x.fillText(e,i*cs+cs*.04,j*cs+cs*.04)}}};
/* 7. Cross-stitch: aida cloth, stitched one cross at a time from a chart, with the key */
M.stitch={init(s){const w=s.p.cols||56,h=Math.round(w*s.H/s.W*.82);s.w=w;s.h=h;const m=off(w,h),mx=m.getContext('2d');const g=mx.createLinearGradient(0,0,0,h);g.addColorStop(0,'#9cc3d8');g.addColorStop(.62,'#f2c8a0');g.addColorStop(.63,'#3d6f86');g.addColorStop(1,'#26485a');mx.fillStyle=g;mx.fillRect(0,0,w,h);const B=off(w*8,h*8);pier(B.getContext('2d'),w*8,h*8,h*8*.64,1.3,s.p.seed,'#3a2a24');for(let q=0;q<4;q++)mx.drawImage(B,0,0,w,h);
  const d=mx.getImageData(0,0,w,h).data,pal=[[156,195,216],[242,200,160],[61,111,134],[38,72,90],[58,42,36],[200,150,130],[110,150,180]];s.cells=[];for(let j=0;j<h;j++)for(let i=0;i<w;i++){const k=(j*w+i)*4;let b=0,bd=1e9;pal.forEach((c,q)=>{const dd=(c[0]-d[k])**2+(c[1]-d[k+1])**2+(c[2]-d[k+2])**2;if(dd<bd){bd=dd;b=q}});s.cells.push(b)}s.pal=pal},
 frame(s,t){const{x,W,H,w,h}=s,cs=Math.min(W*.8/w,H*.92/h),ox=W*.04,oy=(H-cs*h)/2;x.fillStyle='#efe9dc';x.fillRect(0,0,W,H);x.fillStyle='rgba(120,110,90,.25)';for(let j=0;j<=h;j++)for(let i=0;i<=w;i++)x.fillRect(ox+i*cs-1,oy+j*cs-1,2,2);
  const done=s.still?w*h:Math.min(w*h,(t/14)|0);x.lineWidth=cs*.26;x.lineCap='round';for(let k=0;k<done;k++){const i=k%w,j=k/w|0,c=s.pal[s.cells[k]];x.strokeStyle=`rgb(${c})`;const X=ox+i*cs,Y=oy+j*cs,e=cs*.18;x.beginPath();x.moveTo(X+e,Y+e);x.lineTo(X+cs-e,Y+cs-e);x.moveTo(X+cs-e,Y+e);x.lineTo(X+e,Y+cs-e);x.stroke()}
  const sy=['·','○','≈','▲','■','◇','✕'];x.font=`${cs*1.1}px "JetBrains Mono",monospace`;for(let k=done;k<Math.min(w*h,done+w*3);k++){const i=k%w,j=k/w|0;x.fillStyle='rgba(60,50,40,.35)';x.fillText(sy[s.cells[k]],ox+i*cs+cs*.2,oy+j*cs+cs*.85)}
  if(done<w*h){const i=done%w,j=done/w|0;x.strokeStyle='#bbb';x.lineWidth=2;x.beginPath();x.moveTo(ox+i*cs,oy+j*cs);x.lineTo(ox+i*cs+cs*6,oy+j*cs-cs*10);x.stroke()}
  const kx=ox+cs*w+W*.03;x.font=`${W*.016}px "JetBrains Mono",monospace`;x.fillStyle='#3a3530';x.fillText('KEY',kx,oy+W*.02);s.pal.forEach((c,q)=>{x.fillStyle=`rgb(${c})`;x.fillRect(kx,oy+W*.04+q*W*.035,W*.025,W*.025);x.fillStyle='#3a3530';x.fillText(sy[q]+' thread '+(q+1),kx+W*.035,oy+W*.06+q*W*.035)})}};
/* 8. A postage stamp, perforated, engraved, then cancelled by a postmark */
M.stamp={init(s){},frame(s,t){const{x,W,H}=s,T=(t/1000)%12;x.fillStyle='#2a2c30';x.fillRect(0,0,W,H);const sw=H*.62,sh=H*.8,sx=(W-sw)/2,sy=(H-sh)/2,r=sw*.022;
  x.fillStyle='#f6f1e6';x.fillRect(sx,sy,sw,sh);x.fillStyle='#2a2c30';for(let X=sx;X<=sx+sw;X+=r*2.6){x.beginPath();x.arc(X,sy,r,0,TAU);x.arc(X,sy+sh,r,0,TAU);x.fill()}for(let Y=sy;Y<=sy+sh;Y+=r*2.6){x.beginPath();x.arc(sx,Y,r,0,TAU);x.arc(sx+sw,Y,r,0,TAU);x.fill()}
  const ink='#7a1f2b',ix=sx+sw*.08,iy=sy+sh*.07,iw=sw*.84,ih=sh*.66;x.strokeStyle=ink;x.lineWidth=1;for(let Y=iy;Y<iy+ih*.6;Y+=sh*.008){x.globalAlpha=.25+.6*(Y-iy)/(ih*.6);x.beginPath();x.moveTo(ix,Y);x.lineTo(ix+iw,Y);x.stroke()}x.globalAlpha=1;
  for(let Y=iy+ih*.66;Y<iy+ih;Y+=sh*.012){x.beginPath();for(let X=ix;X<=ix+iw;X+=4)x.lineTo(X,Y+Math.sin(X*.05+Y)*2);x.stroke()}
  x.save();x.translate(ix,iy);x.beginPath();x.rect(0,0,iw,ih);x.clip();pier(x,iw,ih,ih*.66,1.35,s.p.seed,ink);x.restore();
  x.strokeStyle=ink;x.lineWidth=2;x.strokeRect(ix,iy,iw,ih);x.fillStyle=ink;x.textAlign='center';x.font=`600 ${sh*.06}px Fraunces,serif`;x.fillText('WEST PIER',sx+sw/2,sy+sh*.81);x.font=`${sh*.035}px "JetBrains Mono",monospace`;x.fillText('BRIGHTON 1866–2026',sx+sw/2,sy+sh*.87);
  x.textAlign='left';x.font=`700 ${sh*.08}px "Space Grotesk",sans-serif`;x.fillText('2nd',sx+sw*.08,sy+sh*.95);x.font=`${sh*.022}px "JetBrains Mono",monospace`;x.textAlign='right';x.fillText('NOT VALID FOR POSTAGE',sx+sw*.92,sy+sh*.95);
  const a=T<6?0:Math.min(.85,(T-6)*2);if(a>0){x.globalAlpha=a;x.strokeStyle='#1c1c24';x.lineWidth=3;const cx=sx+sw*.78,cy=sy+sh*.3,R=sw*.22;x.beginPath();x.arc(cx,cy,R,0,TAU);x.stroke();x.beginPath();x.arc(cx,cy,R*.72,0,TAU);x.stroke();
   x.fillStyle='#1c1c24';x.textAlign='center';x.font=`${R*.22}px "JetBrains Mono",monospace`;x.fillText('BRIGHTON',cx,cy-R*.2);x.fillText('25 OCT 26',cx,cy+R*.1);x.fillText('STORM',cx,cy+R*.4);for(let k=0;k<5;k++){x.beginPath();for(let X=cx-R*3;X<cx-R;X+=4)x.lineTo(X,cy-R*.5+k*R*.25+Math.sin(X*.04)*R*.08);x.stroke()}x.globalAlpha=1}x.textAlign='left'}};
/* 9. A neon sign on a brick wall at night, some tubes dead, some flickering */
M.neon={init(s){const{W,H}=s,b=s.wall=off(W,H),x=b.getContext('2d'),r=s.rnd;x.fillStyle='#1a1214';x.fillRect(0,0,W,H);const bw=W/16,bh=H/22;for(let j=0;j<23;j++)for(let i=-1;i<17;i++){x.fillStyle=`rgb(${40+r()*20},${22+r()*10},${24+r()*10})`;x.fillRect(i*bw+(j%2)*bw/2+2,j*bh+2,bw-4,bh-4)}
  s.S=pierSegs(s.p.seed,.08);s.dead=s.S.map(()=>r()<.12);s.fl=s.S.map(()=>r()<.08)},
 frame(s,t){const{x,W,H}=s,T=t/1000;x.drawImage(s.wall,0,0);const X0=W*.12,Y0=H*.62,L=W*.76,D=H*.3;x.lineCap='round';
  for(const pass of[0,1]){x.lineWidth=pass?W*.004:W*.012;x.shadowBlur=pass?W*.01:W*.03;s.S.forEach((q,i)=>{const on=!s.dead[i]&&!(s.fl[i]&&Math.sin(T*23+i)*Math.sin(T*3.1+i)>.2);const c=q[4]==='arch'||q[4]==='rib'?'255,80,160':'80,200,255';
   x.strokeStyle=on?(pass?'rgba(255,255,255,.9)':`rgba(${c},.8)`):'rgba(90,90,100,.5)';x.shadowColor=on?`rgb(${c})`:'transparent';x.beginPath();x.moveTo(X0+q[0]*L,Y0+q[1]*D);x.lineTo(X0+q[2]*L,Y0+q[3]*D*(q[4]==='leg'?.4:1));x.stroke()})}
  const on=Math.sin(T*1.7)>-.85||Math.sin(T*31)>0;x.font=`italic 600 ${H*.15}px Fraunces,serif`;x.textAlign='center';x.shadowColor=on?'#ffb347':'transparent';x.shadowBlur=W*.03;x.lineWidth=W*.004;x.strokeStyle=on?'#ffe0a0':'#5a5050';x.strokeText('West Pier',W/2,H*.22);
  x.font=`600 ${H*.05}px "Space Grotesk",sans-serif`;x.strokeStyle=Math.sin(T*.9)>0?'#ff5090':'#503040';x.shadowColor=x.strokeStyle;x.strokeText('OPEN',W*.85,H*.9);x.shadowBlur=0;x.textAlign='left'}};
/* 10. Woodcut: black ink, gouge marks, then the press rolls */
M.woodcut={init(s){const{W,H}=s,c=s.blk=off(W,H),x=c.getContext('2d'),r=s.rnd,n=noise(s.p.seed);x.fillStyle='#f1e8d6';x.fillRect(0,0,W,H);x.strokeStyle='#111';x.lineCap='round';
  for(let Y=0;Y<H*.6;Y+=H*.018){x.lineWidth=H*.012*(1-Y/(H*.6))+1;x.beginPath();for(let X=0;X<=W;X+=W/80){const yy=Y+Math.sin(X/W*8+Y*.05)*H*.01+(n(X/W*4,Y/H*4)-.5)*H*.03;X?x.lineTo(X,yy):x.moveTo(X,yy)}x.stroke()}
  for(let i=0;i<70;i++){const X=r()*W,Y=r()*H*.55;x.lineWidth=2;x.beginPath();x.moveTo(X,Y);x.lineTo(X-W*.03,Y+H*.09);x.stroke()}
  x.fillStyle='#111';x.fillRect(0,H*.6,W,H*.4);x.strokeStyle='#f1e8d6';for(let Y=H*.62;Y<H;Y+=H*.022){x.lineWidth=2+(Y-H*.6)/H*10;x.beginPath();for(let X=0;X<=W;X+=W/60){const yy=Y+Math.sin(X/W*14+Y*.1)*H*.012*(1+(Y-H*.6)/H*4);X?x.lineTo(X,yy):x.moveTo(X,yy)}x.stroke()}
  const S=pierSegs(s.p.seed,.22);x.lineCap='square';drawSegs(x,S,W*.1,H*.6,W*.8,H*.3,'#111',W*.012);x.globalCompositeOperation='destination-out';for(let i=0;i<300;i++){x.fillRect(r()*W,r()*H,1+r()*3,1)}x.globalCompositeOperation='source-over';
  x.fillStyle='#b3261e';x.fillRect(W*.9,H*.05,W*.05,W*.05);x.fillStyle='#f1e8d6';x.font=`${W*.03}px Fraunces,serif`;x.fillText('W',W*.913,H*.05+W*.037)},
 frame(s,t){const{x,W,H}=s,u=s.still?1:((t/9000)%1.25),k=Math.min(1,u);x.fillStyle='#f1e8d6';x.fillRect(0,0,W,H);x.save();x.beginPath();x.rect(0,0,W*k,H);x.clip();x.drawImage(s.blk,0,0);x.restore();
  if(u<1){const X=W*k;x.fillStyle='#222';x.fillRect(X-W*.01,0,W*.025,H);x.fillStyle='rgba(0,0,0,.25)';x.fillRect(X+W*.015,0,W*.01,H)}}};
WPAI.register('f-craft',{fps:30,init(s){(M[s.p.mode].init||(()=>0))(s)},frame(s,t){M[s.p.mode].frame(s,t)}});
WPAI.craft={pierSegs,drawSegs};
})();
