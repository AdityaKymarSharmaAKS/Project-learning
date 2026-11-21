/*
 * Student Hub — fireflies + rising mana motes
 *
 * Fireflies gather around every visible interactive element and card, drift
 * gently along its edge, flee from the pointer, and scatter when clicked.
 * A second layer of tiny motes continuously rises from the bottom of the page
 * and reacts to the pointer in the same way.
 *
 * The canvas never captures input. No dependencies or framework required.
 */
(() => {
  'use strict';

  const CANVAS_ID = 'hub-particle-canvas';
  const TARGET_SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'input[type="button"]',
    'input[type="submit"]',
    'input[type="reset"]',
    '[role="button"]',
    '[tabindex]:not([tabindex="-1"])',
    'summary',
    '.feature-card',
    '.section-tile',
    '.subject-card',
    '.resource-row',
    '.resource-tab',
    '.form-card',
    '.help-callout',
    '.loading-card',
    '[data-firefly]'
  ].join(',');

  const CARD_SELECTOR = [
    '.feature-card', '.section-tile', '.subject-card', '.resource-row',
    '.resource-tab', '.form-card', '.help-callout', '.loading-card', '[data-firefly]'
  ].join(',');

  const boot = () => {
    if (document.getElementById(CANVAS_ID)) return;

    const canvas = document.createElement('canvas');
    canvas.id = CANVAS_ID;
    canvas.setAttribute('aria-hidden', 'true');
    canvas.setAttribute('role', 'presentation');
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!ctx) {
      canvas.remove();
      return;
    }

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointer = {
      x: -1000,
      y: -1000,
      active: false,
      type: 'mouse',
      lastMoveAt: 0
    };

    const motes = [];
    const bursts = [];
    let targets = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let previousFrame = 0;
    let lastTargetRefresh = 0;
    let targetsDirty = true;
    let burstSequence = 0;
    let observer = null;
    const glowSprites = {};

    const random = (min, max) => min + Math.random() * (max - min);
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
    const reducedMotion = () => motionQuery.matches;
    const isSmallScreen = () => window.matchMedia('(max-width: 680px)').matches;

    function buildGlowSprites() {
      for (const [hue, rgb] of [['violet', '216, 164, 255'], ['cyan', '125, 232, 255']]) {
        const sprite = document.createElement('canvas');
        sprite.width = 64;
        sprite.height = 64;
        const spriteContext = sprite.getContext('2d');
        if (!spriteContext) continue;
        const gradient = spriteContext.createRadialGradient(32, 32, 0, 32, 32, 31);
        gradient.addColorStop(0, 'rgba(255, 250, 255, 1)');
        gradient.addColorStop(0.12, `rgba(${rgb}, 0.9)`);
        gradient.addColorStop(0.36, `rgba(${rgb}, 0.42)`);
        gradient.addColorStop(0.68, 'rgba(168, 85, 247, 0.12)');
        gradient.addColorStop(1, 'rgba(168, 85, 247, 0)');
        spriteContext.fillStyle = gradient;
        spriteContext.fillRect(0, 0, 64, 64);
        glowSprites[hue] = sprite;
      }
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const areaBasedCount = Math.round((width * height) / (reducedMotion() ? 43000 : 17500));
      const moteCount = reducedMotion()
        ? clamp(areaBasedCount, 12, 24)
        : clamp(areaBasedCount, isSmallScreen() ? 26 : 42, isSmallScreen() ? 48 : 105);

      motes.length = 0;
      for (let i = 0; i < moteCount; i += 1) motes.push(makeMote(true));
      targetsDirty = true;
      refreshTargets(performance.now(), true);
    }

    function makeMote(randomY = false) {
      const riseSpeed = random(0.22, reducedMotion() ? 0.42 : 0.78);
      return {
        x: random(0, Math.max(1, width)),
        y: randomY ? random(0, Math.max(1, height)) : height + random(8, 100),
        vx: random(-0.11, 0.11),
        vy: -riseSpeed,
        riseSpeed: -riseSpeed,
        radius: random(0.65, 1.65),
        alpha: random(0.22, 0.58),
        phase: random(0, Math.PI * 2),
        twinkle: random(0.65, 1.45),
        sway: random(0.25, 0.95),
        hue: Math.random() < 0.22 ? 'cyan' : 'violet'
      };
    }

    function makeFirefly(target, angle) {
      const rect = target.rect;
      const startX = rect ? rect.centerX : random(0, width);
      const startY = rect ? rect.centerY : random(0, height);
      return {
        target,
        x: startX,
        y: startY,
        vx: 0,
        vy: 0,
        angle,
        angleSpeed: random(-0.00042, 0.00042),
        padding: random(4, 10),
        wobble: random(0.8, 2.8),
        phase: random(0, Math.PI * 2),
        twinkle: random(1.0, 2.0),
        radius: random(1.15, 1.9),
        alpha: random(0.62, 0.96),
        hue: Math.random() < 0.27 ? 'cyan' : 'violet',
        state: 'attached',
        stateUntil: 0
      };
    }

    function isVisibleElement(element) {
      if (!element.isConnected || element.closest('[hidden], [aria-hidden="true"]')) return false;
      const style = window.getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false;
      const rect = element.getBoundingClientRect();
      return rect.width > 1 && rect.height > 1;
    }

    function measureTarget(target) {
      const rect = target.element.getBoundingClientRect();
      target.rect = {
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
        centerX: rect.left + rect.width / 2,
        centerY: rect.top + rect.height / 2
      };
    }

    function refreshTargets(now, force = false) {
      if (!force && !targetsDirty && now - lastTargetRefresh < 460) return;
      if (!force && now - lastTargetRefresh < 120) return;
      lastTargetRefresh = now;
      targetsDirty = false;

      const existing = new Map(targets.map((target) => [target.element, target]));
      const elements = Array.from(document.querySelectorAll(TARGET_SELECTOR));
      const nextTargets = [];
      const firefliesPerTarget = reducedMotion() ? 1 : (isSmallScreen() ? 1 : 2);

      for (const element of elements) {
        if (!isVisibleElement(element)) continue;
        let target = existing.get(element);
        if (!target) target = { element, rect: null, fireflies: [], isCard: element.matches(CARD_SELECTOR) };
        target.isCard = element.matches(CARD_SELECTOR);
        measureTarget(target);

        while (target.fireflies.length < firefliesPerTarget) {
          const index = target.fireflies.length;
          const angle = (Math.PI * 2 * index) / firefliesPerTarget + random(-0.35, 0.35);
          target.fireflies.push(makeFirefly(target, angle));
        }
        while (target.fireflies.length > firefliesPerTarget) target.fireflies.pop();
        nextTargets.push(target);
      }

      targets = nextTargets;
    }

    function anchorPosition(firefly, now) {
      const rect = firefly.target.rect;
      if (!rect) return { x: firefly.x, y: firefly.y };

      // The firefly rests just outside the target's edge, with a tiny drift.
      firefly.angle += firefly.angleSpeed * (reducedMotion() ? 0.35 : 1);
      const angle = firefly.angle + Math.sin(now * 0.0012 + firefly.phase) * 0.035;
      const pad = firefly.padding + Math.sin(now * 0.0018 + firefly.phase) * firefly.wobble;
      const rx = Math.max(5, rect.width / 2 + pad);
      const ry = Math.max(5, rect.height / 2 + pad * 0.82);
      return {
        x: rect.centerX + Math.cos(angle) * rx,
        y: rect.centerY + Math.sin(angle) * ry
      };
    }

    function pointerDistance(x, y) {
      const dx = x - pointer.x;
      const dy = y - pointer.y;
      return { dx, dy, distance: Math.max(0.001, Math.hypot(dx, dy)) };
    }

    function applyPointerRepel(particle, step, strength = 1) {
      if (!pointer.active) return false;
      const { dx, dy, distance } = pointerDistance(particle.x, particle.y);
      const radius = reducedMotion() ? 92 : 142;
      if (distance >= radius) return false;

      const falloff = 1 - distance / radius;
      const force = falloff * (reducedMotion() ? 0.075 : 0.24) * step * strength;
      particle.vx += (dx / distance) * force;
      particle.vy += (dy / distance) * force;
      // A little sideways curl makes the movement feel like a real insect.
      particle.vx += (-dy / distance) * force * 0.11;
      particle.vy += (dx / distance) * force * 0.11;
      return true;
    }

    function updateMote(mote, now, step) {
      mote.phase += 0.009 * step;
      mote.vx += Math.sin(mote.phase + now * 0.00022) * 0.0015 * mote.sway * step;
      // Preserve the upward stream; pointer movement can briefly push a mote aside.
      mote.vy += (mote.riseSpeed - mote.vy) * 0.012 * step;
      applyPointerRepel(mote, step, 1.0);

      const speedLimit = reducedMotion() ? 1.35 : 3.2;
      mote.vx = clamp(mote.vx, -speedLimit, speedLimit);
      mote.vy = clamp(mote.vy, -speedLimit, speedLimit);
      mote.x += mote.vx * step;
      mote.y += mote.vy * step;
      mote.vx *= 0.991;

      if (mote.y < -16) {
        mote.x = random(0, width);
        mote.y = height + random(8, 110);
        mote.vx = random(-0.1, 0.1);
        mote.vy = mote.riseSpeed = -random(0.22, reducedMotion() ? 0.42 : 0.78);
      }
      if (mote.x < -18) mote.x = width + 12;
      if (mote.x > width + 18) mote.x = -12;
    }

    function updateFirefly(firefly, now, step) {
      const wasPushed = applyPointerRepel(firefly, step, 1.2);
      // Pointer force can bend a click-scatter trajectory, but must not cancel
      // the scatter state itself while the fireflies are taking off.
      if (wasPushed && firefly.state !== 'scatter') {
        firefly.state = 'flee';
        firefly.stateUntil = Math.max(firefly.stateUntil, now + 360);
      }

      if (firefly.state === 'scatter') {
        firefly.x += firefly.vx * step;
        firefly.y += firefly.vy * step;
        firefly.vx *= 0.986;
        firefly.vy *= 0.986;
        firefly.vy += 0.003 * step;
        if (now >= firefly.stateUntil) firefly.state = 'return';
      } else if (firefly.state === 'flee') {
        firefly.x += firefly.vx * step;
        firefly.y += firefly.vy * step;
        firefly.vx *= 0.972;
        firefly.vy *= 0.972;
        if (now >= firefly.stateUntil && !wasPushed) firefly.state = 'return';
      }

      if (firefly.state === 'attached' || firefly.state === 'return') {
        const destination = anchorPosition(firefly, now);
        const speed = firefly.state === 'return' ? 0.075 : 0.13;
        const ease = Math.min(0.95, speed * step);
        firefly.x += (destination.x - firefly.x) * ease;
        firefly.y += (destination.y - firefly.y) * ease;
        firefly.vx *= 0.82;
        firefly.vy *= 0.82;
        if (Math.hypot(destination.x - firefly.x, destination.y - firefly.y) < 2.5) {
          firefly.state = 'attached';
        }
      }

      // Keep escaped fireflies on the visible field until they return to their host.
      if (firefly.x < -45) firefly.x = -40;
      if (firefly.x > width + 45) firefly.x = width + 40;
      if (firefly.y < -45) firefly.y = -40;
      if (firefly.y > height + 45) firefly.y = height + 40;
    }

    function drawGlow(x, y, radius, alpha, hue, time, phase, twinkle) {
      const flicker = 0.76 + Math.sin(time * 0.001 * twinkle + phase) * 0.2;
      const a = clamp(alpha * flicker, 0.04, 1);
      const sprite = glowSprites[hue] || glowSprites.violet;
      if (!sprite) return;
      const glowRadius = radius * (hue === 'cyan' ? 5.6 : 5.1);
      ctx.globalAlpha = a;
      ctx.drawImage(sprite, x - glowRadius, y - glowRadius, glowRadius * 2, glowRadius * 2);
      ctx.globalAlpha = 1;
    }

    function drawMote(mote, now) {
      drawGlow(mote.x, mote.y, mote.radius, mote.alpha, mote.hue, now, mote.phase, mote.twinkle);
    }

    function drawFirefly(firefly, now) {
      const radius = firefly.state === 'scatter' ? firefly.radius * 1.12 : firefly.radius;
      drawGlow(firefly.x, firefly.y, radius, firefly.alpha, firefly.hue, now, firefly.phase, firefly.twinkle);

      // Tiny wing glints make the larger fireflies feel alive without changing
      // the simple glowing-particle look of the original site.
      if (!reducedMotion() && firefly.state !== 'scatter') {
        const wingAlpha = 0.22 + Math.sin(now * 0.018 + firefly.phase) * 0.12;
        ctx.fillStyle = `rgba(238, 218, 255, ${wingAlpha})`;
        ctx.beginPath();
        ctx.ellipse(firefly.x - 2.5, firefly.y - 1.2, 1.25, 0.55, -0.35, 0, Math.PI * 2);
        ctx.ellipse(firefly.x + 2.5, firefly.y - 1.2, 1.25, 0.55, 0.35, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function addBurst(x, y, count = 42) {
      const id = ++burstSequence;
      for (let i = 0; i < count; i += 1) {
        const angle = (Math.PI * 2 * i) / count + random(-0.22, 0.22);
        const speed = random(1.5, reducedMotion() ? 2.7 : 4.8);
        bursts.push({
          id,
          x: x + random(-4, 4),
          y: y + random(-4, 4),
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: random(0.8, 2.0),
          life: 1,
          decay: random(0.018, 0.032),
          phase: random(0, Math.PI * 2)
        });
      }
    }

    function scatterTarget(target, x, y, now) {
      for (const firefly of target.fireflies) {
        const dx = firefly.x - x;
        const dy = firefly.y - y;
        let angle = Math.atan2(dy, dx);
        if (!Number.isFinite(angle) || Math.hypot(dx, dy) < 4) angle = random(0, Math.PI * 2);
        angle += random(-0.68, 0.68);
        const speed = random(2.0, reducedMotion() ? 2.8 : 4.5);
        firefly.vx = Math.cos(angle) * speed;
        firefly.vy = Math.sin(angle) * speed - random(0.25, 1.15);
        firefly.state = 'scatter';
        firefly.stateUntil = now + random(reducedMotion() ? 420 : 760, reducedMotion() ? 650 : 1250);
      }
    }

    function findClickTargets(control) {
      const matches = new Set();
      const ownTarget = targets.find((target) => target.element === control);
      if (ownTarget) matches.add(ownTarget);

      const card = control.closest(CARD_SELECTOR);
      if (card) {
        const cardTarget = targets.find((target) => target.element === card);
        if (cardTarget) matches.add(cardTarget);
      }

      // Include targets physically inside a clicked card/control, so a click
      // on a nested link releases both the card's and the link's fireflies.
      if (card) {
        for (const target of targets) {
          if (card.contains(target.element)) matches.add(target);
        }
      }
      return Array.from(matches);
    }

    function updateBursts(step) {
      for (let i = bursts.length - 1; i >= 0; i -= 1) {
        const burst = bursts[i];
        burst.x += burst.vx * step;
        burst.y += burst.vy * step;
        burst.vx *= 0.982;
        burst.vy *= 0.982;
        burst.life -= burst.decay * step;
        if (burst.life <= 0) bursts.splice(i, 1);
      }
    }

    function drawBursts() {
      ctx.globalCompositeOperation = 'lighter';
      for (const burst of bursts) {
        const alpha = clamp(burst.life, 0, 1);
        ctx.fillStyle = `rgba(226, 190, 255, ${alpha})`;
        ctx.shadowBlur = 12;
        ctx.shadowColor = 'rgba(168, 85, 247, 0.9)';
        ctx.beginPath();
        ctx.arc(burst.x, burst.y, burst.radius * (0.55 + alpha), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = 'source-over';
    }

    function getClickPoint(event, element) {
      const rect = element.getBoundingClientRect();
      const hasPointerPosition = Number.isFinite(event.clientX) && Number.isFinite(event.clientY) &&
        (event.clientX !== 0 || event.clientY !== 0);
      return hasPointerPosition
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

      const sameSite = destination.origin === window.location.origin ||
        (destination.protocol === 'file:' && window.location.protocol === 'file:');
      if (!sameSite) return null;
      if (destination.pathname === window.location.pathname && destination.search === window.location.search) return null;
      return destination.href;
    }

    function setPointer(event) {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.type = event.pointerType || 'mouse';
      pointer.active = true;
      pointer.lastMoveAt = performance.now();
    }

    document.addEventListener('pointermove', setPointer, { passive: true });
    document.addEventListener('pointerdown', setPointer, { passive: true });
    document.addEventListener('pointerleave', () => { pointer.active = false; });
    window.addEventListener('blur', () => { pointer.active = false; });

    document.addEventListener('click', (event) => {
      const control = event.target.closest(TARGET_SELECTOR);
      if (!control) return;

      const point = getClickPoint(event, control);
      const now = performance.now();
      addBurst(point.x, point.y);
      findClickTargets(control).forEach((target) => scatterTarget(target, point.x, point.y, now));

      // Scattered motes near the impact point too, like a small swarm taking off.
      for (const mote of motes) {
        const dx = mote.x - point.x;
        const dy = mote.y - point.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 78) {
          const angle = Math.atan2(dy, dx) + random(-0.35, 0.35);
          const force = (1 - distance / 78) * random(0.8, 1.7);
          mote.vx += Math.cos(angle) * force;
          mote.vy += Math.sin(angle) * force;
        }
      }

      const anchor = control.closest('a[href]');
      const destination = internalDestination(anchor, event);
      if (!destination) return;

      event.preventDefault();
      window.setTimeout(() => window.location.assign(destination), reducedMotion() ? 180 : 390);
    }, true);

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('scroll', () => { targetsDirty = true; }, { passive: true, capture: true });

    if ('MutationObserver' in window) {
      observer = new MutationObserver(() => { targetsDirty = true; });
      observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden', 'style', 'disabled'] });
    }

    if (motionQuery.addEventListener) {
      motionQuery.addEventListener('change', () => resize());
    }

    function frame(now) {
      if (document.hidden) {
        previousFrame = now;
        requestAnimationFrame(frame);
        return;
      }

      const delta = previousFrame ? now - previousFrame : 16.67;
      const step = clamp(delta / 16.67, 0.4, 2.2);
      previousFrame = now;

      if (pointer.type === 'touch' && now - pointer.lastMoveAt > 900) pointer.active = false;
      refreshTargets(now);

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';

      for (const mote of motes) {
        updateMote(mote, now, step);
        drawMote(mote, now);
      }

      for (const target of targets) {
        const rect = target.rect;
        if (!rect || rect.bottom < -55 || rect.top > height + 55 || rect.right < -55 || rect.left > width + 55) {
          // Off-screen targets keep their fireflies attached; they are drawn again on scroll.
          continue;
        }
        for (const firefly of target.fireflies) {
          updateFirefly(firefly, now, step);
          drawFirefly(firefly, now);
        }
      }

      ctx.globalCompositeOperation = 'source-over';
      updateBursts(step);
      drawBursts();
      requestAnimationFrame(frame);
    }

    buildGlowSprites();
    resize();
    requestAnimationFrame(frame);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
