/* Family: remixes. Live machine treatments of public-domain and CC0 views from this gallery (never share-alike, non-commercial, no-derivatives or
   all-rights-reserved work). The original artist is credited on every work page.
   modes: datamosh, sort, engrave, pointil, slitscan, dither, shatter, channel, teletext. p: {seed, mode, pal, ...} */
(()=>{const{off,cover}=WPAI.util;
function base(s,w){const{W,H}=s,h=Math.round(w*H/W),c=off(w,h),x=c.getContext('2d');cover(x,s.imgs[0],w,h);return{c,x,w,h,d:x.getImageData(0,0,w,h)}}
const lum=(d,i)=>d[i]*.3+d[i+1]*.59+d[i+2]*.11;
WPAI.register('f-remix',{fps:24,init(s){const{W,H,p}=s;s.B=base(s,p.mode==='dither'?Math.round(W/(p.px||3)):p.mode==='teletext'?80:480);s.k=0;s.tri=null;
  if(p.mode==='datamosh'){s.buf=off(W,H);s.bx=s.buf.getContext('2d');cover(s.bx,s.imgs[0],W,H)}
  if(p.mode==='pointil'){s.buf=off(W,H);s.bx=s.buf.getContext('2d');s.bx.fillStyle=p.paper||'#f3efe4';s.bx.fillRect(0,0,W,H)}
  if(p.mode==='channel'){s.ch=[0,1,2].map(k=>{const c=off(s.B.w,s.B.h),x=c.getContext('2d'),im=x.createImageData(s.B.w,s.B.h);for(let i=0;i<im.data.length;i+=4){im.data[i+k]=s.B.d.data[i+k];im.data[i+3]=255}x.putImageData(im,0,0);return c})}
  if(p.mode==='shatter')this.shards(s);if(p.mode==='sort'){s.out=off(s.B.w,s.B.h);s.ox=s.out.getContext('2d')}},
 shards(s){const{W,H}=s,n=p=>p,g=[],cols=9,rows=6;for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++)g.push([W*i/cols+(i%cols?(s.rnd()-.5)*W/cols*.7:0),H*j/rows+(j%rows?(s.rnd()-.5)*H/rows*.7:0)]);
  s.tri=[];for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const a=g[j*(cols+1)+i],b=g[j*(cols+1)+i+1],c=g[(j+1)*(cols+1)+i],d=g[(j+1)*(cols+1)+i+1];for(const t of[[a,b,d],[a,d,c]])s.tri.push({p:t,dx:0,dy:0,r:0,v:0,fall:-1,cx:(t[0][0]+t[1][0]+t[2][0])/3,cy:(t[0][1]+t[1][1]+t[2][1])/3})}s.tri.sort(()=>s.rnd()-.5);s.k=0},
 frame(s,t){const{x,W,H,p,B}=s,R=s.rnd,img=s.imgs[0];s.k++;
  if(p.mode==='datamosh'){const bs=Math.round(W/40);if(s.k%(p.key||150)===1){cover(s.bx,img,W,H)}
   for(let i=0;i<(p.blocks||60);i++){const bx=(R()*W/bs|0)*bs,by=(R()*H/bs|0)*bs,a=Math.sin(bx*.01+t*.001)+Math.cos(by*.013-t*.0007),dx=Math.round(Math.cos(a)*bs*.5),dy=Math.round(Math.sin(a)*bs*.35);
    s.bx.drawImage(s.buf,bx,by,bs*2,bs,bx+dx,by+dy,bs*2,bs)}x.drawImage(s.buf,0,0);if(R()<.06){x.globalCompositeOperation='difference';x.fillStyle=p.flash||'#ff2266';x.fillRect(0,R()*H,W,H*.03);x.globalCompositeOperation='source-over'}}
  else if(p.mode==='sort'){if(s.k%3&&s.k>1){x.drawImage(s.out,0,0,W,H);return}const d=new ImageData(new Uint8ClampedArray(B.d.data),B.w,B.h),th=255*(.5+.22*Math.sin(t*.0004)),D=d.data;
   for(let y=0;y<B.h;y++){let x0=-1;for(let X=0;X<=B.w;X++){const i=(y*B.w+X)*4,on=X<B.w&&(p.dark?lum(D,i)<th:lum(D,i)>th);if(on&&x0<0)x0=X;if((!on||X===B.w)&&x0>=0){
     const run=[];for(let k=x0;k<X;k++){const j=(y*B.w+k)*4;run.push([D[j],D[j+1],D[j+2]])}run.sort((a,b)=>(a[0]+a[1]+a[2])-(b[0]+b[1]+b[2]));for(let k=x0;k<X;k++){const j=(y*B.w+k)*4,c=run[k-x0];D[j]=c[0];D[j+1]=c[1];D[j+2]=c[2]}x0=-1}}}
   s.ox.putImageData(d,0,0);x.drawImage(s.out,0,0,W,H)}
  else if(p.mode==='engrave'){x.fillStyle=p.paper||'#f3efe4';x.fillRect(0,0,W,H);x.strokeStyle=p.ink||'#1d2b33';x.lineWidth=Math.max(1.2,W/520);const L=p.lines||64,D=B.d.data;
   for(let l=0;l<L;l++){const yy=(l+.5)*H/L;x.beginPath();for(let X=0;X<W;X+=2){const sx=X/W*B.w|0,sy=yy/H*B.h|0,v=1-lum(D,(sy*B.w+sx)*4)/255;const y=yy+Math.sin(X*(p.fq||.07)*(.5+v)+t*.004*(l%3+1))*v*H/L*.9;X?x.lineTo(X,y):x.moveTo(X,y)}x.stroke()}}
  else if(p.mode==='pointil'){const D=B.d.data,cyc=p.cycle||900,u=(s.k%cyc)/cyc;if(s.k%cyc===0){s.bx.fillStyle=p.paper||'#f3efe4';s.bx.fillRect(0,0,W,H)}const r=W*(.008-.0055*u);
   for(let i=0;i<(s.full?500:220);i++){const X=R()*W,Y=R()*H,j=((Y/H*B.h|0)*B.w+(X/W*B.w|0))*4,jit=()=>(R()-.5)*34;s.bx.fillStyle=`rgb(${D[j]+jit()},${D[j+1]+jit()},${D[j+2]+jit()})`;s.bx.beginPath();s.bx.arc(X,Y,r*(.6+R()*.8),0,6.283);s.bx.fill()}x.drawImage(s.buf,0,0)}
  else if(p.mode==='slitscan'){const sw=Math.max(2,W/300|0),iw=B.w,ih=B.h;for(let X=0;X<W;X+=sw){const lag=X/W*(p.lag||2.5),off2=Math.sin(t*.0008-lag)*iw*.16+Math.sin(t*.0003-lag*.5)*iw*.07,sx=Math.max(0,Math.min(iw-2,X/W*iw*.9+iw*.05+off2));x.drawImage(B.c,sx,0,sw/W*iw,ih,X,Math.sin(t*.001-lag*2)*H*.02,sw+1,H)}}
  else if(p.mode==='dither'){const D=B.d.data,w=B.w,h=B.h,e=new Float32Array(w*h),th=128+60*Math.sin(t*.0006);for(let i=0;i<w*h;i++)e[i]=lum(D,i*4);
   const out=x.createImageData(w,h),O=out.data,c0=p.pal[0],c1=p.pal[1];for(let y=0;y<h;y++)for(let X=0;X<w;X++){const i=y*w+X,v=e[i],q=v<th?0:255,er=(v-q)/8;const c=q?c1:c0;O[i*4]=c[0];O[i*4+1]=c[1];O[i*4+2]=c[2];O[i*4+3]=255;
    for(const[dx,dy]of[[1,0],[2,0],[-1,1],[0,1],[1,1],[0,2]]){const xx=X+dx,yy=y+dy;if(xx>=0&&xx<w&&yy<h)e[yy*w+xx]+=er}}
   if(!s.dc){s.dc=off(w,h)}s.dc.getContext('2d').putImageData(out,0,0);x.imageSmoothingEnabled=false;x.drawImage(s.dc,0,0,W,H);x.imageSmoothingEnabled=true}
  else if(p.mode==='shatter'){x.fillStyle=p.sea||'#0d2230';x.fillRect(0,0,W,H);if(s.k%18===0&&s.k/18<s.tri.length)s.tri[s.k/18|0].fall=s.k;if(s.k>s.tri.length*18+120)this.shards(s);
   for(const q of s.tri){if(q.fall>=0){q.v+=H*.0008;q.dy+=q.v;q.r+=(q.cx>W/2?.01:-.01);q.dx+=(q.cx-W/2)*.002}if(q.dy>H*1.2)continue;x.save();x.translate(q.cx+q.dx,q.cy+q.dy);x.rotate(q.r);x.translate(-q.cx,-q.cy);
    x.beginPath();x.moveTo(...q.p[0]);x.lineTo(...q.p[1]);x.lineTo(...q.p[2]);x.closePath();x.save();x.clip();cover(x,img,W,H);x.restore();x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=1;x.stroke();x.restore()}}
  else if(p.mode==='channel'){x.fillStyle='#000';x.fillRect(0,0,W,H);x.globalCompositeOperation='lighter';const a=W*.02*(1.2+Math.sin(t*.0005));
   s.ch.forEach((c,k)=>{const ph=k*2.1;x.drawImage(c,Math.sin(t*.0011+ph)*a,Math.cos(t*.0009+ph)*a*.6,W,H)});x.globalCompositeOperation='source-over'}
  else if(p.mode==='teletext'){const D=B.d.data,cols=B.w,rows=B.h,cw=W/cols,ch=H/(rows+3),P=[[0,0,0],[255,0,0],[0,255,0],[255,255,0],[0,0,255],[255,0,255],[0,255,255],[255,255,255]];
   x.fillStyle='#000';x.fillRect(0,0,W,H);const roll=(t*.02)%rows|0;
   for(let y=0;y<rows;y++)for(let X=0;X<cols;X++){const i=(y*cols+X)*4;let best=0,bd=1e9;for(let k=0;k<8;k++){const q=P[k],dd=(q[0]-D[i])**2+(q[1]-D[i+1])**2+(q[2]-D[i+2])**2;if(dd<bd){bd=dd;best=k}}
    if(y===roll&&R()<.5)best=R()*8|0;x.fillStyle=`rgb(${P[best]})`;x.fillRect(X*cw,(y+2)*ch,cw+.5,ch+.5)}
   x.fillStyle='#fff';x.font=`${ch*1.6}px "JetBrains Mono",monospace`;x.textBaseline='top';x.fillText(`P100  PIERFAX 100  ${p.date||'Sun 25 Oct'}  ${String(19+((t/1000|0)/60|0)%5).padStart(2,'0')}:${String((t/1000|0)%60).padStart(2,'0')}`,cw,ch*.1);
   x.fillStyle='#ff0';x.fillText('WEST PIER: LATEST',cw,H-ch*1.8)}}});
})();
