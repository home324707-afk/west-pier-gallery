/* Family: tide simulations. 'pool' is a gull's-eye view: a 2D wave equation on a grid, the pier's legs as obstacles, rain or swell as the forcing.
   'swell' is a side view: summed trochoidal (Gerstner) waves running through the legs, with spray where crests hit iron. 'moon' lets a moon cross the sky and pull the water up the legs.
   p: {seed, mode, pal:{...}, rain, storm, cols} */
(()=>{const{pier,off,sky}=WPAI.util;
WPAI.register('f-tide',{fps:30,init(s){const{W,H,p}=s;if(p.mode==='pool')return this.ipool(s);
  s.bg=sky(W,H,p.sky);s.pc=off(W,H);pier(s.pc.getContext('2d'),W,H,H*(p.base||.6),p.sc||1.3,p.seed,p.iron||'#151515');s.sp=[];
  s.legs=[];const cx=W*.52,cw=W*.34*(p.sc||1.3);for(let xx=cx-cw/2-W*.25;xx<cx+cw/2+W*.12;xx+=W*.012*(p.sc||1.3))s.legs.push(xx);
  s.waves=[];for(let i=0;i<5;i++)s.waves.push({k:(2+i*1.7+s.rnd())/W*6.283,a:H*(p.storm||.02)/(1+i*.8),ph:s.rnd()*6.28,w:.0008+s.rnd()*.0008})},
 ipool(s){const{W,H,p}=s;s.cw=p.cols||200;s.ch=Math.round(s.cw*H/W);const n=s.cw*s.ch;s.u=new Float32Array(n);s.v=new Float32Array(n);s.wall=new Uint8Array(n);
  const y0=s.ch*.5|0,W2=(x,y)=>{for(let a=0;a<2;a++)for(let b=0;b<2;b++)s.wall[(y+b)*s.cw+x+a]=1};for(let x=s.cw*.12|0;x<s.cw*.88;x+=4){for(const dy of[-4,3])W2(x,y0+dy)}for(let y=y0-14;y<y0+14;y+=4)for(let x=s.cw*.55|0;x<s.cw*.75;x+=4)if(s.rnd()<.8)W2(x,y);
  s.g=off(s.cw,s.ch);s.gx=s.g.getContext('2d');s.img=s.gx.createImageData(s.cw,s.ch)},
 frame(s,t){const{x,W,H,p}=s;if(p.mode==='pool')return this.fpool(s,t);
  const lvl=p.mode==='moon'?H*(.66-.12*Math.sin(t*.00025)):H*(p.lvl||.7),Y=X=>{let y=lvl;for(const w of s.waves)y-=w.a*Math.cos(w.k*X-t*w.w*6+w.ph);return y};
  x.drawImage(s.bg,0,0);if(p.mode==='moon'){const u=(t*.00025/6.283)%1,mx=W*(.1+.8*((u*2)%1)),my=H*(.42-.3*Math.sin(Math.PI*((u*2)%1)));x.fillStyle=p.moonc||'#f3efe4';x.beginPath();x.arc(mx,my,W*.025,0,6.283);x.fill();
   x.fillStyle='rgba(243,239,228,.08)';x.beginPath();x.arc(mx,my,W*.06,0,6.283);x.fill()}
  x.drawImage(s.pc,0,0);
  for(let L=0;L<3;L++){x.fillStyle=p.sea[L];x.beginPath();x.moveTo(0,H);for(let X=0;X<=W;X+=6)x.lineTo(X,Y(X+L*97)+L*H*.03);x.lineTo(W,H);x.fill()}
  x.strokeStyle=p.foam||'rgba(255,255,255,.7)';x.lineWidth=Math.max(1,W/600);x.beginPath();for(let X=0;X<=W;X+=6){const y=Y(X);X?x.lineTo(X,y):x.moveTo(X,y)}x.stroke();
  if(p.spray)for(const l of s.legs){const y=Y(l),dy=Y(l+3)-y;if(s.rnd()<p.spray*Math.max(0,(lvl-y)/(H*.03)))for(let i=0;i<4;i++)s.sp.push({x:l,y,vx:(s.rnd()-.5)*W*.003,vy:-H*(.004+s.rnd()*.01),l:40})}
  x.fillStyle=p.foam||'rgba(255,255,255,.7)';s.sp=s.sp.filter(q=>(q.l--)>0);for(const q of s.sp){q.x+=q.vx;q.y+=q.vy;q.vy+=H*.0004;x.fillRect(q.x,q.y,2,2)}
  if(p.mode==='moon'){x.fillStyle='rgba(243,239,228,.75)';x.font=`${Math.max(10,W/80)}px "JetBrains Mono",monospace`;x.fillText(`WATER ON THE LEGS: ${Math.round((H-lvl)/H*100)}%`,W*.03,H*.95)}},
 fpool(s,t){const{x,W,H,p,cw,ch,u,v,wall}=s,R=s.rnd;
  for(let k=0;k<(p.rain||1);k++)if(R()<(p.rp||.12)){const cx=1+R()*(cw-2)|0,cy=1+R()*(ch-2)|0;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const yy=cy+dy,xx=cx+dx;if(yy>0&&xx>0&&yy<ch-1&&xx<cw-1)u[yy*cw+xx]+=(p.drop||6)*Math.exp(-(dx*dx+dy*dy)/2)}}
  if(p.swell){for(let y=1;y<ch-1;y++)u[y*cw+1]=Math.sin(t*.004+y*.08)*(p.swell)}
  for(let y=1;y<ch-1;y++)for(let X=1;X<cw-1;X++){const i=y*cw+X;if(wall[i]){u[i]=0;v[i]=0;continue}v[i]+=(4*(u[i-1]+u[i+1]+u[i-cw]+u[i+cw])+u[i-cw-1]+u[i-cw+1]+u[i+cw-1]+u[i+cw+1]-20*u[i])/24;v[i]*=(p.damp||.985)}
  for(let i=0;i<u.length;i++)u[i]+=v[i];
  const d=s.img.data,c=p.pal;for(let y=0;y<ch;y++)for(let X=0;X<cw;X++){const i=y*cw+X;let o=i*4;if(wall[i]){d[o]=c.iron[0];d[o+1]=c.iron[1];d[o+2]=c.iron[2];d[o+3]=255;continue}
   const sl=X<cw-1?u[i+1]-u[i]:0,l=Math.max(-1,Math.min(1,(sl+(y<ch-1?u[i+cw]-u[i]:0))*1.2));for(let q=0;q<3;q++)d[o+q]=c.deep[q]+(l>0?(c.lit[q]-c.deep[q])*l:(c.deep[q]*.4)*l);d[o+3]=255}
  s.gx.putImageData(s.img,0,0);x.imageSmoothingEnabled=true;x.drawImage(s.g,0,0,W,H)}});
})();
