// Fade-and-rise on scroll. Only elements below the first screen are armed, so nothing
// visible on load is hidden and no layout shifts (opacity and transform only).
export function initReveal() {
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length || !('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -10% 0px' },
  );

  const fold = window.innerHeight;
  els.forEach((el) => {
    if (el.getBoundingClientRect().top < fold) return;
    el.classList.add('is-armed');
    io.observe(el);
  });
}
