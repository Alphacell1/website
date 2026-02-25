// ============================================================
// PETOMA LANDING PAGE — script.js
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // ===== Mobile Nav Toggle =====
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('active');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.classList.remove('active');
      document.body.style.overflow = '';
    });
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

  // ===== Animated stat counters =====
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  let statsCounted = false;

  function animateCounters() {
    statNumbers.forEach(el => {
      const target = parseInt(el.dataset.target, 10);
      const duration = 2000;
      const startTime = performance.now();

      function step(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * target);
        el.textContent = current.toLocaleString();
        if (progress < 1) {
          requestAnimationFrame(step);
        }
      }

      requestAnimationFrame(step);
    });
  }

  if (statNumbers.length > 0) {
    const statsSection = document.querySelector('.stats-bar');
    if (statsSection) {
      const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !statsCounted) {
            statsCounted = true;
            animateCounters();
            statsObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      statsObserver.observe(statsSection);
    }
  }

  // ===== Feature Carousel =====
  const showcase = document.getElementById('featureShowcase');
  const slides = document.querySelectorAll('.feature-slide');
  const pills = document.querySelectorAll('.feature-pill');
  const dots = document.querySelectorAll('.feature-dot');
  const prevBtn = document.getElementById('featurePrev');
  const nextBtn = document.getElementById('featureNext');
  const featureNav = document.getElementById('featureNav');

  let currentSlide = 0;
  let autoTimer = null;
  const SLIDE_INTERVAL = 6000;
  const totalSlides = slides.length;

  function goToSlide(index, direction) {
    if (index === currentSlide && slides[currentSlide].classList.contains('active')) return;
    if (index < 0) index = totalSlides - 1;
    if (index >= totalSlides) index = 0;

    const dir = direction || (index > currentSlide ? 'next' : 'prev');

    // Outgoing slide
    slides[currentSlide].classList.remove('active');
    slides[currentSlide].classList.add(dir === 'next' ? 'exit-left' : 'exit-right');

    // Incoming slide
    slides[index].classList.remove('exit-left', 'exit-right');
    slides[index].classList.add(dir === 'next' ? 'enter-right' : 'enter-left');

    // Force reflow to trigger transition
    void slides[index].offsetWidth;

    slides[index].classList.remove('enter-right', 'enter-left');
    slides[index].classList.add('active');

    const prevSlide = currentSlide;
    currentSlide = index;

    // Clean up old slide after transition
    setTimeout(() => {
      slides[prevSlide].classList.remove('exit-left', 'exit-right');
    }, 500);

    // Update pills
    pills.forEach(p => p.classList.remove('active'));
    if (pills[currentSlide]) {
      pills[currentSlide].classList.add('active');
      // Scroll pill into view (container-only, never moves the page)
      const pill = pills[currentSlide];
      const navWrap = featureNav ? featureNav.closest('.feature-nav-wrap') || featureNav.parentElement : null;
      if (navWrap) {
        const wrapRect = navWrap.getBoundingClientRect();
        const pillRect = pill.getBoundingClientRect();
        if (pillRect.left < wrapRect.left || pillRect.right > wrapRect.right) {
          const scrollTarget = pill.offsetLeft - navWrap.offsetWidth / 2 + pill.offsetWidth / 2;
          navWrap.scrollTo({ left: scrollTarget, behavior: 'smooth' });
        }
      }
    }

    // Update dots
    dots.forEach(d => d.classList.remove('active'));
    if (dots[currentSlide]) dots[currentSlide].classList.add('active');
  }

  function nextSlide() {
    goToSlide(currentSlide + 1, 'next');
  }

  function prevSlide() {
    goToSlide(currentSlide - 1, 'prev');
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

});
