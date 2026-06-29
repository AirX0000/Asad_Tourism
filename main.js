/* ============================================================
   SEVEN HEAVENS TRAVEL — JavaScript
   Features:
   - Navbar scroll behaviour
   - Scroll-reveal animations (IntersectionObserver)
   - Animated counters in stats
   - Smooth mobile menu
   - Contact form handler + toast notification
   - Parallax effect on hero
   ============================================================ */

(function () {
  'use strict';

  /* ─── NAVBAR SCROLL ─────────────────────────────────────── */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    if (window.scrollY > 60) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run on load

  /* ─── MOBILE MENU ────────────────────────────────────────── */
  const burger = document.getElementById('nav-burger');
  const navLinks = document.getElementById('nav-links');
  burger?.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
    // Animate hamburger → X
    const spans = burger.querySelectorAll('span');
    if (open) {
      spans[0].style.cssText = 'transform:translateY(6.5px) rotate(45deg)';
      spans[1].style.cssText = 'opacity:0';
      spans[2].style.cssText = 'transform:translateY(-6.5px) rotate(-45deg)';
    } else {
      spans.forEach(s => s.style.cssText = '');
    }
  });
  // Close menu when a link is clicked
  navLinks?.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      const spans = burger.querySelectorAll('span');
      spans.forEach(s => s.style.cssText = '');
    });
  });

  /* ─── SCROLL REVEAL ──────────────────────────────────────── */
  const revealEls = document.querySelectorAll('[data-reveal]');
  const revealObs = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  revealEls.forEach(el => revealObs.observe(el));

  /* ─── ANIMATED COUNTERS ──────────────────────────────────── */
  const statItems = document.querySelectorAll('.stats__item[data-count]');
  let countersStarted = false;

  function animateCounter(el, target, duration = 1800) {
    const numEl = el.querySelector('.stats__num');
    if (!numEl) return;
    const start = performance.now();
    const easeOut = t => 1 - Math.pow(1 - t, 3);
    const update = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      numEl.textContent = Math.round(easeOut(progress) * target);
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

  const statsSection = document.querySelector('.stats');
  const statsObs = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !countersStarted) {
        countersStarted = true;
        statItems.forEach(item => {
          const target = parseInt(item.dataset.count, 10);
          animateCounter(item, target);
        });
      }
    },
    { threshold: 0.5 }
  );
  if (statsSection) statsObs.observe(statsSection);

  /* ─── HERO PARALLAX ──────────────────────────────────────── */
  const heroImg = document.querySelector('.hero__img');
  if (heroImg) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      if (scrollY < window.innerHeight) {
        heroImg.style.transform = `scale(1) translateY(${scrollY * 0.25}px)`;
      }
    }, { passive: true });
  }

  /* ─── SMOOTH SCROLL for anchor links ────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80; // nav height offset
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ─── CONTACT FORM ───────────────────────────────────────── */
  const form = document.getElementById('contactForm');
  const toast = document.getElementById('toast');

  function showToast() {
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4000);
  }

  form?.addEventListener('submit', e => {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');

    // Simple validation
    const name = form.name?.value.trim();
    const phone = form.phone?.value.trim();
    if (!name || !phone) {
      // Shake invalid fields
      [form.name, form.phone].forEach(field => {
        if (field && !field.value.trim()) {
          field.style.borderColor = '#e05c5c';
          field.style.animation = 'shake 0.3s ease';
          setTimeout(() => {
            field.style.borderColor = '';
            field.style.animation = '';
          }, 600);
        }
      });
      return;
    }

    // Simulate send
    btn.disabled = true;
    btn.textContent = 'Отправляем...';
    btn.style.opacity = '0.7';

    setTimeout(() => {
      form.reset();
      btn.disabled = false;
      btn.innerHTML = 'Отправить заявку <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
      btn.style.opacity = '';
      showToast();
    }, 1200);
  });

  /* ─── DESTINATION CARDS hover tilt ──────────────────────── */
  const cards = document.querySelectorAll('.dest-card, .tour-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotateX = ((y - cy) / cy) * -4;
      const rotateY = ((x - cx) / cx) * 4;
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  /* ─── ADD SHAKE KEYFRAME dynamically ────────────────────── */
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-6px); }
      60% { transform: translateX(6px); }
      80% { transform: translateX(-3px); }
    }
  `;
  document.head.appendChild(style);

  /* ─── ACTIVE nav link on scroll ─────────────────────────── */
  const sections = document.querySelectorAll('section[id]');
  const navLinkEls = document.querySelectorAll('.nav__link:not(.nav__link--cta)');
  const activeObs = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinkEls.forEach(link => {
            link.style.fontWeight = link.getAttribute('href') === `#${id}` ? '500' : '';
          });
        }
      });
    },
    { threshold: 0.4 }
  );
  sections.forEach(s => activeObs.observe(s));
})();
