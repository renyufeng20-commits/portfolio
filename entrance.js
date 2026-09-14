/* All scene coordinates use the original 1672 × 941 artwork.
   The clean plate is only sampled behind the robot's head; the rest stays original. */
const scene=document.querySelector('#scene');
const canvas=document.querySelector('#studio-animation');
const ctx=canvas.getContext('2d');
const robot=document.querySelector('#robot');
const motion=document.querySelector('#motion');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const original=new Image(),plate=new Image();
original.src='assets/studio-cover.png';plate.src='assets/studio-clean-plate.png';
let paused=reduced.matches,hovered=false,focused=false,greeting=false,blend=0,last=0,time=0,raf=0,greetingTimer;
const head=new Path2D('M 460 494 L 467 491 L 467 475 C 454 468 456 449 471 445 C 488 439 499 455 491 469 L 484 476 L 485 491 C 523 492 550 500 564 520 L 577 541 C 590 552 587 586 579 599 L 569 611 C 556 625 533 629 498 632 C 447 638 414 631 397 614 C 385 610 376 598 374 581 C 370 562 378 551 384 547 C 389 516 413 499 460 494 Z');
const face=new Path2D('M 443 550 C 444 531 457 522 478 521 L 524 518 C 548 516 562 529 565 548 L 566 572 C 568 591 556 601 538 604 L 478 610 C 457 611 443 599 442 583 Z');
// Fixed, sparse particles: 12 motes, each on a slow, separate path.
const motes=Array.from({length:12},(_,i)=>({x:(i*137+127)%1672,y:170+(i*83)%600,r:.75+(i%3)*.35,phase:i*1.91,speed:4+(i%4)*1.4}));
function updateLabel(){document.body.classList.toggle('motion-paused',paused);motion.textContent=paused?'播放动效':'暂停动效';motion.setAttribute('aria-pressed',String(paused));}
function resize(){const r=scene.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(r.width*d);canvas.height=Math.round(r.height*d);render();}
function drawHead(){
 ctx.save();ctx.translate(482,628);ctx.rotate(-blend*.115);ctx.translate(-482,-628);
 ctx.save();ctx.clip(head);ctx.drawImage(original,0,0,1672,941);ctx.restore();
 const cycle=time%4.1;let eyeOpen=1;
 if(cycle>3.35&&cycle<3.59)eyeOpen=Math.max(.045,Math.abs(cycle-3.47)/.12);
 // Render the existing robot's LED face as an animated display.
 ctx.save();ctx.clip(face);
 const glass=ctx.createLinearGradient(440,520,565,606);glass.addColorStop(0,'#392329');glass.addColorStop(.42,'#24191c');glass.addColorStop(1,'#492621');ctx.fillStyle=glass;ctx.fill(face);
 const reflection=ctx.createRadialGradient(464,531,0,464,531,100);reflection.addColorStop(0,'#cd827c20');reflection.addColorStop(1,'#cd827c00');ctx.fillStyle=reflection;ctx.fill(face);
 ctx.shadowColor='#ff5a35';ctx.shadowBlur=14;ctx.fillStyle='#fff8df';ctx.strokeStyle='#fff3d3';ctx.lineWidth=5;ctx.lineCap='round';
 for(const [x,y] of [[475,568],[539,563]]){
  ctx.globalAlpha=1-blend;ctx.beginPath();ctx.ellipse(x,y,9.6,19*eyeOpen,0,0,Math.PI*2);ctx.fill();
  ctx.globalAlpha=blend;ctx.beginPath();ctx.moveTo(x-9,y+2);ctx.quadraticCurveTo(x,y-13,x+9,y+2);ctx.stroke();
 }
 ctx.globalAlpha=blend;ctx.lineWidth=3.5;ctx.beginPath();ctx.moveTo(497,586);ctx.quadraticCurveTo(508,597,519,584);ctx.stroke();ctx.restore();ctx.restore();
}
function render(){
 if(!original.complete||!original.naturalWidth||!plate.complete||!plate.naturalWidth)return;
 ctx.setTransform(canvas.width/1672,0,0,canvas.height/941,0,0);ctx.clearRect(0,0,1672,941);
 // Sample only the repaired background and neck around the original head.
 ctx.save();ctx.beginPath();ctx.rect(369,439,222,201);ctx.clip();ctx.drawImage(plate,0,0,1672,941);ctx.restore();drawHead();
 // A soft two-second luminance pulse across the existing clock digits.
 const pulse=(1-Math.cos(time*Math.PI))*.5;
 ctx.save();ctx.beginPath();ctx.moveTo(1322,644);ctx.lineTo(1482,654);ctx.lineTo(1473,716);ctx.lineTo(1313,705);ctx.closePath();ctx.clip();ctx.fillStyle=`rgba(32,7,6,${.08+pulse*.25})`;ctx.fillRect(1300,630,200,100);ctx.globalCompositeOperation='screen';ctx.fillStyle=`rgba(255,70,27,${(1-pulse)*.09})`;ctx.fillRect(1300,630,200,100);ctx.restore();
 for(const m of motes){const x=m.x+Math.sin(time*.13+m.phase)*20,y=((m.y-time*m.speed+1800)%750)+80,alpha=.12+.25*(.5+.5*Math.sin(time*.65+m.phase));ctx.beginPath();ctx.arc(x,y,m.r,0,Math.PI*2);ctx.fillStyle=`rgba(255,204,139,${alpha})`;ctx.shadowColor='#ffc38d';ctx.shadowBlur=5;ctx.fill();ctx.shadowBlur=0;}
}
function tick(now){raf=0;const dt=Math.min((now-last)/1000||0,.05);last=now;if(!paused)time+=dt;const target=(hovered||focused||greeting)?1:0;blend=reduced.matches?target:blend+(target-blend)*Math.min(1,dt*8);if(Math.abs(target-blend)<.001)blend=target;render();if(!document.hidden&&(!paused||blend!==target))raf=requestAnimationFrame(tick);}
function wake(){if(!raf&&!document.hidden){last=performance.now();raf=requestAnimationFrame(tick)}}
robot.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch'){hovered=true;wake()}});
robot.addEventListener('pointerleave',()=>{hovered=false;wake()});
robot.addEventListener('focus',()=>{focused=robot.matches(':focus-visible');wake()});robot.addEventListener('blur',()=>{focused=false;wake()});
robot.addEventListener('click',()=>{greeting=!greeting;robot.setAttribute('aria-pressed',String(greeting));document.querySelector('#robot-status').textContent=greeting?'小机器人歪头笑着向你打招呼。':'';clearTimeout(greetingTimer);if(greeting)greetingTimer=setTimeout(()=>{greeting=false;robot.setAttribute('aria-pressed','false');wake()},2300);wake()});
motion.addEventListener('click',()=>{paused=!paused;updateLabel();wake()});
reduced.addEventListener('change',()=>{paused=reduced.matches;updateLabel();wake()});
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0}else wake()});
new ResizeObserver(resize).observe(scene);Promise.all([original.decode(),plate.decode()]).then(()=>{resize();wake()}).catch(()=>{canvas.hidden=true;motion.hidden=true;robot.hidden=true});updateLabel();

/* Deliberate wheel gesture enters once; pinch-to-zoom is left to the browser. */
let wheelAmount=0,wheelAt=0,entering=false;
window.addEventListener('wheel',event=>{
 if(event.ctrlKey||entering||!matchMedia('(hover:hover) and (pointer:fine)').matches||Math.abs(event.deltaY)<=Math.abs(event.deltaX))return;
 const now=performance.now();if(now-wheelAt>250)wheelAmount=0;wheelAt=now;
 wheelAmount+=Math.abs(event.deltaY)*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1);
 if(wheelAmount>=45){entering=true;location.assign('portfolio.html#about')}
},{passive:true});
