import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCZsGCEQP3vwTHModwLYAPmLR8l56WqrWo",
  authDomain: "seven-heavens-c4665.firebaseapp.com",
  projectId: "seven-heavens-c4665",
  storageBucket: "seven-heavens-c4665.firebasestorage.app",
  messagingSenderId: "537012112552",
  appId: "1:537012112552:web:3dffb09bd216642101c69d",
  measurementId: "G-YX310SXCXB"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
        
        // Close mobile menu if open before scrolling
        const navLinks = document.getElementById('nav-links');
        const burger = document.getElementById('nav-burger');
        if (navLinks && navLinks.classList.contains('open')) {
          navLinks.classList.remove('open');
          if (burger) {
            const spans = burger.querySelectorAll('span');
            spans.forEach(s => s.style.cssText = '');
            burger.setAttribute('aria-expanded', 'false');
          }
        }

        const offset = 80; // nav height offset
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ─── SMART CONTACT BUTTONS ────────────────────────────── */
  document.querySelectorAll('.smart-contact-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const dest = btn.dataset.destination;
      const ctx = btn.dataset.context;
      const form = document.getElementById('contactForm');
      if (form) {
        if (dest && form.direction) {
          // Find option and select it
          const options = Array.from(form.direction.options);
          const match = options.find(o => o.value === dest || o.text === dest);
          if (match) form.direction.value = match.value;
        }
        if (ctx && form.message) {
          form.message.value = ctx;
        }
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

  form?.addEventListener('submit', async e => {
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

    const direction = form.direction?.value || '';
    const message = form.message?.value.trim() || '';
    const desc = `[С Сайта] ${direction ? direction + '. ' : ''}${message}`;

    // Send to Firebase
    btn.disabled = true;
    const originalText = btn.innerHTML;
    
    // Add spinner and loading text
    btn.innerHTML = `<svg style="animation: spin 1s linear infinite; margin-right: 8px; width: 20px; height: 20px; display: inline-block;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Отправляем...`;
    btn.style.opacity = '0.8';

    try {
      const leadsRef = collection(db, "leads");
      const q = query(leadsRef, where("phone", "==", phone));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Лид с таким номером уже существует
        // Обновляем существующий лид, чтобы он остался у того же менеджера
        const existingLeadDoc = querySnapshot.docs[0];
        const existingData = existingLeadDoc.data();
        
        const newDesc = existingData.desc 
          + "\n\n--- НОВОЕ ОБРАЩЕНИЕ С ЛЕНДИНГА ---\n"
          + desc + "\n"
          + "Дата: " + new Date().toLocaleString("ru-RU");

        await updateDoc(doc(db, "leads", existingLeadDoc.id), {
          desc: newDesc,
          stage: 'kanban-new', // возвращаем в "Новые", чтобы менеджер увидел
          tag: 'Повторный',
          updatedAt: new Date().toISOString()
        });
      } else {
        // Создаем новый лид
        await addDoc(leadsRef, {
          name: name,
          phone: phone,
          budget: 0,
          desc: desc,
          stage: 'kanban-new',
          tag: 'Лендинг',
          source: 'Сайт Seven Heavens',
          assignee: 'm1',
          createdAt: new Date().toISOString()
        });
      }

      form.reset();
      btn.innerHTML = '<svg style="margin-right: 8px; width: 20px; height: 20px; display: inline-block;" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg> Заявка отправлена!';
      btn.style.backgroundColor = '#16a34a'; // green
      btn.style.borderColor = '#16a34a';
      btn.style.opacity = '1';
      showToast();

      setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = originalText;
        btn.style.backgroundColor = '';
        btn.style.borderColor = '';
      }, 4000);
    } catch (err) {
      console.error("Ошибка при отправке заявки:", err);
      btn.disabled = false;
      btn.innerHTML = originalText;
      btn.style.opacity = '1';
      alert('Произошла ошибка при отправке. Пожалуйста, попробуйте позже.');
    }
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

  /* ─── ADD SHAKE AND SPIN KEYFRAMES dynamically ────────────────────── */
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-6px); }
      60% { transform: translateX(6px); }
      80% { transform: translateX(-3px); }
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
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
