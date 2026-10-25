/* Family: data portraits. Only real data: counts taken from this gallery's own catalogue (data/artworks.json) when the work was made,
   and dates from the sourced timeline (data/timelapse.json). Nothing invented.
   legs: every human work in the gallery, by the year it was made, drawn as the pier's legs. Collapse dates are marked.
   weather: the licences of the human works, as weather. p: {seed, mode, data:[[label,count]...], marks:[[year,label]...], asof} */
(()=>{const{off}=WPAI.util;const F='"IBM Plex Mono",monospace';
WPAI.register('f-data',{fps:30,init(s){const{W,H,p}=s;if(p.mode==='days'){const Y0=1866,Y1=+p.today.slice(0,4),cols=Y1-Y0+1,ox=W*.07,ow=W*.88,oy=H*.14,oh=H*.7,cw=ow/cols,rh=oh/366;s.g={Y0,Y1,ox,ow,oy,oh,cw,rh};const c=s.dc=off(W,H),x=c.getContext('2d');const st=p.states.map(q=>[Date.parse(q[0]),q[1],q[2]]),end=Date.parse(p.today);
  for(let y=Y0;y<=Y1;y++){const j0=Date.UTC(y,0,1);for(let d=0;d<366;d++){const tm=j0+d*864e5;if(new Date(tm).getUTCFullYear()!==y||tm>end)continue;let col=null;for(const q of st)if(tm>=q[0])col=q[2];if(!col)continue;x.fillStyle=col;x.fillRect(ox+(y-Y0)*cw,oy+d*rh,Math.ceil(cw)-(cw>3?1:0),Math.ceil(rh))}}return}s.max=Math.max(...p.data.filter(d=>d[0]!=='undated').map(d=>d[1]));if(p.mode==='weather'){s.drops=[];p.data.forEach((d,i)=>{for(let k=0;k<d[1];k++)s.drops.push({i,x:s.rnd(),y:s.rnd(),v:.5+s.rnd()})})}},
 frame(s,t){const{x,W,H,p}=s,T=t/1000,fs=Math.max(10,W/70);x.font=`${fs}px ${F}`;
  if(p.mode==='days'){const g=s.g;x.fillStyle='#14171c';x.fillRect(0,0,W,H);x.drawImage(s.dc,0,0);const cyc=s.still?1:(T%20)/20,cx=g.ox+g.ow*cyc;if(!s.still){x.fillStyle='rgba(255,255,255,.08)';x.fillRect(g.ox,g.oy,cx-g.ox,g.oh);x.fillStyle='#fff';x.fillRect(cx,g.oy-4,1.5,g.oh+8);const yr=Math.min(g.Y1,g.Y0+Math.floor(cyc*(g.Y1-g.Y0+1)));x.textAlign='center';x.fillText(yr,cx,g.oy-10);x.textAlign='left'}
    const td=new Date(p.today+'T00:00:00Z'),dy=Math.floor((td-Date.UTC(td.getUTCFullYear(),0,1))/864e5);if((T*2|0)%2===0||s.still){x.fillStyle='#fff';x.fillRect(g.ox+(g.Y1-g.Y0)*g.cw-1,g.oy+dy*g.rh-2,g.cw+2,g.rh+4)}
    x.fillStyle='#d8e2ea';x.font=`${fs*1.5}px ${F}`;x.fillText('One pixel per day since 6 October 1866',g.ox,H*.07);x.font=`${fs}px ${F}`;for(const yr of[1866,1900,1950,2000,2026])x.fillText(yr,g.ox+(yr-g.Y0)*g.cw-fs,g.oy+g.oh+fs*1.5);x.fillText('1 Jan',g.ox-fs*3.6,g.oy+fs*.4);x.fillText('31 Dec',g.ox-fs*3.6,g.oy+g.oh);
    let lx=g.ox;const ly=H*.93;for(const q of p.states){x.fillStyle=q[2];x.fillRect(lx,ly-fs*.8,fs,fs);x.fillStyle='#d8e2ea';x.fillText(q[1],lx+fs*1.4,ly);lx+=x.measureText(q[1]).width+fs*3}x.fillStyle='rgba(216,226,234,.6)';x.fillText(p.note,g.ox,H*.975)}
  else if(p.mode==='legs'){x.fillStyle='#0f141b';x.fillRect(0,0,W,H);const y0=H*.82,x0=W*.06,x1=W*.94,Y0=+p.span[0],Y1=+p.span[1],X=y=>x0+(x1-x0)*(y-Y0)/(Y1-Y0),grow=Math.min(1,T/6),u=H*.55/s.max;
    x.strokeStyle='rgba(120,160,190,.35)';x.lineWidth=1;x.beginPath();x.moveTo(x0,y0);x.lineTo(x1,y0);x.stroke();
    x.fillStyle='#a9c4d8';for(const[yr,c]of p.data){if(yr==='undated')continue;const xx=X(+yr),h=c*u*grow;x.fillRect(xx-W*.003,y0-h,W*.006,h);x.fillRect(xx-W*.003,y0,W*.006,(H-y0)*.6)}
    x.textAlign='center';p.marks.forEach(([yr,lab],i)=>{const xx=X(+yr),a=Math.max(0,Math.min(1,(T-1-i*.6)));x.globalAlpha=a;x.strokeStyle='#e0703a';x.setLineDash([4,4]);x.beginPath();x.moveTo(xx,H*.12+(i%3)*fs*2.4);x.lineTo(xx,y0);x.stroke();x.setLineDash([]);
      x.fillStyle='#e0703a';x.fillText(yr,xx,H*.12+(i%3)*fs*2.4-fs*1.1);x.fillStyle='rgba(224,112,58,.8)';x.fillText(lab,xx,H*.12+(i%3)*fs*2.4-fs*.1);x.globalAlpha=1});
    x.fillStyle='#d8e2ea';x.textAlign='left';x.fillText(`${p.total} human works in this gallery, by year made (as of No. ${p.asof}). ${p.undated} undated, not shown.`,x0,H*.95);
    for(const yr of [Y0,1900,1950,2000,Y1])x.fillText(yr,X(yr)-fs,y0+fs*1.4)}
  else{const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#2a3446');g.addColorStop(1,'#11161e');x.fillStyle=g;x.fillRect(0,0,W,H);const n=p.data.length,bw=W/n;
    p.data.forEach(([lab,c,kind],i)=>{const cx=bw*(i+.5);x.fillStyle='rgba(255,255,255,.04)';x.fillRect(bw*i+2,0,bw-4,H);
      if(kind==='sun'){x.fillStyle='#ffd36b';x.beginPath();x.arc(cx,H*.3,bw*.12+Math.sin(T*2)*2,0,6.283);x.fill()}
      if(kind!=='sun'){x.fillStyle=kind==='storm'?'#59606e':'#9aa5b5';for(let k=0;k<4;k++){x.beginPath();x.arc(cx-bw*.18+k*bw*.12,H*.24+Math.sin(T+k)*3,bw*.1,0,6.283);x.fill()}}
      if(kind==='storm'&&Math.sin(T*3.1+i)>.97){x.strokeStyle='#fff6c0';x.lineWidth=2;x.beginPath();x.moveTo(cx,H*.3);x.lineTo(cx-bw*.06,H*.45);x.lineTo(cx+bw*.03,H*.45);x.lineTo(cx-bw*.04,H*.62);x.stroke()}
      x.fillStyle='#d8e2ea';x.textAlign='center';{const n=p.data.length,lf=Math.min(fs,bw*1.6/Math.max(4,lab.length));x.font=`${lf}px ${F}`;x.fillText(lab,cx,H*(n>8&&i%2?.885:.86));x.font=`${fs}px ${F}`}x.font=`bold ${fs*2}px ${F}`;x.fillText(c,cx,H*.8);x.font=`${fs}px ${F}`;x.fillStyle='rgba(216,226,234,.6)';x.fillText({sun:'clear',cloud:'cloudy',rain:'showers',storm:'storms'}[kind],cx,H*.94)});
    x.strokeStyle='rgba(180,200,230,.7)';x.lineWidth=1.2;x.beginPath();for(const d of s.drops){const kind=p.data[d.i][2];if(kind==='sun'||kind==='cloud'){x.fillStyle='rgba(255,230,150,.6)';x.fillRect(bw*(d.i+d.x*.8+.1),H*(.4+.3*((d.y+T*.03*d.v)%1)),2,2);continue}
      const yy=H*(.32+.4*((d.y+T*.25*d.v)%1)),xx=bw*(d.i+.15+d.x*.7);x.moveTo(xx,yy);x.lineTo(xx-2,yy+H*.025)}x.stroke();
    x.fillStyle='#d8e2ea';x.textAlign='left';x.fillText(p.cap||`Licence forecast: each drop or mote is one human work in this gallery (as of No. ${p.asof}). Clear skies = free to remix.`,W*.03,H*.07)}}});
})();
