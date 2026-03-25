// ============================================================
// WROK LANDING PAGE — script.js
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // ===== Mobile Nav Toggle =====
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  function openMobileNav() {
    document.body.classList.add('mobile-nav-open');
    navToggle.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileNav() {
    document.body.classList.remove('mobile-nav-open');
    navToggle.classList.remove('active');
    document.body.style.overflow = '';
  }

  navToggle.addEventListener('click', () => {
    if (document.body.classList.contains('mobile-nav-open')) {
      closeMobileNav();
    } else {
      openMobileNav();
    }
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => closeMobileNav());
  });

  // ===== Navbar scroll effect =====
  const navbar = document.getElementById('navbar');

  function onScroll() {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ===== Active nav link highlighting =====
  const navAnchors = document.querySelectorAll('[data-nav]');
  const sections = [];

  navAnchors.forEach(a => {
    const targetId = a.getAttribute('href').substring(1);
    const section = document.getElementById(targetId);
    if (section) {
      sections.push({ el: section, link: a });
    }
  });

  function updateActiveNav() {
    const scrollY = window.scrollY + 120;
    let current = null;
    for (const s of sections) {
      if (s.el.offsetTop <= scrollY) {
        current = s;
      }
    }
    navAnchors.forEach(a => a.classList.remove('active'));
    if (current) {
      current.link.classList.add('active');
    }
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

  // ===== Scroll-triggered fade-in animations =====
  const faders = document.querySelectorAll('.fade-in');

  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -30px 0px'
  });

  faders.forEach(el => fadeObserver.observe(el));

  // ===== Feature Carousel =====
  const showcase = document.getElementById('featureShowcase');
  const slides = document.querySelectorAll('.feature-slide');
  const pills = document.querySelectorAll('.feature-pill');
  const dots = document.querySelectorAll('.feature-dot');
  const prevBtn = document.getElementById('featurePrev');
  const nextBtn = document.getElementById('featureNext');
  const featureNav = document.getElementById('featureNav');

  // Slide order matches the pill order (Auto-Scheduling, Analytics, Export, Calendar, ...)
  const slideOrder = [0, 9, 10, 1, 2, 3, 4, 8, 5, 6, 7];
  let currentSlide = 0;       // actual data-slide value of the active slide
  let autoTimer = null;
  const SLIDE_INTERVAL = 6000;
  const totalSlides = slides.length;

  // Index of currentSlide within slideOrder
  function orderIndex() {
    const i = slideOrder.indexOf(currentSlide);
    return i >= 0 ? i : 0;
  }

  // ===== Lock carousel height to tallest slide =====
  function normalizeShowcaseHeight() {
    if (!showcase || slides.length === 0) return;
    // Reset so we can measure naturally
    showcase.style.height = 'auto';
    let maxH = 0;
    // Measure each slide individually (absolute so they don't stack)
    slides.forEach(s => {
      s.style.cssText = 'position:absolute !important;top:0 !important;left:0 !important;right:0 !important;opacity:1 !important;transform:none !important;visibility:hidden !important;';
      const h = s.offsetHeight;
      if (h > maxH) maxH = h;
    });
    // Restore all inline styles
    slides.forEach(s => { s.style.cssText = ''; });
    if (maxH > 0) showcase.style.height = maxH + 'px';
  }

  normalizeShowcaseHeight();
  window.addEventListener('resize', normalizeShowcaseHeight);

  function goToSlide(index, direction) {
    const currentEl = showcase.querySelector('.feature-slide[data-slide="' + currentSlide + '"]');
    if (index === currentSlide && currentEl && currentEl.classList.contains('active')) return;

    // Wrap using slideOrder
    const curOI = slideOrder.indexOf(index);
    if (curOI < 0) return; // safety

    const dir = direction || (slideOrder.indexOf(index) > orderIndex() ? 'next' : 'prev');

    const oldEl = showcase.querySelector('.feature-slide[data-slide="' + currentSlide + '"]');
    const newEl = showcase.querySelector('.feature-slide[data-slide="' + index + '"]');
    if (!oldEl || !newEl) return;

    // Outgoing slide
    oldEl.classList.remove('active');
    oldEl.classList.add(dir === 'next' ? 'exit-left' : 'exit-right');

    // Incoming slide
    newEl.classList.remove('exit-left', 'exit-right');
    newEl.classList.add(dir === 'next' ? 'enter-right' : 'enter-left');

    // Force reflow to trigger transition
    void newEl.offsetWidth;

    newEl.classList.remove('enter-right', 'enter-left');
    newEl.classList.add('active');

    currentSlide = index;

    // Clean up old slide after transition
    setTimeout(() => {
      oldEl.classList.remove('exit-left', 'exit-right');
    }, 500);

    // Update pills
    pills.forEach(p => p.classList.remove('active'));
    const activePill = document.querySelector('.feature-pill[data-slide="' + currentSlide + '"]');
    if (activePill) {
      activePill.classList.add('active');
      // Scroll pill into view (container-only, never moves the page)
      const navWrap = featureNav ? featureNav.closest('.feature-nav-wrap') || featureNav.parentElement : null;
      if (navWrap) {
        const wrapRect = navWrap.getBoundingClientRect();
        const pillRect = activePill.getBoundingClientRect();
        if (pillRect.left < wrapRect.left || pillRect.right > wrapRect.right) {
          const scrollTarget = activePill.offsetLeft - navWrap.offsetWidth / 2 + activePill.offsetWidth / 2;
          navWrap.scrollTo({ left: scrollTarget, behavior: 'smooth' });
        }
      }
    }

    // Update dots
    dots.forEach(d => d.classList.remove('active'));
    const activeDot = document.querySelector('.feature-dot[data-slide="' + currentSlide + '"]');
    if (activeDot) activeDot.classList.add('active');
  }

  function nextSlide() {
    const nextIdx = (orderIndex() + 1) % slideOrder.length;
    goToSlide(slideOrder[nextIdx], 'next');
  }

  function prevSlide() {
    const prevIdx = (orderIndex() - 1 + slideOrder.length) % slideOrder.length;
    goToSlide(slideOrder[prevIdx], 'prev');
  }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(nextSlide, SLIDE_INTERVAL);
  }

  function stopAuto() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  // Pill clicks
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      const idx = parseInt(pill.dataset.slide, 10);
      const dir = idx > currentSlide ? 'next' : 'prev';
      goToSlide(idx, dir);
      startAuto();
    });
  });

  // Dot clicks
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.dataset.slide, 10);
      const dir = idx > currentSlide ? 'next' : 'prev';
      goToSlide(idx, dir);
      startAuto();
    });
  });

  // Arrow clicks
  if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); startAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); startAuto(); });

  // Pause on hover
  if (showcase) {
    showcase.addEventListener('mouseenter', stopAuto);
    showcase.addEventListener('mouseleave', startAuto);
  }

  // Keyboard navigation when showcase is in view
  document.addEventListener('keydown', (e) => {
    if (!showcase) return;
    const rect = showcase.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (!inView) return;

    if (e.key === 'ArrowLeft') { prevSlide(); startAuto(); }
    if (e.key === 'ArrowRight') { nextSlide(); startAuto(); }
  });

  // Touch swipe support
  if (showcase) {
    let touchStartX = 0;
    let touchEndX = 0;

    showcase.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    showcase.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) nextSlide();
        else prevSlide();
        startAuto();
      }
    }, { passive: true });
  }

  // Initialize carousel
  if (totalSlides > 0) {
    startAuto();
  }

  // ===== 3D Phone Drag (fallback for non-Three.js / mobile) =====
  const phoneFloat = document.querySelector('.phone-float');
  if (phoneFloat) {
    let isDragging = false;
    let startX = 0, startY = 0;
    let rotY = 0, rotX = 0, curRotY = 0, curRotX = 0;

    // Skip CSS drag when Three.js is handling it
    function has3D() { return document.querySelector('.hero-visual.has-3d') !== null; }

    phoneFloat.addEventListener('mousedown', (e) => {
      if (has3D() || phoneFloat.classList.contains('phone-fixed')) return;
      isDragging = true;
      startX = e.clientX; startY = e.clientY;
      phoneFloat.classList.add('dragging');
      e.preventDefault();
    });
    document.addEventListener('mousemove', (e) => {
      if (!isDragging || has3D()) return;
      rotY = curRotY + (e.clientX - startX) * 0.4;
      rotX = Math.max(-20, Math.min(20, curRotX - (e.clientY - startY) * 0.2));
      phoneFloat.style.transform = 'translateY(0) rotateY(' + rotY + 'deg) rotateX(' + rotX + 'deg)';
    });
    document.addEventListener('mouseup', () => {
      if (!isDragging || has3D()) return;
      isDragging = false;
      phoneFloat.classList.remove('dragging');
      curRotY = rotY; curRotX = rotX;
      setTimeout(() => {
        if (!isDragging && !phoneFloat.classList.contains('phone-fixed')) {
          phoneFloat.style.transition = 'transform 1s ease';
          phoneFloat.style.transform = '';
          curRotY = 0; curRotX = 0; rotY = 0; rotX = 0;
          setTimeout(() => { phoneFloat.style.transition = ''; }, 1000);
        }
      }, 3000);
    });
    // Touch
    phoneFloat.addEventListener('touchstart', (e) => {
      if (has3D() || phoneFloat.classList.contains('phone-fixed')) return;
      isDragging = true;
      startX = e.touches[0].clientX; startY = e.touches[0].clientY;
      phoneFloat.classList.add('dragging');
    }, { passive: true });
    document.addEventListener('touchmove', (e) => {
      if (!isDragging || has3D()) return;
      rotY = curRotY + (e.touches[0].clientX - startX) * 0.4;
      rotX = Math.max(-20, Math.min(20, curRotX - (e.touches[0].clientY - startY) * 0.2));
      phoneFloat.style.transform = 'translateY(0) rotateY(' + rotY + 'deg) rotateX(' + rotX + 'deg)';
    }, { passive: true });
    document.addEventListener('touchend', () => {
      if (!isDragging || has3D()) return;
      isDragging = false;
      phoneFloat.classList.remove('dragging');
      curRotY = rotY; curRotX = rotX;
      setTimeout(() => {
        if (!isDragging && !phoneFloat.classList.contains('phone-fixed')) {
          phoneFloat.style.transition = 'transform 1s ease';
          phoneFloat.style.transform = '';
          curRotY = 0; curRotX = 0; rotY = 0; rotX = 0;
          setTimeout(() => { phoneFloat.style.transition = ''; }, 1000);
        }
      }, 3000);
    });
  }

  // ===== Phone Fly Animation (desktop only) =====
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && phoneFloat && window.innerWidth > 1024) {
    gsap.registerPlugin(ScrollTrigger);

    const heroSection = document.getElementById('hero');
    const featuresSection = document.getElementById('features');
    const heroVisual = document.querySelector('.hero-visual');
    let isFixed = false;

    if (heroSection && featuresSection) {
      ScrollTrigger.create({
        trigger: heroSection,
        start: 'bottom top+=100',
        endTrigger: featuresSection,
        end: 'bottom center',
        onEnter: () => {
          if (isFixed) return;
          isFixed = true;

          // Get current position
          const rect = phoneFloat.getBoundingClientRect();

          // Take phone out of flow
          phoneFloat.classList.add('phone-fixed');
          phoneFloat.style.left = rect.left + 'px';
          phoneFloat.style.top = rect.top + 'px';
          phoneFloat.style.width = rect.width + 'px';
          if (heroVisual) heroVisual.classList.add('phone-away');
          if (heroSection) heroSection.classList.add('phone-flying');

          // Fly to right sidebar
          gsap.to(phoneFloat, {
            left: window.innerWidth - rect.width - 60,
            top: window.innerHeight * 0.2,
            scale: 0.8,
            rotation: 0,
            duration: 0.9,
            ease: 'power2.inOut',
          });
        },
        onLeaveBack: () => {
          if (!isFixed) return;
          isFixed = false;

          // Fly back to hero
          const heroRect = heroVisual ? heroVisual.getBoundingClientRect() : { left: window.innerWidth * 0.6, top: 200 };

          gsap.to(phoneFloat, {
            left: heroRect.left + (heroVisual ? heroVisual.offsetWidth / 2 - 140 : 0),
            top: heroRect.top + 20,
            scale: 1,
            duration: 0.9,
            ease: 'power2.inOut',
            onComplete: () => {
              // Restore to flow
              phoneFloat.classList.remove('phone-fixed');
              phoneFloat.style.left = '';
              phoneFloat.style.top = '';
              phoneFloat.style.width = '';
              if (heroVisual) heroVisual.classList.remove('phone-away');
              if (heroSection) heroSection.classList.remove('phone-flying');
              gsap.set(phoneFloat, { clearProps: 'all' });
            }
          });
        },
        onLeave: () => {
          if (!isFixed) return;
          isFixed = false;
          // Past features — hide phone
          gsap.to(phoneFloat, {
            opacity: 0,
            duration: 0.4,
            onComplete: () => {
              phoneFloat.classList.remove('phone-fixed');
              phoneFloat.style.left = '';
              phoneFloat.style.top = '';
              phoneFloat.style.width = '';
              phoneFloat.style.opacity = '';
              if (heroVisual) heroVisual.classList.remove('phone-away');
              if (heroSection) heroSection.classList.remove('phone-flying');
              gsap.set(phoneFloat, { clearProps: 'all' });
            }
          });
        },
        onEnterBack: () => {
          if (isFixed) return;
          isFixed = true;

          const rect = phoneFloat.getBoundingClientRect();
          phoneFloat.classList.add('phone-fixed');
          phoneFloat.style.left = (window.innerWidth - rect.width - 60) + 'px';
          phoneFloat.style.top = (window.innerHeight * 0.2) + 'px';
          phoneFloat.style.width = rect.width + 'px';
          phoneFloat.style.opacity = '1';
          if (heroVisual) heroVisual.classList.add('phone-away');
          if (heroSection) heroSection.classList.add('phone-flying');
          gsap.set(phoneFloat, { scale: 0.8 });
        },
      });
    }
  }

  // ===== FAQ Accordion =====
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question');
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      faqItems.forEach(other => other.classList.remove('open'));
      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });

  // ===== Back to Top Button =====
  const backToTop = document.getElementById('backToTop');

  if (backToTop) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 600) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }, { passive: true });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ===== Spotlight Interactive Cards =====

  // ---- 1. Schedule Card: Clickable Cells + Generate ----
  const SHIFT_CYCLE = ['morning', 'afternoon', 'night', 'off'];

  // Click any cell to cycle shift type
  document.querySelectorAll('.sc-grid-row .sc-cell').forEach(cell => {
    cell.addEventListener('click', () => {
      const current = SHIFT_CYCLE.find(s => cell.classList.contains(s)) || 'off';
      const nextIdx = (SHIFT_CYCLE.indexOf(current) + 1) % SHIFT_CYCLE.length;
      SHIFT_CYCLE.forEach(s => cell.classList.remove(s));
      cell.classList.add(SHIFT_CYCLE[nextIdx]);
    });
  });

  // Generate cascade animation
  const generateBtn = document.getElementById('scGenerateBtn');
  if (generateBtn) {
    let generating = false;

    generateBtn.addEventListener('click', () => {
      if (generating) return;
      generating = true;

      const rows = document.querySelectorAll('.sc-grid-row');
      const allCells = [];
      rows.forEach(row => {
        row.querySelectorAll('.sc-cell').forEach(cell => allCells.push(cell));
      });

      // Step 1: Clear all to "off"
      allCells.forEach(cell => {
        SHIFT_CYCLE.forEach(s => cell.classList.remove(s));
        cell.classList.remove('cell-pop');
        cell.classList.add('off');
        cell.style.opacity = '0.3';
      });

      // Step 2: Fill one-by-one after a short pause
      setTimeout(() => {
        const rowCount = rows.length;
        const colCount = 7;

        allCells.forEach((cell, i) => {
          const row = Math.floor(i / colCount);
          const col = i % colCount;
          const delay = (row * colCount + col) * 50;

          setTimeout(() => {
            // Pick random shift; guarantee at least one "off" per row
            // (force last cell of row to "off" if none yet in this row)
            const rowStart = row * colCount;
            const rowEnd = rowStart + colCount;
            const isLastInRow = (col === colCount - 1);
            let hasOffInRow = false;

            if (isLastInRow) {
              for (let j = rowStart; j < rowEnd - 1; j++) {
                if (allCells[j].classList.contains('off')) {
                  hasOffInRow = true;
                  break;
                }
              }
            }

            let shift;
            if (isLastInRow && !hasOffInRow) {
              shift = 'off';
            } else {
              // Weight: 30% morning, 25% afternoon, 20% night, 25% off
              const r = Math.random();
              if (r < 0.30) shift = 'morning';
              else if (r < 0.55) shift = 'afternoon';
              else if (r < 0.75) shift = 'night';
              else shift = 'off';
            }

            SHIFT_CYCLE.forEach(s => cell.classList.remove(s));
            cell.classList.add(shift);
            cell.style.opacity = '';

            // Trigger pop animation
            cell.classList.remove('cell-pop');
            void cell.offsetWidth; // reflow
            cell.classList.add('cell-pop');
          }, delay);
        });

        // Unlock after full cascade
        const totalDuration = allCells.length * 50 + 400;
        setTimeout(() => { generating = false; }, totalDuration);
      }, 300);
    });
  }

  // ---- 2. Chat Card: Type & Send Messages ----
  const chatField = document.getElementById('scChatField');
  const chatSendBtn = document.getElementById('scChatSend');
  const chatContainer = document.querySelector('.sc-chat');

  if (chatField && chatSendBtn && chatContainer) {
    const CANNED_REPLIES = [
      'Sounds good, I\'ll update the schedule!',
      'Thanks! See you on shift.',
      'Got it, let me check with the manager.',
      'Perfect, I\'ll confirm the swap now.',
      'No worries, we\'ll figure it out!',
    ];

    let chatCooldown = false;

    function getTimeString() {
      const now = new Date();
      let h = now.getHours();
      const m = now.getMinutes().toString().padStart(2, '0');
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      return `${h}:${m} ${ampm}`;
    }

    function createBubble(text, type) {
      const bubble = document.createElement('div');
      bubble.className = `sc-bubble ${type} bubble-enter`;
      bubble.innerHTML = `<p>${text}</p><span class="sc-chat-time">${getTimeString()}${type === 'sent' ? ' <span class="sc-chat-read">&#10003;</span>' : ''}</span>`;
      return bubble;
    }

    function scrollChatToBottom() {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function sendMessage() {
      const text = chatField.value.trim();
      if (!text || chatCooldown) return;

      chatCooldown = true;

      // Sanitize text (prevent XSS in demo)
      const safe = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');

      // Append sent bubble
      const sentBubble = createBubble(safe, 'sent');
      chatContainer.appendChild(sentBubble);
      chatField.value = '';
      scrollChatToBottom();

      // Auto-reply after 1.5s
      setTimeout(() => {
        const reply = CANNED_REPLIES[Math.floor(Math.random() * CANNED_REPLIES.length)];
        const receivedBubble = createBubble(reply, 'received');
        chatContainer.appendChild(receivedBubble);
        scrollChatToBottom();

        // Update sent bubble to show read receipt
        const sentCheck = sentBubble.querySelector('.sc-chat-read');
        if (sentCheck) sentCheck.innerHTML = '&#10003;&#10003;';
      }, 1500);

      // 2s cooldown
      setTimeout(() => { chatCooldown = false; }, 2000);
    }

    chatSendBtn.addEventListener('click', sendMessage);
    chatField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  // ---- 3. Time Off Card: Badge Toggle ----
  const BADGE_CYCLE = ['approved', 'pending', 'denied'];
  const BADGE_LABELS = { approved: 'Approved', pending: 'Pending', denied: 'Denied' };

  document.querySelectorAll('.sc-timeoff-badge').forEach(badge => {
    badge.addEventListener('click', () => {
      const current = BADGE_CYCLE.find(s => badge.classList.contains(s)) || 'approved';
      const nextIdx = (BADGE_CYCLE.indexOf(current) + 1) % BADGE_CYCLE.length;
      const next = BADGE_CYCLE[nextIdx];

      BADGE_CYCLE.forEach(s => badge.classList.remove(s));
      badge.classList.add(next);
      badge.textContent = BADGE_LABELS[next];

      // Pop animation
      badge.classList.remove('badge-pop');
      void badge.offsetWidth; // reflow
      badge.classList.add('badge-pop');
    });
  });

  // ===== Three.js 3D Phone Shell =====
  (function initPhone3D() {
    const canvas = document.getElementById('phone3d');
    const heroVisual = document.querySelector('.hero-visual');
    const phoneFloatEl = document.querySelector('.phone-float');
    if (!canvas || !heroVisual || !phoneFloatEl || !window.THREE || window.innerWidth <= 768) return;

    heroVisual.classList.add('has-3d');

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    // Phone dimensions in 3D units (matches aspect ratio of CSS phone ~300x580)
    var PW = 3.0;   // width
    var PH = 5.8;   // height
    var PD = 0.18;  // depth/thickness
    var CR = 0.42;  // corner radius

    // Create a rounded rectangle shape
    function makeRoundedRect(w, h, r) {
      var shape = new THREE.Shape();
      var hw = w / 2, hh = h / 2;
      shape.moveTo(-hw + r, -hh);
      shape.lineTo(hw - r, -hh);
      shape.quadraticCurveTo(hw, -hh, hw, -hh + r);
      shape.lineTo(hw, hh - r);
      shape.quadraticCurveTo(hw, hh, hw - r, hh);
      shape.lineTo(-hw + r, hh);
      shape.quadraticCurveTo(-hw, hh, -hw, hh - r);
      shape.lineTo(-hw, -hh + r);
      shape.quadraticCurveTo(-hw, -hh, -hw + r, -hh);
      return shape;
    }

    // Phone body (extruded rounded rect)
    var bodyShape = makeRoundedRect(PW, PH, CR);
    var bodyGeo = new THREE.ExtrudeGeometry(bodyShape, {
      depth: PD,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.04,
      bevelSegments: 4,
      curveSegments: 24
    });
    bodyGeo.center();

    var bodyMat = new THREE.MeshPhysicalMaterial({
      color: 0x1a1a2e,
      metalness: 0.75,
      roughness: 0.25,
      clearcoat: 0.4,
      clearcoatRoughness: 0.2,
      reflectivity: 0.6
    });
    var phoneMesh = new THREE.Mesh(bodyGeo, bodyMat);
    scene.add(phoneMesh);

    // Screen bezel inset on front face
    var screenW = PW - 0.36;
    var screenH = PH - 0.4;
    var screenR = 0.28;
    var screenShape = makeRoundedRect(screenW, screenH, screenR);
    var screenGeo = new THREE.ShapeGeometry(screenShape, 24);
    // The screen is transparent — it becomes a "cutout" showing the CSS phone beneath
    var screenMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
      side: THREE.FrontSide
    });
    var screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.z = PD / 2 + 0.05; // just in front of body
    phoneMesh.add(screenMesh);

    // Screen background plane (visible when phone rotates away from front)
    var screenBgGeo = new THREE.ShapeGeometry(screenShape, 24);
    var screenBgMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95,
      side: THREE.FrontSide
    });
    var screenBgMesh = new THREE.Mesh(screenBgGeo, screenBgMat);
    screenBgMesh.position.z = PD / 2 + 0.04;
    phoneMesh.add(screenBgMesh);

    // Notch on the front
    var notchGeo = new THREE.PlaneGeometry(0.7, 0.08);
    var notchMat = new THREE.MeshBasicMaterial({ color: 0x2a2a3e });
    var notchMesh = new THREE.Mesh(notchGeo, notchMat);
    notchMesh.position.set(0, screenH / 2 - 0.14, PD / 2 + 0.055);
    phoneMesh.add(notchMesh);

    // --- Schedule UI rendered as colored planes on the screen ---
    var uiGroup = new THREE.Group();
    uiGroup.position.z = PD / 2 + 0.051;
    phoneMesh.add(uiGroup);

    // Status bar
    var statusBarGeo = new THREE.PlaneGeometry(screenW - 0.1, 0.18);
    var statusBarMat = new THREE.MeshBasicMaterial({ color: 0xf8f8f8 });
    var statusBar = new THREE.Mesh(statusBarGeo, statusBarMat);
    statusBar.position.set(0, screenH / 2 - 0.25, 0);
    uiGroup.add(statusBar);

    // App bar "My Schedule"
    var appBarGeo = new THREE.PlaneGeometry(screenW - 0.1, 0.28);
    var appBarMat = new THREE.MeshBasicMaterial({ color: 0xfafafa });
    var appBar = new THREE.Mesh(appBarGeo, appBarMat);
    appBar.position.set(0, screenH / 2 - 0.52, 0);
    uiGroup.add(appBar);

    // Week nav strip
    var weekNavGeo = new THREE.PlaneGeometry(screenW - 0.1, 0.2);
    var weekNavMat = new THREE.MeshBasicMaterial({ color: 0xf0f0f0 });
    var weekNav = new THREE.Mesh(weekNavGeo, weekNavMat);
    weekNav.position.set(0, screenH / 2 - 0.78, 0);
    uiGroup.add(weekNav);

    // Schedule rows (7 days)
    var shiftColors = [
      0xFF9800, // Mon - Morning (orange)
      0xFF9800, // Tue - Morning
      0x1E88E5, // Wed - Afternoon (blue)
      0x5C6BC0, // Thu - Night (purple)
      0x1E88E5, // Fri - Afternoon
      0x9E9E9E, // Sat - Off (grey)
      0x9E9E9E  // Sun - Off
    ];
    var dayLabelsX = -screenW / 2 + 0.25;
    var shiftStartX = -screenW / 2 + 0.55;
    var shiftWidth = screenW - 0.65;
    var rowH = 0.38;
    var startY = screenH / 2 - 1.08;

    for (var i = 0; i < 7; i++) {
      var y = startY - i * (rowH + 0.06);

      // Day label block (small grey square)
      var labelGeo = new THREE.PlaneGeometry(0.3, rowH - 0.04);
      var labelMat = new THREE.MeshBasicMaterial({ color: 0xe8e8e8 });
      var labelMesh = new THREE.Mesh(labelGeo, labelMat);
      labelMesh.position.set(dayLabelsX, y, 0);
      uiGroup.add(labelMesh);

      // Shift block (colored)
      var shiftGeo = new THREE.PlaneGeometry(shiftWidth, rowH - 0.04);
      var shiftMat = new THREE.MeshBasicMaterial({ color: shiftColors[i] });
      var shiftMesh = new THREE.Mesh(shiftGeo, shiftMat);
      shiftMesh.position.set(shiftStartX + shiftWidth / 2, y, 0);
      uiGroup.add(shiftMesh);
    }

    // Bottom nav bar
    var bottomNavGeo = new THREE.PlaneGeometry(screenW - 0.1, 0.28);
    var bottomNavMat = new THREE.MeshBasicMaterial({ color: 0xfafafa });
    var bottomNav = new THREE.Mesh(bottomNavGeo, bottomNavMat);
    bottomNav.position.set(0, -screenH / 2 + 0.24, 0);
    uiGroup.add(bottomNav);

    // 4 small dots for bottom nav icons
    for (var bi = 0; bi < 4; bi++) {
      var dotGeo = new THREE.CircleGeometry(0.06, 12);
      var dotColor = bi === 0 ? 0x0D7C66 : 0xbbbbbb;
      var dotMat = new THREE.MeshBasicMaterial({ color: dotColor });
      var dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.set(-0.75 + bi * 0.5, -screenH / 2 + 0.24, 0.001);
      uiGroup.add(dot);
    }

    // Back face: dark surface with camera dot
    var backShape = makeRoundedRect(PW - 0.12, PH - 0.12, CR - 0.02);
    var backGeo = new THREE.ShapeGeometry(backShape, 24);
    var backMat = new THREE.MeshPhysicalMaterial({
      color: 0x121228,
      metalness: 0.6,
      roughness: 0.4
    });
    var backMesh = new THREE.Mesh(backGeo, backMat);
    backMesh.position.z = -(PD / 2 + 0.05);
    backMesh.rotation.y = Math.PI; // face backwards
    phoneMesh.add(backMesh);

    // Camera lens on back
    var lensGeo = new THREE.CircleGeometry(0.12, 24);
    var lensMat = new THREE.MeshPhysicalMaterial({
      color: 0x0a0a18,
      metalness: 0.9,
      roughness: 0.1,
      clearcoat: 1.0
    });
    var lensMesh = new THREE.Mesh(lensGeo, lensMat);
    lensMesh.position.set(-0.8, PH / 2 - 0.6, -(PD / 2 + 0.06));
    lensMesh.rotation.y = Math.PI;
    phoneMesh.add(lensMesh);

    // Camera lens ring
    var ringGeo = new THREE.RingGeometry(0.12, 0.16, 24);
    var ringMat = new THREE.MeshBasicMaterial({ color: 0x333355, side: THREE.DoubleSide });
    var ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.set(-0.8, PH / 2 - 0.6, -(PD / 2 + 0.065));
    ringMesh.rotation.y = Math.PI;
    phoneMesh.add(ringMesh);

    // Flash dot
    var flashGeo = new THREE.CircleGeometry(0.05, 12);
    var flashMat = new THREE.MeshBasicMaterial({ color: 0xffffcc });
    var flashMesh = new THREE.Mesh(flashGeo, flashMat);
    flashMesh.position.set(-0.8, PH / 2 - 0.35, -(PD / 2 + 0.06));
    flashMesh.rotation.y = Math.PI;
    phoneMesh.add(flashMesh);

    // Lighting
    var ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    var mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(4, 6, 8);
    scene.add(mainLight);

    var fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-4, 2, 4);
    scene.add(fillLight);

    var rimLight = new THREE.DirectionalLight(0x0D7C66, 0.35);
    rimLight.position.set(-3, 0, -5);
    scene.add(rimLight);

    var topLight = new THREE.DirectionalLight(0x4488ff, 0.15);
    topLight.position.set(0, 8, 0);
    scene.add(topLight);

    camera.position.set(0, 0, 9);

    // Sizing
    function resizeCanvas() {
      if (window.innerWidth <= 768) return;
      var rect = heroVisual.getBoundingClientRect();
      var w = rect.width;
      var h = rect.height;
      if (w === 0 || h === 0) { w = 340; h = 640; }
      canvas.width = w * Math.min(window.devicePixelRatio, 2);
      canvas.height = h * Math.min(window.devicePixelRatio, 2);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Interaction: drag to rotate
    var targetRotY = -0.12;
    var targetRotX = 0.04;
    var isDrag3D = false;
    var dragStartX = 0, dragStartY = 0;
    var dragBaseRotY = 0, dragBaseRotX = 0;

    // Use phoneFloatEl for drag events since it overlays the canvas
    phoneFloatEl.addEventListener('mousedown', function(e) {
      if (phoneFloatEl.classList.contains('phone-fixed')) return;
      isDrag3D = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      dragBaseRotY = targetRotY;
      dragBaseRotX = targetRotX;
    });
    window.addEventListener('mousemove', function(e) {
      if (!isDrag3D) return;
      targetRotY = dragBaseRotY + (e.clientX - dragStartX) * 0.008;
      targetRotX = dragBaseRotX + (e.clientY - dragStartY) * 0.005;
      targetRotX = Math.max(-0.6, Math.min(0.6, targetRotX));
    });
    window.addEventListener('mouseup', function() {
      if (!isDrag3D) return;
      isDrag3D = false;
      // Gently return to default after 3s
      setTimeout(function() {
        if (!isDrag3D) {
          targetRotY = -0.12;
          targetRotX = 0.04;
        }
      }, 3000);
    });

    // Touch support
    phoneFloatEl.addEventListener('touchstart', function(e) {
      if (phoneFloatEl.classList.contains('phone-fixed')) return;
      isDrag3D = true;
      dragStartX = e.touches[0].clientX;
      dragStartY = e.touches[0].clientY;
      dragBaseRotY = targetRotY;
      dragBaseRotX = targetRotX;
    }, { passive: true });
    window.addEventListener('touchmove', function(e) {
      if (!isDrag3D) return;
      targetRotY = dragBaseRotY + (e.touches[0].clientX - dragStartX) * 0.008;
      targetRotX = dragBaseRotX + (e.touches[0].clientY - dragStartY) * 0.005;
      targetRotX = Math.max(-0.6, Math.min(0.6, targetRotX));
    }, { passive: true });
    window.addEventListener('touchend', function() {
      if (!isDrag3D) return;
      isDrag3D = false;
      setTimeout(function() {
        if (!isDrag3D) {
          targetRotY = -0.12;
          targetRotX = 0.04;
        }
      }, 3000);
    });

    // Control screen UI visibility based on rotation
    function updateScreenVisibility() {
      // When phone is rotated significantly, hide the CSS phone screen content
      // and show the Three.js screen background instead
      var absY = Math.abs(phoneMesh.rotation.y);
      var absX = Math.abs(phoneMesh.rotation.x);
      var isFrontFacing = absY < 0.5 && absX < 0.45;

      // Screen BG should be semi-visible when phone is rotated away
      screenBgMat.opacity = isFrontFacing ? 0.0 : 0.95;
      screenMat.opacity = 0.0;

      // Also adjust the CSS phone screen opacity to fade when rotated
      var cssScreen = phoneFloatEl.querySelector('.phone-screen');
      if (cssScreen) {
        if (isFrontFacing) {
          cssScreen.style.opacity = '1';
        } else {
          // Fade CSS screen content when rotated to side/back
          var fadeAmount = Math.max(0, 1 - (absY - 0.3) * 3);
          cssScreen.style.opacity = String(Math.max(0, fadeAmount));
        }
      }
    }

    // Render loop
    var time = 0;
    function animate() {
      requestAnimationFrame(animate);
      time += 0.016;

      if (!isDrag3D) {
        // Gentle auto-sway
        var sway = Math.sin(time * 0.5) * 0.04;
        targetRotY = -0.12 + sway;
        // Slight vertical bob via position
        phoneMesh.position.y = Math.sin(time * 0.5) * 0.06;
      }

      // Smooth interpolation
      phoneMesh.rotation.y += (targetRotY - phoneMesh.rotation.y) * 0.06;
      phoneMesh.rotation.x += (targetRotX - phoneMesh.rotation.x) * 0.06;

      // Sync CSS phone transform with 3D rotation
      // The CSS phone-float already has its own bob animation; when 3D is active
      // we override with matching transforms
      var rY = phoneMesh.rotation.y * (180 / Math.PI);
      var rX = phoneMesh.rotation.x * (180 / Math.PI);
      if (!phoneFloatEl.classList.contains('phone-fixed')) {
        phoneFloatEl.style.transform = 'translateY(' + (phoneMesh.position.y * 8) + 'px) rotateY(' + rY + 'deg) rotateX(' + rX + 'deg)';
        phoneFloatEl.style.animation = 'none';
      }

      updateScreenVisibility();
      renderer.render(scene, camera);
    }
    animate();

    // Cleanup 3D when phone enters "fixed" fly mode (GSAP takes over)
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(m) {
        if (m.attributeName === 'class') {
          if (phoneFloatEl.classList.contains('phone-fixed')) {
            // GSAP is controlling position; stop 3D transform sync
            canvas.style.opacity = '0';
          } else {
            canvas.style.opacity = '1';
          }
        }
      });
    });
    observer.observe(phoneFloatEl, { attributes: true });
  })();

});
