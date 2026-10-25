/* Family: interactive pieces. On the work page they answer your pointer or finger; in the grid a ghost cursor plays them for you.
   drag: stir the sea under the pier. storm: the faster you move, the worse the weather. fog: wipe the fog off and watch it come back.
   hold: press and hold to keep the pier standing. visits: each visit (counted only in your own browser) takes a little more of it away.
   rebuild: tap to drive in a new pile; the sea takes them back. globe: shake the snow globe (move fast). tally: each visit adds a chalk
   mark to the slate and rubs out a little of the chalk pier. kaleido: move to turn the kaleidoscope. p: {seed, mode, sky:[stops], sea, pc, ink} */
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
  if(m==='globe'){s.sn=[];for(let i=0;i<500;i++){const a=s.rnd()*6.283,q=Math.sqrt(s.rnd())*.95;let X=Math.cos(a)*q,Y=Math.sin(a)*q;if(s.still&&i%3){Y=.75+s.rnd()*.15;X=(s.rnd()-.5)*1.2}s.sn.push([X,Y,0,0,.5+s.rnd()])}}
  if(m==='tally'){let n=23;if(!s.still){try{const k='wp-tally-'+p.seed;n=(+localStorage.getItem(k)||0)+1;localStorage.setItem(k,n)}catch(e){}}s.n=n;const r=mulberry(p.seed),c2=off(W,H),cx=c2.getContext('2d');
    pier(cx,W*.7,H,H*.7,1.1,p.seed,'#fff');cx.globalCompositeOperation='destination-out';for(let i=0;i<Math.min(300,n*6);i++){cx.globalAlpha=.6;cx.beginPath();cx.ellipse(W*.7*r(),H*(.3+.5*r()),W*.03,H*.02,r()*3,0,6.283);cx.fill()}cx.globalCompositeOperation='source-over';s.chalk=c2;
    s.mk=[];for(let i=0;i<Math.min(n,200);i++)s.mk.push([(r()-.5)*.15,(r()-.5)*.1])}
  if(m==='kaleido'){s.src=off(W,H);const q=s.src.getContext('2d');q.drawImage(s.bg,0,0);q.drawImage(s.pl,0,0);s.ka=0}
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
  else if(m==='globe'){x.fillStyle='#1b1520';x.fillRect(0,0,W,H);const cx=W/2,cy=H*.44,R=H*.34;if(g){ptr.e=Math.max(.02,Math.sin(t/1000*.6)>.6?.9:ptr.e)}x.save();x.beginPath();x.arc(cx,cy,R,0,6.283);x.clip();x.drawImage(s.bg,cx-R,cy-R,R*2,R*2);x.drawImage(s.pl,W*.15,H*.4,W*.7,H*.4,cx-R*1.05,cy-R*.15,R*2.1,R*2.1*(.4*H)/(.7*W));
    for(const f of s.sn){if(s.still){x.fillStyle='rgba(255,255,255,.9)';x.beginPath();x.arc(cx+f[0]*R,cy+f[1]*R,R*.008*(1+f[4]),0,6.283);x.fill();continue}if(ptr.e>.3){f[2]+=(Math.random()-.5)*.02*ptr.e;f[3]-=Math.random()*.03*ptr.e}f[3]+=.0007;f[2]*=.97;f[3]*=.97;f[0]+=f[2];f[1]+=f[3]*f[4];const fl=.78+f[4]*.08;if(f[1]>fl){f[1]=fl;f[3]=0}const d=Math.hypot(f[0],f[1]);if(d>.97){f[0]*=.97/d;f[1]*=.97/d;f[2]*=-.3;f[3]*=-.3}x.fillStyle='rgba(255,255,255,.9)';x.beginPath();x.arc(cx+f[0]*R,cy+f[1]*R,R*.008*(1+f[4]),0,6.283);x.fill()}
    x.restore();const gl=x.createRadialGradient(cx-R*.4,cy-R*.4,0,cx,cy,R);gl.addColorStop(0,'rgba(255,255,255,.35)');gl.addColorStop(.4,'rgba(255,255,255,0)');gl.addColorStop(1,'rgba(200,220,255,.25)');x.fillStyle=gl;x.beginPath();x.arc(cx,cy,R,0,6.283);x.fill();
    x.fillStyle='#6b3a22';x.beginPath();x.moveTo(cx-R*.95,cy+R*.75);x.lineTo(cx+R*.95,cy+R*.75);x.lineTo(cx+R*1.15,cy+R*1.35);x.lineTo(cx-R*1.15,cy+R*1.35);x.fill();x.fillStyle='#e8c88a';x.font=`600 ${R*.09}px Fraunces,serif`;x.textAlign='center';x.fillText('A PRESENT FROM BRIGHTON',cx,cy+R*1.12);
    x.fillStyle='rgba(255,255,255,.6)';x.font=`${Math.max(11,W/52)}px "IBM Plex Mono",monospace`;x.fillText(s.full?'move fast to shake it':'',cx,H*.97)}
  else if(m==='tally'){x.fillStyle='#262b2a';x.fillRect(0,0,W,H);x.fillStyle='rgba(255,255,255,.018)';for(let i=0;i<25;i++){x.beginPath();x.ellipse((i*211)%W,(i*97)%H,W*.15,H*.05,i,0,6.283);x.fill()}x.globalAlpha=.85;x.drawImage(s.chalk,W*.02,0);x.globalAlpha=1;
    x.strokeStyle='rgba(240,240,232,.85)';x.lineWidth=W*.004;x.lineCap='round';const ox=W*.75,oy=H*.12,gw=W*.06,gh=H*.08;const shown=s.still?s.n:Math.min(s.n,(t/1000*3|0)+Math.max(0,s.n-12));s.mk.slice(0,shown).forEach((j,i)=>{const grp=i/5|0,k=i%5,X=ox+(grp%3)*gw*1.15,Y=oy+(grp/3|0)*gh*1.3;x.beginPath();if(k<4){x.moveTo(X+k*gw*.2+j[0]*gw*.3,Y);x.lineTo(X+k*gw*.2+j[1]*gw*.3,Y+gh)}else{x.moveTo(X-gw*.05,Y+gh*.8);x.lineTo(X+gw*.75,Y+gh*.15)}x.stroke()});
    x.fillStyle='rgba(240,240,232,.8)';x.font=`${Math.max(12,W/40)}px "Caveat","Comic Sans MS",cursive`;x.textAlign='left';x.fillText(s.still?'visits':`visit ${s.n} (counted only in this browser)`,ox,H*.08)}
  else if(m==='kaleido'){const a=(ptr.x/W)*6.283*.5+t*.00005,z=2.6+ptr.y/H,N=8;x.fillStyle='#4a3e52';x.fillRect(0,0,W,H);const R=Math.hypot(W,H)/2;for(let k=0;k<N;k++){x.save();x.translate(W/2,H/2);x.rotate(k*6.283/N);if(k%2)x.scale(1,-1);x.beginPath();x.moveTo(0,0);x.arc(0,0,R,-Math.PI/N-.003,Math.PI/N+.003);x.closePath();x.clip();x.rotate(a);x.scale(z,z);x.drawImage(s.src,-W*.5,-H*.6);x.restore()}
    x.strokeStyle='rgba(0,0,0,.25)';x.lineWidth=1;for(let k=0;k<N;k++){x.beginPath();x.moveTo(W/2,H/2);x.lineTo(W/2+Math.cos(k*6.283/N+Math.PI/N)*R,H/2+Math.sin(k*6.283/N+Math.PI/N)*R);x.stroke()}}
  if(g){x.fillStyle='rgba(255,255,255,.85)';x.beginPath();x.moveTo(ptr.x,ptr.y);x.lineTo(ptr.x+W*.012,ptr.y+W*.03);x.lineTo(ptr.x+W*.02,ptr.y+W*.02);x.fill()}
  ptr.px=ptr.x;ptr.py=ptr.y}});
})();
