/*
 * Student Hub — enhanced interactive mana field
 * Ambient particles rise, swirl around the pointer, gather near controls,
 * and scatter with a short free-flight burst when a control is clicked.
 * No loader, external library, or blocking overlay is used.
 */
(() => {
  'use strict';

  const boot = () => {
    if (!document.body || document.getElementById('hub-particle-canvas')) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'hub-particle-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) {
      canvas.remove();
      return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pointer = {
      x: -1000,
      y: -1000,
      vx: 0,
      vy: 0,
      active: false,
      movedAt: 0,
      lastX: -1000,
      lastY: -1000,
    };

    const particles = [];
    const sparks = [];
    const shockwaves = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let targets = [];
    let lastTargetRefresh = 0;
    let previousFrame = 0;

    const random = (min, max) => min + Math.random() * (max - min);
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
    const ease = (value) => value * value * (3 - 2 * value);

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = reducedMotion
        ? clamp(Math.round((width * height) / 33000), 18, 38)
        : clamp(Math.round((width * height) / 10500), 55, 145);

      while (particles.length < count) particles.push(makeParticle());
      if (particles.length > count) particles.length = count;
      particles.forEach((particle) => {
        particle.x = clamp(particle.x, 0, width);
        particle.y = clamp(particle.y, 0, height);
      });

      targets = [];
      refreshTargets(performance.now(), true);
    }

    function makeParticle() {
      return {
        x: random(0, Math.max(1, width)),
        y: random(0, Math.max(1, height)),
        vx: random(-0.22, 0.22),
        vy: random(-0.82, -0.28),
        baseVy: random(-0.78, -0.3),
        radius: random(0.8, 2.15),
        alpha: random(0.28, 0.84),
        phase: random(0, Math.PI * 2),
        twinkle: random(0.7, 1.75),
        sway: random(0.45, 1.5),
        mode: 'float',
        targetIndex: -1,
        angle: random(0, Math.PI * 2),
        orbitSpeed: random(0.012, 0.036),
        orbitX: random(8, 23),
        orbitY: random(7, 19),
        life: 0,
        maxLife: 0,
        rotation: random(-0.5, 0.5),
      };
    }

    function refreshTargets(now, force = false) {
      if (!force && now - lastTargetRefresh < 650) return;
      lastTargetRefresh = now;

      const elements = Array.from(document.querySelectorAll(
        'a.button, button, .main-nav a, .menu-toggle, [role="button"]'
      ));

      targets = elements
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          const style = window.getComputedStyle(element);
          return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
        })
        .slice(0, 48)
        .map((element) => ({ element, rect: null }));

      targets.forEach(updateTargetRect);

      particles.forEach((particle, index) => {
        if (particle.mode === 'orbit' && targets.length) {
          particle.targetIndex = (particle.targetIndex < 0 ? index : particle.targetIndex) % targets.length;
        } else if (particle.mode === 'orbit' && !targets.length) {
          particle.mode = 'float';
          particle.targetIndex = -1;
        } else if (particle.mode === 'float' && targets.length && index % (reducedMotion ? 13 : 8) === 0) {
          particle.mode = 'orbit';
          particle.targetIndex = Math.floor(random(0, targets.length));
          particle.angle = random(0, Math.PI * 2);
        }
      });
    }

    function updateTargetRect(target) {
      const rect = target.element.getBoundingClientRect();
      target.rect = {
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
        centerX: rect.left + rect.width / 2,
        centerY: rect.top + rect.height / 2,
      };
    }

    function closestTarget(x, y) {
      let chosen = null;
      let best = Infinity;
      for (const target of targets) {
        if (!target.rect) continue;
        const dx = x - target.rect.centerX;
        const dy = y - target.rect.centerY;
        const distance = dx * dx + dy * dy;
        if (distance < best) {
          best = distance;
          chosen = target;
        }
      }
      return chosen;
    }

    function drawParticle(particle, time) {
      const flicker = 0.76 + Math.sin(time * 0.001 * particle.twinkle + particle.phase) * 0.2;
      const lifeFade = particle.mode === 'burst' ? clamp(particle.life / particle.maxLife, 0, 1) : 1;
      const alpha = clamp(particle.alpha * flicker * lifeFade, 0.025, 0.96);
      const glowRadius = particle.radius * (particle.mode === 'burst' ? 7.2 : 5.4);

      if (particle.mode === 'burst') {
        ctx.save();
        ctx.globalAlpha = alpha * 0.72;
        ctx.lineWidth = Math.max(0.7, particle.radius * 0.9);
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'rgba(207, 154, 255, 0.72)';
        ctx.shadowBlur = 12;
        ctx.shadowColor = 'rgba(168, 85, 247, 0.95)';
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(particle.x - particle.vx * 2.3, particle.y - particle.vy * 2.3);
        ctx.stroke();
        ctx.restore();
      }

      const gradient = ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, glowRadius
      );
      gradient.addColorStop(0, `rgba(245, 224, 255, ${alpha})`);
      gradient.addColorStop(0.22, `rgba(194, 124, 255, ${alpha * 0.76})`);
      gradient.addColorStop(0.58, `rgba(145, 65, 232, ${alpha * 0.22})`);
      gradient.addColorStop(1, 'rgba(145, 65, 232, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(250, 236, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius * (particle.mode === 'burst' ? 1.15 : 1), 0, Math.PI * 2);
      ctx.fill();
    }

    function updatePointerField(particle, step) {
      if (!pointer.active || reducedMotion) return;

      const dx = particle.x - pointer.x;
      const dy = particle.y - pointer.y;
      const distance = Math.max(1, Math.hypot(dx, dy));
      const nx = dx / distance;
      const ny = dy / distance;

      if (distance < 155) {
        // A soft push away from the cursor, with a tangential swirl.
        const strength = (1 - distance / 155) * 0.13 * step;
        particle.vx += nx * strength - ny * strength * 0.72;
        particle.vy += ny * strength + nx * strength * 0.72;
      } else if (distance < 290) {
        // A wider, gentler stream pulls particles into the cursor's wake.
        const strength = (1 - (distance - 155) / 135) * 0.022 * step;
        particle.vx += -nx * strength + pointer.vx * 0.003;
        particle.vy += -ny * strength + pointer.vy * 0.003;
      }
    }

    function updateParticle(particle, time, step) {
      if (particle.mode === 'burst') {
        particle.life -= step * 16.67;
        particle.vy += 0.022 * step;
        particle.vx += Math.sin(time * 0.006 + particle.phase) * 0.014 * step;
        particle.x += particle.vx * step;
        particle.y += particle.vy * step;
        particle.vx *= Math.pow(0.986, step);
        particle.vy *= Math.pow(0.986, step);

        if (particle.life <= 0) {
          particle.mode = 'float';
          particle.baseVy = random(-0.82, -0.32);
          particle.vx *= 0.18;
          particle.vy = Math.min(-0.24, particle.vy * 0.22);
        }
        return;
      }

      if (particle.mode === 'orbit' && targets.length) {
        const target = targets[particle.targetIndex % targets.length];
        if (target && target.rect) {
          const rect = target.rect;
          particle.angle += particle.orbitSpeed * step;
          const pulse = Math.sin(time * 0.002 + particle.phase) * 2.2;
          const radiusX = rect.width / 2 + particle.orbitX + pulse;
          const radiusY = rect.height / 2 + particle.orbitY + pulse * 0.7;
          const destinationX = rect.centerX + Math.cos(particle.angle) * radiusX;
          const destinationY = rect.centerY + Math.sin(particle.angle) * radiusY;
          const follow = 1 - Math.pow(0.84, step);
          particle.x += (destinationX - particle.x) * follow;
          particle.y += (destinationY - particle.y) * follow;
          particle.x += Math.sin(time * 0.0025 + particle.phase) * 0.16 * step;
          return;
        }
        particle.mode = 'float';
        particle.targetIndex = -1;
      }

      particle.phase += 0.008 * step;
      const ambientWind = Math.sin(time * 0.00042 + particle.phase) * 0.0032 * particle.sway;
      particle.vx += ambientWind * step;
      particle.vy += (particle.baseVy - particle.vy) * 0.018 * step;
      updatePointerField(particle, step);

      particle.x += particle.vx * step;
      particle.y += particle.vy * step;
      particle.vx *= Math.pow(0.994, step);

      if (particle.y < -24) {
        particle.y = height + random(10, 100);
        particle.x = random(-10, width + 10);
        particle.vx = random(-0.2, 0.2);
        particle.vy = random(-0.8, -0.3);
        particle.baseVy = particle.vy;
        if (targets.length && Math.random() < (reducedMotion ? 0.04 : 0.14)) {
          particle.mode = 'orbit';
          particle.targetIndex = Math.floor(random(0, targets.length));
          particle.angle = random(0, Math.PI * 2);
        }
      }

      if (particle.x < -25) particle.x = width + 18;
      if (particle.x > width + 25) particle.x = -18;
    }

    function createClickBurst(x, y, target) {
      const amount = reducedMotion ? 16 : 52;
      const spread = reducedMotion ? 3.6 : 7.2;

      shockwaves.push({
        x,
        y,
        radius: 5,
        maxRadius: reducedMotion ? 72 : 150,
        life: 1,
        lineWidth: reducedMotion ? 1.4 : 2.2,
      });

      shockwaves.push({
        x,
        y,
        radius: 2,
        maxRadius: reducedMotion ? 42 : 92,
        life: 0.72,
        lineWidth: 1,
      });

      for (let i = 0; i < amount; i += 1) {
        const angle = (Math.PI * 2 * i) / amount + random(-0.13, 0.13);
        const speed = random(spread * 0.42, spread);
        const life = random(430, 880);
        sparks.push({
          x: x + random(-4, 4),
          y: y + random(-4, 4),
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: random(0.85, 2.1),
          alpha: random(0.58, 1),
          life,
          maxLife: life,
          phase: random(0, Math.PI * 2),
        });
      }

      // Release the particles orbiting this control, then push nearby ones outward too.
      for (const particle of particles) {
        const isAttachedToTarget = target && particle.mode === 'orbit' &&
          targets[particle.targetIndex] === target;
        const dx = particle.x - x;
        const dy = particle.y - y;
        const distance = Math.max(1, Math.hypot(dx, dy));
        const influence = isAttachedToTarget ? 1 : clamp(1 - distance / 230, 0, 1);
        if (influence <= 0) continue;

        const direction = Math.atan2(dy, dx) + random(-0.24, 0.24);
        const kick = (isAttachedToTarget ? random(4.2, 7.1) : random(1.6, 4.3)) * influence;
        particle.mode = 'burst';
        particle.targetIndex = -1;
        particle.life = random(470, 820);
        particle.maxLife = particle.life;
        particle.vx = Math.cos(direction) * kick + random(-0.55, 0.55);
        particle.vy = Math.sin(direction) * kick + random(-0.55, 0.55);
      }
    }

    function updateSparks(step) {
      for (let i = sparks.length - 1; i >= 0; i -= 1) {
        const spark = sparks[i];
        spark.life -= step * 16.67;
        spark.x += spark.vx * step;
        spark.y += spark.vy * step;
        spark.vx *= Math.pow(0.975, step);
        spark.vy *= Math.pow(0.975, step);
        spark.vy += 0.012 * step;
        if (spark.life <= 0) sparks.splice(i, 1);
      }
    }

    function drawSparks(time) {
      for (const spark of sparks) {
        const fade = clamp(spark.life / spark.maxLife, 0, 1);
        const alpha = spark.alpha * ease(fade);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.lineWidth = Math.max(0.7, spark.radius * 0.85);
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'rgba(236, 207, 255, 0.95)';
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(174, 91, 255, 0.95)';
        ctx.beginPath();
        ctx.moveTo(spark.x, spark.y);
        ctx.lineTo(spark.x - spark.vx * 2.7, spark.y - spark.vy * 2.7);
        ctx.stroke();
        ctx.fillStyle = 'rgba(250, 236, 255, 0.95)';
        ctx.beginPath();
        ctx.arc(spark.x, spark.y, spark.radius * (0.65 + fade * 0.45), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    function updateShockwaves(step) {
      for (let i = shockwaves.length - 1; i >= 0; i -= 1) {
        const wave = shockwaves[i];
        wave.radius += (wave.maxRadius / 34) * step;
        wave.life -= 0.027 * step;
        if (wave.life <= 0 || wave.radius >= wave.maxRadius) shockwaves.splice(i, 1);
      }
    }

    function drawShockwaves() {
      for (const wave of shockwaves) {
        ctx.save();
        ctx.globalAlpha = clamp(wave.life, 0, 1) * 0.7;
        ctx.lineWidth = wave.lineWidth;
        ctx.strokeStyle = 'rgba(207, 157, 255, 0.92)';
        ctx.shadowBlur = 18;
        ctx.shadowColor = 'rgba(164, 76, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }

    function drawPointerAura() {
      if (!pointer.active || reducedMotion) return;
      const radius = 46;
      const gradient = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, radius);
      gradient.addColorStop(0, 'rgba(171, 105, 255, 0.075)');
      gradient.addColorStop(1, 'rgba(171, 105, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(pointer.x, pointer.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    function getClickPoint(event, element) {
      const rect = element.getBoundingClientRect();
      const hasPointerPoint = Number.isFinite(event.clientX) && Number.isFinite(event.clientY) &&
        (event.clientX !== 0 || event.clientY !== 0);
      return hasPointerPoint
        ? { x: event.clientX, y: event.clientY }
        : { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }

    function internalDestination(anchor, event) {
      if (!anchor || !anchor.hasAttribute('href')) return null;
      if (event.defaultPrevented || event.button !== 0) return null;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;
      if (anchor.hasAttribute('download') || anchor.target === '_blank') return null;

      const rawHref = anchor.getAttribute('href') || '';
      if (!rawHref || rawHref.startsWith('#') || /^(mailto:|tel:|javascript:)/i.test(rawHref)) return null;

      let destination;
      try {
        destination = new URL(anchor.href, window.location.href);
      } catch (_error) {
        return null;
      }

      if (destination.origin !== window.location.origin) return null;
      if (destination.pathname === window.location.pathname && destination.search === window.location.search) return null;
      return destination.href;
    }

    function frame(now) {
      if (document.hidden) {
        previousFrame = now;
        requestAnimationFrame(frame);
        return;
      }

      const delta = previousFrame ? now - previousFrame : 16.67;
      const step = clamp(delta / 16.67, 0.45, 2.1);
      previousFrame = now;

      refreshTargets(now);
      if (now - pointer.movedAt > 1700) {
        pointer.active = false;
        pointer.vx *= 0.9;
        pointer.vy *= 0.9;
      }

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';
      drawPointerAura();

      for (const particle of particles) {
        updateParticle(particle, now, step);
        drawParticle(particle, now);
      }

      updateSparks(step);
      updateShockwaves(step);
      drawShockwaves();
      drawSparks(now);
      ctx.globalCompositeOperation = 'source-over';
      requestAnimationFrame(frame);
    }

    document.addEventListener('pointermove', (event) => {
      const now = performance.now();
      const elapsed = Math.max(8, now - pointer.movedAt || 16);
      pointer.vx = clamp((event.clientX - pointer.lastX) / elapsed * 16, -24, 24);
      pointer.vy = clamp((event.clientY - pointer.lastY) / elapsed * 16, -24, 24);
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.lastX = event.clientX;
      pointer.lastY = event.clientY;
      pointer.active = true;
      pointer.movedAt = now;
    }, { passive: true });

    document.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'touch') {
        pointer.x = event.clientX;
        pointer.y = event.clientY;
        pointer.active = true;
        pointer.movedAt = performance.now();
        // The following click event creates the burst; pointerdown only seeds touch tracking.
      }
    }, { passive: true });

    document.addEventListener('pointerleave', () => {
      pointer.active = false;
    });

    document.addEventListener('click', (event) => {
      const eventElement = event.target instanceof Element ? event.target : null;
      const control = eventElement && eventElement.closest('a, button, [role="button"], input[type="submit"]');
      if (!control) return;

      const point = getClickPoint(event, control);
      const target = closestTarget(point.x, point.y);
      createClickBurst(point.x, point.y, target);

      const anchor = control.closest('a[href]');
      const destination = internalDestination(anchor, event);
      if (!destination) return;

      event.preventDefault();
      // A short burst is visible before moving to the next page; no loading screen is shown.
      window.setTimeout(() => window.location.assign(destination), 390);
    }, true);

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('scroll', () => {
      lastTargetRefresh = 0;
      targets.forEach(updateTargetRect);
    }, { passive: true });

    resize();
    requestAnimationFrame(frame);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
