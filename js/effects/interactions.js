/* Pointer-driven 3D tilt, spotlight glow, magnetic buttons, count-up and scroll progress.
   All listeners are delegated from document so re-rendered views pick them up for free. */

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

let activeTilt = null;
let activeMagnet = null;
let pending = null;

function resetTilt(el) {
  if (!el) return;
  el.classList.remove('is-tilting');
  el.style.setProperty('--rx', '0deg');
  el.style.setProperty('--ry', '0deg');
}

function resetMagnet(el) {
  if (!el) return;
  el.style.setProperty('--tx', '0px');
  el.style.setProperty('--ty', '0px');
}

function handlePointer(e) {
  const target = e.target instanceof Element ? e.target : null;

  // Spotlight: any glow surface tracks the pointer position
  const spot = target?.closest('[data-spotlight], [data-tilt]');
  if (spot) {
    const rect = spot.getBoundingClientRect();
    spot.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    spot.style.setProperty('--my', `${e.clientY - rect.top}px`);
  }

  if (reduceMotion() || !finePointer()) return;

  // 3D tilt toward the pointer
  const tilt = target?.closest('[data-tilt]');
  if (tilt !== activeTilt) {
    resetTilt(activeTilt);
    activeTilt = tilt;
  }
  if (tilt) {
    const rect = tilt.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    const strength = parseFloat(tilt.dataset.tilt) || 6;
    tilt.classList.add('is-tilting');
    tilt.style.setProperty('--rx', `${(-py * strength).toFixed(2)}deg`);
    tilt.style.setProperty('--ry', `${(px * strength).toFixed(2)}deg`);
  }

  // Magnetic buttons drift toward the pointer
  const magnet = target?.closest('[data-magnetic]');
  if (magnet !== activeMagnet) {
    resetMagnet(activeMagnet);
    activeMagnet = magnet;
  }
  if (magnet) {
    const rect = magnet.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    magnet.style.setProperty('--tx', `${(dx * 0.18).toFixed(1)}px`);
    magnet.style.setProperty('--ty', `${(dy * 0.28).toFixed(1)}px`);
  }
}

export function initPointerEffects() {
  document.addEventListener('pointermove', (e) => {
    const queued = pending !== null;
    pending = e;
    if (queued) return;
    requestAnimationFrame(() => {
      handlePointer(pending);
      pending = null;
    });
  }, { passive: true });

  document.addEventListener('pointerleave', () => {
    resetTilt(activeTilt);
    resetMagnet(activeMagnet);
    activeTilt = null;
    activeMagnet = null;
  });
}

/* Animate numeric stats from 0 to their value once they scroll into view */
export function initCountUp(root = document) {
  const items = root.querySelectorAll('[data-count]');
  if (!items.length) return;

  const run = (el) => {
    const target = parseFloat(el.dataset.count);
    if (!Number.isFinite(target)) return;
    if (reduceMotion()) {
      el.textContent = el.dataset.display || target;
      return;
    }
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 4);
      el.textContent = Math.round(target * eased).toLocaleString();
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = el.dataset.display || target;
    };
    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        run(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  items.forEach(el => observer.observe(el));
}

/* Top progress bar + back-to-top progress ring */
export function initScrollProgress() {
  const bar = document.querySelector('.scroll-progress');
  const backToTop = document.querySelector('#back-to-top');
  let ticking = false;

  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    if (bar) bar.style.transform = `scaleX(${progress})`;
    if (backToTop) {
      backToTop.style.setProperty('--progress', progress.toFixed(3));
      backToTop.classList.toggle('visible', window.scrollY > 300);
    }
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  update();
}

/* Copy or natively share a link; resolves to a short status label */
export async function shareLink(url, title) {
  try {
    if (navigator.share && window.matchMedia('(pointer: coarse)').matches) {
      await navigator.share({ title, url });
      return 'Shared';
    }
    await navigator.clipboard.writeText(url);
    return 'Link copied';
  } catch (e) {
    return e && e.name === 'AbortError' ? '' : 'Copy failed';
  }
}

/* Floating toast used for share feedback */
export function toast(message) {
  if (!message) return;
  let el = document.querySelector('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.remove('show');
  void el.offsetWidth;
  el.classList.add('show');
  clearTimeout(el.__timer);
  el.__timer = setTimeout(() => el.classList.remove('show'), 2200);
}
