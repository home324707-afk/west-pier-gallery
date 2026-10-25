/* Family: typography. The pier as text. 'words': the pier is typed out of a phrase and the letters below the tide line come loose and drift.
   'rain': letters fall and stick wherever there is iron, until a gust knocks them off. 'kerning': WEST PIER in large type, losing letters to the sea.
   'morse': the pier's dates in Morse code, scrolling as the swell. 'ascii': the whole scene as live ASCII, drawn from code, not from a photo.
   p: {seed, mode, phrase, bg, ink, ink2, cell, font} */
(()=>{const{pier,off}=WPAI.util;const MONO='"JetBrains Mono",monospace';
const MORSE={A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',Y:'-.--',Z:'--..',
 0:'-----',1:'.----',2:'..---',3:'...--',4:'....-',5:'.....',6:'-....',7:'--...',8:'---..',9:'----.'};
function grid(s,cell){const{W,H,p}=s,cols=Math.floor(W/cell),rows=Math.floor(H/(cell*1.4)),m=off(cols,rows);pier(m.getContext('2d'),cols,rows,rows*(p.base||.64),p.sc||1.3,p.seed,'#fff');
  const d=m.getContext('2d').getImageData(0,0,cols,rows).data,on=[];for(let j=0;j<rows;j++)for(let i=0;i<cols;i++)on.push(d[(j*cols+i)*4+3]>40);return{cols,rows,on,cw:W/cols,ch:H/rows}}
WPAI.register('f-typo',{fps:24,init(s){const{W,p}=s;s.cell=Math.max(6,W/(p.cells||110));s.G=grid(s,s.cell);s.ph=(p.phrase||'THE LATEST DAMAGED VIEW OF THE PIER ').toUpperCase();s.L=[];s.st=[];
  if(p.mode==='rain'){s.stuck=new Map()}if(p.mode==='kerning'){s.word=p.word||'WEST PIER';s.lost=[];s.chunks=[];}},
 frame(s,t){const{x,W,H,p,G}=s;x.fillStyle=p.bg;x.fillRect(0,0,W,H);x.textBaseline='top';x.font=`${G.ch*.9}px ${MONO}`;const sea=H*(.8-.05*Math.sin(t*.0005));
  if(p.mode==='words'||p.mode==='ascii'){let k=0;const R=p.ramp||' .:-=+*#%@';for(let j=0;j<G.rows;j++){let line='';for(let i=0;i<G.cols;i++){const y=j*G.ch,on=G.on[j*G.cols+i];
     let ch=' ';if(on){ch=p.mode==='words'?s.ph[k++%s.ph.length]:(p.iron||'#')}else if(y>sea+Math.sin(i*.3+t*.003)*G.ch){const w=Math.sin(i*.25+j*.6-t*.004);ch=p.mode==='words'?'sea '[(i+j+(t*.004|0))%4]:R[Math.max(0,Math.min(R.length-1,(w*.5+.5)*R.length|0))]}
     else if(p.mode==='ascii'&&p.sky){const n=Math.sin(i*.07+t*.0003)*Math.cos(j*.3-t*.0002);ch=n>.92?'*':n>.85?'.':' '}
     line+=ch}x.fillStyle=j*G.ch>sea?p.ink2:p.ink;x.fillText(line,0,j*G.ch)}
   if(p.mode==='words'){if(s.rnd()<.3){const i=s.rnd()*G.cols|0,j=G.rows*.55+s.rnd()*G.rows*.3|0;if(G.on[j*G.cols+i])s.L.push({x:i*G.cw,y:j*G.ch,c:s.ph[s.rnd()*s.ph.length|0],vx:-.3-s.rnd(),vy:.2,r:0})}
    x.fillStyle=p.ink2;for(const l of s.L){l.x+=l.vx*W/900;l.y+=l.vy;l.vy+=(l.y>sea?-.02:.03);l.r+=.02;x.save();x.translate(l.x,l.y);x.rotate(l.r);x.fillText(l.c,0,0);x.restore()}s.L=s.L.filter(l=>l.x>-20)}}
  else if(p.mode==='rain'){for(let k=0;k<(s.full?6:3);k++)s.L.push({i:s.rnd()*G.cols|0,y:-G.ch,c:s.ph[s.rnd()*s.ph.length|0]});
   const gust=(t%16000)>13500;x.fillStyle=p.ink;
   for(const l of s.L){l.y+=G.ch*.5;const j=Math.floor(l.y/G.ch),key=j*G.cols+l.i;if(j>=0&&j<G.rows&&G.on[key]&&!s.stuck.has(key)&&!gust){s.stuck.set(key,l.c);l.dead=1}else x.fillText(l.c,l.i*G.cw,l.y)}
   s.L=s.L.filter(l=>!l.dead&&l.y<H);x.fillStyle=p.ink2;
   for(const[key,c]of s.stuck){if(gust&&s.rnd()<.04){s.stuck.delete(key);s.L.push({i:key%G.cols,y:(key/G.cols|0)*G.ch,c});continue}x.fillText(c,(key%G.cols)*G.cw,(key/G.cols|0)*G.ch)}
   x.globalAlpha=.6;for(let j=Math.ceil(sea/G.ch);j<G.rows;j++)x.fillText('~'.repeat(G.cols).split('').map((c,i)=>Math.sin(i*.4+j-t*.004)>0?'~':'-').join(''),0,j*G.ch);x.globalAlpha=1}
  else if(p.mode==='kerning'){const fs=W/(s.word.length*.62),y0=H*.28;x.font=`600 ${fs}px Fraunces,serif`;x.textBaseline='alphabetic';const cyc=(t%30000)/30000,lost=Math.floor(cyc*s.word.length*1.2);
   let X=W*.04;const order=[...s.word].map((_,i)=>i).sort((a,b)=>((a*7919+p.seed)%13)-((b*7919+p.seed)%13));
   for(let i=0;i<s.word.length;i++){const c=s.word[i],w=x.measureText(c).width,r=order.indexOf(i);let dy=0,rot=0,a=1;if(r<lost&&c!==' '){const u=Math.min(1,(cyc*s.word.length*1.2-r)/2);dy=u*H*.7;rot=u*(r%2?.6:-.4);a=1-u*.7}
    x.save();x.translate(X+w/2,y0+fs*.8+dy);x.rotate(rot);x.globalAlpha=a;x.fillStyle=p.ink;x.fillText(c,-w/2,0);x.restore();X+=w}x.globalAlpha=1;
   x.font=`${G.ch*.9}px ${MONO}`;x.textBaseline='top';x.fillStyle=p.ink2;for(let j=Math.ceil(sea/G.ch);j<G.rows;j++){let line='';for(let i=0;i<G.cols;i++)line+=Math.sin(i*.3+j*.9-t*.003)>.2?'~':' ';x.fillText(line,0,j*G.ch)}
   x.fillStyle=p.ink;x.font=`${Math.max(10,W/80)}px ${MONO}`;x.fillText(`${s.word.replace(/ /g,'').length-Math.min(lost,s.word.replace(/ /g,'').length)} LETTERS REMAIN`,W*.04,H*.9)}
  else if(p.mode==='morse'){const msg=(p.phrase||'1866 1975 2003 2014 2026').toUpperCase().split('').map(c=>MORSE[c]||' ').join('   ');x.font=`${G.ch*.9}px ${MONO}`;
   for(let j=Math.floor(G.rows*.45);j<G.rows;j++){const off2=Math.floor(t*.004*(1+(j%3)*.3)+j*7)%msg.length;let line='';for(let i=0;i<G.cols;i++)line+=msg[(i+off2)%msg.length].replace('.','·').replace('-','–');
    const yy=j*G.ch+Math.sin(j*.7+t*.002)*G.ch*.3;x.fillStyle=j%2?p.ink:p.ink2;x.fillText(line,0,yy)}
   x.fillStyle=p.ink;for(let j=0;j<G.rows;j++)for(let i=0;i<G.cols;i++)if(G.on[j*G.cols+i]&&j<G.rows*.62)x.fillText(j<G.rows*.5?'═':'║',i*G.cw,j*G.ch);
   x.font=`${Math.max(10,W/80)}px ${MONO}`;x.fillText(p.phrase||'1866 1975 2003 2014 2026',W*.03,H*.05)}}});
})();
