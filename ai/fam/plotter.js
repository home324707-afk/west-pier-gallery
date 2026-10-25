/* Family: plotter drawings. Vector paths are computed from code (hatching, contours, a single continuous line, spirographs, packed circles,
   stipple), then a simulated pen plotter draws them, path by path, on paper. On the work page you can download the drawing as SVG.
   p: {seed, mode, paper, pens:[...], frames} */
(()=>{const{pier,off,noise}=WPAI.util;
function field(s){const{W,H,p}=s,w=W/4|0,h=H/4|0,m=off(w,h);pier(m.getContext('2d'),w,h,h*(p.base||.62),p.sc||1.2,p.seed,'#fff');const d=m.getContext('2d').getImageData(0,0,w,h).data,n=noise(p.seed);
  return(X,Y)=>{if(X<0||Y<0||X>=W||Y>=H)return 0;const i=((Y/4|0)*w+(X/4|0))*4+3,pm=d[i]/255,sea=Y>H*(p.base||.62)?.35+.25*n(X/W*8,Y/H*20):0,sky=.08+.12*n(X/W*3,Y/H*3);return Math.max(pm,sea,sky*(Y<H*.62))}}
const G={
 hatch(s,dark){const{W,H,p}=s,P=[],sp=W/(p.density||160);for(const[ang,th,pen]of(p.passes||[[.8,.25,0],[-.8,.5,0],[0,.75,1]])){const ca=Math.cos(ang),sa=Math.sin(ang),D=Math.hypot(W,H);
   for(let o=-D;o<D;o+=sp){let cur=null;for(let k=-D;k<D;k+=3){const X=W/2+ca*k-sa*o,Y=H/2+sa*k+ca*o,on=dark(X,Y)>th;if(on){if(!cur){cur=[pen];P.push(cur)}cur.push([X,Y])}else cur=null}}}return P.filter(q=>q.length>2)},
 contour(s,dark){const{W,H,p}=s,n=noise(p.seed+3),P=[],c=Math.round(W/8),r=Math.round(H/8),hgt=(i,j)=>{const X=i*W/c,Y=j*H/r;return n(X/W*4,Y/H*4)*.6+dark(X,Y)*.5};
   for(let L=.1;L<1;L+=1/(p.levels||22)){for(let j=0;j<r;j++)for(let i=0;i<c;i++){const a=hgt(i,j),b=hgt(i+1,j),cc=hgt(i+1,j+1),d=hgt(i,j+1),pts=[];
     const e=(x1,y1,v1,x2,y2,v2)=>{if((v1<L)!==(v2<L)){const u=(L-v1)/(v2-v1);pts.push([(x1+(x2-x1)*u)*W/c,(y1+(y2-y1)*u)*H/r])}};e(i,j,a,i+1,j,b);e(i+1,j,b,i+1,j+1,cc);e(i+1,j+1,cc,i,j+1,d);e(i,j+1,d,i,j,a);
     if(pts.length>=2)P.push([L>.55?1:0,pts[0],pts[1]])}}return P},
 oneline(s,dark){const{W,H}=s,pts=[];for(let i=0;i<(s.p.n||20000);i++){const X=s.rnd()*W,Y=s.rnd()*H;const v=dark(X,Y);if(v>.8||s.rnd()<v**4*.25)pts.push([X,Y])}
   const path=[0];const used=new Uint8Array(pts.length);used[0]=1;let cur=pts[0];const out=[0,cur];for(let k=1;k<pts.length;k++){let bi=-1,bd=1e18;for(let i=0;i<pts.length;i++)if(!used[i]){const d=(pts[i][0]-cur[0])**2+(pts[i][1]-cur[1])**2;if(d<bd){bd=d;bi=i}}used[bi]=1;cur=pts[bi];out.push(cur)}
   const P=[];for(let i=1;i<out.length-1;i+=60)P.push([0,...out.slice(i,i+61)]);return P},
 spiro(s){const{W,H,p}=s,P=[];for(let k=0;k<(p.k||7);k++){const R=W*(.08+.02*k),r=R*(.3+s.rnd()*.4),d=r*(.6+s.rnd()),cx=W*(.15+.7*k/((p.k||7)-1)),cy=H*(.7+.05*Math.sin(k));let cur=[k%2];
   for(let a=0;a<6.283*12;a+=.04){cur.push([cx+(R-r)*Math.cos(a)+d*Math.cos((R-r)/r*a),cy+((R-r)*Math.sin(a)-d*Math.sin((R-r)/r*a))*.35]);if(cur.length>60){P.push(cur);cur=[k%2,cur[cur.length-1]]}}P.push(cur)}
   const pc=G.hatch(s,(X,Y)=>{const pm=dark(X,Y);return pm>.9?1:0});return pc.concat(P)},
 circles(s,dark){const{W,H}=s,C=[],P=[];for(let i=0;i<120000&&C.length<(s.p.n||1600);i++){const X=s.rnd()*W,Y=s.rnd()*H,v=dark(X,Y);if(v<.2||(v<.8&&s.rnd()<.97))continue;let r=v>.8?W*.007:W*.025;
   for(const c of C){const d=Math.hypot(c[0]-X,c[1]-Y)-c[2];if(d<r)r=d}if(r<W*.002)continue;C.push([X,Y,r]);const q=[v>.8?1:0];for(let a=0;a<=6.3;a+=.35)q.push([X+Math.cos(a)*r*.9,Y+Math.sin(a)*r*.9]);P.push(q)}return P},
 stipple(s,dark){const{W,H}=s,P=[];for(let i=0;i<(s.p.n||40000);i++){const X=s.rnd()*W,Y=s.rnd()*H;if(s.rnd()<dark(X,Y)**3.5){const r=W*.0016;P.push([dark(X,Y)>.8?1:0,[X-r,Y],[X+r,Y],[X,Y+r],[X-r,Y]])}}return P}};
let dark;
WPAI.register('f-plotter',{fps:30,init(s){const{W,H,p}=s;dark=field(s);s.P=(G[p.mode])(s,dark);if(p.mode==='oneline'||p.mode==='circles'||p.mode==='stipple'){}else s.P.sort((a,b)=>a[0]-b[0]||(a[1][1]-b[1][1]));
  s.paper=off(W,H);s.px=s.paper.getContext('2d');this.sheet(s);s.i=0;s.hold=0;const segs=s.P.reduce((a,q)=>a+q.length-2,0);s.per=Math.max(1,Math.ceil(segs/(p.frames||600)));s.pen=[W/2,-20];
  if(s.full&&!s.still)this.svgLink(s)},
 sheet(s){const{W,H,p}=s;s.px.fillStyle=p.paper||'#f4f0e6';s.px.fillRect(0,0,W,H);s.i=0;s.j=1},
 svgLink(s){const{W,H,p}=s,a=document.createElement('a');a.className='btn ghost svgdl';a.textContent='Download this drawing as SVG';a.download='west-pier-plot.svg';
  const body=s.P.map(q=>`<polyline fill="none" stroke="${p.pens[q[0]]}" stroke-width="${(W/900).toFixed(2)}" points="${q.slice(1).map(v=>v[0].toFixed(1)+','+v[1].toFixed(1)).join(' ')}"/>`).join('');
  a.href=URL.createObjectURL(new Blob([`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"><rect width="100%" height="100%" fill="${p.paper||'#f4f0e6'}"/>${body}</svg>`],{type:'image/svg+xml'}));
  const host=s.c.closest('.workimg');if(host&&!host.parentNode.querySelector('.svgdl'))host.after(a)},
 frame(s,t){const{x,W,H,p,px}=s;let n=s.per;px.lineWidth=Math.max(.8,W/900);px.lineCap='round';
  while(n>0&&s.i<s.P.length){const q=s.P[s.i];px.strokeStyle=p.pens[q[0]];px.beginPath();px.moveTo(...q[s.j]);while(n>0&&s.j<q.length-1){s.j++;px.lineTo(...q[s.j]);n--}px.stroke();s.pen=q[s.j];if(s.j>=q.length-1){s.i++;s.j=1}}
  if(s.i>=s.P.length&&!s.still){if(++s.hold>240){this.sheet(s);s.hold=0}}
  x.drawImage(s.paper,0,0);if(s.i<s.P.length){const[X,Y]=s.pen;x.strokeStyle='rgba(40,40,40,.35)';x.lineWidth=1;x.beginPath();x.moveTo(X,0);x.lineTo(X,H);x.stroke();x.fillStyle='rgba(30,30,30,.8)';x.beginPath();x.arc(X,Y,Math.max(3,W/250),0,6.283);x.fill()}}});
})();
