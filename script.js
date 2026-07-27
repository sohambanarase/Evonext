/* ============================================================
   EVONEXT — "THE FORMULARY"  ·  interactions
   script.js
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Preloader ---------- */
  const pre = document.getElementById('preloader');
  const hidePre = () => pre && pre.classList.add('done');
  window.addEventListener('load', () => setTimeout(hidePre, 1700));
  setTimeout(hidePre, 2600);

  /* ---------- Nav scroll state ---------- */
  const navInner = document.querySelector('.nav-inner');
  window.addEventListener('scroll', () => {
    if (!navInner) return;
    navInner.style.boxShadow = window.scrollY > 24
      ? '0 22px 50px -28px rgba(12,26,20,0.5)'
      : 'var(--shadow-soft)';
  }, { passive: true });

  /* ---------- Mobile menu ---------- */
  const burger = document.querySelector('.hamburger');
  const menu = document.querySelector('.mobile-menu');
  burger?.addEventListener('click', () => {
    const open = burger.classList.toggle('open');
    menu?.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    burger.setAttribute('aria-expanded', open);
  });
  menu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    burger?.classList.remove('open'); menu.classList.remove('open');
    document.body.classList.remove('menu-open'); document.body.style.overflow = '';
  }));

  /* ---------- Scroll progress + spine fill ---------- */
  const prog = document.getElementById('scroll-progress');
  const spineFill = document.querySelector('.spine-fill');
  const onScroll = () => {
    const d = document.documentElement;
    const p = d.scrollTop / (d.scrollHeight - d.clientHeight || 1);
    if (prog) prog.style.width = (p * 100) + '%';
    if (spineFill) spineFill.style.height = (p * 100) + '%';
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Spine scrollspy (section label) ---------- */
  const spineLabel = document.getElementById('spine-label');
  const spots = document.querySelectorAll('[data-spine]');
  if (spineLabel && spots.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const t = e.target.getAttribute('data-spine');
          spineLabel.innerHTML = `EVONEXT &nbsp;/&nbsp; <b>${t}</b>`;
        }
      });
    }, { threshold: 0.5 });
    spots.forEach(s => spy.observe(s));
  }

  /* ---------- Reveal + mask reveal ---------- */
  const reveals = document.querySelectorAll('.reveal, .mask');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('visible'));
  }

  /* ---------- Number counters ---------- */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const dur = 1300; const start = performance.now();
        const tick = (now) => {
          const t = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = (Number.isInteger(target) ? Math.round(target * eased) : (target * eased).toFixed(0)) + suffix;
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        cio.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach(c => cio.observe(c));
  }

  /* ---------- Parallax (capsule + glow + media) — desktop pointers only ---------- */
  const finePointer = window.matchMedia('(pointer:fine)').matches;
  if (!reduce && finePointer) {
    const layers = document.querySelectorAll('[data-parallax]');
    let mx = 0, my = 0;
    window.addEventListener('mousemove', (e) => {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
    }, { passive: true });
    const loop = () => {
      const sy = window.scrollY;
      layers.forEach(l => {
        const sp = parseFloat(l.dataset.parallax) || 0.1;
        const rot = l.dataset.rot ? ` rotate(${l.dataset.rot}deg)` : '';
        l.style.transform = `translate(${mx * sp * 40}px, ${my * sp * 40 - sy * sp * 0.25}px)${rot}`;
      });
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  } else {
    document.documentElement.classList.add('touch');
  }

  /* ---------- Page transition sweep ---------- */
  const sweep = document.getElementById('page-sweep');
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.endsWith('.html') && !link.target) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        sweep?.classList.add('active');
        setTimeout(() => { window.location.href = href; }, 520);
      });
    }
  });

  /* ---------- Formulary filter + search (products) ---------- */
  const chips = document.querySelectorAll('.chip[data-filter]');
  const search = document.getElementById('product-search');
  const rows = document.querySelectorAll('[data-category]');
  const none = document.getElementById('no-results');
  const apply = () => {
    const active = document.querySelector('.chip.active')?.dataset.filter || 'all';
    const q = (search?.value || '').toLowerCase().trim();
    let shown = 0;
    rows.forEach(r => {
      const okCat = active === 'all' || r.dataset.category === active;
      const okQ = !q || (r.dataset.name || '').toLowerCase().includes(q);
      const show = okCat && okQ;
      r.style.display = show ? '' : 'none';
      if (show) shown++;
    });
    if (none) none.style.display = shown ? 'none' : 'block';
  };
  chips.forEach(c => c.addEventListener('click', () => {
    chips.forEach(x => x.classList.remove('active')); c.classList.add('active'); apply();
  }));
  search?.addEventListener('input', apply);

  /* ---------- Contact form  (Web3Forms) ----------
     Submissions POST to Web3Forms and land in the Evonext inbox.
     Setup: get a free access key at https://web3forms.com, then paste it
     into the hidden `access_key` input in contact.html.
     To switch providers later, change ENDPOINT below and swap that input. */
  const ENDPOINT = 'https://api.web3forms.com/submit';
  const form = document.getElementById('contact-form');
  const ok = document.getElementById('form-success');
  const bad = document.getElementById('form-error');
  const btn = document.getElementById('submit-btn');
  const btnLabel = document.getElementById('submit-label');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }

    ok?.classList.remove('show');
    bad?.classList.remove('show');

    const data = Object.fromEntries(new FormData(form));
    // Give the notification email a useful subject line
    data.subject = '[Website] ' + (data.subject || 'Enquiry') + ' — ' + (data.name || 'Unknown');

    if (btn) { btn.disabled = true; btn.style.opacity = '0.65'; }
    if (btnLabel) btnLabel.textContent = 'Sending…';

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (res.ok && json.success) {
        form.reset();
        ok?.classList.add('show');
        ok?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        throw new Error(json.message || 'Request failed');
      }
    } catch (err) {
      console.error('Form submission failed:', err);
      bad?.classList.add('show');
    } finally {
      if (btn) { btn.disabled = false; btn.style.opacity = ''; }
      if (btnLabel) btnLabel.textContent = 'Send message';
    }
  });

  /* ---------- Newsletter ---------- */
  document.querySelectorAll('.news-form').forEach(nf => {
    nf.addEventListener('submit', (e) => {
      e.preventDefault();
      const inp = nf.querySelector('input'); const btn = nf.querySelector('button');
      if (inp?.value) { const o = btn.innerHTML; btn.textContent = 'Subscribed'; inp.value = ''; setTimeout(() => btn.innerHTML = o, 2800); }
    });
  });

  /* ---------- Back to top ---------- */
  const top = document.getElementById('back-to-top');
  window.addEventListener('scroll', () => {
    top?.classList.toggle('show', window.scrollY > 600);
  }, { passive: true });
  top?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
});