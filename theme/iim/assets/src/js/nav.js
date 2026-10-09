// Mobile drawer (focus trap, Escape, scroll lock) and desktop mega menu toggle.
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

export function initNav() {
  initDrawer();
  initMega();
}

function initDrawer() {
  const drawer = document.getElementById('drawer');
  if (!drawer) return;
  const openers = document.querySelectorAll('a[href="#drawer"]');
  const panel = drawer.querySelector('.drawer__panel');
  let lastFocus = null;

  // Replace :target behaviour with a JS-managed dialog.
  drawer.setAttribute('aria-hidden', 'true');
  drawer.inert = true;

  const open = () => {
    lastFocus = document.activeElement;
    drawer.classList.add('is-open');
    drawer.removeAttribute('aria-hidden');
    drawer.inert = false;
    document.body.classList.add('drawer-open');
    openers.forEach((o) => o.setAttribute('aria-expanded', 'true'));
    // Focus once the drawer is visible (an element hidden by visibility cannot take focus).
    const first = panel.querySelector(FOCUSABLE);
    // Flush styles so visibility is applied now (rAF would not fire in a background tab).
    getComputedStyle(drawer).visibility;
    if (first) first.focus();
    document.addEventListener('keydown', onKey);
  };

  const close = () => {
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    drawer.inert = true;
    document.body.classList.remove('drawer-open');
    openers.forEach((o) => o.setAttribute('aria-expanded', 'false'));
    document.removeEventListener('keydown', onKey);
    if (location.hash === '#drawer') history.replaceState(null, '', location.pathname + location.search);
    if (lastFocus) lastFocus.focus();
  };

  const onKey = (e) => {
    if (e.key === 'Escape') {
      close();
      return;
    }
    if (e.key !== 'Tab') return;
    const items = [...panel.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  openers.forEach((o) => {
    o.setAttribute('role', 'button');
    o.setAttribute('aria-controls', 'drawer');
    o.setAttribute('aria-expanded', 'false');
    o.addEventListener('click', (e) => {
      e.preventDefault();
      open();
    });
  });

  drawer.querySelectorAll('[data-drawer-close]').forEach((el) =>
    el.addEventListener('click', (e) => {
      e.preventDefault();
      close();
    }),
  );

  // Close when a same-page link inside the drawer is followed.
  panel.querySelectorAll('a[href]').forEach((a) => a.addEventListener('click', () => drawer.classList.contains('is-open') && close()));

  // If the page was loaded with #drawer (no-JS fallback URL), normalise.
  if (location.hash === '#drawer') history.replaceState(null, '', location.pathname + location.search);
}

function initMega() {
  document.querySelectorAll('[data-mega-toggle]').forEach((btn) => {
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    const item = btn.closest('.has-mega');
    if (!panel || !item) return;

    const set = (state) => {
      btn.setAttribute('aria-expanded', String(state));
      panel.classList.toggle('is-open', state);
    };

    btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));

    item.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') {
        set(false);
        btn.focus();
      }
    });

    item.addEventListener('focusout', (e) => {
      if (!item.contains(e.relatedTarget)) set(false);
    });

    document.addEventListener('click', (e) => {
      if (!item.contains(e.target)) set(false);
    });
  });
}
