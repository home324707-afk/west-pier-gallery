/* Family: text works. Words written by the AI (ai/fam/texts.json), typed out live in a given form (index card, typewriter, newsprint,
   brochure, claim form, radio, notice, terminal). When the text is finished, the tide comes in from the bottom and takes the last lines.
   p: {seed, id, style} */
(()=>{const{root}=WPAI.util;let T=null;
const ST={card:{bg:'#f3ecdc',ink:'#2a2622',acc:'#c4562b',font:'italic 300 {s}px Fraunces,serif',s:34,lh:1.45,center:1},
 page:{bg:'#f6f1e6',ink:'#1e1c1a',acc:'#8a7b66',font:'300 {s}px Fraunces,serif',s:30,lh:1.5},
 typewriter:{bg:'#ece3cf',ink:'#262320',acc:'#b03a2e',font:'{s}px "JetBrains Mono",monospace',s:22,lh:1.55,caret:1},
 news:{bg:'#e9e4d8',ink:'#141414',acc:'#141414',font:'{s}px Fraunces,serif',s:25,lh:1.42,rule:1},
 brochure:{bg:'#ffffff',ink:'#1d2b33',acc:'#c4562b',font:'{s}px "Space Grotesk",sans-serif',s:25,lh:1.45,band:1},
 form:{bg:'#eef2f4',ink:'#1b2a3a',acc:'#2c6f93',font:'{s}px "JetBrains Mono",monospace',s:20,lh:1.7,boxes:1},
 radio:{bg:'#0d1a26',ink:'#e6ecf0',acc:'#7fd1ff',font:'{s}px "Space Grotesk",sans-serif',s:26,lh:1.5,wave:1},
 notice:{bg:'#f2d14b',ink:'#151515',acc:'#151515',font:'500 {s}px "Space Grotesk",sans-serif',s:24,lh:1.45,rule:1},
 terminal:{bg:'#050807',ink:'#7fd18b',acc:'#d8ffe0',font:'{s}px "JetBrains Mono",monospace',s:22,lh:1.5,caret:1}};
function wrap(x,txt,w){const out=[];for(const para of txt.split('\n')){if(!para){out.push('');continue}let line='';for(const word of para.split(' ')){const t=line?line+' '+word:word;if(x.measureText(t).width>w&&line){out.push(line);line=word}else line=t}out.push(line)}return out}
WPAI.register('f-text',{fps:30,prep(s){return T?0:fetch(root+'ai/fam/texts.json').then(r=>r.json()).then(j=>T=j)},
 init(s){const{W,H,p,x}=s,st=s.st=ST[p.style],k=W/1200;let size=st.s*k*2.6*(p.scale||1);const txt=T[p.id].text,m=W*.08;
  for(let tries=0;tries<40;tries++){x.font=st.font.replace('{s}',size);s.lines=wrap(x,txt,W-2*m);if(s.lines.length*size*st.lh<H-2*m-(st.band?H*.08:0))break;size*=.94}
  s.size=size;s.m=m;s.y0=(st.center||st.wave||p.vc)?Math.max(m,(H-s.lines.length*size*st.lh)/2):m+(st.band?H*.06:0);s.total=s.lines.reduce((a,l)=>a+l.length+1,0);s.shown=0;s.hold=0;s.tide=0;s.cps=p.cps||Math.max(2,s.total/260)},
 frame(s,t){const{x,W,H,st,size,m,lines}=s;x.fillStyle=st.bg;x.fillRect(0,0,W,H);
  if(st.band){x.fillStyle=st.acc;x.fillRect(0,0,W,H*.07);x.fillStyle='#fff';x.font=`500 ${Math.min(H*.03,W*.022)}px "Space Grotesk",sans-serif`;x.textBaseline='middle';x.fillText('WEST PIER ESTATES  ·  SOLD AS SEEN (FROM THE SHORE)',m,H*.035)}
  if(st.wave){x.strokeStyle=st.acc;x.globalAlpha=.35;x.lineWidth=2;x.beginPath();for(let X=0;X<W;X+=4){const y=H*.94+Math.sin(X*.05+t*.01)*Math.sin(X*.003+t*.002)*H*.03;X?x.lineTo(X,y):x.moveTo(X,y)}x.stroke();x.globalAlpha=1}
  x.font=st.font.replace('{s}',size);x.textBaseline='top';let left=Math.floor(s.shown),y=s.y0;const lh=size*st.lh;let cx=m,cy=y;
  for(let i=0;i<lines.length;i++){const L=lines[i];if(left<=0)break;const part=L.slice(0,left);left-=L.length+1;const w=x.measureText(part).width,X=st.center?(W-x.measureText(L).width)/2:m;
   if(st.boxes&&L.includes(':')){x.strokeStyle=st.acc;x.globalAlpha=.4;x.strokeRect(m-8,y-4,W-2*m+16,lh);x.globalAlpha=1}
   x.fillStyle=i===0&&!st.center?st.acc:st.ink;x.fillText(part,X,y);cx=X+w;cy=y;if(st.rule&&i===0){x.fillRect(m,y+lh*.95,W-2*m,Math.max(1,size*.06))}y+=lh}
  if(st.caret&&(t%900)<450){x.fillStyle=st.acc;x.fillRect(cx+2,cy,size*.55,size)}
  if(s.shown<s.total)s.shown+=s.cps;else if(!s.still){s.hold++;if(s.hold>180){s.tide+=H/360;const ty=H-s.tide;x.fillStyle='rgba(18,52,70,.92)';x.beginPath();x.moveTo(0,H);for(let X=0;X<=W;X+=8)x.lineTo(X,ty+Math.sin(X*.02+t*.004)*H*.012);x.lineTo(W,H);x.fill();
   if(s.tide>H*1.02){s.shown=0;s.hold=0;s.tide=0}}}
  x.fillStyle=st.ink;x.globalAlpha=.55;x.font=`${Math.max(9,W/95)}px "JetBrains Mono",monospace`;x.fillText('WRITTEN BY AN AI',W-m-x.measureText('WRITTEN BY AN AI').width,H-m*.6);x.globalAlpha=1}});
})();
