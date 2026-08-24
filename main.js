// Firebase initialization (using compat style to support file:// protocol)
const firebaseConfig = {
  apiKey: "AIzaSyCZsGCEQP3vwTHModwLYAPmLR8l56WqrWo",
  authDomain: "seven-heavens-c4665.firebaseapp.com",
  projectId: "seven-heavens-c4665",
  storageBucket: "seven-heavens-c4665.firebasestorage.app",
  messagingSenderId: "537012112552",
  appId: "1:537012112552:web:3dffb09bd216642101c69d",
  measurementId: "G-YX310SXCXB"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function parseFirestoreDoc(d) {
  if (!d) return null;
  const id = d.name ? d.name.split('/').pop() : d.id;
  const fields = d.fields || {};
  const obj = { id };
  for (const [k, v] of Object.entries(fields)) {
    if (v.stringValue !== undefined) obj[k] = v.stringValue;
    else if (v.integerValue !== undefined) obj[k] = parseInt(v.integerValue, 10);
    else if (v.doubleValue !== undefined) obj[k] = parseFloat(v.doubleValue);
    else if (v.booleanValue !== undefined) obj[k] = v.booleanValue;
    else if (v.timestampValue !== undefined) obj[k] = v.timestampValue;
    else if (v.nullValue !== undefined) obj[k] = null;
    else if (v.arrayValue && v.arrayValue.values) {
      obj[k] = v.arrayValue.values.map(val => val.stringValue || val.integerValue || val.booleanValue || val);
    } else if (v.mapValue && v.mapValue.fields) {
      obj[k] = {};
      for (const [mk, mv] of Object.entries(v.mapValue.fields)) {
        obj[k][mk] = mv.stringValue || mv.integerValue || mv.booleanValue || mv;
      }
    }
  }
  return obj;
}

async function fetchFirestoreREST(collectionName) {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/seven-heavens-c4665/databases/(default)/documents/${collectionName}?pageSize=100`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.documents) return [];
    return data.documents.map(d => parseFirestoreDoc(d));
  } catch (e) {
    console.warn(`REST fetch error for ${collectionName}:`, e);
    return [];
  }
}

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

  /* ─── UTM PARAMETERS CAPTURE ────────────────────────────── */
  function captureUtmParams() {
    try {
      const params = new URLSearchParams(window.location.search);
      const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
      let hasUtm = false;
      const utmData = {};

      utmKeys.forEach(key => {
        const val = params.get(key);
        if (val) {
          utmData[key] = val;
          hasUtm = true;
        }
      });

      if (hasUtm) {
        sessionStorage.setItem('sh_utm_params', JSON.stringify(utmData));
      }
    } catch (e) {
      console.error("UTM Capture error:", e);
    }
  }
  captureUtmParams();

  function getStoredUtmParams() {
    try {
      const stored = sessionStorage.getItem('sh_utm_params');
      return stored ? JSON.parse(stored) : {};
    } catch(e) {
      return {};
    }
  }

  /* ─── CONTACT FORM ───────────────────────────────────────── */
  const form = document.getElementById('contactForm');
  const toast = document.getElementById('toast');

  // Auto-fill from URL parameters or saved local memory
  if (form) {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlName = urlParams.get('name') || urlParams.get('fullName') || localStorage.getItem('sh_client_name');
      const urlPhone = urlParams.get('phone') || urlParams.get('tel') || localStorage.getItem('sh_client_phone');
      const urlDest = urlParams.get('direction') || urlParams.get('dest') || urlParams.get('tour');

      if (urlName && form.name && !form.name.value) form.name.value = urlName;
      if (urlPhone && form.phone && !form.phone.value) form.phone.value = urlPhone;
      if (urlDest && form.direction) {
        const match = Array.from(form.direction.options).find(o => o.value.toLowerCase().includes(urlDest.toLowerCase()) || o.text.toLowerCase().includes(urlDest.toLowerCase()));
        if (match) form.direction.value = match.value;
      }
    } catch(e) {}
  }

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
    
    // UTM parameters processing
    const utm = getStoredUtmParams();
    let leadSource = 'Сайт Seven Heavens';
    if (utm.utm_source) {
      const srcLower = utm.utm_source.toLowerCase();
      if (srcLower.includes('insta')) leadSource = 'Instagram (Таргет)';
      else if (srcLower.includes('fb') || srcLower.includes('facebook')) leadSource = 'Facebook Ads';
      else if (srcLower.includes('google')) leadSource = 'Google Ads';
      else if (srcLower.includes('tiktok')) leadSource = 'TikTok Ads';
      else leadSource = `Сайт (${utm.utm_source})`;
    }

    let utmInfoStr = '';
    if (utm.utm_campaign) utmInfoStr += ` | Кампания: ${utm.utm_campaign}`;
    if (utm.utm_content) utmInfoStr += ` | Креатив: ${utm.utm_content}`;
    if (utm.utm_medium) utmInfoStr += ` | Метка: ${utm.utm_medium}`;

    const desc = `[С Сайта] ${direction ? direction + '. ' : ''}${message}${utmInfoStr}`;

    // Send to Firebase
    btn.disabled = true;
    const originalText = btn.innerHTML;
    
    // Add spinner and loading text
    btn.innerHTML = `<svg style="animation: spin 1s linear infinite; margin-right: 8px; width: 20px; height: 20px; display: inline-block;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Отправляем...`;
    btn.style.opacity = '0.8';

    try {
      // Создаем новый лид в Firestore
      await db.collection("leads").add({
        name: name,
        phone: phone,
        budget: 0,
        desc: desc,
        stage: 'kanban-new',
        tag: utm.utm_source ? 'Таргет' : 'Лендинг',
        source: leadSource,
        utm_source: utm.utm_source || '',
        utm_medium: utm.utm_medium || '',
        utm_campaign: utm.utm_campaign || '',
        utm_content: utm.utm_content || '',
        assignee: 'm1',
        createdAt: new Date().toISOString()
      });

      // Сохраняем для мгновенного автозаполнения в следующий раз
      try {
        localStorage.setItem('sh_client_name', name);
        localStorage.setItem('sh_client_phone', phone);
      } catch(e) {}

      // Trigger Meta (Facebook) Pixel Lead Event if installed on page
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'Lead', {
          content_name: direction || 'Заявка на тур',
          value: 0,
          currency: 'USD'
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

  /* ─── FETCH TOURS FROM FIREBASE ─────────────────────────── */
  const fetchTours = async () => {
    const gridContainer = document.getElementById('tours-grid-container');
    if (!gridContainer) return;

    try {
      let tourDocs = [];
      try {
        const querySnapshot = await Promise.race([
          db.collection("tours").get(),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2500))
        ]);
        if (querySnapshot && !querySnapshot.empty) {
          querySnapshot.forEach(doc => tourDocs.push({ id: doc.id, ...doc.data() }));
        }
      } catch(errSDK) {
        console.warn("SDK fetchTours timeout/failed, trying REST fallback:", errSDK);
        tourDocs = await fetchFirestoreREST("tours");
      }

      if (!tourDocs || tourDocs.length === 0) {
        gridContainer.innerHTML = '<div style="text-align:center; padding: 2rem; color: #64748b; width: 100%;">Туров пока нет, но скоро появятся!</div>';
        return;
      }

      let html = '';
      tourDocs.forEach(tour => {
        let badgeHtml = '';
        if (tour.badge && tour.badgeText) {
          const badgeClass = tour.badgeColor === 'gold' ? 'tour-card__badge--gold' : '';
          badgeHtml = `<div class="tour-card__badge ${badgeClass}">${escapeHtml(tour.badgeText)}</div>`;
        }
        
        let includesHtml = '';
        if (tour.includes && Array.isArray(tour.includes)) {
          const cleanIncludes = tour.includes.map(i => String(i || '').trim()).filter(Boolean);
          if (cleanIncludes.length > 0) {
            includesHtml = cleanIncludes.map(inc => `<li><svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>${escapeHtml(inc)}</li>`).join('');
          }
        }
        
        const hasDuration = Boolean(tour.duration && String(tour.duration).trim());
        const hasFlight = Boolean(tour.flight && String(tour.flight).trim());
        let metaHtml = '';
        if (hasDuration || hasFlight) {
          metaHtml = `
            <div class="tour-card__meta">
              ${hasDuration ? `<span>🗓 ${escapeHtml(tour.duration)}</span>` : ''}
              ${hasFlight ? `<span>✈ ${escapeHtml(tour.flight)}</span>` : ''}
            </div>
          `;
        }

        const priceNum = (tour.price !== undefined && tour.price !== null && tour.price !== '' && !isNaN(Number(tour.price))) ? Number(tour.price) : null;
        const priceHtml = priceNum !== null ? `от <strong>${priceNum} USD</strong>` : '<strong>По запросу</strong>';
        const imgUrl = tour.image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80';

        html += `
        <article class="tour-card revealed" data-reveal>
          <div class="tour-card__header">
            <img src="${imgUrl}" alt="${escapeHtml(tour.title || 'Тур')}" />
            ${badgeHtml}
          </div>
          <div class="tour-card__body">
            ${metaHtml}
            <h3 class="tour-card__title">${escapeHtml(tour.title || 'Без названия')}</h3>
            ${includesHtml ? `<ul class="tour-card__includes">${includesHtml}</ul>` : ''}
            <div class="tour-card__footer">
              <div class="tour-card__price">${priceHtml}</div>
              <button class="btn btn--primary btn--sm smart-contact-btn" data-destination="${escapeHtml(tour.title || '')}" data-id="${tour.id}">Забронировать</button>
            </div>
          </div>
        </article>`;
      });

      gridContainer.innerHTML = html;

      // Re-apply hover tilt to dynamically created cards
      const newCards = gridContainer.querySelectorAll('.tour-card');
      newCards.forEach(card => {
        card.classList.add('revealed');
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
        card.addEventListener('mouseleave', () => { card.style.transform = ''; });
      });

      // Re-apply smart contact buttons logic
      gridContainer.querySelectorAll('.smart-contact-btn').forEach(btn => {
        const docId = btn.dataset.id;
        btn.addEventListener('click', async () => {
          if (docId) {
            try {
              await db.collection("tours").doc(docId).update({
                clicks: firebase.firestore.FieldValue.increment(1)
              });
            } catch(e) { console.warn("Analytics tracking notice", e); }
          }

          const dest = btn.dataset.destination;
          const form = document.getElementById('contactForm');
          if (form) {
            if (dest && form.direction) {
              const options = Array.from(form.direction.options);
              const match = options.find(o => o.value === dest || o.text === dest);
              if (match) form.direction.value = match.value;
            }
          }
          const target = document.querySelector('#contact-form') || document.querySelector('#contact');
          if (target) {
            const top = target.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top, behavior: 'smooth' });
          }
        });
      });
      
      const revealEls = gridContainer.querySelectorAll('[data-reveal]');
      revealEls.forEach(el => el.classList.add('revealed'));

    } catch (error) {
      console.error("Error loading tours:", error);
      gridContainer.innerHTML = '<div style="text-align:center; padding: 2rem; color: #e05c5c; width: 100%;">Не удалось загрузить туры.</div>';
    }
  };

  fetchTours();

  /* ─── FETCH DESTINATIONS ─────────────────────────── */
  const fetchDestinations = async () => {
    const grid = document.getElementById('destinations-grid-container');
    if (!grid) return;
    try {
      let destDocs = [];
      try {
        const snap = await Promise.race([
          db.collection('destinations').get(),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2500))
        ]);
        if (snap && !snap.empty) {
          snap.forEach(doc => destDocs.push({ id: doc.id, ...doc.data() }));
        }
      } catch(errSDK) {
        destDocs = await fetchFirestoreREST("destinations");
      }

      if (!destDocs || destDocs.length === 0) {
        grid.innerHTML = '<div style="text-align:center; padding: 2rem; color: #64748b; width: 100%;">Направления пока не добавлены.</div>';
        return;
      }
      let html = '';
      let idx = 0;
      destDocs.forEach(d => {
        let classes = 'dest-card revealed';
        if (idx === 0) classes += ' dest-card--large';
        if (idx === 3) classes += ' dest-card--wide';
        html += `
        <div class="${classes}" data-reveal>
          <img src="${d.image || ''}" alt="${d.title || ''}" class="dest-card__img" />
          <div class="dest-card__overlay"></div>
          <div class="dest-card__content">
            <span class="dest-card__tag">${d.tag || 'Популярно'}</span>
            <h3 class="dest-card__title">${d.title || d.name || ''}</h3>
            <p class="dest-card__sub">${d.subtitle || ''}</p>
            <div class="dest-card__price">от <strong>${d.price || 0} USD</strong></div>
            <a href="#contact" class="dest-card__btn">Подробнее →</a>
          </div>
        </div>`;
        idx++;
      });
      grid.innerHTML = html;
      
      const newCards = grid.querySelectorAll('.dest-card');
      newCards.forEach(card => {
        card.classList.add('revealed');
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
        card.addEventListener('mouseleave', () => { card.style.transform = ''; });
      });
    } catch(e) {
      console.error("fetchDestinations error:", e);
    }
  };
  fetchDestinations();

  /* ─── FETCH REVIEWS ─────────────────────────── */
  const fetchReviews = async () => {
    const grid = document.getElementById('reviews-grid-container');
    if (!grid) return;
    try {
      let revDocs = [];
      try {
        const snap = await Promise.race([
          db.collection('reviews').get(),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2500))
        ]);
        if (snap && !snap.empty) {
          snap.forEach(doc => revDocs.push({ id: doc.id, ...doc.data() }));
        }
      } catch(errSDK) {
        revDocs = await fetchFirestoreREST("reviews");
      }

      grid.classList.add('revealed');
      if (!revDocs || revDocs.length === 0) {
        grid.innerHTML = '<div style="text-align:center; padding: 2rem; color: #64748b; width: 100%;">Отзывов пока нет.</div>';
        return;
      }
      let html = '';
      revDocs.forEach(r => {
        const stars = '★'.repeat(r.rating || 5) + '☆'.repeat(5 - (r.rating || 5));
        const authorName = r.author || r.name || 'Гость';
        const photoUrl = r.image || r.photo || r.avatar || r.avatarUrl || '';
        
        let topPhotoHtml = '';
        let avatarHtml = `<div class="review-card__avatar">${authorName[0].toUpperCase()}</div>`;
        
        if (photoUrl) {
          topPhotoHtml = `<div style="width:100%; height:210px; border-radius:12px; overflow:hidden; margin-bottom:16px; box-shadow:0 4px 12px rgba(25,31,43,0.08); border:1px solid rgba(0,0,0,0.05);"><img src="${photoUrl}" alt="${authorName}" style="width:100%; height:100%; object-fit:cover; display:block;"></div>`;
          avatarHtml = `<div class="review-card__avatar" style="padding:0; overflow:hidden; width:44px; height:44px; border-radius:50%; border:2px solid #E3E4E8;"><img src="${photoUrl}" alt="${authorName}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;"></div>`;
        }

        html += `
        <div class="review-card flex flex-col revealed">
          ${topPhotoHtml}
          <div class="review-card__stars">${stars}</div>
          <p class="review-card__text">"${r.text || ''}"</p>
          <div class="review-card__author" style="margin-top:auto;">
            ${avatarHtml}
            <div>
              <strong>${authorName}</strong>
              <span>${r.location || 'Клиент Seven Heavens'}</span>
            </div>
          </div>
        </div>`;
      });
      grid.innerHTML = html;
    } catch(e) {
      console.error("fetchReviews error:", e);
      grid.classList.add('revealed');
    }
  };
  fetchReviews();

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

  /* ─── REQUISITES MODAL POPUP ────────────────────────────── */
  const reqModal = document.getElementById('requisitesModal');
  const reqModalClose = document.getElementById('reqModalClose');
  const reqModalOverlay = document.getElementById('reqModalOverlay');
  const reqCloseBtn = document.getElementById('reqCloseBtn');
  const reqCopyBtn = document.getElementById('reqCopyBtn');
  const openReqBtns = document.querySelectorAll('.open-req-btn');

  const openReqModal = (e) => {
    if (e) e.preventDefault();
    if (!reqModal) return;
    reqModal.classList.add('open');
    reqModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeReqModal = () => {
    if (!reqModal) return;
    reqModal.classList.remove('open');
    reqModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  openReqBtns.forEach(btn => {
    btn.addEventListener('click', openReqModal);
  });

  reqModalClose?.addEventListener('click', closeReqModal);
  reqModalOverlay?.addEventListener('click', closeReqModal);
  reqCloseBtn?.addEventListener('click', closeReqModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && reqModal?.classList.contains('open')) {
      closeReqModal();
    }
  });

  // Auto open if hash is #requisites
  if (window.location.hash === '#requisites') {
    openReqModal();
  }

  // Copy requisites functionality
  reqCopyBtn?.addEventListener('click', async () => {
    const textToCopy = `ООО «Seven Heavens Travel» («SEVEN HEAVENS TRAVEL» MCHJ)
Директор: Тойиров Асадбек Хамзаевич
ИНН: 313 091 434
ОКЭД: 79110
Адрес: 100015, Узбекистан, г. Ташкент, Мирабадский р-н, ул. Мироншох 3-й проезд, 16
График работы: ПН-СБ 10:00 - 22:00 (ВС - выходной)
Телефон: +998 (88) 898-77-78
Email: travel@sevenheavens.uz
Банк: АКБ «Ипак Йули»
МФО: 00444
Р/с: 20208000707481626001`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      const prevText = reqCopyBtn.textContent;
      reqCopyBtn.textContent = '✓ Скопировано!';
      setTimeout(() => {
        reqCopyBtn.textContent = prevText;
      }, 2000);
    } catch (err) {
      console.error('Clipboard copy error:', err);
    }
  });
})();
