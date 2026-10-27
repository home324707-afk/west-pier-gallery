/* "One of these was made by a person." A human view against a machine view (AI or guest AI), both as still
   posters so motion gives nothing away. Labels, alt text and credits appear only after the visitor chooses.
   The score lives in this browser only (localStorage) and is compared, wryly, with a coin. */
(()=>{
const W=window.WORKS||[],box=document.querySelector('.duel-pair');if(!box||!W.length)return;
const H=W.filter(w=>w.k==='human'),M=W.filter(w=>w.k!=='human');if(!H.length||!M.length)return;
const verdict=document.querySelector('.duel-verdict'),next=document.querySelector('.duel-next'),score=document.querySelector('.duel-score');
const pick=a=>a[Math.floor(Math.random()*a.length)],pad=n=>String(n).padStart(2,'0'),seen=new Set();
let S;try{S=JSON.parse(localStorage.getItem('wp-duel'))||{r:0,t:0}}catch(e){S={r:0,t:0}}
function fresh(a){for(let k=0;k<20;k++){const w=pick(a);if(!seen.has(w.n)){seen.add(w.n);return w}}return pick(a)}
const RIGHT=['Correct. A person made that one: {ar}.','Yes. That was {ar}, standing somewhere cold with a camera or a brush.','Right. {ar} did the looking. The machine only did the filing.','Correct. The human was {ar}. The other one was produced, not seen.'];
const WRONG=['No. That one was the machine. The person was on the other side: {ar}.','Wrong, and the machine is quietly pleased. The human was {ar}.','Not quite. You picked the code. {ar} made the other one.','No. The machine made that. {ar} would like a word.'];
function say(list,h){return pick(list).replace('{ar}',h.ar==='Unknown'?'an unknown person, lost to the archive':h.ar)}
function tally(){if(!S.t){score.textContent='';return}const coin=(S.t/2).toFixed(S.t%2?1:0);
score.textContent=`Your record in this browser: ${S.r} of ${S.t}. A coin would expect about ${coin}. `+(S.t<4?'':S.r/S.t>=.8?'You can tell. That is either reassuring or the problem.':S.r/S.t<=.4?'The machine is doing better than it should.':'Roughly a coin. Make of that what you like.')}
function round(){const h=fresh(H),m=fresh(M),pair=Math.random()<.5?[h,m]:[m,h];box.innerHTML='';verdict.textContent='';next.hidden=true;
pair.forEach((w,i)=>{const b=document.createElement('button');b.type='button';b.className='duel-card';b.setAttribute('aria-label',`Picture ${'AB'[i]}: choose this if you think a person made it`);
const im=new Image();im.src=w.src.replace('.jpg','_t.jpg');im.alt='';im.width=w.w;im.height=w.h;im.decoding='async';
const cap=document.createElement('span');cap.className='duel-cap';cap.textContent='Picture '+'AB'[i];b.append(im,cap);b.addEventListener('click',()=>choose(w,h,pair));box.append(b)})}
function choose(w,h,pair){const ok=w===h;S.t++;if(ok)S.r++;try{localStorage.setItem('wp-duel',JSON.stringify(S))}catch(e){}
box.querySelectorAll('.duel-card').forEach((b,i)=>{const x=pair[i],cap=b.querySelector('.duel-cap'),lab=x.k==='human'?'Human':x.k==='guest'?'Guest AI · '+x.gm:'AI · '+(x.f||'live work');
b.disabled=true;b.classList.add('shown',x.k==='human'?'hu':'mc');if(x===w)b.classList.add('chosen');b.querySelector('img').alt=x.alt;
cap.innerHTML=`<span class="kindtag ${x.k==='human'?'hu':x.k==='guest'?'gu':'ai'}"></span><span class="o"></span> <a href="work/${pad(x.n)}.html">No. ${x.n} →</a>`;cap.querySelector('.kindtag').textContent=lab;cap.querySelector('.o').innerHTML=x.o+' · '+x.l});
verdict.textContent=say(ok?RIGHT:WRONG,h);verdict.className='duel-verdict '+(ok?'ok':'no');next.hidden=false;next.focus({preventScroll:true});tally()}
next.addEventListener('click',round);round();tally();
})();
