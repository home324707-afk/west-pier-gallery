/* Family: minimal and conceptual. As little as possible: raked shingle, one sentence, a palindrome. p: {seed, mode, ...} */
(()=>{const{off,noise,mulberry}=WPAI.util;const TAU=6.283;const M={};
/* 1. Land art: lines raked into shingle, parting around the stones where the pier legs were; the tide slowly erases them */
M.shingle={init(s){const r=s.rnd,{W,H}=s;s.st=[];for(let i=0;i<14;i++)if(r()>.2)s.st.push([W*(.15+.7*i/13),H*(.5+(r()-.5)*.04),H*(.012+r()*.01)]);s.peb=[];for(let i=0;i<2500;i++)s.peb.push([r()*W,r()*H,r()*2+.5,r()])},
 frame(s,t){const{x,W,H}=s,T=s.still?6:(t/1000)%60;x.fillStyle='#d8d3c8';x.fillRect(0,0,W,H);for(const[X,Y,R,c]of s.peb){x.fillStyle=`rgba(${110+c*60|0},${105+c*55|0},${100+c*50|0},.5)`;x.fillRect(X,Y,R,R)}
  const tide=H*(1.05-.06*Math.max(0,T-20)/40*(1+Math.sin(T*.6)*.1));x.lineWidth=H*.004;for(let k=-30;k<=30;k++){const y0=H*.5+k*H*.016;x.strokeStyle='rgba(90,85,78,.55)';x.beginPath();for(let X=0;X<=W;X+=4){let d=0;for(const[sx,sy,R]of s.st){const dx=X-sx,dist=Math.hypot(dx,y0-sy);const infl=Math.exp(-(dist*dist)/(R*R*60));d+=Math.sign(y0-sy||1)*R*3*infl}const Y=y0+d;if(Y>tide)break;x.lineTo(X,Y)}x.stroke();x.strokeStyle='rgba(250,248,240,.35)';x.stroke()}
  for(const[sx,sy,R]of s.st){x.fillStyle='#4a4038';x.beginPath();x.ellipse(sx,sy,R*1.3,R,0,0,TAU);x.fill();x.fillStyle='rgba(255,255,255,.15)';x.beginPath();x.ellipse(sx-R*.3,sy-R*.3,R*.5,R*.3,0,0,TAU);x.fill();for(let q=1;q<5;q++){x.strokeStyle='rgba(90,85,78,.5)';x.beginPath();x.ellipse(sx,sy,R*1.3+q*H*.016,R+q*H*.016,0,0,TAU);x.stroke()}}
  const g=x.createLinearGradient(0,tide-H*.05,0,tide);g.addColorStop(0,'rgba(120,150,150,0)');g.addColorStop(1,'rgba(120,150,150,.6)');x.fillStyle=g;x.fillRect(0,tide-H*.05,W,H)}};
/* 2. One line. The letters fall away like the pier and come back. */
M.oneline={frame(s,t){const{x,W,H,p}=s,T=s.still?10:(t/1000)%24,txt=p.text,fs=Math.min(W/(txt.length*.55),H*.07);x.fillStyle='#fafaf7';x.fillRect(0,0,W,H);x.font=`300 ${fs}px Fraunces,serif`;const tw=x.measureText(txt).width;let X=(W-tw)/2;const r=mulberry(s.p.seed);
  for(let i=0;i<txt.length;i++){const ch=txt[i],w=x.measureText(ch).width,fall=r(),start=4+fall*10,falls=fall<.35&&ch!==' ';let y=H/2,a=0;if(falls&&T>start){const d=Math.min(T-start,20-start);const k=T>20?Math.max(0,1-(T-20)/3):1;y+=d*d*H*.02*k;a=d*.2*k*(r()-.5)}else r();
   x.save();x.translate(X+w/2,y);x.rotate(a);x.fillStyle='#111';x.fillText(ch,-w/2,0);x.restore();X+=w}}};
/* 3. Palindrome: the poem reads the same both ways; the pier falls, then plays backwards and stands up again */
M.palin={init(s){const{W,H}=s;s.legs=[];const r=s.rnd;for(let i=0;i<24;i++)s.legs.push([W*(.1+.8*i/23),r()*.8+.1,(r()-.5)*1.2])},frame(s,t){const{x,W,H,p}=s,T=s.still?4:(t/1000)%16,ph=T<8?T/8:(16-T)/8,e=ph*ph*(3-2*ph);
  x.fillStyle='#10161c';x.fillRect(0,0,W,H);x.fillStyle='#1a2836';x.fillRect(0,H*.7,W,H*.3);x.strokeStyle='#c9d1d9';x.lineWidth=W*.004;
  for(const[X,d,rot]of s.legs){const k=Math.max(0,Math.min(1,(e-d*.6)/.4));x.save();x.translate(X,H*.7);x.rotate(rot*k);x.beginPath();x.moveTo(0,0);x.lineTo(0,-H*.18*(1-.5*k));x.stroke();x.restore()}
  const dk=Math.max(0,Math.min(1,e*1.6));x.beginPath();x.moveTo(W*.1,H*.52+dk*H*.12);x.lineTo(W*.5,H*.52+dk*H*.02);x.moveTo(W*.55,H*.52);x.lineTo(W*.9,H*.52+dk*H*.16);x.stroke();
  x.fillStyle='#c9d1d9';x.font=`italic ${H*.042}px Fraunces,serif`;x.textAlign='center';p.lines.forEach((l,i)=>x.fillText(l,W/2,H*.15+i*H*.07));x.font=`${H*.022}px "JetBrains Mono",monospace`;x.fillStyle='#6b7a88';x.fillText(T<8?'▶  forward':'◀  backward',W/2,H*.93);x.textAlign='left'}};
WPAI.register('f-minimal',{fps:30,init(s){(M[s.p.mode].init||(()=>0))(s)},frame(s,t){M[s.p.mode].frame(s,t)}});})();
