/* Family: Turing test failures. The AI tries to pass as a human photographer or artist and gives itself away every time:
   a thumb over the lens, a postcard nobody sent, a phone filter, a 'Victorian' photo with a jet in it, a crayon drawing, a stock photo.
   Deliberately failed attempts to pass as human. p: {seed, mode} */
(()=>{const{pier,off,sky,noise}=WPAI.util;
const F='"IBM Plex Mono",monospace';
function base(s,stops,pc){const{W,H,p}=s,c=sky(W,H,stops),x=c.getContext('2d');pier(x,W,H,H*.66,1.15,p.seed,pc||'#1a1416');return c}
function wob(x,pts,t,amp){x.beginPath();pts.forEach(([a,b],i)=>{const j=Math.sin(i*12.9+t*7)*amp,k=Math.cos(i*7.1+t*5)*amp;i?x.lineTo(a+j,b+k):x.moveTo(a+j,b+k)});x.stroke()}
WPAI.register('f-turing',{fps:12,init(s){const{W,H,p}=s,m=p.mode;
  if(m==='thumb')s.bg=base(s,[[0,'#8fb6d8'],[.65,'#dfe6e8'],[.651,'#5d7e8c'],[1,'#3b4f58']]);
  if(m==='postcard')s.bg=base(s,[[0,'#3aa0d8'],[.65,'#a8e0f0'],[.651,'#1677a8'],[1,'#0e4e76']],'#3b2a24');
  if(m==='filter')s.bg=base(s,[[0,'#ff7eb3'],[.55,'#ffd08a'],[.651,'#00c2c7'],[1,'#00616e']],'#3a0838');
  if(m==='sepia'){s.bg=base(s,[[0,'#cdb48c'],[.65,'#e3d1ae'],[.651,'#8f7656'],[1,'#5e4a33']],'#3a2a1c');s.grain=off(W/2|0,H/2|0);const g=s.grain.getContext('2d'),d=g.createImageData(W/2|0,H/2|0);for(let i=0;i<d.data.length;i+=4){const v=s.rnd()*255;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=22}g.putImageData(d,0,0)}
  if(m==='stock')s.bg=base(s,[[0,'#4aa3ff'],[.65,'#cfeaff'],[.651,'#1e8fd6'],[1,'#0a5e9c']],'#202830');
  if(m==='crayon'){s.legs=[];for(let i=0;i<9;i++)s.legs.push(W*(.28+.44*i/8)+(s.rnd()-.5)*W*.02)}},
 frame(s,t){const{x,W,H,p}=s,m=p.mode,T=t/1000;
  if(m==='thumb'){x.save();x.translate(W/2,H/2);x.rotate(-.035);x.drawImage(s.bg,-W/2*1.06,-H/2*1.06,W*1.06,H*1.06);x.restore();const a=.5+.5*Math.sin(T*.6),cx=W*(1.02-.08*a),cy=H*(.96-.06*a);
    const g=x.createRadialGradient(cx,cy,W*.05,cx,cy,W*.32);g.addColorStop(0,'rgba(196,110,92,.98)');g.addColorStop(.6,'rgba(214,140,118,.9)');g.addColorStop(1,'rgba(230,170,150,0)');x.fillStyle=g;x.beginPath();x.ellipse(cx,cy,W*.3,H*.42,-.6,0,6.283);x.fill();
    x.fillStyle='#ff9a2a';x.font=`bold ${W/32}px ${F}`;x.textAlign='right';x.fillText("'98 10 25",W*.62,H*.95)}
  else if(m==='postcard'){x.fillStyle='#f6f1e4';x.fillRect(0,0,W,H);x.drawImage(s.bg,W*.04,H*.06,W*.92,H*.88);const L='BRIGHTON';x.textAlign='center';x.font=`900 ${W/7.2}px Georgia,serif`;
    for(let i=0;i<L.length;i++){const X=W*(.14+i*.103),Y=H*.5+Math.sin(T*1.5+i*.6)*H*.012;x.fillStyle='#14243a';x.fillText(L[i],X+W*.006,Y+W*.006);x.fillStyle=['#ffcf3a','#ff6b3a','#e84a8a','#3ad1a8'][i%4];x.fillText(L[i],X,Y)}
    x.font=`italic ${W/26}px Georgia,serif`;x.fillStyle='#fff';x.fillText('Greetings from',W*.5,H*.24);x.fillText('wish you were here (no one was)',W*.5,H*.86)}
  else if(m==='filter'){x.drawImage(s.bg,0,0);const v=x.createRadialGradient(W/2,H/2,H*.2,W/2,H/2,W*.7);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(60,0,60,.6)');x.fillStyle=v;x.fillRect(0,0,W,H);
    x.textAlign='center';for(let i=0;i<9;i++){const X=W*((i*.137+.07)%1),Y=H*(.15+.7*((i*.31+T*.05)%1));x.font=`${W/(18+i)}px serif`;x.fillStyle='#ff3d7f';x.fillText('♥',X,Y)}
    for(let i=0;i<30;i++){const a=(Math.sin(T*3+i*1.7)+1)/2;x.fillStyle=`rgba(255,255,255,${a})`;x.fillRect(W*((i*.0731)%1),H*((i*.191)%1),3,3)}
    x.fillStyle='#fff';x.font=`bold ${W/22}px ${F}`;x.fillText('#nofilter #pierlife #blessed',W/2,H*.93)}
  else if(m==='sepia'){x.drawImage(s.bg,0,0);const px=((T*.06)%1.4-.2)*W,py=H*.18;x.strokeStyle='rgba(255,250,240,.75)';x.lineWidth=H*.008;x.beginPath();x.moveTo(px-W*.5,py+H*.04);x.lineTo(px,py);x.stroke();
    x.fillStyle='#3a2a1c';x.beginPath();x.moveTo(px+W*.02,py);x.lineTo(px-W*.01,py-H*.008);x.lineTo(px-W*.01,py+H*.008);x.fill();x.fillRect(px-W*.004,py-H*.02,W*.006,H*.04);
    const dx=W*(.75+.04*Math.sin(T*2)),dy=H*(.32+.02*Math.sin(T*3));x.fillRect(dx-W*.015,dy,W*.03,H*.008);x.fillRect(dx-W*.02,dy-H*.006,W*.01,H*.003);x.fillRect(dx+W*.01,dy-H*.006,W*.01,H*.003);
    x.drawImage(s.grain,(T*37%7)|0,(T*53%5)|0,W,H);x.strokeStyle='rgba(40,30,20,.5)';x.lineWidth=1;for(let i=0;i<3;i++){const X=W*((Math.sin(T*9+i*3)+1)/2);x.beginPath();x.moveTo(X,0);x.lineTo(X+5,H);x.stroke()}
    x.fillStyle='rgba(40,28,18,.8)';x.font=`italic ${W/40}px Georgia,serif`;x.textAlign='left';x.fillText('The West Pier, c. 1880 (definitely)',W*.04,H*.95)}
  else if(m==='stock'){x.drawImage(s.bg,0,0);x.save();x.translate(W/2,H/2);x.rotate(-.5);x.font=`bold ${W/12}px Helvetica,Arial,sans-serif`;x.textAlign='center';x.fillStyle='rgba(255,255,255,.32)';x.strokeStyle='rgba(0,0,0,.12)';
    const o=(T*30)%(W*.5);for(let j=-3;j<=3;j++)for(let i=-3;i<=3;i++){x.fillText('STOCKPIER',i*W*.5+o,j*H*.35);x.strokeText('STOCKPIER',i*W*.5+o,j*H*.35)}x.restore();
    x.fillStyle='rgba(0,0,0,.55)';x.fillRect(0,H*.92,W,H*.08);x.fillStyle='#fff';x.font=`${W/50}px ${F}`;x.textAlign='left';x.fillText('Image #0000000 · "Happy pier at sunset, business concept" · license from £0.00',W*.02,H*.97)}
  else if(m==='crayon'){x.fillStyle='#fbf8f0';x.fillRect(0,0,W,H);x.lineCap='round';x.lineJoin='round';const tt=Math.floor(T*4)/4,a=W*.004;x.lineWidth=W*.012;
    x.strokeStyle='#2f6fe0';for(let k=0;k<6;k++)wob(x,Array.from({length:30},(_,i)=>[W*i/29,H*(.72+k*.045)+Math.sin(i*.9+k)*H*.015]),tt+k,a);
    x.strokeStyle='#5a3a22';for(const L of s.legs)wob(x,[[L,H*.95],[L,H*.6]],tt,a);wob(x,[[W*.24,H*.6],[W*.76,H*.6]],tt,a);wob(x,Array.from({length:20},(_,i)=>[W*(.34+.32*i/19),H*(.6-.16*Math.sin(Math.PI*i/19))]),tt,a);
    x.strokeStyle='#ffc21a';x.fillStyle='#ffd84a';x.beginPath();x.arc(W*.85,H*.18,W*.06,0,6.283);x.fill();for(let i=0;i<10;i++){const g=i/10*6.283+tt*.2;wob(x,[[W*.85+Math.cos(g)*W*.08,H*.18+Math.sin(g)*W*.08],[W*.85+Math.cos(g)*W*.12,H*.18+Math.sin(g)*W*.12]],tt,a)}
    x.strokeStyle='#222';x.lineWidth=W*.005;wob(x,[[W*.83,H*.16],[W*.832,H*.17]],tt,a/2);wob(x,[[W*.87,H*.16],[W*.872,H*.17]],tt,a/2);wob(x,Array.from({length:8},(_,i)=>[W*(.825+.05*i/7),H*(.2+.025*Math.sin(Math.PI*i/7))]),tt,a/2);
    x.fillStyle='#d1342f';x.font=`${W/16}px "Comic Sans MS","Chalkboard SE",cursive`;x.textAlign='left';x.save();x.translate(W*.05,H*.17);x.rotate(-.06);x.fillText('MY PEIR',0,0);x.restore()}}});
})();
