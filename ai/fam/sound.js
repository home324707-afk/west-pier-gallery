/* Family: sound pieces. Each one is a small WebAudio synthesiser plus the picture of what it plays. Sound NEVER autoplays: it starts only
   when a visitor presses the play button on the work page, and stops when they press it again, leave, or switch tab.
   The picture runs from the same score as the sound, so it shows what you would hear. p: {seed, mode, bg, ink, ink2} */
(()=>{const{pier,off,mulberry}=WPAI.util;
const h=(k,a)=>{const r=mulberry(k*7919+a*104729+13);r();return r()};
const PENTA=[0,2,4,7,9,12,14,16,19];
const MORSE={A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',Y:'-.--',Z:'--..',' ':' '};
function morseSeq(msg){const out=[];let u=0;for(const ch of msg.toUpperCase()){const m=MORSE[ch]||'';if(m===' '){u+=4;continue}for(const d of m){const L=d==='.'?1:3;out.push([u,L]);u+=L+1}u+=2}return{seq:out,len:u+6}}
/* the score: events for step k of a mode. Shared by audio and picture. */
const SC={
 harp:{d:.32,ev:(k,s)=>h(k,s)<.42?{i:Math.floor(h(k,s+1)*9),v:.5+.5*h(k,s+2)}:null},
 starlings:{d:.07,ev:(k,s)=>{const dens=.25+.25*Math.sin(k*.004+s);return h(k,s)<dens?{f:2600+h(k,s+1)*2600,v:.3+.4*h(k,s+2),pan:h(k,s+3)*2-1}:null}},
 rust:{d:.05,ev:(k,s)=>h(k,s)<.22?{f:1500+h(k,s+1)*5000,v:h(k,s+2)}:null},
 foghorn:{d:16,ev:()=>({dur:3.2})},
 tide:{d:9,ev:(k,s)=>({amp:.6+.4*h(k,s)})},
 morse:{d:.085,ev:null}};
WPAI.register('f-sound',{fps:24,init(s){const{W,H,p}=s;s.bgc=off(W,H);const b=s.bgc.getContext('2d'),g=b.createLinearGradient(0,0,0,H);g.addColorStop(0,p.bg[0]);g.addColorStop(1,p.bg[1]);b.fillStyle=g;b.fillRect(0,0,W,H);
  pier(b,W,H,H*.66,1.1,p.seed,p.pc||'rgba(150,165,180,.45)');if(p.mode==='morse')s.ms=morseSeq(p.msg||'WEST PIER ');s.legs=[];for(let i=0;i<9;i++)s.legs.push(W*(.24+.52*i/8));
  s.birds=[];for(let i=0;i<(s.full?700:260);i++)s.birds.push([s.rnd(),s.rnd(),s.rnd()*6.28])},
 frame(s,t){const{x,W,H,p}=s,T=t/1000,sd=p.seed%97;x.drawImage(s.bgc,0,0);x.strokeStyle=p.ink;x.fillStyle=p.ink;const m=p.mode,S=SC[m];
  if(m==='harp'){const k0=Math.floor(T/S.d);for(let i=0;i<9;i++){let a=0;for(let k=k0-12;k<=k0;k++){const e=S.ev(k,sd);if(e&&e.i===i){const age=T-k*S.d;if(age>=0)a+=e.v*Math.exp(-age*1.6)}}
    x.lineWidth=Math.max(1,W/400)*(1+a*2);x.globalAlpha=.35+.65*Math.min(1,a);x.beginPath();for(let y=H*.08;y<=H*.62;y+=4){const u=(y-H*.08)/(H*.54);x.lineTo(s.legs[i]+Math.sin(u*3.14)*Math.sin(T*40+i)*a*W*.012,y)}x.stroke()}x.globalAlpha=1}
  else if(m==='starlings'){const k0=Math.floor(T/S.d);let n=0;for(let k=k0-8;k<=k0;k++)if(S.ev(k,sd))n++;const cx=W*(.5+.25*Math.sin(T*.13)),cy=H*(.3+.08*Math.sin(T*.21));
    for(const b of s.birds){const a=b[2]+T*(.3+b[0]*.4),r=W*(.06+.16*b[1])*(1+.25*Math.sin(T*.7+b[0]*6));const X=cx+Math.cos(a)*r*(1.4+Math.sin(T*.3)),Y=cy+Math.sin(a*1.3)*r*.45;x.fillRect(X,Y,Math.max(1.5,W/500)*(1+n*.06),Math.max(1,W/700))}}
  else if(m==='rust'){const k0=Math.floor(T/S.d);for(let k=k0-30;k<=k0;k++){const e=S.ev(k,sd);if(!e)continue;const age=T-k*S.d,X=W*(.24+.52*h(k,sd+5)),Y=H*(.4+.3*h(k,sd+6))+age*H*.25;x.globalAlpha=Math.max(0,1-age/1.5);x.fillStyle=p.ink2;x.fillRect(X,Y,W/260,W/260)}x.globalAlpha=1;
    x.fillStyle=p.ink;x.globalAlpha=.5;x.beginPath();for(let X=0;X<W;X+=3)x.lineTo(X,H*.9+Math.sin(X*.05+T*2*Math.PI*3)*H*.01*Math.sin(T*.5*Math.PI));x.stroke();x.globalAlpha=1}
  else if(m==='foghorn'){const ph=T%S.d,on=ph<3.2;x.lineWidth=Math.max(1,W/500);for(let r=0;r<8;r++){const R=((T*60+r*W*.09)%(W*.75));x.globalAlpha=Math.max(0,1-R/(W*.75))*(on?1:.35);x.beginPath();x.ellipse(W*.5,H*.55,R,R*.32,0,Math.PI,2*Math.PI);x.stroke()}x.globalAlpha=1;
    if(on){x.fillStyle=p.ink2;x.globalAlpha=1-ph/3.2;x.beginPath();x.arc(W*.5,H*.5,W*.012,0,6.283);x.fill();x.globalAlpha=1}}
  else if(m==='tide'){const k=Math.floor(T/S.d),ph=(T%S.d)/S.d,amp=S.ev(k,sd).amp,sw=Math.sin(ph*Math.PI);x.lineWidth=Math.max(1,W/600);
    for(let j=0;j<14;j++){x.globalAlpha=.25+.05*j;x.beginPath();for(let X=0;X<=W;X+=4){const Y=H*(.68+j*.022)-sw*amp*H*.06*(1-j/16)+Math.sin(X*.012+T*.8+j)*H*.006;x.lineTo(X,Y)}x.stroke()}x.globalAlpha=1}
  else if(m==='morse'){const u=Math.floor(T/S.d)%s.ms.len,cell=W/Math.min(90,s.ms.len),y=H*.82;let lit=false;for(const[st,L]of s.ms.seq){const X=(st%90)*cell*.95+W*.03,act=u>=st&&u<st+L;if(act)lit=true;x.globalAlpha=act?1:.3;x.fillRect(X,y+(Math.floor(st/90))*cell*1.4,L*cell*.95-2,cell*.4)}x.globalAlpha=1;
    if(lit){const g=x.createRadialGradient(W*.5,H*.48,1,W*.5,H*.48,W*.2);g.addColorStop(0,p.ink2);g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,W,H)}}
  x.fillStyle='rgba(255,255,255,.75)';x.font=`${Math.max(11,W/45)}px "IBM Plex Mono",monospace`;x.textAlign='left';x.fillText(s.still?'♪ sound piece · click to listen, never autoplays':s.full?'♪ sound piece · press play below · never autoplays':'♪ sound piece · open to listen',W*.03,H*.07)}});
/* audio engine */
const RUN=new Map();
function noiseBuf(ac,sec,brown){const b=ac.createBuffer(1,ac.sampleRate*sec,ac.sampleRate),d=b.getChannelData(0);let l=0;for(let i=0;i<d.length;i++){const w=Math.random()*2-1;l=brown?(l+.02*w)/1.02:w;d[i]=brown?l*3.5:w}return b}
function start(p){const ac=new (window.AudioContext||window.webkitAudioContext)(),M=ac.createGain();M.gain.value=0;M.gain.linearRampToValueAtTime(.32,ac.currentTime+1.5);M.connect(ac.destination);
  const sd=p.seed%97,S=SC[p.mode],t0=ac.currentTime,R={ac,M,next:0};const nb=noiseBuf(ac,4,false);
  const burst=(when,f,q,dur,v)=>{const n=ac.createBufferSource();n.buffer=nb;n.loop=true;const bp=ac.createBiquadFilter();bp.type='bandpass';bp.frequency.value=f;bp.Q.value=q;const g=ac.createGain();g.gain.setValueAtTime(0,when);g.gain.linearRampToValueAtTime(v,when+.003);g.gain.exponentialRampToValueAtTime(.0001,when+dur);n.connect(bp).connect(g).connect(M);n.start(when,Math.random()*3);n.stop(when+dur+.05)};
  const tone=(when,f,type,dur,v,a=.005,pan=0,f2)=>{const o=ac.createOscillator();o.type=type;o.frequency.setValueAtTime(f,when);if(f2)o.frequency.exponentialRampToValueAtTime(f2,when+dur);const g=ac.createGain();g.gain.setValueAtTime(0,when);g.gain.linearRampToValueAtTime(v,when+a);g.gain.exponentialRampToValueAtTime(.0001,when+dur);
    let out=o.connect(g);if(ac.createStereoPanner){const pn=ac.createStereoPanner();pn.pan.value=pan;out=out.connect(pn)}out.connect(M);o.start(when);o.stop(when+dur+.05)};
  if(p.mode==='tide'||p.mode==='foghorn'){const n=ac.createBufferSource();n.buffer=noiseBuf(ac,6,true);n.loop=true;const lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.value=p.mode==='tide'?900:500;const g=ac.createGain();g.gain.value=p.mode==='tide'?.0:.25;n.connect(lp).connect(g).connect(M);n.start();R.sea=g}
  if(p.mode==='rust'){[55,58.3].forEach(f=>{const o=ac.createOscillator();o.frequency.value=f;const g=ac.createGain();g.gain.value=.18;o.connect(g).connect(M);o.start()})}
  const T=()=>ac.currentTime-t0;
  const tick=()=>{const now=T(),ahead=now+.25,m=p.mode;
    if(m==='morse'){const ms=morseSeq(p.msg||'WEST PIER '),d=S.d;while(R.next*d<ahead){const u=R.next%ms.len;for(const[st,L]of ms.seq)if(st===u)tone(t0+R.next*d,620,'sine',L*d,.35,.004);R.next++}}
    else while(R.next*S.d<ahead){const k=R.next,w=t0+k*S.d,e=S.ev&&S.ev(k,sd);
      if(e){if(m==='harp'){const f=196*2**(PENTA[e.i]/12);tone(w,f,'triangle',3,.25*e.v,.004,(e.i-4)/5);tone(w,f*2.003,'sine',1.5,.06*e.v,.004,(e.i-4)/5)}
       if(m==='starlings')tone(w,e.f,'sine',.06+.05*Math.random(),.05*e.v,.004,e.pan,e.f*(.6+Math.random()*.3));
       if(m==='rust')burst(w,e.f,8,.02+.05*e.v,.4*e.v);
       if(m==='foghorn'){[82,123,164].forEach((f,i)=>{const o=ac.createOscillator();o.type='sawtooth';o.frequency.value=f;const lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.value=380;const g=ac.createGain();g.gain.setValueAtTime(0,w);g.gain.linearRampToValueAtTime(.22/(i+1),w+.4);g.gain.setValueAtTime(.22/(i+1),w+2.6);g.gain.linearRampToValueAtTime(0,w+e.dur);o.connect(lp).connect(g).connect(M);o.start(w);o.stop(w+e.dur+.1)})}
       if(m==='tide'){R.sea.gain.setValueAtTime(.05,w);R.sea.gain.linearRampToValueAtTime(.7*e.amp,w+S.d*.45);R.sea.gain.linearRampToValueAtTime(.05,w+S.d);for(let j=0;j<40;j++)burst(w+S.d*(.5+.4*Math.random()),3000+Math.random()*4000,4,.03,.08*e.amp)}}
      R.next++}};
  tick();R.iv=setInterval(tick,100);return R}
function stop(R){clearInterval(R.iv);try{R.M.gain.linearRampToValueAtTime(0,R.ac.currentTime+.3)}catch(e){}setTimeout(()=>R.ac.close(),400)}
WPAI.sound={toggle(b){let p={};try{p=JSON.parse(b.dataset.p||'{}')}catch(e){}const R=RUN.get(b);
  if(R){stop(R);RUN.delete(b);b.textContent='▶ Play sound';b.setAttribute('aria-pressed','false')}else{RUN.set(b,start(p));b.textContent='■ Stop sound';b.setAttribute('aria-pressed','true')}}};
const halt=()=>{RUN.forEach((R,b)=>{stop(R);b.textContent='▶ Play sound';b.setAttribute('aria-pressed','false')});RUN.clear()};
document.addEventListener('visibilitychange',()=>{if(document.hidden)halt()});addEventListener('pagehide',halt);
})();
