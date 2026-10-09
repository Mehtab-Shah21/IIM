// Conversion events for Analytics (GA4 via GTM or gtag): phone_click, whatsapp_click.
// quote_submit is pushed from form.js on success. Nothing is sent if no tag is installed.
export function push(event, params = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
}

export function initTracking() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href');
    const location = a.dataset.track || a.closest('[data-track-zone]')?.dataset.trackZone || 'unknown';
    if (href.startsWith('tel:')) push('phone_click', { link_location: location });
    else if (href.includes('wa.me/') || href.includes('api.whatsapp.com')) push('whatsapp_click', { link_location: location });
  });
}
