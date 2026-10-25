/* Family: specimens and instruments. The pier examined as if it were a sample: a herbarium sheet, an X-ray, a seismogram of its
   sourced history, a petri dish of rust, a side-scan sonar sweep, and a spectrogram of the sea. p: {seed, mode, ...}.
   Dates in the seismogram come from the sourced timeline (data/timelapse.json); everything else is drawn, not measured. */
(()=>{const{pier,off,noise,mulberry}=WPAI.util;const TAU=6.283,F='"JetBrains Mono",monospace';
const M={};
/* 1. Herbarium sheet: a pressed seaweed that grew in the shape of the pier, taped down, labelled */
M.herbarium={init(s){const{W,H}=s,c=s.sp=off(W,H),x=c.getContext('2d'),r=s.rnd;const br=(X,Y,a,L,d,w)=>{if(d>7||L<H*.006)return;const X2=X+Math.cos(a)*L,Y2=Y+Math.sin(a)*L;x.lineWidth=w;x.strokeStyle=d<2?'#5a4a2a':'#6d6a3a';x.beginPath();x.moveTo(X,Y);x.quadraticCurveTo((X+X2)/2+(r()-.5)*L*.3,(Y+Y2)/2,X2,Y2);x.stroke();
   if(d>4){x.fillStyle='rgba(110,105,60,.55)';x.beginPath();x.ellipse(X2,Y2,L*.35,L*.12,a,0,TAU);x.fill()}br(X2,Y2,a-.35-r()*.3,L*.78,d+1,w*.7);br(X2,Y2,a+.3+r()*.3,L*.72,d+1,w*.7)};
  const legs=13;for(let i=0;i<legs;i++){const X=W*(.18+.5*i/legs);if(r()<.15)continue;br(X,H*.86,-Math.PI/2+(r()-.5)*.1,H*.09,0,W*.004)}
  x.strokeStyle='#4a3d22';x.lineWidth=W*.004;x.beginPath();x.moveTo(W*.16,H*.62);x.bezierCurveTo(W*.3,H*.6,W*.55,H*.63,W*.7,H*.6);x.stroke();
  for(let i=0;i<=9;i++){const X=W*(.5+.18*i/9),h=H*(.12+.12*Math.sin(Math.PI*i/9));x.beginPath();x.moveTo(X,H*.62);x.quadraticCurveTo(X+W*.01,H*.62-h*.6,X,H*.62-h);x.stroke()}},
 frame(s,t){const{x,W,H}=s,T=t/1000;x.fillStyle='#efe6cf';x.fillRect(0,0,W,H);x.fillStyle='rgba(150,120,70,.06)';for(let i=0;i<60;i++)x.fillRect((i*131)%W,(i*71)%H,W*.08,H*.05);x.drawImage(s.sp,0,0);
  x.fillStyle='rgba(240,230,190,.8)';for(const[a,b,rot]of[[.2,.86,.3],[.42,.62,-.2],[.62,.86,.1],[.58,.47,.4]]){x.save();x.translate(W*a,H*b);x.rotate(rot);x.fillRect(-W*.03,-H*.012,W*.06,H*.024);x.restore()}
  const lx=W*.66,ly=H*.7,lw=W*.3,lh=H*.25;x.fillStyle='#fbf7ec';x.fillRect(lx,ly,lw,lh);x.strokeStyle='#333';x.lineWidth=1;x.strokeRect(lx+4,ly+4,lw-8,lh-8);x.fillStyle='#222';x.font=`${H*.022}px ${F}`;
  const L=['HERBARIUM OF THE LATEST DAMAGED VIEWS','No. 0124','Pierus occidentalis Birch, 1866','Loc.: Brighton, in the sea, W of the i360','Coll.: the storm. Det.: a machine.','Pressed 25.x.2026'];
  const n=s.still?1e9:(T*12|0);let k=0;L.forEach((l,i)=>{const show=l.slice(0,Math.max(0,n-k));k+=l.length;x.font=i===2?`italic ${H*.03}px Fraunces,serif`:`${H*.021}px ${F}`;x.fillText(show,lx+W*.015,ly+H*.04+i*H*.034)});
  x.fillStyle='#222';for(let i=0;i<10;i++){x.fillStyle=i%2?'#222':'#fbf7ec';x.fillRect(W*.05+i*W*.03,H*.94,W*.03,H*.015)}x.strokeRect(W*.05,H*.94,W*.3,H*.015);x.font=`${H*.018}px ${F}`;x.fillStyle='#222';x.fillText('0      5 cm (not to scale)',W*.05,H*.985);
  const mx=W*(.4+.25*Math.sin(T*.25)),my=H*(.6+.12*Math.cos(T*.31)),R=H*.1;x.save();x.beginPath();x.arc(mx,my,R,0,TAU);x.clip();x.translate(mx,my);x.scale(2,2);x.translate(-mx,-my);x.fillStyle='#efe6cf';x.fillRect(0,0,W,H);x.drawImage(s.sp,0,0);x.restore();
  x.strokeStyle='#3a2e20';x.lineWidth=W*.006;x.beginPath();x.arc(mx,my,R,0,TAU);x.stroke();x.lineWidth=W*.012;x.beginPath();x.moveTo(mx+R*.7,my+R*.7);x.lineTo(mx+R*1.5,my+R*1.5);x.stroke()}};
/* 2. X-ray: the ironwork as bone, soft tissue where the pavilion was, a scan line and a radiologist's note */
M.xray={init(s){const{W,H}=s,c=s.b=off(W,H),x=c.getContext('2d');x.filter='blur(3px)';x.globalAlpha=.25;x.fillStyle='#9fc4e0';x.beginPath();x.ellipse(W*.62,H*.5,W*.2,H*.18,0,0,TAU);x.fill();x.globalAlpha=1;x.filter='none';
  x.shadowColor='#cfe8ff';x.shadowBlur=W*.01;pier(x,W,H,H*.66,1.3,s.p.seed,'rgba(225,240,255,.85)');x.shadowBlur=0;const r=s.rnd;x.strokeStyle='rgba(255,255,255,.9)';x.lineWidth=1.5;
  for(let i=0;i<6;i++){const X=W*(.3+r()*.45),Y=H*(.45+r()*.3);x.beginPath();x.moveTo(X,Y);for(let k=0;k<4;k++)x.lineTo(X+(r()-.5)*W*.03,Y+k*H*.02);x.stroke()}},
 frame(s,t){const{x,W,H}=s,T=t/1000;const g=x.createRadialGradient(W/2,H/2,0,W/2,H/2,W*.7);g.addColorStop(0,'#1b2a3a');g.addColorStop(1,'#03070c');x.fillStyle=g;x.fillRect(0,0,W,H);x.drawImage(s.b,0,0);
  const sy=H*((T*.12)%1);const sg=x.createLinearGradient(0,sy-H*.05,0,sy+H*.01);sg.addColorStop(0,'rgba(140,200,255,0)');sg.addColorStop(1,'rgba(140,200,255,.25)');x.fillStyle=sg;x.fillRect(0,sy-H*.05,W,H*.06);
  x.fillStyle='rgba(220,235,255,.8)';x.font=`${H*.03}px ${F}`;x.fillText('WEST PIER  F  b.1866',W*.03,H*.07);x.fillText('AP VIEW  25-OCT-2026',W*.03,H*.11);x.font=`700 ${H*.07}px ${F}`;x.fillText('L',W*.92,H*.12);
  x.strokeStyle='#ffd27a';x.fillStyle='#ffd27a';x.lineWidth=2;x.beginPath();x.moveTo(W*.3,H*.25);x.lineTo(W*.42,H*.5);x.stroke();x.beginPath();x.moveTo(W*.42,H*.5);x.lineTo(W*.405,H*.47);x.lineTo(W*.425,H*.475);x.fill();
  x.font=`${H*.026}px ${F}`;x.fillText('multiple fractures, old and new.',W*.18,H*.22);x.fillText('prognosis: the sea.',W*.18,H*.255)}};
/* 3. Seismogram: a drum recorder draws 160 years; spikes on the sourced dates */
M.seismo={init(s){s.ev=s.p.events;s.n=noise(s.p.seed)},frame(s,t){const{x,W,H,p}=s,T=t/1000,yrs=p.span,Y0=yrs[0],Y1=yrs[1],rows=8,rh=H*.8/rows,px=W*.86,speed=(Y1-Y0)/(s.still?1:60),cur=s.still?Y1:Y0+((T*speed)%(Y1-Y0+.001));
  x.fillStyle='#f4f1e8';x.fillRect(0,0,W,H);x.strokeStyle='rgba(200,80,80,.25)';x.lineWidth=1;for(let X=0;X<W;X+=W/40){x.beginPath();x.moveTo(X,0);x.lineTo(X,H);x.stroke()}
  const yrPerRow=(Y1-Y0)/rows,amp=(y)=>{let a=.03+.02*s.n(y*3,1);for(const[ey,mag]of s.ev){const d=Math.abs(y-ey);if(d<1.2)a+=mag*Math.exp(-d*d*12)}return Math.min(1.4,a)};
  x.strokeStyle='#1d2b33';x.lineWidth=1.2;for(let r=0;r<rows;r++){const a=Y0+r*yrPerRow,b=a+yrPerRow,yc=H*.12+r*rh+rh/2;if(a>cur)break;x.beginPath();const end=Math.min(b,cur);let q=0;for(let y=a;y<=end;y+=yrPerRow/900,q++){const X=W*.06+(y-a)/yrPerRow*W*.8,A=amp(y)*rh*.5;x.lineTo(X,yc+(q%2?1:-1)*A*(.3+.7*Math.abs(Math.sin(q*.37))))}x.stroke();
   x.fillStyle='#8a7b66';x.font=`${H*.018}px ${F}`;x.fillText(String(Math.round(a)),W*.01,yc+4)}
  x.fillStyle='#b03a2e';x.font=`${H*.019}px ${F}`;let lr=-1,li=0;for(const[ey,mag,lab]of s.ev){if(ey>cur)continue;const r=Math.floor((ey-Y0)/yrPerRow),X=W*.06+((ey-Y0)-r*yrPerRow)/yrPerRow*W*.8,yc=H*.12+r*rh;li=r===lr?li+1:0;lr=r;x.fillText(lab,Math.min(X+4,W*.8),yc+H*.012+li*H*.022)}
  x.fillStyle='#1d2b33';x.font=`${H*.026}px ${F}`;x.fillText(`WEST PIER  ·  STATION WP1  ·  ${Math.floor(cur)}`,W*.06,H*.06)}};
/* 4. Petri dish: a culture of rust, streaked in the shape of the pier, growing until it covers the plate */
M.petri={init(s){const{W,H}=s,r=s.rnd,R=H*.42,cx=W/2,cy=H/2,m=off(W,H),mx=m.getContext('2d');pier(mx,W,H,H*.6,.9,s.p.seed,'#fff');const d=mx.getImageData(0,0,W,H).data;s.c=[];
  const P=[];for(let i=0;i<W*H;i+=3)if(d[i*4+3]>0){const X=i%W,Y=i/W|0;if(Math.hypot(X-cx,Y-cy)<R*.93)P.push([X,Y])}for(let i=0;i<2600;i++){const[X,Y]=P[(r()*P.length)|0];s.c.push([X,Y,r()*.6,.4+r()*.8,r()])}for(let i=0;i<500;i++){const a=r()*TAU,q=Math.sqrt(r())*R*.92;s.c.push([cx+Math.cos(a)*q,cy+Math.sin(a)*q,.8+r()*2,.5+r(),r()])}s.R=R},
 frame(s,t){const{x,W,H}=s,T=s.still?60:(t/1000)%40,cx=W/2,cy=H/2,R=s.R;x.fillStyle='#d9d6cf';x.fillRect(0,0,W,H);x.fillStyle='rgba(0,0,0,.15)';x.beginPath();x.ellipse(cx+W*.01,cy+H*.02,R*1.05,R*1.05,0,0,TAU);x.fill();
  const g=x.createRadialGradient(cx-R*.3,cy-R*.3,0,cx,cy,R);g.addColorStop(0,'#f0d79a');g.addColorStop(1,'#c9a35a');x.fillStyle=g;x.beginPath();x.arc(cx,cy,R,0,TAU);x.fill();x.save();x.clip();x.fillStyle=`rgba(140,60,20,${Math.min(.75,T/50)})`;x.fillRect(0,0,W,H);
  for(const[X,Y,b,sp,h]of s.c){const rad=Math.min(Math.max(0,(T-b*10)*sp*W*.0005),W*.012);if(rad<=0)continue;x.fillStyle=`rgba(${120+h*60|0},${50+h*30|0},${20+h*10|0},.8)`;x.beginPath();x.arc(X,Y,rad,0,TAU);x.fill();x.fillStyle='rgba(80,30,10,.5)';x.beginPath();x.arc(X,Y,rad*.35,0,TAU);x.fill()}x.restore();
  x.strokeStyle='rgba(255,255,255,.7)';x.lineWidth=W*.004;x.beginPath();x.arc(cx,cy,R,0,TAU);x.stroke();x.strokeStyle='rgba(255,255,255,.35)';x.beginPath();x.arc(cx,cy,R*.97,-2.6,-1.4);x.stroke();
  x.fillStyle='#1d3a8a';x.font=`italic ${H*.04}px "Space Grotesk",sans-serif`;x.save();x.translate(cx+R*.75,cy+R*.95);x.rotate(-.5);x.fillText('WP 25/10  Fe(OH)₃  day '+(T*4|0),0,0);x.restore()}};
/* 5. Side-scan sonar: a waterfall display of the seabed; the leg stumps return bright and throw acoustic shadows */
M.sonar={init(s){const{W,H}=s;s.n=noise(s.p.seed);s.rows=180;s.cols=320;s.buf=off(s.cols,s.rows);s.img=s.buf.getContext('2d').createImageData(s.cols,s.rows);s.y=0;s.legs=[];const r=s.rnd;for(let i=0;i<16;i++)for(const u of[.22,.28,.72,.78])if(r()>.25)s.legs.push([u+(r()-.5)*.01,i*25,.6+r()*.5]);for(let i=0;i<12;i++)s.legs.push([.1+r()*.8,r()*400,.4+r()*.4])},
 row(s,k){const{cols,n}=s,out=new Uint8ClampedArray(cols);const mid=cols/2;for(let i=0;i<cols;i++){const d=Math.abs(i-mid)/mid;let v=d<.06?0:(60+90*n(i*.05,k*.05)+40*n(i*.3,k*.3))*(.4+.6*Math.min(1,d*3));out[i]=v}
  for(const[u,at,sz]of s.legs){if(Math.abs(((k-at)%400+400)%400)<3*sz){const i=u*cols|0,dir=i>mid?1:-1;for(let q=-2;q<=2;q++)out[i+q]=255;for(let q=3;q<14*sz;q++){const j=i+dir*q;if(j>=0&&j<cols)out[j]*=.15}}}return out},
 frame(s,t){const{x,W,H,cols,rows}=s,steps=s.still?rows:2;for(let st=0;st<steps;st++){const d=s.img.data;d.copyWithin(cols*4,0,(rows-1)*cols*4);const r=this.row(s,s.y++);for(let i=0;i<cols;i++){const v=r[i];d[i*4]=v;d[i*4+1]=v*.75;d[i*4+2]=v*.3;d[i*4+3]=255}}
  s.buf.getContext('2d').putImageData(s.img,0,0);x.imageSmoothingEnabled=true;x.drawImage(s.buf,0,0,W,H*.9);x.fillStyle='#0a0703';x.fillRect(0,H*.9,W,H*.1);x.fillStyle='#ffb347';x.font=`${H*.028}px ${F}`;
  x.fillText(`SSS  RANGE 50 m  FREQ 900 kHz  PING ${s.y}  50°49'N 0°09'W (approx.)`,W*.02,H*.96);x.strokeStyle='rgba(255,180,70,.4)';x.beginPath();x.moveTo(W/2,0);x.lineTo(W/2,H*.9);x.stroke();for(let k=1;k<5;k++){x.beginPath();x.moveTo(W/2+k*W/10,0);x.lineTo(W/2+k*W/10,H*.9);x.moveTo(W/2-k*W/10,0);x.lineTo(W/2-k*W/10,H*.9);x.setLineDash([2,6]);x.stroke();x.setLineDash([])}}};
/* 6. Spectrogram of the sea, scrolling; the pier is hidden in the frequencies */
M.spectro={init(s){const{W,H}=s;s.cols=300;s.rows=150;s.buf=off(s.cols,s.rows);s.img=s.buf.getContext('2d').createImageData(s.cols,s.rows);s.n=noise(s.p.seed);const m=off(600,150);pier(m.getContext('2d'),600,150,150*.7,1.6,s.p.seed,'#fff');s.m=m.getContext('2d').getImageData(0,0,600,150).data;s.k=0},
 col(s,k){const{rows,n}=s,out=new Float32Array(rows);const surge=.5+.5*Math.sin(k*.05);for(let j=0;j<rows;j++){const f=1-j/rows;out[j]=Math.min(1,.15+.55*Math.exp(-f*3)*(.6+.4*surge)+.3*n(k*.08,j*.15)*Math.exp(-f*1.5));const mi=((j*600)+(k%600))*4+3;if(s.m[mi]>0)out[j]=Math.max(out[j],.85)}return out},
 frame(s,t){const{x,W,H,cols,rows}=s,steps=s.still?cols:2;const pal=v=>{v=Math.max(0,Math.min(1,v));return[255*Math.min(1,v*1.8),255*Math.max(0,v*1.6-.6),255*(v<.4?v*1.2:Math.max(0,1-v)*.8+v*.3)]};
  for(let st=0;st<steps;st++){const d=s.img.data;for(let j=0;j<rows;j++){d.copyWithin(j*cols*4,j*cols*4+4,(j+1)*cols*4)}const c=this.col(s,s.k++);for(let j=0;j<rows;j++){const q=pal(c[j]),i=(j*cols+cols-1)*4;d[i]=q[0];d[i+1]=q[1];d[i+2]=q[2];d[i+3]=255}}
  s.buf.getContext('2d').putImageData(s.img,0,0);const ox=W*.08,oy=H*.06,w=W*.88,h=H*.82;x.fillStyle='#0b0b10';x.fillRect(0,0,W,H);x.imageSmoothingEnabled=true;x.drawImage(s.buf,ox,oy,w,h);
  x.fillStyle='#c9c9d4';x.font=`${H*.024}px ${F}`;['8 kHz','4 kHz','2 kHz','1 kHz','0'].forEach((l,i)=>x.fillText(l,W*.005,oy+h*i/4+8));x.fillText('time →   recording: the sea under the West Pier (synthesised)',ox,H*.95)}};
WPAI.register('f-science',{fps:30,init(s){(M[s.p.mode].init||(()=>0))(s)},frame(s,t){M[s.p.mode].frame.call(M[s.p.mode],s,t)}});
})();
