/* Then & now sliders: drag, tap, or use the arrow keys. Nothing stored, nothing sent. */
(function(){
var figs=document.querySelectorAll('.tn');
figs.forEach(function(f,k){
  var fr=f.querySelector('.tn-frame'),r=f.querySelector('.tn-range'),dragging=false;
  function set(v){v=Math.max(0,Math.min(100,v));f.style.setProperty('--p',v+'%');r.value=v}
  function at(e){var b=fr.getBoundingClientRect();set((e.clientX-b.left)/b.width*100)}
  fr.addEventListener('pointerdown',function(e){dragging=true;try{fr.setPointerCapture(e.pointerId)}catch(_){}at(e);f.classList.add('touched')});
  fr.addEventListener('pointermove',function(e){if(dragging)at(e)});
  ['pointerup','pointercancel','lostpointercapture'].forEach(function(n){fr.addEventListener(n,function(){dragging=false})});
  r.addEventListener('input',function(){set(+r.value);f.classList.add('touched')});
  /* one gentle nudge so people see it moves */
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&'IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){
      if(!e.isIntersecting||f.classList.contains('touched')||f.dataset.nudged)return;
      f.dataset.nudged=1;io.disconnect();var t0=null;
      (function step(t){if(f.classList.contains('touched'))return;if(t0===null)t0=t;var p=(t-t0)/1800;if(p>=1){set(50);return}
        set(50+22*Math.sin(p*Math.PI*2)*(1-p));requestAnimationFrame(step)})(performance.now());
    })},{threshold:.6});io.observe(f);
  }
});
})();
