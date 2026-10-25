/* Family: flow fields. Particles follow a seeded noise field; the pier either condenses out of the current ('iron'), is blown apart by it ('dissolve'), or stands against a gale of streaks ('wind'). p: {seed, mode, bg, ink:[a,b], f (field scale), fade, density} */
(()=>{const{pier,off,noise}=WPAI.util;
function mask(W,H,p){const m=off(W,H);pier(m.getContext('2d'),W,H,H*(p.base||.64),p.sc||1.25,p.seed,p.pc||'#fff');const q=off(W/4|0,H/4|0);pier(q.getContext('2d'),q.width,q.height,q.height*(p.base||.64),p.sc||1.25,p.seed,'#fff');
  const b=off(W,H),bx=b.getContext('2d');bx.fillStyle='#000';bx.fillRect(0,0,W,H);bx.imageSmoothingQuality='high';bx.drawImage(q,0,0,W,H);bx.drawImage(q,-2,0,W,H);bx.drawImage(q,2,0,W,H);return{m,d:bx.getImageData(0,0,W,H).data}}
WPAI.register('f-flow',{fps:30,init(s){const{W,H,p}=s;s.n=noise(p.seed);s.t=off(W,H);s.tx=s.t.getContext('2d');s.tx.fillStyle=p.bg;s.tx.fillRect(0,0,W,H);s.M=mask(W,H,p);
    s.pts=[];const N=Math.round((s.full?2600:1100)*(p.density||1));for(let i=0;i<N;i++)s.pts.push(this.spawn(s,true));s.k=0},
 at(s,x,y){x|=0;y|=0;return x<0||y<0||x>=s.W||y>=s.H?0:s.M.d[(y*s.W+x)*4]/255},
 spawn(s,first){const{W,H,p}=s;if(p.mode==='dissolve'){for(let i=0;i<40;i++){const x=s.rnd()*W,y=s.rnd()*H;if(this.at(s,x,y)>.5)return{x,y,a:0,l:60+s.rnd()*160}}}
  if(p.mode==='wind')return{x:first?s.rnd()*W:-10,y:s.rnd()*H,a:0,l:200+s.rnd()*200};return{x:s.rnd()*W,y:s.rnd()*H,a:0,l:80+s.rnd()*200}},
 frame(s,t){const{W,H,p,tx}=s,f=(p.f||1.6)/W,TAU=6.283,sp=W/900,ink=p.ink;s.k++;
  tx.fillStyle=p.bg;tx.globalAlpha=p.fade||.03;tx.fillRect(0,0,W,H);tx.globalAlpha=1;
  const paths=[new Path2D(),new Path2D()];
  for(const q of s.pts){let ang=(s.n(q.x*f,q.y*f+t*.00004)-.5)*TAU*2+(p.dir||0),v=sp*(p.v||2);const m=this.at(s,q.x,q.y);let g=0;
   if(p.mode==='iron'){v*=1-m*.92;g=m>.15?1:0}else if(p.mode==='dissolve'){ang=ang*.5+(p.dir||0);v*=1.6;g=q.a<30?1:0}else{ang=ang*.25+(p.dir||0);v*=3;g=0}
   const nx=q.x+Math.cos(ang)*v,ny=q.y+Math.sin(ang)*v;paths[g].moveTo(q.x,q.y);paths[g].lineTo(nx,ny);q.x=nx;q.y=ny;q.a++;
   if(q.a>q.l||nx<-20||ny<-20||nx>W+20||ny>H+20)Object.assign(q,this.spawn(s,false))}
  tx.lineWidth=Math.max(1,W/1000);tx.strokeStyle=ink[0];tx.globalAlpha=p.alpha||.35;tx.stroke(paths[0]);tx.strokeStyle=ink[1];tx.globalAlpha=Math.min(1,(p.alpha||.35)*1.8);tx.stroke(paths[1]);tx.globalAlpha=1;
  s.x.drawImage(s.t,0,0);s.x.globalAlpha=p.mode==='wind'?.95:p.mode==='iron'?Math.min(.85,.1+t/9000):.7;s.x.drawImage(s.M.m,0,0);s.x.globalAlpha=1}});
})();
