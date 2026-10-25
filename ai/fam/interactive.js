/* Family: interactive pieces. On the work page they answer your pointer or finger; in the grid a ghost cursor plays them for you.
   drag: stir the sea under the pier. storm: the faster you move, the worse the weather. fog: wipe the fog off and watch it come back.
   hold: press and hold to keep the pier standing. visits: each visit (counted only in your own browser) takes a little more of it away.
   rebuild: tap to drive in a new pile; the sea takes them back. p: {seed, mode, sky:[stops], sea, pc, ink} */
(()=>{const{pier,off,sky,mulberry}=WPAI.util;
function scene(s,base=.66){const{W,H,p}=s,c=sky(W,H,p.sky||[[0,'#24304a'],[.55,'#c98a6a'],[.66,'#e8c49a'],[.661,p.sea||'#2b3a48'],[1,'#121a22']]);return c}
WPAI.register('f-interactive',{fps:30,init(s){const{W,H,p,c}=s;s.bg=scene(s);s.pl=off(W,H);pier(s.pl.getContext('2d'),W,H,H*.66,1.15,p.seed,p.pc||'#121018');
  s.ptr={x:W/2,y:H/2,px:W/2,py:H/2,down:false,last:-1e9,e:0};
  if(s.full&&!s.still){c.classList.add('int');const pos=e=>{const r=c.getBoundingClientRect();s.ptr.x=(e.clientX-r.left)/r.width*W;s.ptr.y=(e.clientY-r.top)/r.height*H;s.ptr.last=performance.now()};
    c.addEventListener('pointermove',pos);c.addEventListener('pointerdown',e=>{pos(e);s.ptr.down=true;s.ptr.click=1});addEventListener('pointerup',()=>s.ptr.down=false);c.addEventListener('pointerleave',()=>s.ptr.down=false)}
  const m=p.mode;
  if(m==='drag'){s.gw=W/5|0;s.gh=(H*.34/5|0)+1;s.a=new Float32Array(s.gw*s.gh);s.b=new Float32Array(s.gw*s.gh);s.img=s.x.createImageData(s.gw,s.gh);s.sm=off(s.gw,s.gh)}
  if(m==='fog'){s.fog=off(W/4|0,H/4|0);const f=s.fog.getContext('2d');f.fillStyle=p.ink||'#d9dde0';f.fillRect(0,0,W,H)}
  if(m==='storm'){s.rain=[];for(let i=0;i<(s.full?900:400);i++)s.rain.push([s.rnd()*W,s.rnd()*H,.6+s.rnd()])}
  if(m==='hold')s.hp=.6;
  if(m==='visits'){let n=7;if(!s.still){try{const k='wp-visits-'+p.seed;n=(+localStorage.getItem(k)||0)+1;localStorage.setItem(k,n)}catch(e){}}s.n=n;const r=mulberry(p.seed),px=s.pl.getContext('2d');px.globalCompositeOperation='destination-out';
    s.fall=[];for(let i=0;i<Math.min(400,n*14);i++){const X=W*(.2+.6*r()),Y=H*(.45+.55*r()),w=W*(.01+.03*r());px.fillRect(X,Y,w,w*.8);if(i>=(n-1)*14)s.fall.push([X,Y,w])}px.globalCompositeOperation='source-over'}
  if(m==='rebuild'){s.piles=[];for(let i=0;i<5;i++)s.piles.push([W*(.3+.4*s.rnd()),1])}},
 ghost(s,t){const{W,H,ptr}=s;if(s.full&&!s.still&&performance.now()-ptr.last<5000)return false;const T=t/1000;ptr.x=W*(.5+.38*Math.sin(T*.7)*Math.cos(T*.23));ptr.y=H*(.5+.3*Math.sin(T*1.1+1));if(s.p.mode==='drag')ptr.y=H*(.8+.12*Math.sin(T*1.3));
  ptr.down=s.p.mode==='hold'?Math.sin(T*.5)>-.2:true;if(s.p.mode==='rebuild')ptr.click=(Math.floor(T/1.6)!==s.gk)&&(s.gk=Math.floor(T/1.6),1);return true},
 frame(s,t){const{x,W,H,p,ptr}=s,m=p.mode,g=this.ghost(s,t),sp=Math.hypot(ptr.x-ptr.px,ptr.y-ptr.py);ptr.e=Math.min(1,ptr.e*.96+sp/W*2.5);
  x.drawImage(s.bg,0,0);
  if(m==='drag'){const{gw,gh,a,b}=s,y0=H*.66;if(ptr.y>y0){const i=ptr.x/5|0,j=(ptr.y-y0)/5|0;if(i>1&&j>1&&i<gw-2&&j<gh-2)a[j*gw+i]+=sp>1||g?9:0}
    for(let j=1;j<gh-1;j++)for(let i=1;i<gw-1;i++){const k=j*gw+i;b[k]=((a[k-1]+a[k+1]+a[k-gw]+a[k+gw])/2-b[k])*.975}[s.a,s.b]=[b,a];const d=s.img.data;
    for(let j=0;j<gh;j++)for(let i=0;i<gw;i++){const k=j*gw+i,sl=(s.a[k+1]||0)-(s.a[k-1]||0),l=Math.max(-60,Math.min(90,sl*25)),v=j/gh;d[k*4]=43+l-v*20;d[k*4+1]=58+l*.9-v*25;d[k*4+2]=72+l*.8-v*30;d[k*4+3]=255}
    s.sm.getContext('2d').putImageData(s.img,0,0);x.imageSmoothingEnabled=true;x.drawImage(s.sm,0,y0,W,H-y0);x.drawImage(s.pl,0,0)}
  else if(m==='storm'){const e=Math.max(ptr.e,.05);x.drawImage(s.pl,0,0);x.fillStyle=`rgba(10,14,22,${e*.6})`;x.fillRect(0,0,W,H);x.strokeStyle='rgba(200,215,230,.5)';x.lineWidth=1;x.beginPath();const n=s.rain.length*e|0;
    for(let i=0;i<n;i++){const r=s.rain[i];r[1]+=H*.03*r[2];r[0]+=e*W*.01;if(r[1]>H){r[1]=-10;r[0]=Math.random()*W}x.moveTo(r[0],r[1]);x.lineTo(r[0]-e*W*.01,r[1]-H*.03*r[2])}x.stroke();
    if(e>.55&&Math.random()<.04*e){x.fillStyle='rgba(255,255,255,.6)';x.fillRect(0,0,W,H)}x.fillStyle='rgba(230,235,240,.6)';for(let X=0;X<W;X+=6){const Y=H*.68+Math.sin(X*.02+t*.003)*H*.03*e;x.fillRect(X,Y,6,1.5)}}
  else if(m==='fog'){x.drawImage(s.pl,0,0);const f=s.fog.getContext('2d'),fw=s.fog.width;f.globalCompositeOperation='destination-out';f.beginPath();f.arc(ptr.x/4,ptr.y/4,fw*.06,0,6.283);f.fill();f.globalCompositeOperation='source-over';
    f.globalAlpha=.006;f.fillStyle=p.ink||'#d9dde0';f.fillRect(0,0,fw,s.fog.height);f.globalAlpha=1;x.filter='blur(6px)';x.drawImage(s.fog,0,0,W,H);x.filter='none'}
  else if(m==='hold'){s.hp=Math.max(0,Math.min(1,s.hp+(ptr.down?.012:-.004)));x.globalAlpha=s.hp;x.drawImage(s.pl,0,0);x.globalAlpha=1;x.fillStyle='rgba(255,255,255,.7)';x.fillRect(W*.3,H*.92,W*.4*s.hp,H*.012);
    x.font=`${Math.max(11,W/48)}px "IBM Plex Mono",monospace`;x.textAlign='center';x.fillText(s.hp<.02?'gone. press again.':s.full?'press and hold to keep it standing':'',W/2,H*.89)}
  else if(m==='visits'){x.drawImage(s.pl,0,0);x.fillStyle=p.pc||'#121018';for(const f of s.fall){f[1]+=H*.002;if(f[1]<H)x.fillRect(f[0],f[1],f[2]*.6,f[2]*.4)}
    x.fillStyle='rgba(255,255,255,.8)';x.font=`${Math.max(11,W/48)}px "IBM Plex Mono",monospace`;x.textAlign='center';x.fillText(s.still?'each visit takes a little more':`visit ${s.n}. each visit takes a little more (counted only in this browser)`,W/2,H*.93)}
  else if(m==='rebuild'){if(ptr.click&&ptr.y>H*.3){s.piles.push([ptr.x,1]);if(s.piles.length>140)s.piles.shift()}ptr.click=0;x.drawImage(s.pl,0,0);x.strokeStyle=p.ink||'#e9d7b0';x.lineWidth=Math.max(2,W/300);x.beginPath();
    for(const q of s.piles){q[1]-=.0009;if(q[1]>0){x.moveTo(q[0],H);x.lineTo(q[0],H-(H*.38)*q[1])}}x.stroke();s.piles=s.piles.filter(q=>q[1]>0);
    x.fillStyle='rgba(255,255,255,.7)';x.font=`${Math.max(11,W/48)}px "IBM Plex Mono",monospace`;x.textAlign='center';x.fillText(s.full?'tap to drive in a pile. the sea will take it back.':'',W/2,H*.08)}
  if(g){x.fillStyle='rgba(255,255,255,.85)';x.beginPath();x.moveTo(ptr.x,ptr.y);x.lineTo(ptr.x+W*.012,ptr.y+W*.03);x.lineTo(ptr.x+W*.02,ptr.y+W*.02);x.fill()}
  ptr.px=ptr.x;ptr.py=ptr.y}});
})();
