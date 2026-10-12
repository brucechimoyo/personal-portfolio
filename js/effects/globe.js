/* Interactive 3D particle globe rendered on a 2D canvas (no WebGL dependency) */

const TAU = Math.PI * 2;

function hexToRgb(value) {
  const hex = (value || '').trim().replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(hex)) return [29, 155, 240];
  return [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16));
}

function readColors() {
  const styles = getComputedStyle(document.documentElement);
  return {
    accent: hexToRgb(styles.getPropertyValue('--color-accent')),
    dark: document.documentElement.getAttribute('data-theme') === 'dark'
  };
}

function buildSphere(count) {
  const points = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    points.push([Math.cos(theta) * r, y, Math.sin(theta) * r]);
  }
  return points;
}

function buildLinks(points, maxDistance) {
  const links = [];
  const max2 = maxDistance * maxDistance;
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const dx = points[i][0] - points[j][0];
      const dy = points[i][1] - points[j][1];
      const dz = points[i][2] - points[j][2];
      if (dx * dx + dy * dy + dz * dz < max2) links.push([i, j]);
    }
  }
  return links;
}

function buildRing(count, radius, tiltX, tiltZ) {
  const ring = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * TAU;
    let x = Math.cos(a) * radius;
    let y = 0;
    let z = Math.sin(a) * radius;
    // tilt around X
    const y1 = y * Math.cos(tiltX) - z * Math.sin(tiltX);
    const z1 = y * Math.sin(tiltX) + z * Math.cos(tiltX);
    // tilt around Z
    const x2 = x * Math.cos(tiltZ) - y1 * Math.sin(tiltZ);
    const y2 = x * Math.sin(tiltZ) + y1 * Math.cos(tiltZ);
    ring.push([x2, y2, z1]);
  }
  return ring;
}

export function mountGlobe(canvas) {
  if (!canvas || !canvas.getContext) return () => {};
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const sphere = buildSphere(360);
  const links = buildLinks(sphere, 0.2);
  const rings = [buildRing(140, 1.45, 1.15, 0.35), buildRing(110, 1.75, 1.3, -0.5)];

  let colors = readColors();
  let width = 0;
  let height = 0;
  let dpr = 1;
  let rotY = 0;
  let tiltX = -0.3;
  let targetTiltX = -0.3;
  let spinBoost = 0;
  let visible = true;
  let frame = 0;

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!frame) draw(0);
  };

  const project = (p, cx, cy, radius, cosY, sinY, cosX, sinX) => {
    const x = p[0] * cosY - p[2] * sinY;
    const z0 = p[0] * sinY + p[2] * cosY;
    const y = p[1] * cosX - z0 * sinX;
    const z = p[1] * sinX + z0 * cosX;
    const scale = 2.8 / (2.8 - z);
    return [cx + x * radius * scale, cy + y * radius * scale, z, scale];
  };

  function draw(dt) {
    if (!width || !height) return;
    rotY += (0.00012 + spinBoost) * dt;
    spinBoost *= 0.94;
    tiltX += (targetTiltX - tiltX) * 0.05;

    const [r, g, b] = colors.accent;
    const narrow = width < 520;
    const cx = width * (narrow ? 0.62 : 0.74);
    const cy = height * 0.6;
    const radius = Math.min(height * 0.78, width * 0.36);
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const cosX = Math.cos(tiltX);
    const sinX = Math.sin(tiltX);

    ctx.clearRect(0, 0, width, height);

    // Atmospheric glow behind the globe
    const glow = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius * 1.9);
    glow.addColorStop(0, `rgba(${r},${g},${b},${colors.dark ? 0.28 : 0.2})`);
    glow.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    const projected = sphere.map(p => project(p, cx, cy, radius, cosY, sinY, cosX, sinX));

    // Mesh lines, batched into depth buckets to keep draw calls low
    const buckets = [[], [], [], []];
    for (const [i, j] of links) {
      const depth = (projected[i][2] + projected[j][2]) / 2;
      const bucket = Math.min(3, Math.max(0, Math.floor(((depth + 1) / 2) * 4)));
      buckets[bucket].push(i, j);
    }
    ctx.lineWidth = 0.6;
    buckets.forEach((pairs, level) => {
      if (!pairs.length) return;
      ctx.strokeStyle = `rgba(${r},${g},${b},${0.03 + level * 0.06})`;
      ctx.beginPath();
      for (let k = 0; k < pairs.length; k += 2) {
        const a = projected[pairs[k]];
        const c = projected[pairs[k + 1]];
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(c[0], c[1]);
      }
      ctx.stroke();
    });

    // Sphere particles
    for (const p of projected) {
      const depth = (p[2] + 1) / 2;
      ctx.fillStyle = `rgba(${r},${g},${b},${0.12 + depth * 0.78})`;
      ctx.beginPath();
      ctx.arc(p[0], p[1], 0.5 + depth * 1.5 * p[3], 0, TAU);
      ctx.fill();
    }

    // Orbit rings with a travelling highlight
    const time = performance.now() / 1000;
    rings.forEach((ring, ringIndex) => {
      const head = ((time * (ringIndex ? 0.09 : 0.13)) % 1) * ring.length;
      ring.forEach((pt, i) => {
        const p = project(pt, cx, cy, radius, cosY, sinY, cosX, sinX);
        const depth = (p[2] + 1.8) / 3.6;
        const dist = Math.min(Math.abs(i - head), ring.length - Math.abs(i - head));
        const trail = Math.max(0, 1 - dist / 14);
        const alpha = 0.08 + depth * 0.32 + trail * 0.6;
        ctx.fillStyle = trail > 0.05
          ? `rgba(${colors.dark ? '255,255,255' : `${r},${g},${b}`},${alpha})`
          : `rgba(${r},${g},${b},${alpha})`;
        ctx.beginPath();
        ctx.arc(p[0], p[1], (0.6 + trail * 1.8) * p[3], 0, TAU);
        ctx.fill();
      });
    });
  }

  let last = performance.now();
  const loop = (now) => {
    const dt = Math.min(48, now - last);
    last = now;
    if (visible && !document.hidden) draw(dt);
    frame = requestAnimationFrame(loop);
  };

  const onPointer = (e) => {
    const rect = canvas.getBoundingClientRect();
    const ny = (e.clientY - rect.top) / Math.max(rect.height, 1) - 0.5;
    targetTiltX = -0.3 + Math.max(-0.5, Math.min(0.5, ny)) * 0.5;
    spinBoost = Math.min(0.0012, spinBoost + Math.abs(e.movementX || 0) * 0.000004);
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);

  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
  });
  intersection.observe(canvas);

  const themeObserver = new MutationObserver(() => {
    colors = readColors();
    if (reduceMotion) draw(0);
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['style', 'data-theme'] });

  resize();
  if (!reduceMotion) {
    window.addEventListener('pointermove', onPointer, { passive: true });
    frame = requestAnimationFrame(loop);
  }

  return () => {
    cancelAnimationFrame(frame);
    resizeObserver.disconnect();
    intersection.disconnect();
    themeObserver.disconnect();
    window.removeEventListener('pointermove', onPointer);
  };
}
