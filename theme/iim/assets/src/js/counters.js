// Animated number counters. The final value is server-rendered (crawlable, no-JS safe);
// JS only animates from zero when the number scrolls into view.
export function initCounters() {
  const els = document.querySelectorAll('[data-count-to]');
  if (!els.length || !('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const fmt = new Intl.NumberFormat('en');
  const animate = (el) => {
    const target = Number(el.dataset.countTo);
    const suffix = el.dataset.countSuffix || '';
    if (!Number.isFinite(target) || target <= 0) return;
    const duration = 1200;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt.format(Math.round(target * eased)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animate(entry.target);
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.6 },
  );

  const fold = window.innerHeight;
  els.forEach((el) => {
    if (el.getBoundingClientRect().top < fold) return; // already visible: leave the final value
    io.observe(el);
  });
}
