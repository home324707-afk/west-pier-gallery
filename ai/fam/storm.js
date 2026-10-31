/* Family: storm. A timelapse of real weather, resolving into the pier it left behind. Only real data (ai/fam/storm.json):
   hourly 10 m wind gusts and precipitation from the DWD ICON-D2 2 km model (via Open-Meteo, CC BY 4.0) on a 0.04-degree grid over the Sussex coast,
   22 Oct 12:00 to 25 Oct 00:00 UTC 2026; the model is hourly, and the frames between hours are interpolated (linearly, in time and space), not measured.
   Rings on the map are real METAR observations (Shoreham, Gatwick, Southampton; about every 30 minutes) shown only when one is fresh.
   Coastline: OpenStreetMap (ODbL). The timelapse ends on a long exposure of what remained of the pier.
   p: {seed, title}  (src: the final pier photograph) */
(()=>{const{root,off,cover}=WPAI.util;let D=null;
const ST=[[0,'#06142b'],[14,'#0b2447'],[27,'#123562'],[38,'#1b5a92'],[46,'#6e9cc0'],[52,'#efe6cf'],[58,'#e6a23c'],[65,'#d4472a'],[72,'#fff1d6']];
const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const LUT=(()=>{const L=new Uint8Array(256*3);for(let i=0;i<256;i++){const v=i*80/255;let k=0;while(k<ST.length-2&&v>ST[k+1][0])k++;const a=ST[k],b=ST[k+1],u=Math.max(0,Math.min(1,(v-a[0])/(b[0]-a[0]))),ca=hex(a[1]),cb=hex(b[1]);for(let c=0;c<3;c++)L[i*3+c]=ca[c]+(cb[c]-ca[c])*u}return L})();
const b64=s=>{const a=atob(s),u=new Uint8Array(a.length);for(let i=0;i<a.length;i++)u[i]=a.charCodeAt(i);return u};
const sm=u=>u*u*u*(u*(u*6-15)+10), ez=u=>u<0?0:u>1?1:sm(u);
const DAY=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const T_IN=1000,T_STORM=24000,T_DISS=6000,T_HOLD=7000,T_OUT=2000,CYC=T_IN+T_STORM+T_DISS+T_HOLD+T_OUT;
WPAI.register('f-storm',{fps:24,prep(s){return D?0:fetch(root+'ai/fam/storm.json?v=1').then(r=>r.json()).then(j=>{j.G=b64(j.gust);j.R=b64(j.rain);D=j})},
 init(s){const{W,H}=s,[la0,la1,nla]=D.lat,[lo0,lo1,nlo]=D.lon;s.nla=nla;s.nlo=nlo;s.bw=Math.round(Math.min(600,W/2.5));s.bh=Math.round(s.bw*H/W);
  s.X=lo=>(lo-lo0)/(lo1-lo0)*W;s.Y=la=>(la1-la)/(la1-la0)*H;
  const{bw,bh}=s;s.ix=new Int32Array(bw*bh);s.wx=new Float32Array(bw*bh*4);s.hs=new Float32Array(bw*bh);
  for(let j=0;j<bh;j++)for(let i=0;i<bw;i++){const fx=(i+.5)/bw*(nlo-1),fy=(j+.5)/bh*(nla-1),gx=Math.min(nlo-2,fx|0),gy=Math.min(nla-2,(nla-1-fy)|0),ux=fx-gx,uy=(nla-1-fy)-gy,k=i+j*bw;
   s.ix[k]=gx+gy*nlo;s.wx[k*4]=(1-ux)*(1-uy);s.wx[k*4+1]=ux*(1-uy);s.wx[k*4+2]=(1-ux)*uy;s.wx[k*4+3]=ux*uy;s.hs[k]=((i*73856093^j*19349663)>>>0)%1000/1000}
  s.hb=off(bw,bh);s.hx=s.hb.getContext('2d');s.hd=s.hx.createImageData(bw,bh);s.lv=new Uint8Array(bw*bh);s.hv=new Float32Array(bw*bh);
  s.hl=off(W,H);s.T=0;s.last=null;s.img=s.imgs[0];s.fs=Math.max(8,W/80);
  s.land=new Path2D();for(const r of D.land){r.forEach(([lo,la],i)=>i?s.land.lineTo(s.X(lo),s.Y(la)):s.land.moveTo(s.X(lo),s.Y(la)));s.land.closePath()}
  s.nt=D.nt},
 field(s,h,out){const{bw,bh,nla,nlo,ix,wx}=s,G=D.G,R=D.R,n=nla*nlo,h0=Math.min(s.nt-2,h|0),f=h-h0,gk=D.gk,rk=D.rk,a=h0*n,b=(h0+1)*n,hv=s.hv;
  for(let k=0;k<bw*bh;k++){const o=ix[k],w0=wx[k*4],w1=wx[k*4+1],w2=wx[k*4+2],w3=wx[k*4+3];
   const g0=G[a+o]*w0+G[a+o+1]*w1+G[a+o+nlo]*w2+G[a+o+nlo+1]*w3,g1=G[b+o]*w0+G[b+o+1]*w1+G[b+o+nlo]*w2+G[b+o+nlo+1]*w3;hv[k]=(g0+(g1-g0)*f)/gk;
   const r0=R[a+o]*w0+R[a+o+1]*w1+R[a+o+nlo]*w2+R[a+o+nlo+1]*w3,r1=R[b+o]*w0+R[b+o+1]*w1+R[b+o+nlo]*w2+R[b+o+nlo+1]*w3;out[k]=(r0+(r1-r0)*f)/rk}},
 blur(s){const{bw,bh,hv}=s,tmp=s.tmp||(s.tmp=new Float32Array(bw*bh));for(let pass=0;pass<3;pass++){
  for(let j=0;j<bh;j++){const r=j*bw;tmp[r]=hv[r];tmp[r+bw-1]=hv[r+bw-1];for(let i=1;i<bw-1;i++)tmp[r+i]=(hv[r+i-1]+2*hv[r+i]+hv[r+i+1])*.25}
  for(let i=0;i<bw;i++){hv[i]=tmp[i];hv[i+(bh-1)*bw]=tmp[i+(bh-1)*bw]}for(let j=1;j<bh-1;j++){const r=j*bw;for(let i=0;i<bw;i++)hv[r+i]=(tmp[r-bw+i]+2*tmp[r+i]+tmp[r+bw+i])*.25}}},
 heat(s,h,T){const{bw,bh,hd,hv,lv}=s,rn=s.rn||(s.rn=new Float32Array(bw*bh));this.field(s,h,rn);this.blur(s);const d=hd.data,sp=Math.floor(T*7);
  for(let k=0;k<bw*bh;k++){const v=hv[k],ci=Math.max(0,Math.min(255,v*255/80|0))*3;let r=LUT[ci],g=LUT[ci+1],b=LUT[ci+2];lv[k]=v/10|0;
   const q=rn[k];if(q>.12){const hh=(((k*2654435761)^(sp*40503))>>>0)%1000/1000;if(hh<Math.min(.55,q*.5)){const m=.22+Math.min(.3,q*.1);r+=(196-r)*m;g+=(226-g)*m;b+=(244-b)*m}}
   const o=k*4;d[o]=r;d[o+1]=g;d[o+2]=b;d[o+3]=255}
  for(let j=0;j<bh-1;j++)for(let i=0;i<bw-1;i++){const k=i+j*bw;if(lv[k]!==lv[k+1]||lv[k]!==lv[k+bw]){const o=k*4,m=.26+.12*(lv[k]>4?1:0);d[o]+=(245-d[o])*m;d[o+1]+=(236-d[o+1])*m;d[o+2]+=(214-d[o+2])*m}}
  s.hx.putImageData(hd,0,0);const x=s.hl.getContext('2d'),{W,H}=s;x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';x.drawImage(s.hb,0,0,W,H);
  x.fillStyle='rgba(5,16,36,.34)';x.fill(s.land,'evenodd');x.lineJoin='round';x.strokeStyle='rgba(243,236,220,.88)';x.lineWidth=Math.max(1,W/900);x.stroke(s.land)},
 hud(s,h,T,a){const{x,W,H,fs}=s,F='"JetBrains Mono",monospace';if(a<=0)return;x.save();x.globalAlpha=a;
  const t0=Date.UTC(2026,9,22,12),tm=new Date(t0+h*36e5),mins=h*60,pad=n=>String(n).padStart(2,'0');
  const lab=`${DAY[tm.getUTCDay()].toUpperCase()} ${tm.getUTCDate()} ${MON[tm.getUTCMonth()].toUpperCase()} 2026`,clock=`${pad(tm.getUTCHours())}:${pad(tm.getUTCMinutes())} UTC`;
  {let g=x.createLinearGradient(0,H*.78,0,H);g.addColorStop(0,'rgba(5,15,34,0)');g.addColorStop(1,'rgba(5,15,34,.72)');x.fillStyle=g;x.fillRect(0,H*.78,W,H*.22);g=x.createLinearGradient(0,0,0,H*.3);g.addColorStop(0,'rgba(5,15,34,.6)');g.addColorStop(1,'rgba(5,15,34,0)');x.fillStyle=g;x.fillRect(0,0,W,H*.3)}
  x.textBaseline='alphabetic';x.fillStyle='#f3ecdc';x.font=`${fs*1.15}px ${F}`;x.fillText(lab,W*.03,H*.065);x.font=`300 ${fs*3.1}px Fraunces,serif`;x.fillText(clock,W*.03,H*.065+fs*3.4);
  x.font=`${fs*.82}px ${F}`;x.fillStyle='rgba(243,236,220,.62)';x.fillText('GUSTS AT 10 M, SUSSEX COAST',W*.03,H*.065+fs*4.9);
  /* pier marker */
  const px=s.X(D.pier.lon),py=s.Y(D.pier.lat);x.strokeStyle='#f3ecdc';x.lineWidth=Math.max(1,W/800);x.beginPath();x.arc(px,py,W*.0065,0,6.283);x.stroke();x.beginPath();x.moveTo(px,py);x.lineTo(px,py+W*.022);x.stroke();
  x.fillStyle='#f3ecdc';x.font=`italic 300 ${fs*1.25}px Fraunces,serif`;x.fillText('West Pier',px+W*.01,py+W*.032);
  /* real observations, only while fresh */
  for(const o of D.obs){if(o.lon<D.lon[0]||o.lon>D.lon[1]||o.lat<D.lat[0]||o.lat>D.lat[1])continue;let bi=-1,bd=1e9;for(let i=0;i<o.t.length;i++){const d=Math.abs(o.t[i]-mins);if(d<bd){bd=d;bi=i}}if(bd>35)continue;const v=o.g[bi]!=null?o.g[bi]:o.m[bi],ox=s.X(o.lon),oy=s.Y(o.lat),ci=Math.max(0,Math.min(255,v*255/80|0))*3;
   x.beginPath();x.arc(ox,oy,W*.0055,0,6.283);x.fillStyle=`rgb(${LUT[ci]},${LUT[ci+1]},${LUT[ci+2]})`;x.fill();x.strokeStyle='#f3ecdc';x.lineWidth=Math.max(1,W/700);x.stroke();
   x.fillStyle='#f3ecdc';x.font=`${fs*.8}px ${F}`;x.fillText(`${o.name} ${Math.round(v)}${o.g[bi]!=null?'':' mean'}`,ox+W*.009,oy+fs*.3)}
  /* scale */
  const sx=W*.03,sy=H*.93,sw=W*.2,sh=H*.012;const gr=x.createLinearGradient(sx,0,sx+sw,0);for(const[v,c]of ST)gr.addColorStop(Math.min(1,v/80),c);x.fillStyle=gr;x.fillRect(sx,sy,sw,sh);
  x.strokeStyle='rgba(243,236,220,.5)';x.fillStyle='rgba(243,236,220,.75)';x.font=`${fs*.8}px ${F}`;x.lineWidth=1;for(const v of[0,20,40,60]){const xx=sx+sw*v/80;x.beginPath();x.moveTo(xx,sy+sh);x.lineTo(xx,sy+sh+fs*.35);x.stroke();x.fillText(v,xx-fs*.3,sy+sh+fs*1.3)}
  x.fillText('mph',sx+sw+fs*.6,sy+sh);
  /* pier sparkline: model gust in the cell nearest the pier, hourly */
  const g=D.pier.gust,pr=D.pier.pres,qx=W*.69,qw=W*.28,qy=H*.915,qh=H*.07,n=g.length;x.strokeStyle='rgba(243,236,220,.7)';x.lineWidth=Math.max(1,W/900);x.beginPath();
  for(let i=0;i<n;i++){const xx=qx+qw*i/(n-1),yy=qy-qh*g[i]/70;i?x.lineTo(xx,yy):x.moveTo(xx,yy)}x.stroke();
  const hi=Math.min(n-2,h|0),f=h-hi,gv=g[hi]+(g[hi+1]-g[hi])*f,pv=pr[hi]+(pr[hi+1]-pr[hi])*f,cx=qx+qw*h/(n-1);x.strokeStyle='#e6a23c';x.beginPath();x.moveTo(cx,qy-qh);x.lineTo(cx,qy);x.stroke();
  x.fillStyle='#e6a23c';x.beginPath();x.arc(cx,qy-qh*gv/70,W*.0035,0,6.283);x.fill();
  x.fillStyle='rgba(243,236,220,.8)';x.textAlign='right';x.fillText(`MODEL, PIER CELL: ${Math.round(gv)} MPH GUST · ${Math.round(pv)} HPA`,qx+qw,qy-qh-fs*.5);
  x.fillStyle='rgba(243,236,220,.5)';x.fillText('ICON-D2 2 KM, HOURLY. FRAMES BETWEEN HOURS ARE INTERPOLATED. RINGS: MEASURED (METAR)',W*.97,H*.985);x.textAlign='left';x.restore()},
 frame(s,t){const{x,W,H}=s;if(s.last==null)s.last=t;s.T+=Math.min(100,t-s.last);s.last=t;const T=s.T%CYC;
  const h=Math.max(0,Math.min(1,(T-T_IN)/T_STORM))*(s.nt-1),tD=T-T_IN-T_STORM,k=ez(tD/T_DISS);
  x.fillStyle='#050f22';x.fillRect(0,0,W,H);
  if(T<T_IN+T_STORM+T_DISS)this.heat(s,h,T/1000);
  const fin=T>=T_IN+T_STORM+T_DISS-1;
  if(!fin||T<T_IN+T_STORM+T_DISS){x.globalAlpha=Math.min(1,T/T_IN);x.drawImage(s.hl,0,0);x.globalAlpha=1}
  if(tD>0&&s.img){/* the storm's colour settles into the sky of the final photograph */
   cover(x,s.img,W,H,k);
   x.save();x.globalCompositeOperation='soft-light';x.globalAlpha=(1-k)*.0+Math.sin(Math.PI*Math.min(1,tD/T_DISS))*.55;x.drawImage(s.hl,0,0);x.restore()}
  if(tD>T_DISS&&s.img){cover(x,s.img,W,H)}
  const hudA=T<T_IN+T_STORM?1:Math.max(0,1-tD/(T_DISS*.35));this.hud(s,h,T,hudA*Math.min(1,T/T_IN));
  if(tD>T_DISS*.4){const a=ez((tD-T_DISS*.4)/(T_DISS*.6)),fs=s.fs;x.save();x.globalAlpha=Math.min(1,a);x.fillStyle='#f3ecdc';x.shadowColor='rgba(0,0,0,.6)';x.shadowBlur=fs*.8;
   x.font=`italic 300 ${fs*2.4}px Fraunces,serif`;x.fillText('Sunday 25 October 2026. What was left.',W*.03,H*.9);x.shadowBlur=0;x.font=`${fs*.8}px "JetBrains Mono",monospace`;x.fillStyle='rgba(243,236,220,.7)';
   x.fillText('PHOTOGRAPH: IAN HUNTER, IANHUNTERPHOTO.COM, CC BY-NC 4.0. WEATHER: OPEN-METEO.COM (CC BY 4.0), DWD ICON-D2. MAP: OPENSTREETMAP (ODBL).',W*.03,H*.95);x.restore()}
  const fo=T-(CYC-T_OUT);if(fo>0){x.fillStyle=`rgba(5,15,34,${Math.min(1,fo/T_OUT)})`;x.fillRect(0,0,W,H)}}});
})();
