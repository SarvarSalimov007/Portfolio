// ============================
// SARVAR SALIMOV — Portfolio JS
// Clean, Modern, Performance-first
// ============================

// Remove no-js class
document.documentElement.classList.remove('no-js');

// ========== SMOOTH SCROLL ==========
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const targetId = link.getAttribute('href');
    if (targetId.length > 1) {
      const el = document.querySelector(targetId);
      if (el) {
        e.preventDefault();
        const offset = 80;
        const top = el.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });

        // Close mobile menu
        const menu = document.getElementById('nav-menu');
        if (menu?.classList.contains('open')) {
          menu.classList.remove('open');
          document.querySelector('.nav-toggle')?.setAttribute('aria-expanded', 'false');
        }
      }
    }
  });
});

// ========== MOBILE NAV ==========
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.getElementById('nav-menu');
if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const open = navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
}
// Close menu on outside click
document.addEventListener('click', (e) => {
  if (navMenu && navToggle && !navMenu.contains(e.target) && !navToggle.contains(e.target) && navMenu.classList.contains('open')) {
    navMenu.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }
});

// ========== HEADER SCROLL EFFECT ==========
const header = document.getElementById('siteHeader');
if (header) {
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    header.classList.toggle('scrolled', scrollY > 20);
    lastScroll = scrollY;
  }, { passive: true });
}

// ========== ACTIVE NAV LINK ==========
const sections = document.querySelectorAll('.section[id]');
const navLinks = document.querySelectorAll('.main-nav a[href^="#"]');
const activateNav = () => {
  const scrollY = window.scrollY + 120;
  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');
    if (scrollY >= top && scrollY < top + height) {
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
};
window.addEventListener('scroll', activateNav, { passive: true });

// ========== THEME TOGGLE ==========
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
  // Check saved preference
  const savedTheme = localStorage.getItem('portfolio-theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
  }
  updateThemeIcon();

  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    localStorage.setItem('portfolio-theme', isLight ? 'light' : 'dark');
    updateThemeIcon();
  });
}

function updateThemeIcon() {
  if (!themeToggle) return;
  const isLight = document.body.classList.contains('light-theme');
  themeToggle.querySelector('.theme-icon').textContent = isLight ? '☀️' : '🌙';
}

// ========== FOOTER YEAR ==========
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ========== TYPING EFFECT ==========
(() => {
  const el = document.getElementById('typingText');
  if (!el) return;

  const phrases = [
    'Software Engineer',
    'Full-Stack Developer',
    'UI/UX Enthusiast',
    'Problem Solver',
    'React & Next.js',
  ];

  let phraseIdx = 0;
  let charIdx = 0;
  let deleting = false;
  let pauseEnd = 0;

  const tick = () => {
    const now = Date.now();
    if (now < pauseEnd) {
      requestAnimationFrame(tick);
      return;
    }

    const phrase = phrases[phraseIdx];

    if (!deleting) {
      charIdx++;
      el.textContent = phrase.slice(0, charIdx);
      if (charIdx === phrase.length) {
        deleting = true;
        pauseEnd = now + 2000;
      }
    } else {
      charIdx--;
      el.textContent = phrase.slice(0, charIdx);
      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        pauseEnd = now + 400;
      }
    }

    const speed = deleting ? 35 : 80;
    setTimeout(() => requestAnimationFrame(tick), speed);
  };

  requestAnimationFrame(tick);
})();

// ========== STATS COUNTER ==========
(() => {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  if (!counters.length) return;

  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target, 10);
    const duration = 2000;
    const start = performance.now();

    const update = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
})();

// ========== SKILL BARS ==========
(() => {
  const bars = document.querySelectorAll('.skill-fill[data-width]');
  if (!bars.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.width = entry.target.dataset.width + '%';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  bars.forEach(b => observer.observe(b));
})();

// ========== SCROLL REVEAL ==========
(() => {
  const items = document.querySelectorAll(
    '.section-header, .glass-card, .stat-item, .about-lead, .highlight-item, .tech-pill'
  );
  if (!items.length) return;

  items.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  // Stagger observation
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => items.forEach(el => observer.observe(el)));
  } else {
    setTimeout(() => items.forEach(el => observer.observe(el)), 100);
  }
})();

// ========== FORM VALIDATION ==========
(() => {
  const form = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const formStatus = document.getElementById('formStatus');
  if (!form || !submitBtn) return;

  const fields = {
    name: document.getElementById('name'),
    email: document.getElementById('email'),
    message: document.getElementById('message')
  };

  const validators = {
    name: (v) => {
      if (!v.trim()) return 'Ism kiritishingiz shart';
      if (v.trim().length < 2) return 'Ism kamida 2 belgidan iborat bo\'lishi kerak';
      if (v.trim().length > 50) return 'Ism 50 belgidan oshmasligi kerak';
      return null;
    },
    email: (v) => {
      if (!v.trim()) return 'Email kiritishingiz shart';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'To\'g\'ri email manzilini kiriting';
      return null;
    },
    message: (v) => {
      if (!v.trim()) return 'Xabar kiritishingiz shart';
      if (v.trim().length < 10) return 'Xabar kamida 10 belgidan iborat bo\'lishi kerak';
      if (v.trim().length > 1000) return 'Xabar 1000 belgidan oshmasligi kerak';
      return null;
    }
  };

  function showError(name, msg) {
    const field = fields[name];
    const errEl = field?.parentElement?.querySelector('.error-message');
    if (errEl) {
      errEl.textContent = msg || '';
      field?.setAttribute('aria-invalid', msg ? 'true' : 'false');
    }
  }

  function validateField(name) {
    const field = fields[name];
    if (!field) return false;
    const error = validators[name]?.(field.value);
    showError(name, error);
    return !error;
  }

  function validateAll() {
    let valid = true;
    Object.keys(fields).forEach(n => { if (!validateField(n)) valid = false; });
    return valid;
  }

  // Real-time validation
  Object.keys(fields).forEach(name => {
    const field = fields[name];
    if (field) {
      field.addEventListener('blur', () => validateField(name));
      field.addEventListener('input', () => {
        if (field.hasAttribute('aria-invalid')) validateField(name);
      });
    }
  });

  function showStatus(msg, type = 'success') {
    formStatus.textContent = msg;
    formStatus.className = `form-status ${type}`;
    formStatus.setAttribute('role', 'alert');
    setTimeout(() => {
      formStatus.textContent = '';
      formStatus.className = 'form-status';
    }, 5000);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateAll()) {
      showStatus('Iltimos, barcha maydonlarni to\'g\'ri to\'ldiring', 'error');
      const firstErr = form.querySelector('[aria-invalid="true"]');
      if (firstErr) {
        firstErr.focus();
        firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    formStatus.textContent = '';
    formStatus.className = 'form-status';

    try {
      // Simulate API call (replace with actual endpoint)
      await new Promise(resolve => setTimeout(resolve, 1500));
      showStatus('Xabar muvaffaqiyatli yuborildi! Tez orada javob beraman ✨', 'success');
      form.reset();
      Object.keys(fields).forEach(n => {
        showError(n, '');
        fields[n]?.removeAttribute('aria-invalid');
      });
    } catch (err) {
      console.error('Form error:', err);
      showStatus('Xatolik yuz berdi. Keyinroq qayta urinib ko\'ring.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
    }
  });
})();

// ========== PARTICLE EFFECT (Refined) ==========
(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.getElementById('fx-canvas');
  if (!canvas || prefersReduced) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  let width = 0, height = 0;
  const dpr = Math.min(2, window.devicePixelRatio || 1);

  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener('resize', resize);

  // Particles
  const MAX = 180;
  const particles = [];
  const pool = [];
  const rand = (a, b) => a + Math.random() * (b - a);
  let hue = 0;

  function spawn(x, y, vx, vy, life, size) {
    const p = pool.pop() || {};
    p.x = x; p.y = y; p.vx = vx; p.vy = vy;
    p.life = life; p.max = life; p.size = size; p.hue = hue;
    hue = (hue + 6) % 360;
    particles.push(p);
  }

  // Mouse trail
  let lastSpawn = 0;
  window.addEventListener('pointermove', (e) => {
    const now = performance.now();
    if (now - lastSpawn < 18) return;
    lastSpawn = now;
    for (let i = 0; i < 2; i++) {
      const a = rand(0, Math.PI * 2);
      const s = rand(0.4, 1.8);
      spawn(e.clientX, e.clientY, Math.cos(a) * s, Math.sin(a) * s, rand(12, 22), rand(1.5, 3));
    }
  }, { passive: true });

  // Click burst
  window.addEventListener('pointerdown', (e) => {
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2 + rand(-0.15, 0.15);
      const s = rand(2.5, 5);
      spawn(e.clientX, e.clientY, Math.cos(a) * s, Math.sin(a) * s, rand(16, 28), rand(2, 3.5));
    }
  }, { passive: true });

  // Render
  let lastTime = 0;
  const step = (t) => {
    if (document.hidden) { lastTime = t; requestAnimationFrame(step); return; }
    const dt = Math.min(33, t - lastTime || 16.7);
    lastTime = t;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= dt * 0.055;
      if (p.life <= 0 || particles.length > MAX) {
        pool.push(particles.splice(i, 1)[0]);
        continue;
      }
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.985;
      p.vy *= 0.985;

      const alpha = Math.max(0, p.life / p.max);
      const size = p.size * (0.5 + 0.5 * alpha);

      // Use portfolio brand colors instead of pure rainbow
      const h = p.hue;
      let color;
      if (h % 3 === 0) {
        color = `rgba(108, 99, 255, ${0.2 + alpha * 0.5})`; // primary purple
      } else if (h % 3 === 1) {
        color = `rgba(0, 212, 170, ${0.2 + alpha * 0.5})`; // accent teal
      } else {
        color = `rgba(255, 107, 157, ${0.2 + alpha * 0.4})`; // warm pink
      }

      ctx.shadowBlur = 12;
      ctx.shadowColor = color;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) lastTime = performance.now();
  });
})();
