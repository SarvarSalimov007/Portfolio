// Remove no-js class
document.documentElement.classList.remove('no-js');

// Smooth scroll for in-page links with offset for sticky header
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const targetId = link.getAttribute('href');
    if (targetId.length > 1) {
      const el = document.querySelector(targetId);
      if (el) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = el.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
        
        // Close mobile menu if open
        const menu = document.getElementById('nav-menu');
        if (menu?.classList.contains('open')) {
          menu.classList.remove('open');
          const toggle = document.querySelector('.nav-toggle');
          if (toggle) toggle.setAttribute('aria-expanded', 'false');
        }
      }
    }
  });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
  const menu = document.getElementById('nav-menu');
  const toggle = document.querySelector('.nav-toggle');
  if (menu && toggle && !menu.contains(e.target) && !toggle.contains(e.target) && menu.classList.contains('open')) {
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }
});

// Mobile nav toggle
const toggle = document.querySelector('.nav-toggle');
const menu = document.getElementById('nav-menu');
if (toggle && menu) {
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
}

// Theme toggle (neon variants + light/dark)
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('alt-theme');
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    themeToggle.textContent = isLight ? '☀️ Light' : '🌙 Dark';
  });
  // Boshlang'ich statusini yangilash
  const initialIsLight = document.body.classList.contains('light-theme');
  themeToggle.textContent = initialIsLight ? '☀️ Light' : '🌙 Dark';
}


// Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Form validation and submission
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

  // Validation rules
  const validators = {
    name: (value) => {
      if (!value.trim()) return 'Ism kiritishingiz shart';
      if (value.trim().length < 2) return 'Ism kamida 2 belgidan iborat bo\'lishi kerak';
      if (value.trim().length > 50) return 'Ism 50 belgidan oshmasligi kerak';
      return null;
    },
    email: (value) => {
      if (!value.trim()) return 'Email kiritishingiz shart';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return 'To\'g\'ri email manzilini kiriting';
      return null;
    },
    message: (value) => {
      if (!value.trim()) return 'Xabar kiritishingiz shart';
      if (value.trim().length < 10) return 'Xabar kamida 10 belgidan iborat bo\'lishi kerak';
      if (value.trim().length > 1000) return 'Xabar 1000 belgidan oshmasligi kerak';
      return null;
    }
  };

  // Show error
  function showError(fieldName, message) {
    const field = fields[fieldName];
    const errorEl = field?.parentElement?.querySelector('.error-message');
    if (errorEl) {
      errorEl.textContent = message || '';
      field?.setAttribute('aria-invalid', message ? 'true' : 'false');
    }
  }

  // Validate field
  function validateField(fieldName) {
    const field = fields[fieldName];
    if (!field) return false;
    const validator = validators[fieldName];
    if (!validator) return true;
    const error = validator(field.value);
    showError(fieldName, error);
    return !error;
  }

  // Validate all fields
  function validateForm() {
    let isValid = true;
    Object.keys(fields).forEach(name => {
      if (!validateField(name)) isValid = false;
    });
    return isValid;
  }

  // Real-time validation
  Object.keys(fields).forEach(name => {
    const field = fields[name];
    if (field) {
      field.addEventListener('blur', () => validateField(name));
      field.addEventListener('input', () => {
        if (field.hasAttribute('aria-invalid')) {
          validateField(name);
        }
      });
    }
  });

  // Debounce function
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Show status message
  function showStatus(message, type = 'success') {
    formStatus.textContent = message;
    formStatus.className = `form-status ${type}`;
    formStatus.setAttribute('role', 'alert');
    setTimeout(() => {
      formStatus.textContent = '';
      formStatus.className = 'form-status';
    }, 5000);
  }

  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showStatus('Iltimos, barcha xatolarni tuzattingiz', 'error');
      const firstError = form.querySelector('[aria-invalid="true"]');
      if (firstError) {
        firstError.focus();
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Disable button and show loading
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    formStatus.textContent = '';
    formStatus.className = 'form-status';

    try {
      // Simulate API call (replace with actual endpoint)
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);
      
      // TODO: Replace with actual API endpoint
      // Example: const response = await fetch('/api/contact', { method: 'POST', body: JSON.stringify(data) });
      // if (!response.ok) throw new Error('Network error');
      
      // Simulate API call for demo
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showStatus('Xabar muvaffaqiyatli yuborildi! Tez orada sizga javob beraman. ✨', 'success');
      form.reset();
      
      // Clear all errors
      Object.keys(fields).forEach(name => {
        showError(name, '');
        fields[name]?.removeAttribute('aria-invalid');
      });
    } catch (error) {
      console.error('Form submission error:', error);
      showStatus('Xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko\'ring.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
    }
  });
})();

// Performance: Debounce scroll handlers
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Intersection Observer with performance optimization
const observerOptions = {
  threshold: 0.12,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '0';
      entry.target.style.transform = 'translateY(14px)';
      entry.target.animate([
        { opacity: 0, transform: 'translateY(14px)' },
        { opacity: 1, transform: 'translateY(0px)' }
      ], { 
        duration: 600, 
        easing: 'cubic-bezier(.2,.6,.2,1)', 
        fill: 'forwards' 
      });
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Observe elements with requestIdleCallback for better performance
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => {
    document.querySelectorAll('.section .title, .skill-card, .project-card, .contact-form').forEach(el => {
      observer.observe(el);
    });
  });
} else {
  setTimeout(() => {
    document.querySelectorAll('.section .title, .skill-card, .project-card, .contact-form').forEach(el => {
      observer.observe(el);
    });
  }, 100);
}

// === RGB Particle Trail + Click Burst ===
(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.getElementById('fx-canvas');
  if (!canvas || prefersReduced) return;
  const ctx = canvas.getContext('2d', { alpha: true });

  let width = 0, height = 0, dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const resize = () => {
    width = canvas.clientWidth = window.innerWidth;
    height = canvas.clientHeight = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener('resize', resize);

  // Particle pool
  const MAX_PARTICLES = 240; // hard cap
  const particles = [];
  const pool = [];
  function makeParticle(x, y, vx, vy, life, size, hueBase) {
    const p = pool.pop() || {};
    p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.life = life; p.max = life; p.size = size; p.hue = hueBase;
    particles.push(p);
  }

  let hueTicker = 0;
  const rand = (a, b) => a + Math.random() * (b - a);

  // Trail spawn (throttled for performance)
  let mx = width * 0.5, my = height * 0.5, moved = false;
  let lastSpawn = 0;
  const spawnTrail = (x, y, now) => {
    if (now - lastSpawn < 16) return; // ~60fps max
    lastSpawn = now;
    const n = 3; // particles per frame when moving
    for (let i = 0; i < n; i++) {
      const angle = rand(0, Math.PI * 2);
      const speed = rand(0.6, 2.2); // ~3x faster
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const size = rand(2, 3.2);
      const life = rand(10, 18); // ~3x shorter
      hueTicker += 8;
      makeParticle(x, y, vx, vy, life, size, hueTicker);
    }
  };

  // Click burst
  const burst = (x, y) => {
    const count = 28;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + rand(-0.12, 0.12);
      const speed = rand(3.0, 6.0); // ~3x faster
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const size = rand(2.2, 3.8);
      const life = rand(14, 24); // ~3x shorter
      hueTicker += 10;
      makeParticle(x, y, vx, vy, life, size, hueTicker);
    }
  };

  // Events
  const toCanvasCoords = (clientX, clientY) => {
    const rect = canvas.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  };
  window.addEventListener('pointermove', (e) => {
    const pos = toCanvasCoords(e.clientX, e.clientY);
    mx = pos.x; my = pos.y; moved = true;
    spawnTrail(mx, my, performance.now());
  }, { passive: true });
  window.addEventListener('pointerdown', (e) => {
    const pos = toCanvasCoords(e.clientX, e.clientY);
    burst(pos.x, pos.y);
  }, { passive: true });

  // Animation
  let lastTime = 0;
  const step = (t) => {
    if (document.hidden) { lastTime = t; requestAnimationFrame(step); return; }
    const dt = Math.min(33, t - lastTime || 16.7);
    lastTime = t;

    // Fade trails without darkening background using destination-out
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)'; // clear a bit stronger for faster fade
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';

    // Update & draw
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= dt * 0.06; // time-based decay
      if (p.life <= 0 || particles.length > MAX_PARTICLES) {
        pool.push(particles.splice(i, 1)[0]);
        continue;
      }
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.982; p.vy *= 0.982; // slight drag

      const alpha = Math.max(0, p.life / p.max);
      const size = p.size * (0.6 + 0.4 * alpha);
      const hue = (p.hue % 360);
      const color = `hsla(${hue}, 100%, 60%, ${0.24 + alpha * 0.40})`;
      const glow = `hsla(${(hue + 40) % 360}, 100%, 55%, ${0.16 + alpha * 0.28})`;

      // Outer glow
      ctx.shadowBlur = 16; // simpler glow
      ctx.shadowColor = glow;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);

  // Pause on visibility change for battery/perf
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) lastTime = performance.now();
  });
})();
