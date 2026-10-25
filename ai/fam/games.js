/* Family: games and puzzles. The pier as something you play: falling blocks that try to rebuild it, a 1-bit handheld scene,
   a text adventure that plays itself, and a crossword with the clues. p: {seed, mode, ...} */
(()=>{const{off,mulberry}=WPAI.util;const TAU=6.283,F='"JetBrains Mono",monospace';const M={};
/* 1. Falling blocks: pieces drop and lock into the shape of the pier; every so often a wave clears a row */
M.blocks={init(s){const C=12,R=20;s.C=C;s.R=R;const tgt=[];for(let j=0;j<R;j++){tgt.push([]);for(let i=0;i<C;i++){let v=0;if(j>=13&&i%2===0)v=1;if(j===12)v=2;if(j<12&&j>=8&&i>=5&&i<=10){const h=Math.round(4*Math.sin(Math.PI*(i-4.5)/6.5));if(12-j<=h)v=3}tgt[j].push(v)}}s.tgt=tgt;
  s.order=[];for(let j=R-1;j>=0;j--)for(let i=0;i<C;i++)if(tgt[j][i])s.order.push([i,j,tgt[j][i]]);s.r=mulberry(s.p.seed)},
 frame(s,t){const{x,W,H,C,R}=s,T=s.still?999:t/1000,cell=H*.9/R,ox=W/2-cell*C/2,oy=H*.05,per=.35,N=s.order.length,cyc=N*per+6,tt=s.still?N*per+1:T%cyc,k=Math.min(N,tt/per|0);
  x.fillStyle='#101018';x.fillRect(0,0,W,H);x.fillStyle='#000';x.fillRect(ox,oy,cell*C,cell*R);x.strokeStyle='#444';x.lineWidth=2;x.strokeRect(ox,oy,cell*C,cell*R);
  const col=['','#59b4e8','#f0a020','#e04848'],blk=(i,j,c,a=1)=>{x.globalAlpha=a;x.fillStyle=c;x.fillRect(ox+i*cell+1,oy+j*cell+1,cell-2,cell-2);x.fillStyle='rgba(255,255,255,.35)';x.fillRect(ox+i*cell+1,oy+j*cell+1,cell-2,cell*.18);x.fillStyle='rgba(0,0,0,.3)';x.fillRect(ox+i*cell+1,oy+j*cell+cell*.8,cell-2,cell*.2-1);x.globalAlpha=1};
  for(let q=0;q<k;q++){const[i,j,v]=s.order[q];blk(i,j,col[v])}if(k<N){const[i,j,v]=s.order[k],f=(tt%per)/per;blk(i,Math.floor(j*f),col[v])}
  const storm=tt>N*per+2;if(storm){const lv=Math.min(1,(tt-N*per-2)/3);x.fillStyle=`rgba(80,140,255,${.5*lv})`;x.fillRect(ox,oy+cell*(R-6*lv),cell*C,cell*6*lv)}
  x.fillStyle='#ddd';x.font=`${H*.035}px ${F}`;const sx=ox+cell*C+W*.03;x.fillText('SCORE',sx,H*.12);x.fillText(String(k*40).padStart(6,'0'),sx,H*.17);x.fillText('LEVEL',sx,H*.27);x.fillText('1866',sx,H*.32);x.fillText('NEXT',sx,H*.42);
  if(k<N-1){const[,, v]=s.order[k+1];x.fillStyle=col[v];x.fillRect(sx,H*.45,cell,cell)}x.fillStyle='#ddd';x.fillText('WEST PIER',ox-W*.2,H*.12);if(storm){x.fillStyle='#ff6060';x.fillText('STORM',ox-W*.2,H*.2)}}};
/* 2. A 1-bit handheld scene: 160x144, four greens, chunky sprites, a little gull */
M.gb={init(s){s.b=off(160,144);s.bx=s.b.getContext('2d');s.r=mulberry(s.p.seed)},frame(s,t){const{x,W,H}=s,T=s.still?3:t/1000,b=s.bx,P=['#0f380f','#306230','#8bac0f','#9bbc0f'];
  b.fillStyle=P[3];b.fillRect(0,0,160,144);b.fillStyle=P[2];for(let i=0;i<5;i++){const cx=((i*47-T*4)%200+200)%200-20;b.fillRect(cx,14+i*7%20,22,4);b.fillRect(cx+4,10+i*7%20,12,4)}
  b.fillStyle=P[2];b.fillRect(0,92,160,52);b.fillStyle=P[1];for(let y=96;y<144;y+=6)for(let i=0;i<160;i+=8)if(((i/8+y/6+(T*3|0))%5)===0)b.fillRect(i,y,4,1);
  b.fillStyle=P[0];b.fillRect(10,78,140,3);for(let i=12;i<150;i+=8){if(i>56&&i<76)continue;b.fillRect(i,81,2,24)}b.fillRect(56,84,4,3);b.fillRect(72,79,6,2);
  for(let k=0;k<=8;k++){const a=Math.PI*k/8,X=110+Math.cos(a)*22,Y=78-Math.sin(a)*20;b.fillRect(X|0,Y|0,2,2);if(k%2===0)b.fillRect(X|0,Y|0,1,78-(Y|0))}
  const gx=(T*18)%190-20,gy=40+Math.sin(T*2)*6,wf=(T*6|0)%2;b.fillStyle=P[0];b.fillRect(gx,gy,3,2);b.fillRect(gx-3,gy-(wf?2:-1),3,1);b.fillRect(gx+3,gy-(wf?2:-1),3,1);
  b.fillStyle=P[0];b.fillRect(0,128,160,16);b.fillStyle=P[3];b.font='8px monospace';b.fillText('WEST PIER   HP ♥♡♡',4,139);
  x.fillStyle='#c4c0b8';x.fillRect(0,0,W,H);const sc=Math.floor(Math.min(W/180,H/170)),w=160*sc,h=144*sc,ox=(W-w)/2,oy=(H-h)/2;x.fillStyle='#55555f';x.fillRect(ox-sc*10,oy-sc*10,w+sc*20,h+sc*20);x.imageSmoothingEnabled=false;x.drawImage(s.b,ox,oy,w,h);x.imageSmoothingEnabled=true;
  x.fillStyle='rgba(0,0,0,.08)';for(let y=0;y<h;y+=sc)x.fillRect(ox,oy+y,w,1)}};
/* 3. Text adventure that plays itself */
M.adventure={frame(s,t){const{x,W,H,p}=s,T=s.still?1e4:t/1000,L=p.lines,cps=28;x.fillStyle='#0c0c0c';x.fillRect(0,0,W,H);x.font=`${H*.032}px ${F}`;let budget=T*cps,y=H*.08;const lh=H*.045;const out=[];
  for(const l of L){if(budget<=0)break;const sh=l.slice(0,Math.max(0,budget|0));budget-=l.length+10;out.push([l,sh])}const vis=out.slice(-Math.floor(H*.86/lh));
  for(const[l,sh]of vis){x.fillStyle=l.startsWith('>')?'#ffd25a':'#c8c8c8';x.fillText(sh,W*.05,y);y+=lh}if(((T*2)|0)%2===0){x.fillStyle='#ffd25a';x.fillRect(W*.05,y-lh*.75,W*.012,lh*.8)}}};
/* 4. Crossword: a hand-placed grid; letters fill in as the clues are solved */
M.cross={frame(s,t){const{x,W,H,p}=s,T=s.still?6:t/1000,g=p.grid,R=g.length,C=g[0].length,cell=Math.min(H*.85/R,W*.5/C),ox=W*.04,oy=(H-cell*R)/2;x.fillStyle='#f6f3ec';x.fillRect(0,0,W,H);
  let num=1;const nums={};for(let j=0;j<R;j++)for(let i=0;i<C;i++){if(g[j][i]==='#')continue;const a=(i===0||g[j][i-1]==='#')&&i+1<C&&g[j][i+1]!=='#',d=(j===0||g[j-1][i]==='#')&&j+1<R&&g[j+1][i]!=='#';if(a||d)nums[j+','+i]=num++}
  let order=0;for(let j=0;j<R;j++)for(let i=0;i<C;i++){const X=ox+i*cell,Y=oy+j*cell;if(g[j][i]==='#'){x.fillStyle='#1a1a1a';x.fillRect(X,Y,cell,cell);continue}x.fillStyle='#fff';x.fillRect(X,Y,cell,cell);x.strokeStyle='#1a1a1a';x.lineWidth=1.5;x.strokeRect(X,Y,cell,cell);
   if(nums[j+','+i]){x.fillStyle='#1a1a1a';x.font=`${cell*.26}px "Space Grotesk",sans-serif`;x.fillText(nums[j+','+i],X+cell*.06,Y+cell*.28)}order++;if(T*3>order+((i*7+j*3)%11)){x.fillStyle='#1d3a8a';x.font=`${cell*.6}px "Space Grotesk",sans-serif`;x.textAlign='center';x.fillText(g[j][i],X+cell/2,Y+cell*.8);x.textAlign='left'}}
  const cx=ox+cell*C+W*.04;x.fillStyle='#1a1a1a';x.font=`700 ${H*.03}px "Space Grotesk",sans-serif`;x.fillText(p.title,cx,H*.08);let y=H*.15;for(const[h,cl]of[['Across',p.across],['Down',p.down]]){x.font=`700 ${H*.026}px "Space Grotesk",sans-serif`;x.fillText(h,cx,y);y+=H*.04;x.font=`${H*.029}px Fraunces,serif`;for(const c of cl){x.fillText(c,cx,y);y+=H*.045}y+=H*.03}}};
WPAI.register('f-games',{fps:30,init(s){(M[s.p.mode].init||(()=>0))(s)},frame(s,t){M[s.p.mode].frame(s,t)}});})();
