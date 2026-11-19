// Shared script for kuwaGO's info pages: light/dark toggle (remembered,
// same key as the main page), soft fade-ins, and the contents rail that
// highlights the section you're reading.
(() => {
  const root = document.documentElement;
  root.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const meta = document.querySelector('meta[name="theme-color"]');
  const isDark = () => root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  const syncMeta = () => meta && meta.setAttribute('content', isDark() ? '#15100b' : '#f3e8d2');
  syncMeta();

  const btn = document.getElementById('themeBtn');
  if (btn) btn.addEventListener('click', () => {
    const apply = () => {
      root.dataset.theme = isDark() ? 'light' : 'dark';
      try { localStorage.setItem('kuwago-theme', root.dataset.theme); } catch (e) {}
      syncMeta();
    };
    if (!document.startViewTransition || reduce) return apply();
    const r = btn.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    document.startViewTransition(apply).ready.then(() => {
      root.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
        { duration: 650, easing: 'cubic-bezier(.22, 1, .36, 1)', pseudoElement: '::view-transition-new(root)' });
    });
  });

  // Fade-ins
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .08 });
  document.querySelectorAll('.rise').forEach(el => io.observe(el));

  // Contents rail: mark the section currently on screen
  const links = [...document.querySelectorAll('.toc a')];
  if (links.length) {
    const byId = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
    const spy = new IntersectionObserver(es => {
      es.forEach(e => {
        if (!e.isIntersecting) return;
        links.forEach(a => a.classList.remove('active'));
        byId.get(e.target.id)?.classList.add('active');
      });
    }, { rootMargin: '-90px 0px -65% 0px' });
    byId.forEach((_, id) => { const h = document.getElementById(id); if (h) spy.observe(h); });
  }
})();
