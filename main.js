// Digital Bridge Academy — interactivity
(function () {
  'use strict';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scroll progress bar + sticky header shadow + back-to-top
  var progressBar = document.getElementById('progressBar');
  var header = document.getElementById('siteHeader');
  var backToTop = document.getElementById('backToTop');
  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    progressBar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
    header.classList.toggle('scrolled', h.scrollTop > 8);
    backToTop.classList.toggle('show', h.scrollTop > 600);
  }
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  backToTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }); });

  // Reveal on scroll
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in-view'); revealObserver.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(function (el) { revealObserver.observe(el); });

  // Scrollspy — highlight nav link of section in view
  var navLinks = document.querySelectorAll('#siteNav a[data-section]');
  var spyObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        navLinks.forEach(function (a) { a.classList.toggle('active', a.dataset.section === e.target.id); });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  ['about', 'programs', 'quiz', 'how'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) spyObserver.observe(el);
  });

  // Rotating word in hero
  var words = ['bank online', 'video call family', 'spot the scams', 'apply for jobs', 'browse safely'];
  var rotator = document.getElementById('rotator');
  var wi = 0;
  if (!reduceMotion) {
    setInterval(function () {
      wi = (wi + 1) % words.length;
      rotator.classList.remove('swap');
      void rotator.offsetWidth;
      rotator.textContent = words[wi];
      rotator.classList.add('swap');
    }, 2600);
  }

  // Animated counters
  var counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      counterObserver.unobserve(e.target);
      var el = e.target;
      var target = parseInt(el.dataset.count, 10);
      var suffix = el.dataset.suffix || '';
      if (reduceMotion) { el.textContent = target + suffix; return; }
      var start = null, dur = 1400;
      function tick(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('.stat-num[data-count]').forEach(function (el) { counterObserver.observe(el); });

  // Expandable program cards
  document.querySelectorAll('.program-card').forEach(function (card) {
    function toggle() {
      var open = card.classList.toggle('open');
      var btn = card.querySelector('.card-toggle');
      btn.setAttribute('aria-expanded', open);
      btn.firstChild.textContent = open ? 'Show less ' : 'See details ';
    }
    card.querySelector('.card-toggle').addEventListener('click', function (ev) { ev.stopPropagation(); toggle(); });
    card.addEventListener('click', function (ev) {
      if (ev.target.closest('a, button, [data-tip]:hover')) return;
      toggle();
    });
    card.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter' && ev.target === card) toggle();
    });
  });

  // FAQ accordion
  document.querySelectorAll('.faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq-item');
      var wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function (i) { i.classList.remove('open'); });
      if (!wasOpen) item.classList.add('open');
    });
  });

  // Quiz
  var votes = { 1: 0, 2: 0, 3: 0 };
  var step = 0;
  var steps = document.querySelectorAll('.quiz-step');
  var dots = document.querySelectorAll('#quizDots span');
  var results = {
    1: { title: 'Track 01 · Everyday Tech Confidence', text: "Let's make your devices feel like helpful friends instead of confusing strangers. You'll be video-calling, emailing, and banking online before you know it." },
    2: { title: 'Track 02 · Online Safety & Scam Defense', text: "You're already using tech — now let's make you a hard target. One track, and you'll spot scams from a mile away and lock your accounts down tight." },
    3: { title: 'Track 03 · Job-Ready Computer Skills', text: "You bring the work ethic, we bring the skills employers ask for: documents, spreadsheets, professional email, and applications that stand out." }
  };
  var winner = 1;
  function showStep(n) {
    step = n;
    steps.forEach(function (s) { s.classList.toggle('active', parseInt(s.dataset.step, 10) === n); });
    dots.forEach(function (d, i) { d.classList.toggle('active', i === Math.min(n, 2)); });
  }
  document.querySelectorAll('.quiz-opts button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      votes[btn.dataset.vote]++;
      if (step < 2) { showStep(step + 1); return; }
      winner = [1, 2, 3].reduce(function (a, b) { return votes[b] > votes[a] ? b : a; });
      document.getElementById('quizResultTitle').textContent = results[winner].title;
      document.getElementById('quizResultText').textContent = results[winner].text;
      showStep(3);
    });
  });
  document.getElementById('quizRetryBtn').addEventListener('click', function () {
    votes = { 1: 0, 2: 0, 3: 0 };
    showStep(0);
  });
  document.getElementById('quizGoBtn').addEventListener('click', function () {
    var card = document.querySelector('.program-card[data-track="' + winner + '"]');
    if (!card) return;
    card.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    card.classList.add('open');
    card.classList.remove('pulse');
    void card.offsetWidth;
    card.classList.add('pulse');
  });

  // Contact form (front-end only for now)
  document.getElementById('contactForm').addEventListener('submit', function (e) {
    e.preventDefault();
    document.getElementById('formMsg').classList.add('show');
    this.reset();
  });
})();
