// Digital Bridge Academy — shared interactivity
(function () {
  'use strict';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Theme (dark default, persisted) ---------- */
  var themeBtn = $('#themeToggle');
  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    if (themeBtn) {
      themeBtn.textContent = t === 'dark' ? '☀️' : '🌙';
      themeBtn.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }
  var saved = null;
  try { saved = localStorage.getItem('dba-theme'); } catch (e) {}
  applyTheme(saved || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'));
  if (themeBtn) themeBtn.addEventListener('click', function () {
    var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem('dba-theme', next); } catch (e) {}
  });

  /* ---------- Progress bar / header / back-to-top ---------- */
  var progressBar = $('#progressBar'), header = $('.site-header'), backToTop = $('#backToTop');
  function onScroll() {
    var h = document.documentElement, max = h.scrollHeight - h.clientHeight;
    if (progressBar) progressBar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
    if (header) header.classList.toggle('scrolled', h.scrollTop > 8);
    if (backToTop) backToTop.classList.toggle('show', h.scrollTop > 600);
    litJourney();
    sweepReveals();
  }
  document.addEventListener('scroll', onScroll, { passive: true });
  if (backToTop) backToTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }); });

  /* ---------- Reveal on scroll ---------- */
  var pendingReveals = $$('.reveal, .reveal-scale');
  function markRevealed(el) {
    el.classList.add('in-view');
    revealObserver.unobserve(el);
    var i = pendingReveals.indexOf(el);
    if (i > -1) pendingReveals.splice(i, 1);
  }
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) markRevealed(e.target); });
  }, { threshold: 0.08 });
  pendingReveals.slice().forEach(function (el) { revealObserver.observe(el); });
  // Safety sweep: fast scrolling can skip IO frames — reveal anything already passed
  function sweepReveals() {
    if (!pendingReveals.length) return;
    var vh = window.innerHeight;
    pendingReveals.slice().forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.95 || r.bottom < 0) markRevealed(el);
    });
  }

  /* ---------- Scrollspy ---------- */
  var navLinks = $$('.main-nav a[data-section]');
  if (navLinks.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) navLinks.forEach(function (a) { a.classList.toggle('active', a.dataset.section === e.target.id); });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    navLinks.forEach(function (a) { var el = document.getElementById(a.dataset.section); if (el) spy.observe(el); });
  }

  /* ---------- Rotating word ----------
     Always rotates (text change isn't motion); the swap animation
     itself is skipped for reduced-motion users. */
  var rotator = $('#rotator');
  if (rotator) {
    var words = [
      'video call the grandkids',
      'bank online safely',
      'spot every scam',
      'use AI with confidence',
      'apply for jobs online',
      'pay bills from your couch',
      'share photos with the family',
      'plan a whole trip with AI',
      'shop online without worry'
    ];
    var wi = 0;
    setInterval(function () {
      wi = (wi + 1) % words.length;
      if (reduceMotion) { rotator.textContent = words[wi]; return; }
      rotator.classList.remove('swap'); void rotator.offsetWidth;
      rotator.textContent = words[wi]; rotator.classList.add('swap');
    }, 5500);
  }

  /* ---------- Particles (hero) ---------- */
  var canvas = $('#particles');
  if (canvas && !reduceMotion) {
    var ctx = canvas.getContext('2d'), ps = [], W, H;
    function sizeCanvas() {
      W = canvas.offsetWidth; H = canvas.offsetHeight;
      canvas.width = W * devicePixelRatio; canvas.height = H * devicePixelRatio;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    }
    sizeCanvas(); window.addEventListener('resize', sizeCanvas);
    for (var i = 0; i < 34; i++) ps.push({ x: Math.random() * 1200, y: Math.random() * 700, r: Math.random() * 2.2 + .6, vx: (Math.random() - .5) * .22, vy: (Math.random() - .5) * .22, o: Math.random() * .5 + .15 });
    (function tick() {
      if (!W) { requestAnimationFrame(tick); return; }
      ctx.clearRect(0, 0, W, H);
      var teal = document.documentElement.getAttribute('data-theme') === 'light' ? '31,141,130' : '76,196,184';
      ps.forEach(function (p) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7);
        ctx.fillStyle = 'rgba(' + teal + ',' + p.o + ')'; ctx.fill();
      });
      requestAnimationFrame(tick);
    })();
  }

  /* ---------- Mouse-follow parallax on floating cards ---------- */
  var stage = $('.hero-stage');
  if (stage && !reduceMotion && matchMedia('(pointer:fine)').matches) {
    var cards = $$('.float-card', stage);
    stage.addEventListener('mousemove', function (e) {
      var r = stage.getBoundingClientRect();
      var dx = (e.clientX - r.left) / r.width - .5, dy = (e.clientY - r.top) / r.height - .5;
      cards.forEach(function (c, i) {
        var depth = (i % 2 ? 14 : 22);
        c.style.translate = (dx * depth) + 'px ' + (dy * depth) + 'px';
      });
    });
    stage.addEventListener('mouseleave', function () { cards.forEach(function (c) { c.style.translate = '0px 0px'; }); });
  }

  /* ---------- Animated counters ---------- */
  var counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      counterObserver.unobserve(e.target);
      var el = e.target, target = parseInt(el.dataset.count, 10), suffix = el.dataset.suffix || '';
      if (reduceMotion) { el.textContent = target + suffix; return; }
      var start = null, dur = 1500;
      (function tick(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick); else el.textContent = target + suffix;
      })(performance.now());
    });
  }, { threshold: 0.6 });
  $$('.stat-num[data-count]').forEach(function (el) { counterObserver.observe(el); });

  /* ---------- Journey timeline lights up as you scroll ---------- */
  var journey = $('.journey'), jLine = $('.j-line');
  function litJourney() {
    if (!journey) return;
    var r = journey.getBoundingClientRect(), vh = window.innerHeight;
    var progress = Math.min(Math.max((vh * .7 - r.top) / r.height, 0), 1);
    if (jLine) jLine.style.height = (progress * 100) + '%';
    $$('.j-step', journey).forEach(function (s) {
      var sr = s.getBoundingClientRect();
      s.classList.toggle('lit', sr.top < vh * .72);
    });
  }

  /* ---------- Accordions (FAQ + course modules) ---------- */
  $$('.faq-q, .module-q').forEach(function (btn) {
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq-item, .module');
      var group = item.parentElement, wasOpen = item.classList.contains('open');
      $$('.open', group).forEach(function (i) {
        i.classList.remove('open');
        var q = $('.faq-q, .module-q', i); if (q) q.setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) { item.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
    });
  });

  /* ---------- Tabs (AI examples) ---------- */
  $$('.tab-btns').forEach(function (group) {
    var btns = $$('button', group), panels = $$('.tab-panel', group.parentElement);
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () {
        btns.forEach(function (x) { x.classList.remove('active'); });
        panels.forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        if (panels[i]) panels[i].classList.add('active');
      });
    });
  });

  /* ---------- Before / After toggles ---------- */
  $$('.ba').forEach(function (ba) {
    var btns = $$('.ba-toggle button', ba), panes = $$('.ba-pane', ba);
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () {
        btns.forEach(function (x) { x.classList.remove('active'); });
        panes.forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active'); if (panes[i]) panes[i].classList.add('active');
      });
    });
  });

  /* ---------- Testimonials carousel ---------- */
  var track = $('#testiTrack');
  if (track) {
    var slides = track.children.length, cur = 0, timer;
    var dots = $$('.testi-dot');
    function go(n) {
      cur = (n + slides) % slides;
      track.style.transform = 'translateX(-' + cur * 100 + '%)';
      dots.forEach(function (d, i) { d.classList.toggle('active', i === cur); });
    }
    function arm() { if (reduceMotion) return; clearInterval(timer); timer = setInterval(function () { go(cur + 1); }, 6500); }
    $('#testiPrev').addEventListener('click', function () { go(cur - 1); arm(); });
    $('#testiNext').addEventListener('click', function () { go(cur + 1); arm(); });
    dots.forEach(function (d, i) { d.addEventListener('click', function () { go(i); arm(); }); });
    var shell = $('.testi-shell');
    shell.addEventListener('mouseenter', function () { clearInterval(timer); });
    shell.addEventListener('mouseleave', arm);
    arm();
  }

  /* ---------- Confidence quiz ---------- */
  var quiz = $('#quizInner');
  if (quiz) {
    var votes = { 1: 0, 2: 0, 3: 0 }, confidence = 0, step = 0, TOTAL = 4;
    var steps = $$('.quiz-step', quiz), bar = $('.quiz-progress span', quiz);
    var results = {
      1: { title: 'Everyday Tech Confidence', text: "Let's make your devices feel like helpful friends instead of confusing strangers. You'll be video-calling, emailing, and banking online before you know it.", href: 'courses/everyday-tech.html', road: ['Devices', 'Email & calls', 'Banking & telehealth', 'Confidence'] },
      2: { title: 'Online Safety & Scam Defense', text: "You're already using tech — now let's make you a hard target. You'll spot scams from a mile away and lock your accounts down tight.", href: 'courses/online-safety.html', road: ['Scam radar', 'Passwords', 'Privacy', 'Peace of mind'] },
      3: { title: 'Job-Ready Computer Skills', text: 'You bring the work ethic, we bring the skills employers ask for: documents, spreadsheets, professional email, and applications that stand out.', href: 'courses/job-ready.html', road: ['Documents', 'Spreadsheets', 'Pro email', 'Hired'] }
    };
    var winner = 1;
    function showStep(n) {
      step = n;
      steps.forEach(function (s) { s.classList.toggle('active', parseInt(s.dataset.step, 10) === n); });
      if (bar) bar.style.width = (Math.min(n, TOTAL) / TOTAL * 100) + '%';
    }
    $$('.quiz-opts button', quiz).forEach(function (btn) {
      btn.addEventListener('click', function () {
        votes[btn.dataset.vote]++;
        confidence += parseInt(btn.dataset.conf || 0, 10);
        if (step < TOTAL - 1) { showStep(step + 1); return; }
        winner = [1, 2, 3].reduce(function (a, b) { return votes[b] > votes[a] ? b : a; });
        var score = Math.min(35 + confidence, 96);
        $('#quizResultTitle').textContent = results[winner].title;
        $('#quizResultText').textContent = results[winner].text;
        $('#quizGoBtn').setAttribute('href', results[winner].href);
        $('#quizRoadmap').innerHTML = results[winner].road.map(function (r, i) { return '<span><b>' + (i + 1) + '</b> ' + r + '</span>'; }).join('');
        showStep(TOTAL);
        var ring = $('.ring-val'), num = $('#scoreVal');
        setTimeout(function () {
          if (ring) ring.style.strokeDashoffset = 408 - (408 * score / 100);
          if (num) {
            if (reduceMotion) { num.textContent = score; return; }
            var s0 = null;
            (function t(ts) { if (!s0) s0 = ts; var p = Math.min((ts - s0) / 1300, 1); num.textContent = Math.round(score * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(t); })(performance.now());
          }
        }, 150);
      });
    });
    $('#quizRetryBtn').addEventListener('click', function () {
      votes = { 1: 0, 2: 0, 3: 0 }; confidence = 0;
      var ring = $('.ring-val'); if (ring) ring.style.strokeDashoffset = 408;
      $('#scoreVal').textContent = '0';
      showStep(0);
    });
  }

  /* ---------- Workshop countdown (next Saturday, 10am) ---------- */
  var cd = $('#countdown');
  if (cd) {
    var target = new Date();
    target.setDate(target.getDate() + ((6 - target.getDay() + 7) % 7 || 7));
    target.setHours(10, 0, 0, 0);
    function pad(n) { return String(n).padStart(2, '0'); }
    function tickCd() {
      var d = target - Date.now();
      if (d < 0) { target.setDate(target.getDate() + 7); d = target - Date.now(); }
      $('#cdD').textContent = pad(Math.floor(d / 864e5));
      $('#cdH').textContent = pad(Math.floor(d / 36e5) % 24);
      $('#cdM').textContent = pad(Math.floor(d / 6e4) % 60);
      $('#cdS').textContent = pad(Math.floor(d / 1e3) % 60);
    }
    tickCd(); setInterval(tickCd, 1000);
  }

  /* ---------- Booking slot picker ---------- */
  var dayRow = $('#bookDays'), timeRow = $('#bookTimes');
  function pickSlot(row, btn) {
    $$('.slot', row).forEach(function (x) { x.classList.remove('selected'); x.setAttribute('aria-pressed', 'false'); });
    btn.classList.add('selected'); btn.setAttribute('aria-pressed', 'true');
  }
  if (dayRow) {
    var fmt = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    for (var di = 1; di <= 7; di++) {
      var dd = new Date(); dd.setDate(dd.getDate() + di);
      var db = document.createElement('button');
      db.type = 'button'; db.className = 'slot'; db.textContent = fmt.format(dd);
      db.setAttribute('aria-pressed', 'false');
      if (dd.getDay() === 0) { db.disabled = true; db.setAttribute('data-tip', 'We rest on Sundays — even bridges need a day off.'); }
      db.addEventListener('click', function () { pickSlot(dayRow, this); });
      dayRow.appendChild(db);
    }
    $$('.slot', timeRow).forEach(function (b) {
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () { pickSlot(timeRow, this); });
    });
  }
  function composeBooking() {
    var d = $('.slot.selected', dayRow), t = $('.slot.selected', timeRow);
    if (!d || !t) return '';
    return 'Booking request — free consultation\nDay: ' + d.textContent + '\nTime: ' + t.textContent + ' (visitor local time)';
  }

  /* ---------- Live forms → /api/contact ---------- */
  $$('form[data-live]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = $('.form-msg', form), err = $('.form-err', form), btn = form.querySelector('button[type="submit"]');
      if (msg) msg.classList.remove('show');
      if (err) err.classList.remove('show');
      function fieldVal(sel) { var el = form.querySelector(sel); return el ? el.value.trim() : ''; }
      var isBooking = form.dataset.compose === 'booking';
      var message = isBooking ? composeBooking() : (fieldVal('textarea[name="message"]') || form.dataset.message || '');
      if (isBooking && !message) {
        if (err) { err.textContent = 'Please pick a day and a time first.'; err.classList.add('show'); }
        return;
      }
      var interest = form.querySelector('select[name="interest"]');
      if (interest) message = 'Interested in: ' + interest.value + '\n\n' + message;
      var payload = {
        name: fieldVal('input[name="name"]') || form.dataset.name || 'Website visitor',
        email: fieldVal('input[name="email"]'),
        message: message
      };
      if (btn) btn.disabled = true;
      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (res) {
        if (!res.ok) throw new Error('Request failed');
        if (msg) msg.classList.add('show');
        form.reset();
        if (isBooking) $$('.slot.selected', form).forEach(function (s) { s.classList.remove('selected'); s.setAttribute('aria-pressed', 'false'); });
      }).catch(function () {
        if (err) { err.textContent = 'Something went wrong — please email us directly at contact@stevenjhubbard.com.'; err.classList.add('show'); }
      }).finally(function () {
        if (btn) btn.disabled = false;
      });
    });
  });

  onScroll();
})();
