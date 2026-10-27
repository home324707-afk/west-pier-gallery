/* Wandering and walking. "Wander" links jump to a random view (a new one on every click); on a work page,
   ← and → walk the pier and W wanders again. No libraries, nothing stored, nothing sent. */
(()=>{
const R=document.documentElement.dataset.root||'',N=+document.documentElement.dataset.n||0,W=(document.documentElement.dataset.walk||'').split(',').filter(Boolean).map(Number);if(!N)return;
const here=(location.pathname.match(/work\/(\d+)\.html$/)||[])[1];
const pad=n=>String(n).padStart(2,'0');
function wander(){let n;do{n=W.length?W[Math.floor(Math.random()*W.length)]:1+Math.floor(Math.random()*N)}while(N>1&&+here===n);location.href=R+'work/'+pad(n)+'.html'}
document.querySelectorAll('a.wander').forEach(a=>a.addEventListener('click',e=>{if(e.metaKey||e.ctrlKey||e.shiftKey||e.button)return;e.preventDefault();wander()}));
if(!here)return;
document.addEventListener('keydown',e=>{if(e.metaKey||e.ctrlKey||e.altKey||e.defaultPrevented)return;const t=e.target;if(t.closest&&t.closest('input,textarea,select,button,[contenteditable],iframe'))return;
const go=r=>{const a=document.querySelector(`a[rel=${r}]`);if(a)location.href=a.href};
if(e.key==='ArrowLeft')go('prev');else if(e.key==='ArrowRight')go('next');else if(e.key==='w'||e.key==='W')wander()});
})();
