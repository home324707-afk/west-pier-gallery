/* Family: optical toys. Pre-cinema machines for making pictures move. p: {seed, mode, n (drawings)} */
(()=>{const TAU=6.2832,M={};
/* one drawing of the loop: a wave rears up, breaks over the iron skeleton of the pier and falls back. k in [0,1) */
function drawing(x,X,Y,w,h,k,ink,paper){x.save();x.beginPath();x.rect(X,Y,w,h);x.clip();x.fillStyle=paper;x.fillRect(X,Y,w,h);
 const sea=Y+h*.72;x.strokeStyle=ink;x.fillStyle=ink;x.lineCap='round';x.lineJoin='round';
 /* horizon hatching */x.lineWidth=Math.max(.6,w*.004);for(let i=0;i<4;i++){x.globalAlpha=.25+i*.12;x.beginPath();x.moveTo(X,sea+h*.05*i);x.lineTo(X+w,sea+h*.05*i);x.stroke()}x.globalAlpha=1;
 /* pier: deck stubs and the pavilion cage on legs */const px=X+w*.6,pw=w*.3;x.lineWidth=Math.max(.8,w*.008);
 for(let i=0;i<7;i++){const lx=px+pw*i/6;x.beginPath();x.moveTo(lx,sea+h*.06);x.lineTo(lx,sea-h*.16);x.stroke()}
 x.beginPath();x.moveTo(px-w*.02,sea-h*.16);x.lineTo(px+pw+w*.02,sea-h*.16);x.stroke();
 for(let i=0;i<6;i++){x.beginPath();x.moveTo(px+pw*i/6,sea-h*.16);x.lineTo(px+pw*(i+1)/6,sea-h*.06);x.moveTo(px+pw*(i+1)/6,sea-h*.16);x.lineTo(px+pw*i/6,sea-h*.06);x.stroke()}
 x.beginPath();x.moveTo(px+pw*.15,sea-h*.16);x.lineTo(px+pw*.15,sea-h*.34);x.quadraticCurveTo(px+pw*.5,sea-h*.5,px+pw*.85,sea-h*.34);x.lineTo(px+pw*.85,sea-h*.16);x.moveTo(px+pw*.5,sea-h*.44);x.lineTo(px+pw*.5,sea-h*.16);x.stroke();
 /* the wave: rises as it travels right, curls, then collapses into spray */
 const rise=Math.sin(Math.min(1,k/.55)*Math.PI/2),fall=k>.55?(k-.55)/.45:0,cx=X+w*(.05+.5*Math.min(1,k/.55)),top=sea-h*(.05+.5*rise*(1-fall*.9));
 x.lineWidth=Math.max(1,w*.012);x.beginPath();x.moveTo(X,sea);x.bezierCurveTo(cx-w*.3,sea,cx-w*.12,top,cx,top);
 const curl=w*.09*rise*(1-fall);x.bezierCurveTo(cx+curl,top,cx+curl*1.2,top+curl*.8,cx+curl*.3,top+curl*.9);x.stroke();
 x.beginPath();x.moveTo(cx,top);x.bezierCurveTo(cx+w*.05,top+h*.15,cx+w*.15,sea,X+w,sea);x.stroke();
 for(let i=0;i<5;i++){x.globalAlpha=.6;x.beginPath();const yy=top+(sea-top)*(i+1)/6;x.moveTo(cx-w*.2*(1-i/6),yy);x.quadraticCurveTo(cx-w*.05,yy-h*.02,cx+w*.03*(i/5),yy+h*.01);x.stroke()}x.globalAlpha=1;
 if(fall>0){for(let i=0;i<40;i++){const a=i*2.4,r=fall*w*.25*((i*37%11)/11),sx=px+pw*.3+Math.cos(a)*r,sy=sea-h*.3-Math.abs(Math.sin(a))*r*1.2+fall*fall*h*.3;x.globalAlpha=1-fall;x.beginPath();x.arc(sx,sy,Math.max(.7,w*.008),0,TAU);x.fill()}x.globalAlpha=1}
 x.restore()}
/* 1. Zoetrope: a slotted drum turns; through the slits the twelve drawings on the strip inside become one moving wave */
M.zoetrope={frame(s,t){const{x,W,H,p}=s,N=p.n||12,T=t/1000,rot=T*TAU/(p.period||3.6),ink='#3b2a1c',paper='#efe2c4';
 const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#2b1f1a');g.addColorStop(1,'#120c0a');x.fillStyle=g;x.fillRect(0,0,W,H);
 const cx=W/2,cy=H*.4,rx=W*.3,ry=rx*.22,dh=H*.34,top=cy-dh/2,bot=cy+dh/2;
 /* table shadow and spindle */x.fillStyle='rgba(0,0,0,.45)';x.beginPath();x.ellipse(cx,bot+H*.06,rx*1.1,ry*1.1,0,0,TAU);x.fill();
 x.fillStyle='#6d4a2a';x.fillRect(cx-W*.012,bot,W*.024,H*.06);x.beginPath();x.ellipse(cx,bot+H*.065,W*.07,W*.015,0,0,TAU);x.fill();
 /* inside back wall: the drawings, seen across the drum, through the slits facing us */
 x.fillStyle='#1a120d';x.beginPath();x.ellipse(cx,top,rx,ry,0,0,TAU);x.fill();
 /* drum body */const body=x.createLinearGradient(cx-rx,0,cx+rx,0);body.addColorStop(0,'#3a0d0a');body.addColorStop(.35,'#9b2a1c');body.addColorStop(.5,'#c2452c');body.addColorStop(.75,'#7a1d14');body.addColorStop(1,'#2a0907');
 x.fillStyle=body;x.beginPath();x.moveTo(cx-rx,top);x.lineTo(cx-rx,bot);x.ellipse(cx,bot,rx,ry,0,Math.PI,0,true);x.lineTo(cx+rx,top);x.ellipse(cx,top,rx,ry,0,0,Math.PI,false);x.fill();
 /* gilt bands */x.strokeStyle='#d9a441';x.lineWidth=H*.006;x.beginPath();x.ellipse(cx,bot-dh*.06,rx,ry,0,0,Math.PI);x.stroke();x.beginPath();x.ellipse(cx,top+dh*.42,rx,ry,0,0,Math.PI);x.stroke();
 /* slits in the upper band: the one nearest the front opens a window on the current drawing */
 let best=9,bi=0;const sh=dh*.36;for(let i=0;i<N;i++){const a=((i/N)*TAU+rot)%TAU,sa=Math.sin(a),ca=Math.cos(a);if(ca<=0)continue;const sx=cx+rx*sa,sw=W*.012*ca;
  x.fillStyle='#050302';x.fillRect(sx-sw/2,top+ry*ca*.2+dh*.02,sw,sh);if(Math.abs(sa)<best){best=Math.abs(sa);bi=i}}
 /* the window: brightest when a slit is dead centre (the stroboscopic shutter) */
 const open=Math.max(0,1-best*N/2.2),frameNo=((bi%N)+N)%N,k=frameNo/N,ww=W*.26,wh=ww*.62,wx=cx-ww/2,wy=cy-wh*.72;
 x.save();x.beginPath();x.ellipse(cx,wy+wh/2,ww/2,wh/2,0,0,TAU);x.clip();drawing(x,wx,wy,ww,wh,k,ink,paper);
 x.fillStyle=`rgba(10,6,4,${.78-.7*open})`;x.fillRect(wx,wy,ww,wh);const vg=x.createRadialGradient(cx,wy+wh/2,wh*.2,cx,wy+wh/2,ww*.55);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.7)');x.fillStyle=vg;x.fillRect(wx,wy,ww,wh);x.restore();
 x.strokeStyle='#d9a441';x.lineWidth=H*.004;x.beginPath();x.ellipse(cx,wy+wh/2,ww/2,wh/2,0,0,TAU);x.stroke();
 /* the paper strip, laid flat on the table: all the drawings, the one in the window marked */
 const fw=W*.92/N,fh=fw*.66,sy=H*.8,sx0=W*.04;x.fillStyle='#e6d6b2';x.fillRect(sx0-6,sy-6,fw*N+12,fh+12);
 for(let i=0;i<N;i++){drawing(x,sx0+i*fw+2,sy,fw-4,fh,i/N,ink,paper);x.fillStyle=ink;x.font=`${Math.max(8,fh*.14)}px Fraunces,serif`;x.fillText(String(i+1),sx0+i*fw+5,sy+fh*.18)}
 x.strokeStyle='#c2452c';x.lineWidth=Math.max(2,H*.005);x.strokeRect(sx0+frameNo*fw+1,sy-2,fw-2,fh+4);
 x.fillStyle='#d9c9a6';x.font=`italic ${H*.03}px Fraunces,serif`;x.textAlign='center';x.fillText(p.cap||'Zoetrope, or wheel of life: twelve drawings of one wave',cx,H*.74);x.textAlign='left'}};
WPAI.register('f-optical',{fps:30,init(s){(M[s.p.mode].init||(()=>0))(s)},frame(s,t){M[s.p.mode].frame(s,t)}});})();
