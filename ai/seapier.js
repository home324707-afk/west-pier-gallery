/* No. 315, live: the sea of "Swell and graphite" in a WebGL fragment shader, no libraries.
   The same formula as tools/code_art/sea.py: 46 sine waves (each with a second harmonic) summed on a perspective ground plane,
   slopes -> normals -> reflected ray -> a filtered-noise sky, with Schlick-style Fresnel. The pencil pier is a still transparent PNG laid on top.
   Tilt the phone (DeviceOrientation) to turn the wind and the swell and slide the glint; shake it for chop. Mouse position on desktop.
   Pauses off screen and in a hidden tab, caps pixel ratio, and steps the wave count and resolution down on a slow GPU.
   Does nothing under prefers-reduced-motion or without WebGL: the poster still stays. */
(()=>{
const box=document.querySelector('[data-seapier]');if(!box)return;
if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
const cv=box.querySelector('canvas.seagl'),pier=box.querySelector('img.seapier'),btn=box.querySelector('.seatilt'),hint=box.querySelector('.seahint');
const gl=cv.getContext('webgl',{antialias:false,alpha:false,powerPreference:'default',preserveDrawingBuffer:false})||cv.getContext('experimental-webgl');
if(!gl)return;
const NW=46;
const FS=`#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes;uniform float uT,uWind,uSwell,uChop,uRoll,uHor,uGlow,uSig,uDrift;uniform int uN;uniform vec4 uW[${NW}];
const vec3 PRU=vec3(.020,.075,.135),NAVY=vec3(.045,.105,.190),STORM=vec3(.36,.42,.48),MIST=vec3(.74,.76,.76);
float sm(float a,float b,float x){float t=clamp((x-a)/(b-a),0.,1.);return t*t*(3.-2.*t);}
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<6;i++){s+=a*vn(p);p=p*2.03+vec2(17.1,9.7);a*=.5;}return s;}
vec3 skyc(float el,float wob){
 float t=pow(clamp(el,0.,1.),.62);t=clamp(t+.10*wob*(.4+t),0.,1.);
 vec3 c=vec3(.90,.88,.80);
 c=mix(c,MIST,sm(0.,.10,t));c=mix(c,STORM,sm(.10,.40,t));c=mix(c,vec3(.12,.20,.29),sm(.40,.75,t));c=mix(c,PRU,sm(.75,1.,t));return c;}
void main(){
 vec2 fc=gl_FragCoord.xy;vec2 q=vec2(fc.x,uRes.y-fc.y);
 float yh=uRes.y*uHor;vec2 c=vec2(uRes.x*.5,yh);vec2 d=q-c;float cr=cos(uRoll),sr=sin(uRoll);
 q=c+vec2(cr*d.x-sr*d.y,sr*d.x+cr*d.y);
 float W=uRes.x,H=uRes.y;vec3 col;
 if(q.y<yh){
  float el=(yh-q.y)/yh;vec2 p=vec2(q.x/W,q.y/H);
  float n1=(fbm(vec2(p.x*.9+uDrift,p.y*3.4)*1.6+3.1)-.5)/.11,n2=(fbm(vec2(p.x*1.8-uDrift*1.6,p.y*5.0)*2.1+8.4)-.5)/.11;
  float wob=1.05*n1+.6*n2;
  vec3 s=skyc(el,wob*sm(0.,.5,el)*1.15);
  float slot=exp(-pow((el-.015)/.035,2.)),gl=exp(-pow((p.x-uGlow)/.28,2.));
  s=s*(1.-.55*slot*gl)+.55*slot*gl*vec3(.98,.93,.80);
  float bank=exp(-(pow((q.x-.53*W)/(.34*W),2.)+pow((q.y-(yh-.16*H))/(.17*H),2.)));
  s=s*(1.-.62*bank)+.62*bank*vec3(.70,.74,.76);
  col=s;
 }else{
  float hs=H-yh,ys=max(q.y-yh,1.5);float cam=7.,f=1.55*W;
  float z=cam*f/ys,x=(q.x-.5*W)*z/f,pix=z/f,pixz=z*z/(cam*f);
  float hg=0.,gx=0.,gz=0.;
  for(int i=0;i<${NW};i++){
   if(i>=uN)break;
   vec4 w=uW[i];float k=w.x,lam=6.2831853/k;
   float ang=uWind+w.y;float kx=k*cos(ang),kz=k*sin(ang);
   float fade=sm(1.2,3.,lam/max(pix*1.5,pixz*1.5));
   float a=w.z*fade*mix(uChop,uSwell,sm(10.,22.,lam));
   float th=kx*x+kz*z+w.w-sqrt(9.81*k)*uT;
   float s1=sin(th),c1=cos(th);float s2=2.*s1*c1,c2=c1*c1-s1*s1;
   float sp=s2*.6967+c2*.7174,cp=c2*.6967-s2*.7174;   // sin/cos(2th+0.8)
   hg+=a*(s1+.34*sp);float dh=a*(c1+.68*cp);gx+=dh*kx;gz+=dh*kz;
  }
  vec3 n=normalize(vec3(-gx,1.,-gz));
  float vl=sqrt(x*x+z*z+cam*cam);vec3 v=vec3(x/vl,-cam/vl,z/vl);
  vec3 r=reflect(v,n);float ry=abs(r.y);
  float rel=clamp(asin(clamp(ry,0.,1.))/1.5707963,0.,1.);
  vec3 rs=skyc(rel,0.);
  float az=clamp(.5+.5*(r.x/max(abs(r.z)+.1,.1))*.5,0.,1.);
  float gg=exp(-pow((az-(uGlow))/.28,2.))*exp(-pow((rel-.015)/.04,2.));
  rs=rs*(1.-.55*gg)+.55*gg*vec3(.98,.93,.80);
  float cosv=clamp(-(v.y*n.y),0.,1.);
  float fr=.02+.98*pow(1.-cosv,5.);
  fr=clamp(fr*1.5,0.,1.)*(.30+.70*(1.-pow(sm(0.,1.,ys/hs),.8)));
  float hn=hg/(uSig*3.);
  vec3 deep=NAVY*(.30+1.1*clamp(.5+hn,0.,1.));
  vec3 sss=vec3(.03,.11,.16)*(sm(0.,.8,hn)*.9);
  vec3 sea=deep+sss+rs*fr*.95;
  float haze=exp(-ys/(.07*hs));
  sea=sea*(1.-.8*haze)+.8*haze*vec3(.60,.64,.66);
  col=sea;
  col=mix(col,col,0.);
 }
 col=pow(clamp(col,0.,1.),vec3(.92));
 vec2 u=fc/uRes;col*=1.-.34*((u.x-.5)*(u.x-.5)*1.6+(.5-u.y)*(.5-u.y)*1.3);
 col+=(h21(fc)-.5)*.03;
 gl_FragColor=vec4(clamp(col,0.,1.),1.);
}`;
const VS='attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
function sh(t,s){const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS)){console.warn(gl.getShaderInfoLog(o));return null}return o}
const vs=sh(gl.VERTEX_SHADER,VS),fs=sh(gl.FRAGMENT_SHADER,FS);if(!vs||!fs)return;
const pr=gl.createProgram();gl.attachShader(pr,vs);gl.attachShader(pr,fs);gl.linkProgram(pr);
if(!gl.getProgramParameter(pr,gl.LINK_STATUS)){console.warn(gl.getProgramInfoLog(pr));return}
gl.useProgram(pr);
const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
const loc=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
const U={};['uRes','uT','uWind','uSwell','uChop','uRoll','uHor','uGlow','uSig','uDrift','uN'].forEach(n=>U[n]=gl.getUniformLocation(pr,n));
const UW=gl.getUniformLocation(pr,'uW');
/* the 46 waves: wavelength 3..90 m, direction scatter, amplitude from steepness, phase. Same recipe as sea.py, seeded. */
const rnd=(a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296})(315);
const smooth=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t)};
const WV=new Float32Array(NW*4);let amp2=0;
for(let i=0;i<NW;i++){const u=(i+rnd())/NW,lam=4*Math.pow(22.5,Math.pow(u,.7))*(1+.5*rnd()),k=2*Math.PI/lam;
 const sd=(lam>12?11:30)*Math.PI/180,dev=(rnd()+rnd()+rnd()-1.5)*2*sd;
 const slope=(.07+.07*smooth(14,50,lam))*(lam>16?1:Math.pow(lam/16,1.7)),a=slope/k*(.55+.9*rnd());
 WV.set([k,dev,a,rnd()*2*Math.PI],i*4);amp2+=a*a}
const SIG=Math.sqrt(amp2*.5*1.1156)*.55;
/* input: lr (left-right tilt) and fb (forward-back tilt) in -1..1, shake 0..1; everything eased */
const I={lr:0,fb:0,shake:0,src:'idle'};const S={lr:0,fb:0,chop:1,wind:.07,sw:1};
let base=null,lastOri=0,lastAcc=null;
function setTilt(lr,fb,src){I.lr=Math.max(-1,Math.min(1,lr));I.fb=Math.max(-1,Math.min(1,fb));I.src=src}
function onOri(e){if(e.gamma==null&&e.beta==null)return;let g=e.gamma||0,b=e.beta||0;
 const ang=(screen.orientation&&screen.orientation.angle)||window.orientation||0;let lr=g,fb=b;
 if(ang===90||ang===-270){lr=b;fb=-g}else if(ang===-90||ang===270){lr=-b;fb=g}else if(ang===180||ang===-180){lr=-g;fb=-b}
 if(!base)base={lr,fb};base.lr+=(lr-base.lr)*.0015;base.fb+=(fb-base.fb)*.0015;   /* the neutral hold drifts back slowly */
 const now=performance.now(),dt=Math.max(1,now-lastOri);lastOri=now;
 const rate=Math.abs(e.gamma-(onOri.pg??e.gamma))+Math.abs(e.beta-(onOri.pb??e.beta));onOri.pg=e.gamma;onOri.pb=e.beta;
 if(!hasMotion)I.shake=Math.max(I.shake,Math.min(1,(rate/dt*1000-90)/260));
 setTilt((lr-base.lr)/32,(fb-base.fb)/28,'tilt');if(!gotOri&&hint&&!fine){hint.textContent='Tilt the phone';hint.classList.remove('off');fadeHint();btn.hidden=true}gotOri=true}
let hasMotion=false,gotOri=false;
function onMot(e){const a=e.accelerationIncludingGravity;if(!a||a.x==null)return;hasMotion=true;
 if(lastAcc){const d=Math.hypot(a.x-lastAcc.x,a.y-lastAcc.y,a.z-lastAcc.z);I.shake=Math.max(I.shake,Math.min(1,(d-4)/14))}lastAcc={x:a.x,y:a.y,z:a.z}}
function listen(){addEventListener('deviceorientation',onOri,true);addEventListener('devicemotion',onMot,true)}
function fadeHint(){if(hint)setTimeout(()=>hint.classList.add('off'),4500)}
const fine=matchMedia('(pointer:fine)').matches;
const needPerm=typeof DeviceOrientationEvent!=='undefined'&&typeof DeviceOrientationEvent.requestPermission==='function';
if('DeviceOrientationEvent' in window)listen();     /* Android and desktop Chrome: events just flow. iOS: silent until the tap below */
if(needPerm&&navigator.maxTouchPoints>0){
 setTimeout(()=>{if(gotOri)return;btn.hidden=false;
  btn.addEventListener('click',()=>{
   const reqs=[DeviceOrientationEvent.requestPermission()];
   if(typeof DeviceMotionEvent!=='undefined'&&typeof DeviceMotionEvent.requestPermission==='function')reqs.push(DeviceMotionEvent.requestPermission().catch(()=>'denied'));
   Promise.all(reqs).then(r=>{if(r[0]==='granted'){listen();btn.hidden=true;if(hint){hint.textContent='Tilt the phone';hint.classList.remove('off');fadeHint()}}else btn.textContent='Tilt is blocked'}).catch(()=>{btn.textContent='Tilt unavailable'})})},900);
}
if(hint&&!fine&&'DeviceOrientationEvent' in window&&!needPerm){hint.textContent='Tilt the phone';hint.classList.remove('off');fadeHint()}
if(fine){addEventListener('mousemove',e=>{if(I.src==='tilt')return;setTilt((e.clientX/innerWidth-.5)*2,(e.clientY/innerHeight-.5)*2,'mouse')},{passive:true});
 if(hint){hint.textContent='Move the mouse';hint.classList.remove('off');fadeHint()}}
/* size: cap the pixel ratio and the width; step down if frames run long */
let q={scale:1,n:NW},W=0,H=0;const cap=()=>Math.min(window.devicePixelRatio||1,1.5);
function size(){const r=cv.getBoundingClientRect();W=Math.max(2,Math.round(Math.min(r.width*cap()*q.scale,1400)));H=Math.max(2,Math.round(W*(r.height/Math.max(1,r.width))));
 if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H}gl.viewport(0,0,W,H)}
new ResizeObserver(size).observe(cv);size();
let vis=true,run=false,t0=performance.now(),last=t0,frames=0,acc=0,T=0,failed=false;
new IntersectionObserver(es=>{vis=es[0].isIntersecting;kick()},{threshold:0}).observe(box);
document.addEventListener('visibilitychange',kick);
cv.addEventListener('webglcontextlost',e=>{e.preventDefault();failed=true;cv.classList.remove('on');pier.classList.remove('on')});
function kick(){if(!run&&vis&&!document.hidden&&!failed){run=true;last=performance.now();requestAnimationFrame(loop)}}
function loop(now){
 if(!vis||document.hidden||failed){run=false;return}
 const dt=Math.min(.1,(now-last)/1000);last=now;T+=dt;
 /* idle breath so it lives with no input at all */
 const tt=now/1000,il=I.src==='idle'?.22*Math.sin(tt*.21)+.1*Math.sin(tt*.53):0,ifb=I.src==='idle'?.2*Math.sin(tt*.17+1):0;
 const ea=1-Math.exp(-dt/.45);S.lr+=(I.lr+il-S.lr)*ea;S.fb+=(I.fb+ifb-S.fb)*ea;
 I.shake*=Math.exp(-dt/1.6);
 const chopT=1+2.4*I.shake;S.chop+=(chopT-S.chop)*(1-Math.exp(-dt/(chopT>S.chop?.15:1.2)));
 const wind=.07+S.lr*.55,swell=Math.max(.45,Math.min(1.9,1+S.fb*.75)),roll=-S.lr*.045,hor=.46+S.fb*.012,glow=Math.max(.3,Math.min(.95,.62+S.lr*.2));
 S.wind+=(wind-S.wind)*ea;S.sw+=(swell-S.sw)*ea;
 gl.uniform2f(U.uRes,W,H);gl.uniform1f(U.uT,T*.8);gl.uniform1f(U.uWind,S.wind);gl.uniform1f(U.uSwell,S.sw);gl.uniform1f(U.uChop,S.chop);
 gl.uniform1f(U.uRoll,roll);gl.uniform1f(U.uHor,hor);gl.uniform1f(U.uGlow,glow);gl.uniform1f(U.uSig,SIG);gl.uniform1f(U.uDrift,T*.0025+S.lr*.02);gl.uniform1i(U.uN,q.n);
 gl.uniform4fv(UW,WV);
 gl.drawArrays(gl.TRIANGLES,0,3);
 if(!cv.classList.contains('on')&&++frames>1){cv.classList.add('on');pier.classList.add('on')}
 /* slow GPU: after 40 frames judge the average frame time and step down (wave count, then resolution) */
 acc+=dt;if(++perf.f>=40){const avg=acc/perf.f;perf.f=0;acc=0;
  if(avg>.032&&perf.steps<4){perf.steps++;if(q.n>26)q.n=Math.max(26,Math.round(q.n*.7));else q.scale=Math.max(.5,q.scale*.78);size()}}
 requestAnimationFrame(loop)}
const perf={f:0,steps:/[?&]sea=hi/.test(location.search)?99:0};
window.__seapier={state:()=>({q,S:{...S},I:{...I},T,steps:perf.steps,W,H}),input:(lr,fb,shake)=>{setTilt(lr,fb,'mouse');if(shake)I.shake=shake}};
kick();
})();
