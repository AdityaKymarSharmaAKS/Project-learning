(() => {
  'use strict';

  const startLoader = () => {
    const loader = document.getElementById('sl-loader');
    if (!loader) return;

    const fill = document.getElementById('sl-progress-fill');
    const percent = document.getElementById('sl-percent');
    const count = document.getElementById('sl-count');
    const status = document.getElementById('sl-status');
    const particles = document.getElementById('sl-particles');

    if (!fill || !percent || !count || !status || !particles) {
      loader.classList.add('is-hidden');
      document.body.classList.remove('sl-page-loading');
      return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const minimumDuration = reducedMotion ? 450 : 1900;
    const maximumWait = 12000;
    const startTime = performance.now();
    let pageLoaded = document.readyState === 'complete';
    let finished = false;
    let currentProgress = 0;

    const messages = [
      [0, 'ESTABLISHING CONNECTION...'],
      [18, 'CONNECTING TO STUDENT HUB...'],
      [36, 'LOADING YOUR STUDY SPACE...'],
      [55, 'SYNCHRONIZING RESOURCES...'],
      [76, 'CALIBRATING HUNTER STATUS...'],
      [92, 'STABILIZING THE GATE...'],
      [100, 'SYSTEM READY. WELCOME, HUNTER.']
    ];

    const particleCount = reducedMotion ? 8 : (window.innerWidth < 600 ? 18 : 32);
    for (let i = 0; i < particleCount; i += 1) {
      const particle = document.createElement('span');
      particle.className = 'sl-loader__particle';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.animationDuration = `${5 + Math.random() * 8}s`;
      particle.style.animationDelay = `${Math.random() * 6}s`;
      const size = 1 + Math.random() * 2.5;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particles.appendChild(particle);
    }

    window.addEventListener('load', () => {
      pageLoaded = true;
    }, { once: true });

    const setMessage = (progress) => {
      let current = messages[0][1];
      for (const [threshold, message] of messages) {
        if (progress >= threshold) current = message;
      }
      status.textContent = current;
    };

    const hideLoader = () => {
      if (finished) return;
      finished = true;
      fill.style.width = '100%';
      percent.textContent = '100%';
      count.textContent = '100 / 100';
      setMessage(100);
      loader.setAttribute('aria-hidden', 'true');

      window.setTimeout(() => {
        loader.classList.add('is-hidden');
        window.setTimeout(() => {
          document.body.classList.remove('sl-page-loading');
        }, 850);
      }, reducedMotion ? 80 : 280);
    };

    const animate = (now) => {
      if (finished) return;

      const elapsed = now - startTime;
      let target;

      if (pageLoaded && elapsed >= minimumDuration) {
        target = 100;
      } else {
        // Simulated progress stops below 100% until the browser finishes loading.
        target = Math.min(92, 12 + elapsed / 28);
      }

      // Prevent a long-running external asset from trapping the user on the loader.
      if (elapsed >= maximumWait) {
        pageLoaded = true;
        target = 100;
      }

      currentProgress += (target - currentProgress) * (target >= 100 ? 0.12 : 0.055);
      if (target === 100 && currentProgress > 99.2) currentProgress = 100;

      const shown = Math.floor(currentProgress);
      fill.style.width = `${currentProgress}%`;
      fill.parentElement.setAttribute('aria-valuenow', String(shown));
      percent.textContent = `${String(shown).padStart(2, '0')}%`;
      count.textContent = `${shown} / 100`;
      setMessage(shown);

      if (currentProgress >= 100) {
        hideLoader();
        return;
      }

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startLoader, { once: true });
  } else {
    startLoader();
  }
})();
