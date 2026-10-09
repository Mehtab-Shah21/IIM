// Entry point. Every feature is progressive: the site works fully without JavaScript.
import { initNav } from './nav.js';
import { initReveal } from './reveal.js';
import { initCounters } from './counters.js';
import { initTracking } from './track.js';

const ready = (fn) => (document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn, { once: true }) : fn());

ready(() => {
  initNav();
  initReveal();
  initCounters();
  initTracking();

  const forms = document.querySelectorAll('[data-iim-form]');
  if (forms.length) {
    import('./form.js').then(({ initForm }) => forms.forEach(initForm));
  }
});
