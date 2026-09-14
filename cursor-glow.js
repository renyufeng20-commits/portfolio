/* Desktop-only blue cursor glow with a short, eased trail. */
(() => {
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  if (!finePointer.matches || reducedMotion.matches) return;

  const style = document.createElement('style');
  style.textContent = `
    @media (hover:hover) and (pointer:fine) {
      html.cursor-glow-active, html.cursor-glow-active a, html.cursor-glow-active button { cursor:none !important; }
      .cursor-glow, .cursor-core { position:fixed; left:0; top:0; pointer-events:none; z-index:2147483647; translate:-50% -50%; border-radius:50%; opacity:0; }
      .cursor-glow { width:44px; height:44px; background:radial-gradient(circle, #75c9ff42 0%, #398aff20 36%, transparent 70%); filter:blur(1px); mix-blend-mode:screen; transition:width .22s ease,height .22s ease,opacity .2s ease; }
      .cursor-core { width:5px; height:5px; background:#b5e4ff; box-shadow:0 0 6px #68bfff,0 0 15px #337dff; transition:width .18s ease,height .18s ease,background .18s ease; }
      html.cursor-glow-active.cursor-over-control .cursor-glow { width:58px; height:58px; background:radial-gradient(circle, #8bd5ff55 0%, #477aff28 42%, transparent 72%); }
      html.cursor-glow-active.cursor-over-control .cursor-core { width:7px; height:7px; background:#fff; }
    }
  `;
  document.head.append(style);
  const halo = document.createElement('i');
  const core = document.createElement('i');
  halo.className = 'cursor-glow'; core.className = 'cursor-core';
  halo.setAttribute('aria-hidden', 'true'); core.setAttribute('aria-hidden', 'true');
  document.body.append(halo, core);
  document.documentElement.classList.add('cursor-glow-active');

  let targetX = innerWidth / 2, targetY = innerHeight / 2;
  let trailX = targetX, trailY = targetY, raf = 0, visible = false;
  const draw = () => {
    raf = 0;
    trailX += (targetX - trailX) * .18;
    trailY += (targetY - trailY) * .18;
    halo.style.transform = `translate(${trailX}px,${trailY}px)`;
    core.style.transform = `translate(${targetX}px,${targetY}px)`;
    if (Math.abs(targetX - trailX) > .15 || Math.abs(targetY - trailY) > .15) raf = requestAnimationFrame(draw);
  };
  const wake = () => { if (!raf) raf = requestAnimationFrame(draw); };
  addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse') return;
    targetX = event.clientX; targetY = event.clientY;
    if (!visible) { visible = true; halo.style.opacity = core.style.opacity = '1'; }
    document.documentElement.classList.toggle('cursor-over-control', !!event.target.closest('a,button,input,select,textarea,[role="button"]'));
    wake();
  }, {passive:true});
  addEventListener('pointerleave', () => { halo.style.opacity = core.style.opacity = '0'; document.documentElement.classList.remove('cursor-over-control'); });
  addEventListener('blur', () => { halo.style.opacity = core.style.opacity = '0'; });
  addEventListener('focus', () => { if (visible) halo.style.opacity = core.style.opacity = '1'; });
})();
