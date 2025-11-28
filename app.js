// app.js — Combined theme, UI behaviors, forms, animations
// Author: Merged for AdhyatamBuzz

/* ===========
   Configuration
   =========== */
const API_BASE_URL = 'http://localhost:5000/api'; // change to production when ready
const PREF_KEY = 'adhyatambuzz_theme';
const LIGHT_CLASS = 'theme-light';
const TRANSITION_WRAPPER = 'theme-transition';

/* ======================
   Utility helpers
   ====================== */
function safeQuery(selector) {
  return document.querySelector(selector);
}
function safeQueryAll(selector) {
  return Array.from(document.querySelectorAll(selector));
}
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

/* ======================
   Theme + Logo behavior
   ====================== */
const ThemeLogo = (function () {
  function getSavedTheme() {
    try { return localStorage.getItem(PREF_KEY); } catch (e) { return null; }
  }
  function saveTheme(value) {
    try { localStorage.setItem(PREF_KEY, value); } catch (e) {}
  }
  function systemPrefersLight() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    const toggle = document.getElementById('theme-toggle');
    const icon = document.getElementById('theme-icon');

    if (theme === 'light') {
      root.classList.add(LIGHT_CLASS);
      if (icon) icon.textContent = '☀️';
      if (toggle) toggle.setAttribute('aria-pressed', 'true');
    } else {
      root.classList.remove(LIGHT_CLASS);
      if (icon) icon.textContent = '🌙';
      if (toggle) toggle.setAttribute('aria-pressed', 'false');
    }

    // short visual transition helper
    root.classList.add(TRANSITION_WRAPPER);
    window.setTimeout(() => root.classList.remove(TRANSITION_WRAPPER), 600);
  }

  function initThemeToggle() {
    const root = document.documentElement;
    const toggle = document.getElementById('theme-toggle');

    // apply stored or system preference
    const saved = getSavedTheme();
    if (saved === 'light' || saved === 'dark') {
      applyTheme(saved);
    } else {
      applyTheme(systemPrefersLight() ? 'light' : 'dark');
    }

    // wire toggle
    if (toggle) {
      toggle.addEventListener('click', () => {
        const isLight = root.classList.contains(LIGHT_CLASS);
        const next = isLight ? 'dark' : 'light';
        applyTheme(next);
        saveTheme(next);
      });
      toggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle.click();
        }
      });
    }
  }

  function animateLogoOnLoad() {
    try {
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        safeQueryAll('.logo').forEach(el => el.classList.add('logo-loaded'));
        return;
      }

      const logo = safeQuery('.logo');
      if (!logo) return;

      setTimeout(() => {
        logo.classList.add('logo-animate');
        setTimeout(() => {
          logo.classList.remove('logo-animate');
          logo.classList.add('logo-loaded');
        }, 900); // match CSS animation length
      }, 220);
    } catch (e) {
      console.warn('Logo animation failed', e);
    }
  }

  return {
    init() {
      initThemeToggle();
      animateLogoOnLoad();
    }
  };
})();

/* ======================
   Ticker, footer, toggles
   ====================== */
const TickerAndUI = (function () {
  const headlines = [
    "“Why do I feel lost when I have everything?”",
    "“Can spirituality and memes live in the same brain?”",
    "“My career plan changes every Sunday night.”",
    "“I want peace without becoming boring.”",
    "“I believe in something, I just do not know its name yet.”"
  ];

  let tickerIndex = 0;
  let tickerIntervalId = null;

  function updateTickerOnce() {
    const tickerText = document.getElementById('ticker-text');
    if (!tickerText) return;
    tickerText.style.opacity = 0;
    setTimeout(() => {
      tickerText.textContent = headlines[tickerIndex];
      tickerText.style.opacity = 1;
      tickerIndex = (tickerIndex + 1) % headlines.length;
    }, 200);
  }
  function startTicker() {
    updateTickerOnce();
    tickerIntervalId = setInterval(updateTickerOnce, 4500);
  }

  function setFooterYear() {
    const y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();
  }

  function wireSignToggles() {
    // Keep functions global (used by inline onclick attributes)
    window.toggleSignInForm = function () {
      const signinContainer = document.getElementById('signin-form-container');
      const signupCard = document.querySelector('.two-col > .form-card:first-child');
      if (signinContainer && signupCard) {
        signinContainer.style.display = signinContainer.style.display === 'none' ? 'block' : 'none';
        if (signinContainer.style.display === 'block') signupCard.style.display = 'none';
      }
    };

    window.toggleSignUpForm = function () {
      const signinContainer = document.getElementById('signin-form-container');
      const signupCard = document.querySelector('.two-col > .form-card:first-child');
      if (signinContainer && signupCard) {
        signupCard.style.display = signupCard.style.display === 'none' ? 'block' : 'none';
        if (signupCard.style.display === 'block') signinContainer.style.display = 'none';
      }
    };
  }

  return {
    init() {
      startTicker();
      setFooterYear();
      wireSignToggles();
    },
    stopTicker() {
      if (tickerIntervalId) clearInterval(tickerIntervalId);
    }
  };
})();

/* ======================
   Forms Handling (fetch)
   ====================== */
const Forms = (function () {
  async function postJson(path, payload) {
    const url = `${API_BASE_URL}${path}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, json };
  }

  function showPremiumSuccessModal(title, message, name = '') {
    // Create modal HTML
    const modalHTML = `
      <div id="premium-modal-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(5px); display: flex; align-items: center; justify-content: center; z-index: 9999; animation: fadeIn 0.3s ease-out;">
        <div style="background: linear-gradient(135deg, rgba(15, 24, 41, 0.95), rgba(20, 32, 51, 0.9)); border: 1px solid rgba(0, 245, 255, 0.3); border-radius: 2rem; padding: 3rem 2rem; max-width: 500px; width: 90%; box-shadow: 0 30px 80px rgba(0, 245, 255, 0.2), 0 0 60px rgba(0, 245, 255, 0.1); backdrop-filter: blur(10px); animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);">
          
          <!-- Decorative top glow -->
          <div style="position: absolute; top: -30px; left: 50%; transform: translateX(-50%); width: 60px; height: 60px; background: radial-gradient(circle, rgba(0, 245, 255, 0.4), transparent); border-radius: 50%; pointer-events: none;"></div>
          
          <!-- Title -->
          <h2 style="font-size: 1.8rem; font-weight: 800; background: linear-gradient(135deg, #00f5ff, #ff5aa6); -webkit-background-clip: text; background-clip: text; color: transparent; margin-bottom: 1rem; text-align: center;">
            ${title}
          </h2>
          
          <!-- Message -->
          <p style="font-size: 1rem; color: #f7f9fb; line-height: 1.8; text-align: center; margin-bottom: 2rem;">
            ${message}
          </p>
          
          <!-- Confetti animation -->
          <div style="text-align: center; margin-bottom: 2rem; font-size: 3rem;">
            🎉 ✨ 🎊
          </div>
          
          <!-- Success button -->
          <button onclick="document.getElementById('premium-modal-overlay').remove()" style="width: 100%; padding: 1rem; background: linear-gradient(135deg, #00f5ff, #ff5aa6); color: #141829; border: none; border-radius: 1rem; font-weight: 700; font-size: 1rem; cursor: pointer; box-shadow: 0 12px 40px rgba(0, 245, 255, 0.3); transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);" onmouseover="this.style.boxShadow='0 16px 48px rgba(0, 245, 255, 0.4)'; this.style.transform='translateY(-3px) scale(1.02)';" onmouseout="this.style.boxShadow='0 12px 40px rgba(0, 245, 255, 0.3)'; this.style.transform='translateY(0) scale(1)';">
            Continue Exploring 🚀
          </button>
          
          <!-- Bottom accent line -->
          <div style="margin-top: 1.5rem; height: 2px; background: linear-gradient(90deg, transparent, rgba(0, 245, 255, 0.5), transparent); border-radius: 1px;"></div>
        </div>
      </div>
      
      <style>
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      </style>
    `;

    // Insert modal into page
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Auto-close after 4 seconds
    setTimeout(() => {
      const overlay = document.getElementById('premium-modal-overlay');
      if (overlay) {
        overlay.style.animation = 'fadeOut 0.3s ease-out forwards';
        setTimeout(() => overlay.remove(), 300);
      }
    }, 4000);
  }

  function wireYouthConnect() {
    const youthConnectForm = document.querySelector('form[data-form="youth-connect"]');
    if (!youthConnectForm) return;

    youthConnectForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const form = this;
      const formData = {
        name: form.querySelector('[name="name"]').value,
        email: form.querySelector('[name="email"]').value,
        campus: form.querySelector('[name="campus"]').value,
        city: form.querySelector('[name="city"]').value,
        address: form.querySelector('[name="address"]').value,
        thought: form.querySelector('[name="thought"]').value,
      };

      try {
        // Save to localStorage
        const thoughts = JSON.parse(localStorage.getItem('youthThoughts') || '[]');
        thoughts.push({...formData, timestamp: new Date().toISOString()});
        localStorage.setItem('youthThoughts', JSON.stringify(thoughts));
        
        // Also try to submit to server
        const { ok, json } = await postJson('/youth-connect', formData);
        
        alert('Your thought has been submitted successfully! Thank you for sharing.');
        form.reset();
        
        // Reload portfolio if it exists
        if(window.loadPortfolio) window.loadPortfolio();
      } catch (err) {
        console.error(err);
        // Still save locally even if server fails
        alert('Your thought has been saved! Thank you for sharing.');
      }
    });
  }

  function wireSignup() {
    const signupForm = document.querySelector('form[data-form="signup"]');
    if (!signupForm) return;

    signupForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const form = this;
      
      const fullName = form.querySelector('[name="fullName"]').value.trim();
      const email = form.querySelector('[name="email"]').value.trim();
      const password = form.querySelector('[name="password"]').value;
      const confirmPassword = form.querySelector('[name="confirmPassword"]').value;
      const campus = form.querySelector('[name="campus"]').value.trim();
      const city = form.querySelector('[name="city"]').value.trim();

      // Validation
      if (!fullName) {
        alert('❌ Please enter your full name');
        return;
      }

      if (!email) {
        alert('❌ Please enter your email address');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert('❌ Please enter a valid email address');
        return;
      }

      if (!password) {
        alert('❌ Please enter a password');
        return;
      }

      if (password.length < 6) {
        alert('❌ Password must be at least 6 characters');
        return;
      }

      if (password !== confirmPassword) {
        alert('❌ Passwords do not match');
        return;
      }

      try {
        // Get existing accounts
        let accounts = [];
        const accountsData = localStorage.getItem('userAccounts');
        if (accountsData) {
          accounts = JSON.parse(accountsData);
        }

        // Check if account exists
        const exists = accounts.some(acc => acc.email === email);
        if (exists) {
          alert('❌ An account with this email already exists');
          return;
        }

        // Create new account
        const newAccount = {
          id: 'user_' + Date.now(),
          fullName: fullName,
          email: email,
          password: btoa(password), // Simple encoding
          campus: campus || '',
          city: city || '',
          createdAt: new Date().toISOString(),
          verified: false
        };

        // Save account
        accounts.push(newAccount);
        localStorage.setItem('userAccounts', JSON.stringify(accounts));

        // Set as logged in
        localStorage.setItem('currentUser', JSON.stringify({
          id: newAccount.id,
          fullName: fullName,
          email: email
        }));

        console.log('✅ Account created successfully');
        alert('✨ Account created successfully!\n\n👋 Welcome ' + fullName + '!\n\nYour account has been created.');

        form.reset();

        // Optional: scroll to auth section
        scrollToSection('auth');

      } catch (error) {
        console.error('Signup error:', error);
        alert('❌ Error creating account: ' + error.message);
      }
    });
  }

  function wireSignin() {
    const signinForm = document.querySelector('form[data-form="signin"]');
    if (!signinForm) return;

    signinForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const form = this;
      const email = form.querySelector('[name="email"]').value.trim();
      const password = form.querySelector('[name="password"]').value;
      const remember = !!form.querySelector('[name="remember"]').checked;

      if (!email || !password) {
        alert('❌ Please enter email and password');
        return;
      }

      try {
        // Get accounts
        const accountsData = localStorage.getItem('userAccounts');
        const accounts = accountsData ? JSON.parse(accountsData) : [];

        // Find matching account
        const account = accounts.find(acc => acc.email === email && acc.password === btoa(password));

        if (account) {
          // Set as logged in
          localStorage.setItem('currentUser', JSON.stringify({
            id: account.id,
            fullName: account.fullName,
            email: account.email
          }));

          if (remember) {
            localStorage.setItem('rememberUser', 'true');
          }

          // Show premium success modal
          showPremiumSuccessModal('✨ Welcome Back!', 'Welcome back, <strong>' + account.fullName + '</strong>! 🙌<br><br>You\'ve successfully signed in. Explore the AdhyatamBuzz community and share your wisdom.', account.fullName);
          
          form.reset();
          
          // Scroll after modal closes
          setTimeout(() => scrollToSection('auth'), 500);
        } else {
          alert('❌ Invalid email or password');
        }

      } catch (error) {
        console.error('Sign in error:', error);
        alert('❌ Error signing in: ' + error.message);
      }
    });
  }

  function wireDonation() {
    const donationForm = document.querySelector('form[data-form="donation"]');
    if (!donationForm) return;

    donationForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const form = this;
      const formData = {
        name: form.querySelector('[name="donationName"]').value,
        amount: form.querySelector('[name="amount"]').value,
        message: form.querySelector('[name="message"]').value,
      };

      try {
        const { ok, json } = await postJson('/donation', formData);
        if (ok) {
          alert('Thank you for your donation! Redirecting to payment...');
          if (json.paymentUrl) window.location.href = json.paymentUrl;
        } else {
          alert('Error: ' + (json.message || 'Failed to process donation'));
        }
      } catch (err) {
        console.error(err);
        alert('Error processing donation. Please try again.');
      }
    });
  }

  function wireForgotPassword() {
    const forgotForm = document.querySelector('form[data-form="forgot"]');
    if (!forgotForm) return;

    forgotForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const form = this;
      const email = form.querySelector('[name="email"]').value.trim();
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;

      if (!email) {
        alert('❌ Please enter your email address');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert('❌ Please enter a valid email address');
        return;
      }

      try {
        // Check if account exists
        const accountsData = localStorage.getItem('userAccounts');
        const accounts = accountsData ? JSON.parse(accountsData) : [];
        const accountExists = accounts.some(acc => acc.email === email);

        if (!accountExists) {
          alert('❌ No account found with this email address');
          return;
        }

        // Show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = '⏳ Sending...';

        // Simulate sending reset email
        setTimeout(() => {
          try {
            // Create reset token (valid for 30 minutes)
            const resetToken = 'reset_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
            const resetData = {
              token: resetToken,
              email: email,
              timestamp: new Date().toISOString(),
              expires: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
            };

            // Store reset token
            localStorage.setItem('pwReset_' + email, JSON.stringify(resetData));

            console.log('✅ Password reset token created for:', email);

            // Show success message
            alert('✨ Password reset instructions sent!\n\n📧 Check your email (or in this demo, use the token below):\n\nToken: ' + resetToken.substring(0, 15) + '...\n\nNote: In production, an actual email would be sent with a reset link.\n\n💡 For demo purposes, you can create a new password by signing in again.');

            submitBtn.disabled = false;
            submitBtn.textContent = originalText;

            // Reset form
            form.reset();

            // Optionally switch back to signin after delay
            setTimeout(() => {
              // Switch back to signin tab if switchTab function exists
              if (typeof switchTab !== 'undefined') {
                switchTab('signin');
              }
            }, 1000);

          } catch (error) {
            console.error('Reset email sending error:', error);
            alert('❌ Error sending reset email: ' + error.message);
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
          }
        }, 1500);

      } catch (error) {
        console.error('Forgot password error:', error);
        alert('❌ Error: ' + error.message);
      }
    });
  }

  return {
    init() {
      wireYouthConnect();
      wireSignup();
      wireSignin();
      wireForgotPassword();
      wireDonation();
    }
  };
})();

/* ======================
   Animations & UI extras
   ====================== */
const UIAnimations = (function () {
  // Particles
  function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;

    const particleEmojis = [
      { emoji: '😊', className: 'smiley-neon' },
      { emoji: '😌', className: 'smiley-calm' },
    ];
    const particleCount = Math.random() > 0.5 ? 10 : 8;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      const selected = particleEmojis[Math.floor(Math.random() * particleEmojis.length)];
      particle.textContent = selected.emoji;
      particle.classList.add(selected.className);

      const startX = Math.random() * 100;
      const duration = 15 + Math.random() * 10;
      const delay = Math.random() * 5;
      const tx = (Math.random() - 0.5) * 100;

      particle.style.left = startX + '%';
      particle.style.bottom = '-10%';
      particle.style.setProperty('--tx', tx + 'px');
      particle.style.animationDuration = duration + 's';
      particle.style.animationDelay = delay + 's';
      container.appendChild(particle);
    }
  }

  // Intersection Observer for fade-ins
  function setupScrollAnimations() {
    if (!('IntersectionObserver' in window)) return;
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -100px 0px' };
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const t = entry.target;
        if (t.tagName === 'SECTION') t.classList.add('fade-in-section');
        const headings = t.querySelectorAll('h1, h2, h3');
        headings.forEach((h, i) => {
          h.classList.add('fade-in-heading');
          h.style.animationDelay = (i * 0.1) + 's';
        });
        obs.unobserve(t);
      });
    }, observerOptions);

    document.querySelectorAll('section, .card').forEach(el => observer.observe(el));
  }

  // Card mouse tracking
  function setupCardHoverEffects() {
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mx', (x / rect.width) * 100 + '%');
        card.style.setProperty('--my', (y / rect.height) * 100 + '%');
      });
      card.addEventListener('mouseleave', () => {
        card.style.setProperty('--mx', '50%');
        card.style.setProperty('--my', '50%');
      });
    });
  }

  // Button ripple
  function setupButtonAnimations() {
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('click', function (e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        Object.assign(ripple.style, {
          width: size + 'px',
          height: size + 'px',
          left: x + 'px',
          top: y + 'px',
          position: 'absolute',
          background: 'rgba(255,255,255,0.35)',
          borderRadius: '50%',
          pointerEvents: 'none',
          transform: 'scale(0)',
          opacity: '0.9',
          transition: 'transform .6s ease-out, opacity .6s ease-out'
        });

        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);

        requestAnimationFrame(() => {
          ripple.style.transform = 'scale(3.8)';
          ripple.style.opacity = '0';
        });

        setTimeout(() => ripple.remove(), 650);
      });
    });
  }

  // Parallax hero
  function setupParallax() {
    const heroVisual = document.querySelector('.hero-visual');
    if (!heroVisual) return;
    // throttle with requestAnimationFrame
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrolled = window.pageYOffset;
        heroVisual.style.transform = 'translateY(' + (scrolled * 0.12) + 'px)';
        ticking = false;
      });
    });
  }

  /* ===== Inserted: Bookshelf animations & 3D tilt =====
     This function initializes entrance, stagger, tilt and touch handling.
  */
  function initBookshelfAnimations() {
    // Entrance + IntersectionObserver
    const shelf = document.querySelector('.shelf-row');
    if (!shelf) return;

    const cards = Array.from(shelf.querySelectorAll('.book-card'));
    if (!cards.length) return;

    // Add entrance class immediately so CSS hides them initially
    cards.forEach(c => c.classList.add('book-entrance'));

    // Staggered entrance when shelf scrolls into view
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          // reveal cards with stagger
          cards.forEach((card, i) => {
            setTimeout(() => card.classList.add('show'), i * 110);
          });
          obs.unobserve(entry.target);
        });
      }, { threshold: 0.18, rootMargin: '0px 0px -60px 0px' });

      io.observe(shelf);
    } else {
      // fallback: reveal immediately with small stagger
      cards.forEach((card, i) => setTimeout(() => card.classList.add('show'), i * 110));
    }

    // Mouse-based tilt + parallax inside each card
    function onPointerMove(e) {
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;   // 0..1
      const py = (e.clientY - rect.top) / rect.height;   // 0..1

      // map to rotation: center = 0, edges = +/- tilt
      const maxTilt = 10; // degrees
      const rx = (py - 0.5) * -maxTilt; // rotateX (invert so pointer down tilts toward user)
      const ry = (px - 0.5) * maxTilt;  // rotateY

      const depth = 12; // small translateZ for pop
      card.style.transform = `perspective(900px) translateZ(${depth}px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.006)`;
      // Slightly tweak boxShadow to feel depth
      card.style.boxShadow = `0 28px 60px rgba(2,6,23,0.58), ${((Math.abs(rx) + Math.abs(ry)) / 30) * 10}px 10px 30px rgba(0,245,255,0.02)`;
    }

    function onPointerLeave(e) {
      const card = e.currentTarget;
      card.style.transform = '';
      card.style.boxShadow = '';
    }

    // Add handlers only on non-touch large-screen devices
    const supportsTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (!supportsTouch) {
      cards.forEach(card => {
        card.addEventListener('mousemove', onPointerMove);
        card.addEventListener('mouseleave', onPointerLeave);
        card.addEventListener('touchstart', onPointerLeave, { passive: true }); // ensure no stuck transforms on hybrid devices
      });
    } else {
      // For touch devices, enable horizontal scroll variant if viewport is narrow
      if (window.innerWidth < 700) {
        shelf.classList.add('shelf-scroll');
      }
    }

    // Optional: keyboard focus effect — slight lift when focused
    cards.forEach(card => {
      card.setAttribute('tabindex', '0'); // make focusable
      card.addEventListener('focus', () => card.classList.add('show'));
      card.addEventListener('blur', () => {/* no-op */});
    });
  }

  return {
    init() {
      createParticles();
      setupScrollAnimations();
      setupCardHoverEffects();
      setupButtonAnimations();
      setupParallax();
      initBookshelfAnimations(); // <-- bookshelf initialization wired here
      // add ripple keyframes to head (only once)
      if (!document.getElementById('ripple-keyframes')) {
        const style = document.createElement('style');
        style.id = 'ripple-keyframes';
        style.textContent = `@keyframes ripple { to { transform: scale(4); opacity: 0; } }`;
        document.head.appendChild(style);
      }
    },
    // expose bookshelf init if you ever need to re-run it
    initBookshelfAnimations
  };
})();

/* ======================
   Boot sequence
   ====================== */
document.addEventListener('DOMContentLoaded', () => {
  try {
    // Core UI
    ThemeLogo.init();
    TickerAndUI.init();

    // Forms (wires submit handlers if present)
    Forms.init();

    // Enhanced UI animations & interactions (includes bookshelf)
    UIAnimations.init();

    // Optional console indicator
    console.log('✨ AdhyatamBuzz app initialized');
  } catch (err) {
    console.error('Initialization error', err);
  }
});


// Recreate particles on resize if none exist (light safeguard)
window.addEventListener('resize', () => {
  if (!document.querySelectorAll('.particle').length) {
    try { UIAnimations.init(); } catch (e) {}
  }
});

/* ======================
   Newsletter Subscription
   ====================== */
function subscribeToNewsletter() {
  const emailInput = document.getElementById('newsletterEmail');
  const subscribeBtn = document.getElementById('subscribeBtn');
  const messageDiv = document.getElementById('subscribeMessage');
  const email = emailInput.value.trim();

  // Reset message
  messageDiv.style.display = 'none';

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    showSubscribeMessage('Please enter your email address', 'error', messageDiv);
    return;
  }

  if (!emailRegex.test(email)) {
    showSubscribeMessage('Please enter a valid email address', 'error', messageDiv);
    return;
  }

  // Check if already subscribed
  let subscribers = JSON.parse(localStorage.getItem('adhyatambuzz_subscribers') || '[]');
  if (subscribers.includes(email)) {
    showSubscribeMessage('✓ You are already subscribed!', 'success', messageDiv);
    emailInput.value = '';
    return;
  }

  // Save to localStorage (simulating backend)
  subscribers.push(email);
  localStorage.setItem('adhyatambuzz_subscribers', JSON.stringify(subscribers));

  // Simulate email sending (in production, this would call a backend API)
  subscribeBtn.disabled = true;
  subscribeBtn.style.opacity = '0.6';
  subscribeBtn.textContent = 'Processing...';

  // Simulate API call
  setTimeout(() => {
    // In production, you would make an API call here:
    // fetch('/api/subscribe', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email: email })
    // }).then(response => response.json())
    //   .then(data => {
    //     showSubscribeMessage('✓ Check your email! Welcome to our community.', 'success', messageDiv);
    //     emailInput.value = '';
    //     subscribeBtn.disabled = false;
    //     subscribeBtn.style.opacity = '1';
    //     subscribeBtn.textContent = 'Subscribe';
    //   });

    // For now, show success message
    showSubscribeMessage('✓ Welcome! Check your email for Sri Keshav\'s first reflection. 💫', 'success', messageDiv);
    emailInput.value = '';
    subscribeBtn.disabled = false;
    subscribeBtn.style.opacity = '1';
    subscribeBtn.textContent = 'Subscribe';

    // Log subscriber info
    console.log('📧 New subscriber:', email);
    console.log('Total subscribers:', subscribers.length);
  }, 1500);
}

function showSubscribeMessage(message, type, messageDiv) {
  // Fade out existing message first
  messageDiv.style.opacity = '0';
  messageDiv.style.transition = 'opacity 0.2s ease';
  
  setTimeout(() => {
    messageDiv.textContent = message;
    messageDiv.style.display = 'block';
    
    if (type === 'success') {
      messageDiv.style.color = '#00f5ff';
      messageDiv.style.fontWeight = '600';
    } else if (type === 'error') {
      messageDiv.style.color = '#ff5aa6';
      messageDiv.style.fontWeight = '600';
    }
    
    // Fade in new message
    messageDiv.style.opacity = '1';
    messageDiv.style.transition = 'opacity 0.3s ease';

    // Auto-hide after 5 seconds (for error messages)
    if (type === 'error') {
      setTimeout(() => {
        messageDiv.style.opacity = '0';
        setTimeout(() => {
          messageDiv.style.display = 'none';
        }, 300);
      }, 5000);
    }
  }, 200);
}

// Function to retrieve all subscribers (for admin/testing)
function getAllSubscribers() {
  const subscribers = JSON.parse(localStorage.getItem('adhyatambuzz_subscribers') || '[]');
  console.log('📊 All Subscribers:', subscribers);
  console.log('Total Count:', subscribers.length);
  return subscribers;
}

// Daily reflection simulator (in production, this would be server-based)
function sendDailyReflection() {
  const subscribers = getAllSubscribers();
  if (subscribers.length === 0) {
    console.log('No subscribers yet');
    return;
  }

  // Sample daily reflections
  const reflections = [
    "Stillness is not laziness, but presence and awareness. In a world that demands constant motion, stillness becomes your superpower. 🧘‍♀️",
    "Your confusion is not a roadblock—it's a signpost. Learn to read the messages your uncertainty is sending. 💭",
    "Finding Your Authentic Voice is essential. Stop imitating the world—your unique perspective is what the world is waiting to hear. 🎯",
    "Real love is when two whole people choose each other—not two broken pieces trying to feel complete. 💙",
    "Comparison is the thief of joy. Your life isn't less—your perspective is distorted. 🌟",
    "Purpose isn't found—it's created. Purpose = Natural talents + World's needs. 🚀",
    "Perfection is a prison. Excellence is a practice. Permission to be average is permission to be free. ✨",
    "The best revenge isn't finding someone better—it's becoming your best self. 💪"
  ];

  const randomReflection = reflections[Math.floor(Math.random() * reflections.length)];
  
  // In production, this would send actual emails via backend
  console.log('📮 Sending daily reflection to', subscribers.length, 'subscribers');
  console.log('📝 Today\'s Reflection:', randomReflection);
  
  return {
    timestamp: new Date().toISOString(),
    recipientCount: subscribers.length,
    reflection: randomReflection
  };
}

// ===== PAGE TRANSITION HANDLER =====
function transitionToSection(sectionId) {
  // Fade out current content
  const mainContent = document.querySelector('main');
  if (mainContent) {
    mainContent.style.opacity = '0';
    mainContent.style.transition = 'opacity 0.3s ease';
  }

  // Transition to new section after fade out
  setTimeout(() => {
    // Smooth scroll to section
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      section.classList.add('transition-in');
      
      // Restore opacity
      if (mainContent) {
        mainContent.style.opacity = '1';
      }
      
      // Remove animation class after completion
      setTimeout(() => {
        section.classList.remove('transition-in');
      }, 600);
    }
  }, 300);
}

// Log subscription count on page load
document.addEventListener('DOMContentLoaded', () => {
  // Add smooth transitions to all nav links
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href !== '#') {
        e.preventDefault();
        transitionToSection(href.substring(1));
        
        // Close mobile menu if open
        const navLinks = document.getElementById('navLinks');
        const hamburger = document.querySelector('.hamburger');
        if (navLinks && hamburger && hamburger.classList.contains('active')) {
          hamburger.classList.remove('active');
          navLinks.classList.remove('active');
        }
      }
    });
  });

  const subscribers = JSON.parse(localStorage.getItem('adhyatambuzz_subscribers') || '[]');
  if (subscribers.length > 0) {
    console.log('✅ Newsletter System Active. Current Subscribers:', subscribers.length);
  }
});

