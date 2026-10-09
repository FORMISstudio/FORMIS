(() => {
  if (document.getElementById('formis-badge')) return;

  const script = document.currentScript || document.querySelector('script[src*="badge.js"]');
  const origin = 'https://formis.space';
  const position = ['left', 'center', 'right'].includes(script?.dataset.position) ? script.dataset.position : 'right';
  const fontUrl = 'https://fonts.googleapis.com/css2?family=Cal+Sans&display=swap';

  if (!document.querySelector(`link[href="${fontUrl}"]`)) {
    const font = document.createElement('link');
    font.rel = 'stylesheet';
    font.href = fontUrl;
    document.head.append(font);
  }

  const host = document.createElement('div');
  host.id = 'formis-badge';
  host.dataset.position = position;

  const root = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');

  style.textContent = `
    :host {
      all: initial;
      position: fixed;
      bottom: calc(18px + env(safe-area-inset-bottom, 0px));
      z-index: 2147483000;
    }

    :host([data-position="right"]) { right: 18px; }
    :host([data-position="left"]) { left: 18px; }
    :host([data-position="center"]) { left: 50%; transform: translateX(-50%); }

    a {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 24px;
      border: 1px solid #2a2a2a;
      border-radius: 999px;
      background: #050505;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
      color: #fff;
      font: 400 17px/1 "Cal Sans", system-ui, sans-serif;
      text-decoration: none;
      white-space: nowrap;
      transition: transform 0.3s cubic-bezier(0.2, 0.7, 0.2, 1), border-color 0.3s;
      animation: in 0.6s cubic-bezier(0.2, 0.7, 0.2, 1) 0.8s backwards;
    }

    a:hover {
      transform: translateY(-2px);
      border-color: #5a5a5a;
    }

    a:focus-visible {
      outline: 2px solid #fff;
      outline-offset: 3px;
    }

    .by { color: #8c8c8c; }

    @keyframes in {
      from { opacity: 0; transform: translateY(8px); }
    }

    @media (max-width: 600px) {
      :host { bottom: calc(12px + env(safe-area-inset-bottom, 0px)); }
      :host([data-position="right"]) { right: 12px; }
      :host([data-position="left"]) { left: 12px; }
      a { padding: 12px 20px; font-size: 15px; }
      .by { display: none; }
    }

    @media (prefers-reduced-motion: reduce) {
      a { animation: none; transition: none; }
    }

    @media print {
      :host { display: none; }
    }
  `;

  const link = document.createElement('a');
  link.href = `${origin}/?utm_source=${encodeURIComponent(location.hostname)}&utm_medium=badge`;
  link.target = '_blank';
  link.rel = 'noopener';
  link.setAttribute('aria-label', 'Created by FORMIS, formis.space');

  const by = document.createElement('span');
  by.className = 'by';
  by.textContent = 'Created by';

  const name = document.createElement('span');
  name.className = 'name';
  name.textContent = 'formis.space';

  link.append(by, name);
  root.append(style, link);
  document.body.append(host);
})();
