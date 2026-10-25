/* Family: cellular automata. The pier is the initial condition; simple local rules do the rest.
   rust: iron next to rust or sea corrodes, rust flakes off and falls, the sea rises and falls. life: Conway's Game of Life seeded with the pier.
   sand: a storm loosens cells that fall and pile on the seabed. rule: an elementary automaton (rule 30/90/110...) rains down and is bent by the iron.
   cyclic: a cyclic automaton grows rust-coloured spirals out of the ironwork. p: {seed, rule, cols, pal:[...colours], n (states), wolf (rule number)} */
(()=>{const{pier,off}=WPAI.util;
const hex=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
WPAI.register('f-automata',{fps:20,init(s){const{W,H,p}=s;s.cw=p.cols||200;s.ch=Math.round(s.cw*H/W);s.g=off(s.cw,s.ch);s.gx=s.g.getContext('2d');s.img=s.gx.createImageData(s.cw,s.ch);
  s.pal=p.pal.map(hex);this.reset(s)},
 reset(s){const{cw,ch,p}=s,m=off(cw,ch);pier(m.getContext('2d'),cw,ch,ch*(p.base||.66),p.sc||1.3,p.seed+(s.gen|0),'#fff');const d=m.getContext('2d').getImageData(0,0,cw,ch).data;
  s.a=new Uint8Array(cw*ch);s.b=new Uint8Array(cw*ch);s.age=new Uint16Array(cw*ch);s.step=0;s.row=0;
  for(let i=0;i<cw*ch;i++){const iron=d[i*4+3]>60;
   if(p.rule==='life')s.a[i]=iron||s.rnd()<.04?1:0;else if(p.rule==='cyclic')s.a[i]=iron?1+(s.rnd()*(p.n-1)|0):0;else if(p.rule==='rule')s.a[i]=iron?2:0;else s.a[i]=iron?1:0}
  if(p.rule==='rust')for(let k=0;k<6;k++)s.a[s.rnd()*cw*ch|0]=2;if(p.rule==='rule')s.a[cw>>1]=1},
 step(s,t){const{cw,ch,p}=s,a=s.a,b=s.b,R=s.rnd;b.set(a);const I=(x,y)=>a[((y+ch)%ch)*cw+(x+cw)%cw];
  if(p.rule==='rust'){const sea=Math.round(ch*(.82-.07*Math.sin(t*.0004)));
   for(let y=ch-1;y>=0;y--)for(let x=0;x<cw;x++){const i=y*cw+x,v=a[i];
    if(v===1){let n=0;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const u=I(x+dx,y+dy);if(u===2||u===3)n++}if(n&&R()<.05*n)b[i]=2}
    else if(v===2&&R()<.012){b[i]=4}else if(v===4){if(y+1<ch&&!b[i+cw]){b[i]=0;b[i+cw]=4}else b[i]=0}
    if(y>=sea&&(b[i]===0))b[i]=3;else if(y<sea&&b[i]===3)b[i]=0}
   if(!a.some(v=>v===1||v===2)&&s.rnd()<.02){s.gen=(s.gen|0)+1;this.reset(s);return}}
  else if(p.rule==='life'){let alive=0;for(let y=0;y<ch;y++)for(let x=0;x<cw;x++){let n=0;for(let dy=-1;dy<2;dy++)for(let dx=-1;dx<2;dx++)if(dx||dy)n+=I(x+dx,y+dy)===1;
    const i=y*cw+x,v=a[i];b[i]=v===1?(n===2||n===3?1:2):(n===3?1:(v===2&&R()>.03?2:0));if(b[i]===1)alive++;s.age[i]=b[i]===1?Math.min(999,s.age[i]+1):0}
   if(++s.step>(p.life||400)||alive<20){s.gen=(s.gen|0)+1;this.reset(s);return}}
  else if(p.rule==='sand'){const loosen=p.storm||.002;for(let y=ch-2;y>=0;y--)for(let x=0;x<cw;x++){const i=y*cw+x,v=a[i];
    if(v===1&&R()<loosen*(1+3*(y/ch)))b[i]=2;else if(v===2){const dn=i+cw;if(!b[dn]){b[i]=0;b[dn]=2}else{const dx=R()<.5?-1:1,j=dn+dx;if(x+dx>=0&&x+dx<cw&&!b[j]){b[i]=0;b[j]=2}else b[i]=3}}}
   if(++s.step>(p.life||900)){s.gen=(s.gen|0)+1;this.reset(s);return}}
  else if(p.rule==='rule'){const r=s.row,nr=(r+1)%ch,w=p.wolf||30;for(let x=0;x<cw;x++){const i=nr*cw+x;if(a[i]===2)continue;
    const l=I(x-1,r)&1,c=I(x,r)&1,rr=I(x+1,r)&1;let v=(w>>(l*4+c*2+rr))&1;if(a[((nr+1)%ch)*cw+x]===2)v=1-v;b[i]=v}s.row=nr;s.step++}
  else if(p.rule==='cyclic'){const N=p.n||8;for(let y=0;y<ch;y++)for(let x=0;x<cw;x++){const i=y*cw+x,v=a[i];if(!v){let n=0;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]])if(I(x+dx,y+dy)===1)n++;if(n&&R()<(p.spread||.06))b[i]=1;continue}
    const nx=v%N+1;let c=0;for(let dy=-1;dy<2;dy++)for(let dx=-1;dx<2;dx++)if((dx||dy)&&I(x+dx,y+dy)===nx)c++;if(c>=(p.th||2))b[i]=nx}
   if(++s.step>(p.life||700)){s.gen=(s.gen|0)+1;this.reset(s);return}}
  [s.a,s.b]=[b,a]},
 frame(s,t){const{x,W,H,cw,ch,p}=s;for(let k=0;k<(p.spf||1);k++)this.step(s,t);const d=s.img.data,a=s.a,P=s.pal,N=p.n||8;
  for(let i=0;i<cw*ch;i++){let c;const v=a[i];if(p.rule==='cyclic')c=v?P[1+(v-1)%(P.length-1)]:P[0];else if(p.rule==='life')c=v===1?P[s.age[i]>8?3:1]:P[v===2?2:0];else c=P[Math.min(v,P.length-1)];
   d[i*4]=c[0];d[i*4+1]=c[1];d[i*4+2]=c[2];d[i*4+3]=255}
  s.gx.putImageData(s.img,0,0);x.imageSmoothingEnabled=false;x.drawImage(s.g,0,0,W,H);x.imageSmoothingEnabled=true}});
})();
