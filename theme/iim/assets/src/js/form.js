// Quote and AMC forms: optional multi-step flow, inline accessible validation, fresh
// anti-spam token, lazy Cloudflare Turnstile, file checks and fetch submission.
// Without JS the same form posts directly to the REST endpoint and the server redirects.
import { push } from './track.js';

// UAE numbers: +971 / 00971 / 0 prefix, mobile 5[0,2,4,5,6,8] + 7 digits, landline area code + 7 digits.
const UAE_PHONE = /^(?:\+971|00971|0)?(?:5[024568]\d{7}|[234679]\d{7})$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function initForm(form) {
  const i18n = JSON.parse(form.dataset.i18n || '{}');
  const t = (key, fallback) => i18n[key] || fallback;
  const steps = [...form.querySelectorAll('.form-step')];
  const stepped = form.dataset.steps === 'true' && steps.length > 1;
  const alertBox = form.querySelector('[data-form-alert]');
  let current = 0;

  form.setAttribute('novalidate', '');

  refreshToken(form);
  lazyTurnstile(form);

  // ---------- Steps ----------
  const progress = [...form.querySelectorAll('.form-progress li')];
  const showStep = (i, focus = true) => {
    current = i;
    steps.forEach((s, idx) => s.classList.toggle('is-active', idx === i));
    progress.forEach((p, idx) => {
      p.classList.toggle('is-done', idx < i);
      if (idx === i) p.setAttribute('aria-current', 'step');
      else p.removeAttribute('aria-current');
    });
    form.querySelectorAll('[data-prev]').forEach((b) => (b.hidden = i === 0));
    form.querySelectorAll('[data-next]').forEach((b) => (b.hidden = i === steps.length - 1));
    form.querySelectorAll('.form-nav [type="submit"]').forEach((b) => (b.hidden = i !== steps.length - 1));
    if (focus) {
      const legend = steps[i].querySelector('legend');
      if (legend) {
        legend.setAttribute('tabindex', '-1');
        legend.focus({ preventScroll: true });
      }
      const top = form.getBoundingClientRect().top + window.scrollY - 96;
      if (window.scrollY > top) window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  if (stepped) {
    form.classList.add('is-stepped');
    showStep(0, false);
    form.querySelectorAll('[data-next]').forEach((b) =>
      b.addEventListener('click', () => {
        if (validate(steps[current])) showStep(current + 1);
      }),
    );
    form.querySelectorAll('[data-prev]').forEach((b) => b.addEventListener('click', () => showStep(current - 1)));
  }

  // ---------- Validation ----------
  const fieldOf = (el) => el.closest('.field') || el.closest('fieldset.field');

  const setError = (el, msg) => {
    const field = fieldOf(el);
    if (!field) return;
    const err = field.querySelector('.field__error');
    const inputs = field.querySelectorAll('input, select, textarea');
    if (msg) {
      field.classList.add('has-error');
      inputs.forEach((i) => i.setAttribute('aria-invalid', 'true'));
      if (err) err.querySelector('span').textContent = msg;
    } else {
      field.classList.remove('has-error');
      inputs.forEach((i) => i.removeAttribute('aria-invalid'));
    }
  };

  const check = (el) => {
    if (el.disabled || el.closest('.hp-field')) return '';
    const v = (el.value || '').trim();
    if (el.type === 'radio') {
      if (!el.required) return '';
      const group = form.querySelectorAll(`input[name="${CSS.escape(el.name)}"]`);
      return [...group].some((r) => r.checked) ? '' : t('choose', 'Please choose an option.');
    }
    if (el.type === 'checkbox') return el.required && !el.checked ? t('consent', 'Please tick this box to continue.') : '';
    if (el.type === 'file') return checkFiles(el, t);
    if (el.required && !v) return t('required', 'This field is required.');
    if (!v) return '';
    if (el.dataset.validate === 'phone' && !UAE_PHONE.test(v.replace(/[\s\-().]/g, ''))) return t('phone', 'Enter a UAE number, for example 050 123 4567.');
    if (el.dataset.validate === 'email' && !EMAIL.test(v)) return t('email', 'Enter a valid email address.');
    if (el.type === 'date' && el.min && v < el.min) return t('date', 'Choose today or a later date.');
    if (el.maxLength > 0 && v.length > el.maxLength) return t('tooLong', 'This is too long.');
    return '';
  };

  const validate = (scope) => {
    let firstBad = null;
    const seen = new Set();
    scope.querySelectorAll('input, select, textarea').forEach((el) => {
      if (el.type === 'hidden' || (el.type === 'radio' && seen.has(el.name))) return;
      if (el.type === 'radio') seen.add(el.name);
      const msg = check(el);
      setError(el, msg);
      if (msg && !firstBad) firstBad = el;
    });
    if (firstBad) firstBad.focus();
    return !firstBad;
  };

  form.addEventListener('change', (e) => {
    if (fieldOf(e.target)?.classList.contains('has-error')) setError(e.target, check(e.target));
    if (e.target.type === 'file') listFiles(e.target);
  });
  form.addEventListener('focusout', (e) => {
    const el = e.target;
    if (!el.matches('input, select, textarea') || el.type === 'radio' || el.type === 'checkbox' || el.type === 'file') return;
    if (el.value.trim()) setError(el, check(el));
  });

  // ---------- Submit ----------
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (alertBox) alertBox.hidden = true;
    if (!validate(form)) {
      if (stepped) {
        const bad = steps.findIndex((s) => s.querySelector('.has-error'));
        if (bad > -1 && bad !== current) {
          showStep(bad);
          steps[bad].querySelector('[aria-invalid="true"]')?.focus();
        }
      }
      return;
    }

    const btns = form.querySelectorAll('[type="submit"]');
    btns.forEach((b) => {
      b.disabled = true;
      b.classList.add('is-loading');
    });

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
        credentials: 'same-origin',
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        push('quote_submit', { form_type: form.querySelector('[name="form_type"]')?.value || 'quote', reference: data.ref });
        window.location.assign(data.redirect);
        return;
      }
      if (data.errors) {
        Object.entries(data.errors).forEach(([name, msg]) => {
          const el = form.querySelector(`[name="${CSS.escape(name)}"], [name="${CSS.escape(name)}[]"]`);
          if (el) setError(el, msg);
        });
        if (stepped) {
          const bad = steps.findIndex((s) => s.querySelector('.has-error'));
          if (bad > -1) showStep(bad);
        }
      }
      showAlert(data.message || t('generic', 'Something went wrong. Please try again or contact us on WhatsApp.'));
      if (res.status === 403) refreshToken(form);
      if (window.turnstile) form.querySelectorAll('.cf-turnstile').forEach((w) => window.turnstile.reset(w));
    } catch {
      showAlert(t('network', 'We could not send your request. Check your connection and try again, or message us on WhatsApp.'));
    } finally {
      btns.forEach((b) => {
        b.disabled = false;
        b.classList.remove('is-loading');
      });
    }
  });

  function showAlert(msg) {
    if (!alertBox) return;
    alertBox.querySelector('span').textContent = msg;
    alertBox.hidden = false;
    alertBox.focus();
  }
}

function checkFiles(input, t) {
  const files = [...(input.files || [])];
  const max = Number(input.dataset.maxFiles || 3);
  const maxBytes = Number(input.dataset.maxMb || 8) * 1024 * 1024;
  if (files.length > max) return t('fileCount', `You can attach up to ${max} photos.`);
  for (const f of files) {
    if (!IMAGE_TYPES.includes(f.type)) return t('fileType', 'Photos must be JPG, PNG or WebP.');
    if (f.size > maxBytes) return t('fileSize', 'Each photo must be 8 MB or smaller.');
  }
  return '';
}

function listFiles(input) {
  const list = input.closest('.field')?.querySelector('.file-list');
  if (!list) return;
  list.replaceChildren(
    ...[...(input.files || [])].map((f) => {
      const li = document.createElement('li');
      li.textContent = `${f.name} (${(f.size / 1024 / 1024).toFixed(1)} MB)`;
      return li;
    }),
  );
}

// Pages are cached, so the embedded token can be old. Fetch a fresh one (uncached endpoint).
async function refreshToken(form) {
  const url = form.dataset.tokenUrl;
  if (!url) return;
  try {
    const res = await fetch(url, { credentials: 'same-origin', cache: 'no-store' });
    if (!res.ok) return;
    const data = await res.json();
    const nonce = form.querySelector('[name="_iim_nonce"]');
    const token = form.querySelector('[name="_iim_token"]');
    if (nonce && data.nonce) nonce.value = data.nonce;
    if (token && data.token) token.value = data.token;
    const js = form.querySelector('[name="_iim_js"]');
    if (js) js.value = '1';
  } catch {
    /* keep the embedded token */
  }
}

// Load Turnstile only when the visitor starts interacting with the form.
let turnstileLoading = null;
function lazyTurnstile(form) {
  const box = form.querySelector('.cf-turnstile');
  const sitekey = form.dataset.sitekey;
  if (!box || !sitekey) return;

  const load = () => {
    if (!turnstileLoading) {
      turnstileLoading = new Promise((resolve) => {
        window.iimTurnstileReady = resolve;
        const s = document.createElement('script');
        s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=iimTurnstileReady';
        s.async = true;
        document.head.appendChild(s);
      });
    }
    turnstileLoading.then(() => {
      if (box.dataset.rendered) return;
      box.dataset.rendered = '1';
      window.turnstile.render(box, { sitekey, 'response-field-name': 'cf-turnstile-response', size: 'flexible' });
    });
  };

  form.addEventListener('focusin', load, { once: true });
  form.addEventListener('pointerdown', load, { once: true });
}
