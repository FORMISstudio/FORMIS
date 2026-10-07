const tiles = document.querySelectorAll('.tile');
const navItems = document.querySelectorAll('.nav__item');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const maxTilt = 4;
const config = {
  sheets: {
    pricing: '1kp7bSXEfGT-DuPdD8g8U8N_P9Sn95YkCH5HTYPV03Z4',
    reviews: '11L3pRFrOdZsefk7LNERb96tr4-uMbkK149www4NbpwA',
    works: '1PIGR6IhORhHIA7xJDAPFZv8IKL6ys94xYM1reEirn9g',
    guides: '1CqmaXEMdm8mryOhGViVcjk4DUFRIC-GZLaeZw9gxOnk'
  },
  orderEndpoint: 'https://script.google.com/macros/s/AKfycbwT317xHa5NF9fqSABOFfmMmb1ofQPxHUdxTRcMofQySKvo42D85aOHg_hC_CGdmFcamQ/exec',
  assistantEndpoint: 'https://formisai.formisworkk.workers.dev/'
};

tiles.forEach((tile) => { 
  tile.addEventListener('pointermove', (event) => {
    const rect = tile.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    tile.style.setProperty('--x', `${x}px`);
    tile.style.setProperty('--y', `${y}px`);

    if (reducedMotion || event.pointerType !== 'mouse') return;

    const offsetX = (x / rect.width - 0.5) * 2;
    const offsetY = (y / rect.height - 0.5) * 2;

    tile.style.setProperty('--ry', `${offsetX * maxTilt}deg`);
    tile.style.setProperty('--rx', `${-offsetY * maxTilt}deg`);
  });

  tile.addEventListener('pointerleave', () => {
    tile.style.setProperty('--rx', '0deg');
    tile.style.setProperty('--ry', '0deg');
  });
});

navItems.forEach((item) => {
  const tile = document.querySelector(`[data-tile="${item.dataset.target}"]`);

  item.addEventListener('mouseenter', () => tile.classList.add('is-linked'));
  item.addEventListener('mouseleave', () => tile.classList.remove('is-linked'));
  item.addEventListener('focus', () => tile.classList.add('is-linked'));
  item.addEventListener('blur', () => tile.classList.remove('is-linked'));
});

const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const sheetCache = {};
let activeSection = null;
let pendingOrder = '';

const siteTypes = ['Bio site', 'Other site'];
const messengers = ['Telegram', 'WhatsApp', 'Viber', 'Instagram', 'Other'];
const usernameHints = {
  Telegram: '@username',
  WhatsApp: 'Phone number',
  Viber: 'Phone number',
  Instagram: '@username',
  Other: 'Username or phone number'
};
const aboutText = [
  'FORMIS is a design and web development studio. We build websites for people and businesses, from one-page bio sites to full projects.',
  'We take care of the whole path: design, development and launch. You describe the idea, we turn it into a clean and fast website.',
  'Every project is made by hand and adjusted to the person behind it.'
  ''
  'Credits: xiyyxs, kionylixe'
];

const sections = {
  order: { title: 'Order a website', render: renderOrder },
  reviews: { title: 'Reviews', render: renderReviews },
  work: { title: 'Our work', render: renderWork },
  about: { title: 'About us', render: renderAbout },
  pricing: { title: 'Pricing', render: renderPricing },
  pay: { title: 'Pay for an order', render: renderPay },
  guides: { title: 'Instructions', render: renderGuides },
  contact: { title: 'Contact us', render: renderContact }
};

function createElement(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(cell);
      cell = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }

  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}

async function loadSheet(name) {
  if (sheetCache[name]) return sheetCache[name];

  const url = `https://docs.google.com/spreadsheets/d/${config.sheets[name]}/gviz/tq?tqx=out:csv`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Sheet request failed');

  const [headers, ...rows] = parseCsv(await response.text());
  const keys = headers.map((header) => header.trim().toLowerCase());

  sheetCache[name] = rows
    .map((row) => Object.fromEntries(keys.map((key, index) => [key, (row[index] || '').trim()])))
    .filter((record) => Object.values(record).some(Boolean));

  return sheetCache[name];
}

function safeUrl(value) {
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    return ['http:', 'https:'].includes(url.protocol) ? url : null;
  } catch {
    return null;
  }
}

function createCards(records, buildCard, emptyText) {
  if (!records.length) return createElement('p', 'modal__note', emptyText);

  const list = createElement('div', 'cards');
  records.forEach((record) => list.append(buildCard(record)));
  return list;
}

function renderAbout() {
  const text = createElement('div', 'modal__text');
  aboutText.forEach((paragraph) => text.append(createElement('p', '', paragraph)));
  return text;
}

async function renderPricing() {
  const records = await loadSheet('pricing');

  return createCards(records, (item) => {
    const card = createElement('article', 'card');
    card.append(
      createElement('h3', 'card__title', item.title),
      createElement('p', 'card__text', item.description),
      createElement('p', 'card__price', item.price)
    );
    return card;
  }, 'Prices will appear here soon.');
}

async function renderReviews() {
  const records = await loadSheet('reviews');

  return createCards(records, (item) => {
    const card = createElement('article', 'card');
    const url = safeUrl(item.link);

    card.append(
      createElement('h3', 'card__title', item.username),
      createElement('p', 'card__text', item.review)
    );

    if (url) {
      const link = createElement('a', 'card__link', url.hostname.replace(/^www\./, ''));
      link.href = url.href;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      card.append(link);
    }

    return card;
  }, 'Reviews will appear here soon.');
}

async function renderWork() {
  const records = await loadSheet('works');

  return createCards(records, (item) => {
    const url = safeUrl(item.link);
    const card = createElement(url ? 'a' : 'article', 'card');

    if (url) {
      card.href = url.href;
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
    }

    card.append(
      createElement('h3', 'card__title', item.title || url?.hostname.replace(/^www\./, '')),
      createElement('p', 'card__link', url ? url.hostname.replace(/^www\./, '') : '')
    );

    return card;
  }, 'Our work will appear here soon.');
}

async function renderGuides() {
  const records = await loadSheet('guides');

  return createCards(records, (item) => {
    const card = createElement('button', 'card card--button');
    card.type = 'button';
    card.append(
      createElement('h3', 'card__title', item.title),
      createElement('p', 'card__link', 'Read instruction')
    );
    card.addEventListener('click', () => showGuide(item));
    return card;
  }, 'Instructions will appear here soon.');
}

function showGuide(item) {
  const article = createElement('article', 'guide');
  const back = createElement('button', 'guide__back', '← All instructions');
  const text = createElement('div', 'modal__text');

  back.type = 'button';
  back.addEventListener('click', () => openSection('guides'));

  item.text.split(/\n+/).forEach((line) => text.append(createElement('p', '', line)));
  article.append(back, createElement('h3', 'guide__title', item.title), text);

  modalBody.replaceChildren(article);
  modalBody.scrollTop = 0;
}

function createChoice(options, onChange) {
  const group = createElement('div', 'choice');
  let value = '';

  group.setAttribute('role', 'radiogroup');

  options.forEach((option) => {
    const button = createElement('button', 'choice__item', option);
    button.type = 'button';
    button.setAttribute('role', 'radio');
    button.setAttribute('aria-checked', 'false');

    button.addEventListener('click', () => {
      value = option;
      group.querySelectorAll('.choice__item').forEach((item) => {
        item.setAttribute('aria-checked', String(item === button));
      });
      onChange(option);
    });

    group.append(button);
  });

  return {
    node: group,
    get value() {
      return value;
    }
  };
}

function createInput(tag, placeholder, label, maxLength) {
  const input = createElement(tag, 'input');
  input.placeholder = placeholder;
  input.maxLength = maxLength;
  input.setAttribute('aria-label', label);

  if (tag === 'textarea') input.rows = 4;
  else input.type = 'text';

  return input;
}

function createField(label, control) {
  const field = createElement('div', 'field');
  field.append(createElement('span', 'field__label', label), control);
  return field;
}

function createSuccess(messenger, code) {
  const success = createElement('div', 'success');
  success.append(
    createElement('h3', 'card__title', 'Request sent'),
    createElement('p', 'card__price', `Order number: ${code}`),
    createElement('p', 'card__text', `Save this number, you will need it to pay and check your order. We will contact you in ${messenger} once we review your request. It may take a little time, but we always reply.`)
  );
  return success;
}

async function sendOrder(data) {
  const response = await fetch(config.orderEndpoint, {
    method: 'POST',
    body: JSON.stringify(data)
  });
  const result = await response.json();

  if (!result.ok) throw new Error('Order request failed');
  return result;
}

function createMore(fields) {
  const node = createElement('div', 'more');
  const toggle = createElement('button', 'more__toggle', 'Add more details');
  const panel = createElement('div', 'more__panel');
  const inner = createElement('div', 'more__inner');

  toggle.type = 'button';
  toggle.setAttribute('aria-expanded', 'false');
  panel.inert = true;
  inner.append(...fields);
  panel.append(inner);
  node.append(toggle, panel);

  toggle.addEventListener('click', () => {
    const open = node.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    panel.inert = !open;
  });

  return node;
}

function createConsent() {
  const node = createElement('label', 'consent');
  const box = createElement('input');
  const text = createElement('span');
  const [before, linkText, after] = 'I agree with the [terms of work]'.split(/[\[\]]/);
  const link = createElement('a', '', linkText);

  box.type = 'checkbox';
  link.href = '?guide=terms-of-work';
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  text.append(before, link, after);
  node.append(box, text);

  return { node, box };
}

function renderOrder() {
  const form = createElement('form', 'form');
  form.noValidate = true;

  const siteType = createChoice(siteTypes, () => {});
  const username = createInput('input', 'Choose a messenger first', 'Username', 64);
  const messenger = createChoice(messengers, (value) => {
    username.placeholder = usernameHints[value];
  });
  const description = createInput('textarea', 'What should the website be about?', 'Website description', 1500);
  const note = createInput('textarea', 'Anything else we should know (optional)', 'Note', 800);
  const deadline = createInput('input', 'Desired deadline (optional)', 'Deadline', 64);
  const example = createInput('input', 'Link to a site you like (optional)', 'Example', 200);
  const promo = createInput('input', 'Promo code (optional)', 'Promo code', 32);
  const more = createMore([
    createField('Deadline', deadline),
    createField('Example', example),
    createField('Promo code', promo)
  ]);
  const consent = createConsent();
  const trap = createElement('input', 'form__trap');
  const error = createElement('p', 'form__error');
  const submit = createElement('button', 'form__submit', 'Send request');
  const hint = createElement('p', 'form__hint', 'After you send the form, we will contact you in the messenger you chose. It will not be instant, but we always reply.');

  trap.type = 'text';
  trap.tabIndex = -1;
  trap.autocomplete = 'off';
  trap.setAttribute('aria-hidden', 'true');
  error.setAttribute('role', 'alert');
  submit.type = 'submit';

  form.append(
    createField('Website type', siteType.node),
    createField('Messenger', messenger.node),
    createField('Your username', username),
    createField('Description', description),
    createField('Note', note),
    more,
    consent.node,
    trap,
    error,
    submit,
    hint
  );

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const data = {
      siteType: siteType.value,
      messenger: messenger.value,
      username: username.value.trim(),
      description: description.value.trim(),
      note: note.value.trim(),
      deadline: deadline.value.trim(),
      example: example.value.trim(),
      promo: promo.value.trim(),
      website: trap.value
    };

    if (!data.siteType || !data.messenger || !data.username || !data.description) {
      error.textContent = 'Please choose a website type and messenger, then fill in your username and description.';
      return;
    }

    if (!consent.box.checked) {
      error.textContent = 'Please accept the terms of work to continue.';
      return;
    }

    error.textContent = '';
    submit.disabled = true;
    submit.textContent = 'Sending…';

    try {
      const { code, promo: promoStatus, discount } = await sendOrder(data);
      const view = createSuccess(data.messenger, code);

      if (promoStatus === 'applied') {
        view.append(createElement('p', 'card__text', `Promo code applied: -${discount}%`));
      }

      if (promoStatus === 'invalid') {
        view.append(createElement('p', 'form__error', 'Promo code not found. The order was created at full price.'));
      }

      modalBody.replaceChildren(view);
    } catch {
      error.textContent = 'Could not send the form. Check your connection and try again.';
      submit.disabled = false;
      submit.textContent = 'Send request';
    }
  });

  return form;
}

async function findOrder(id) {
  const response = await fetch(`${config.orderEndpoint}?order=${encodeURIComponent(id)}`);
  if (!response.ok) throw new Error('Order request failed');
  return response.json();
}

function isPaymentLink(payment) {
  return /^https?:\/\//i.test(payment);
}

function createStatus(paid) {
  return createElement('span', `status ${paid ? 'status--paid' : 'status--unpaid'}`, paid ? 'Paid' : 'Not paid');
}

function createReceiptRow(label, value) {
  const row = createElement('div', 'receipt__row');
  const term = createElement('dt', 'receipt__label', label);
  const details = createElement('dd', 'receipt__value');

  if (value instanceof Node) details.append(value);
  else details.textContent = value;

  row.append(term, details);
  return row;
}

function createPayAction(order) {
  const url = isPaymentLink(order.payment) ? safeUrl(order.payment) : null;

  if (url) {
    const link = createElement('a', 'form__submit', 'Go to payment');
    link.href = url.href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    return link;
  }

  const button = createElement('button', 'form__submit', 'Copy card number');
  button.type = 'button';

  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(order.payment);
      button.textContent = 'Card number copied';
    } catch {
      button.textContent = 'Copy failed, select the number manually';
    }

    setTimeout(() => {
      button.textContent = 'Copy card number';
    }, 2000);
  });

  return button;
}

async function sendPaid(id) {
  const response = await fetch(config.orderEndpoint, {
    method: 'POST',
    body: JSON.stringify({ action: 'paid', order: id })
  });
  const result = await response.json();

  if (!result.ok) throw new Error('Paid request failed');
}

function createPaidButton(id) {
  const button = createElement('button', 'form__submit form__submit--ghost', 'I have paid');
  button.type = 'button';

  button.addEventListener('click', async () => {
    button.disabled = true;

    try {
      await sendPaid(id);
      button.textContent = 'Thank you! We will check the payment soon.';
    } catch {
      button.textContent = 'Could not send. Try again later.';
      button.disabled = false;
    }
  });

  return button;
}

async function sendCert(id, code) {
  const response = await fetch(config.orderEndpoint, {
    method: 'POST',
    body: JSON.stringify({ action: 'cert', order: id, code })
  });
  const result = await response.json();

  if (!result.ok) throw new Error('Certificate request failed');
}

function createCertNote() {
  return createElement('p', 'modal__note', 'Thank you! We received your certificate and will check it soon.');
}

function createCertForm(id) {
  const form = createElement('form', 'form');
  const input = createInput('input', 'Certificate code', 'Certificate code', 200);
  const error = createElement('p', 'form__error');
  const submit = createElement('button', 'form__submit', 'Send certificate');

  form.noValidate = true;
  submit.type = 'submit';
  error.setAttribute('role', 'alert');
  form.append(input, error, submit);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const code = input.value.trim();

    if (!code) {
      error.textContent = 'Enter the certificate code.';
      return;
    }

    error.textContent = '';
    submit.disabled = true;
    submit.textContent = 'Sending…';

    try {
      await sendCert(id, code);
      form.replaceWith(createCertNote());
    } catch {
      error.textContent = 'Could not send. Try again later.';
      submit.disabled = false;
      submit.textContent = 'Send certificate';
    }
  });

  return form;
}

function createPaymentRow(order, method) {
  if (method === 'card') {
    return isPaymentLink(order.payment) ? null : createReceiptRow('Card number', order.payment);
  }

  if (method === 'cert') {
    const url = safeUrl(order.payment);
    return createReceiptRow('Certificate shop', url ? url.hostname.replace(/^www\./, '') : order.payment);
  }

  return createReceiptRow('Data', 'Waiting');
}

function createPaymentActions(order, method, id) {
  if (method === 'card') return [createPayAction(order), createPaidButton(id)];

  if (method === 'cert') {
    const actions = [];
    const url = isPaymentLink(order.payment) ? safeUrl(order.payment) : null;

    if (url) {
      const link = createElement('a', 'form__submit form__submit--ghost', 'Get a certificate');
      link.href = url.href;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      actions.push(link);
    }

    actions.push(order.certSent ? createCertNote() : createCertForm(id));
    return actions;
  }

  return [createElement('p', 'modal__note', 'Payment details will appear here after we confirm your project in the messenger.')];
}

function createOrderView(order, id) {
  const view = createElement('div', 'receipt');
  const list = createElement('dl', 'receipt__list');

  list.append(
    createReceiptRow('Client', order.username),
    createReceiptRow('Amount to pay', order.amount),
    createReceiptRow('Status', createStatus(order.paid))
  );

  if (order.stage) list.append(createReceiptRow('Stage', order.stage));

  const method = order.payment ? order.type : 'non-selected';
  const paymentRow = order.paid ? null : createPaymentRow(order, method);

  if (paymentRow) list.append(paymentRow);

  view.append(list);

  if (order.paid) {
    view.append(createElement('p', 'modal__note', 'This order is already paid. Thank you!'));
  } else {
    view.append(...createPaymentActions(order, method, id));
  }

  return view;
}

function renderPay() {
  const form = createElement('form', 'form');
  const input = createInput('input', 'For example, 12345', 'Order number', 32);
  const error = createElement('p', 'form__error');
  const submit = createElement('button', 'form__submit', 'Find order');
  const result = createElement('div', 'pay__result');

  form.noValidate = true;
  submit.type = 'submit';
  error.setAttribute('role', 'alert');

  form.append(createField('Order number', input), error, submit, result);

  if (pendingOrder) {
    input.value = pendingOrder;
    pendingOrder = '';
    setTimeout(() => form.requestSubmit(), 0);
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const id = input.value.trim();

    if (!id) {
      error.textContent = 'Enter your order number.';
      return;
    }

    error.textContent = '';
    result.replaceChildren();
    submit.disabled = true;
    submit.textContent = 'Searching…';

    try {
      const order = await findOrder(id);

      if (order.found) result.replaceChildren(createOrderView(order, id));
      else error.textContent = 'Order not found. Check the number and try again.';
    } catch {
      error.textContent = 'Could not load the order. Please try again later.';
    }

    submit.disabled = false;
    submit.textContent = 'Find order';
  });

  return form;
}

async function openSection(name) {
  const section = sections[name];
  activeSection = name;

  modalTitle.textContent = section.title;
  modalBody.replaceChildren(createSkeleton());
  if (!modal.open) modal.showModal();

  try {
    const content = await section.render();
    if (activeSection === name) modalBody.replaceChildren(content);
  } catch {
    if (activeSection === name) {
      modalBody.replaceChildren(createElement('p', 'modal__note', 'Could not load this section. Please try again later.'));
    }
  }
}

function closeModal() {
  if (modal.classList.contains('is-closing')) return;

  activeSection = null;
  modal.classList.add('is-closing');

  setTimeout(() => {
    modal.classList.remove('is-closing');
    modal.close();
  }, 200);
}

document.querySelectorAll('[data-tile], [data-target]').forEach((trigger) => {
  trigger.addEventListener('click', () => openSection(trigger.dataset.tile || trigger.dataset.target));
});

document.querySelectorAll('.pay').forEach((button) => {
  button.addEventListener('pointermove', (event) => {
    const rect = button.getBoundingClientRect();
    button.style.setProperty('--x', `${event.clientX - rect.left}px`);
    button.style.setProperty('--y', `${event.clientY - rect.top}px`);
  });
});

modal.querySelector('.modal__close').addEventListener('click', closeModal);

modal.addEventListener('click', (event) => {
  if (event.target === modal) closeModal();
});

modal.addEventListener('cancel', (event) => {
  event.preventDefault();
  closeModal();
});

function createSkeleton() {
  const list = createElement('div', 'skeleton');
  for (let i = 0; i < 3; i++) list.append(createElement('div', 'skeleton__card'));
  return list;
}

const linkedOrder = new URLSearchParams(window.location.search).get('order');

if (linkedOrder) {
  pendingOrder = linkedOrder;
  openSection('pay');
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function openLinkedGuide(slug) {
  try {
    const records = await loadSheet('guides');
    const index = sheetCache.guides.findIndex((item) => slugify(item.title) === slug);

    if (index < 0) return;

    activeSection = 'guides';
    modalTitle.textContent = 'Instructions';
    if (!modal.open) modal.showModal();
    showGuide(records[index]);
  } catch {}
}

const linkedGuide = new URLSearchParams(window.location.search).get('guide');

if (linkedGuide) openLinkedGuide(linkedGuide);

const ticketTypes = ['Order question', 'Payment', 'Technical issue', 'Other'];
const ticketDigits = 4;

async function sendTicket(data) {
  const response = await fetch(config.orderEndpoint, {
    method: 'POST',
    body: JSON.stringify({ action: 'ticket', ...data })
  });
  const result = await response.json();

  if (!result.ok) throw new Error('Ticket request failed');
  return result;
}

async function findTicket(id) {
  const response = await fetch(`${config.orderEndpoint}?ticket=${encodeURIComponent(id)}`);
  if (!response.ok) throw new Error('Ticket request failed');
  return response.json();
}

function createBubble(author, text, className) {
  const bubble = createElement('div', `bubble ${className}`);
  bubble.append(createElement('span', 'bubble__author', author), createElement('p', 'bubble__text', text));
  return bubble;
}

function showChat(ticket) {
  const chat = createElement('div', 'chat');
  const back = createElement('button', 'guide__back', '← Back');
  const head = createElement('div', 'chat__head');
  const messages = createElement('div', 'chat__messages');

  back.type = 'button';
  back.addEventListener('click', () => openSection('contact'));

  head.append(
    createElement('h3', 'guide__title', `Ticket ${ticket.ticket}`),
    createElement('p', 'card__text', [ticket.type, ticket.created].filter(Boolean).join(' · '))
  );

  messages.append(createBubble('You', ticket.message, 'bubble--client'));

  if (ticket.reply) {
    messages.append(createBubble('FORMIS', ticket.reply, 'bubble--team'));
  } else {
    messages.append(createElement('p', 'chat__wait', 'No reply yet. We will answer here, check again a bit later.'));
  }

  chat.append(back, head, messages);

  if (!ticket.reply) {
    const refresh = createElement('button', 'form__submit form__submit--ghost', 'Check for reply');
    refresh.type = 'button';

    refresh.addEventListener('click', async () => {
      refresh.disabled = true;
      refresh.textContent = 'Checking…';

      try {
        const fresh = await findTicket(ticket.ticket);
        showChat(fresh.found ? fresh : ticket);
      } catch {
        refresh.disabled = false;
        refresh.textContent = 'Check for reply';
      }
    });

    chat.append(refresh);
  }

  modalBody.replaceChildren(chat);
  modalBody.scrollTop = 0;
}

function createTicketSuccess(ticket) {
  const success = createElement('div', 'success');
  success.append(
    createElement('h3', 'card__title', 'Message sent'),
    createElement('p', 'card__price', ticket),
    createElement('p', 'card__text', 'Save this number. Enter it below to see our reply.')
  );
  return success;
}

function createTicketForm() {
  const form = createElement('form', 'form');
  const type = createChoice(ticketTypes, () => {});
  const message = createInput('textarea', 'Describe your problem', 'Message', 1500);
  const trap = createElement('input', 'form__trap');
  const error = createElement('p', 'form__error');
  const submit = createElement('button', 'form__submit', 'Send message');

  form.noValidate = true;
  trap.type = 'text';
  trap.tabIndex = -1;
  trap.autocomplete = 'off';
  trap.setAttribute('aria-hidden', 'true');
  submit.type = 'submit';
  error.setAttribute('role', 'alert');

  form.append(
    createElement('h3', 'card__title', 'Write to us'),
    createField('Problem type', type.node),
    createField('Message', message),
    trap,
    error,
    submit
  );

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const data = { type: type.value, message: message.value.trim(), website: trap.value };

    if (!data.type || !data.message) {
      error.textContent = 'Choose a problem type and describe the problem.';
      return;
    }

    error.textContent = '';
    submit.disabled = true;
    submit.textContent = 'Sending…';

    try {
      const { ticket } = await sendTicket(data);
      form.replaceWith(createTicketSuccess(ticket));
    } catch {
      error.textContent = 'Could not send the message. Try again later.';
      submit.disabled = false;
      submit.textContent = 'Send message';
    }
  });

  return form;
}

function createTicketLookup() {
  const block = createElement('div', 'lookup');
  const row = createElement('div', 'lookup__row');
  const input = createInput('input', '0'.repeat(ticketDigits), 'Ticket number', 10);
  const status = createElement('p', 'form__hint');

  input.inputMode = 'numeric';
  input.autocomplete = 'off';
  row.append(createElement('span', 'lookup__prefix', 'C'), input);
  block.append(createElement('h3', 'card__title', 'Open an existing ticket'), row, status);

  input.addEventListener('input', async () => {
    input.value = input.value.replace(/\D/g, '').slice(0, ticketDigits);
    status.className = 'form__hint';
    status.textContent = '';

    if (input.value.length < ticketDigits) return;

    const value = input.value;
    status.textContent = 'Checking…';

    try {
      const ticket = await findTicket(`C${value}`);

      if (input.value !== value) return;

      if (ticket.found) {
        showChat(ticket);
      } else {
        status.className = 'form__error';
        status.textContent = 'Ticket not found. Check the number.';
      }
    } catch {
      status.className = 'form__error';
      status.textContent = 'Could not load the ticket. Try again later.';
    }
  });

  return block;
}

function renderContact() {
  const wrapper = createElement('div', 'contact');
  wrapper.append(createTicketForm(), createElement('div', 'contact__divider', 'or'), createTicketLookup());
  return wrapper;
}

const assistant = document.getElementById('assistant');
const assistantToggle = document.querySelector('.assistant-toggle');
const assistantMessages = document.getElementById('assistant-messages');
const assistantForm = document.getElementById('assistant-form');
const assistantInput = assistantForm.querySelector('input');
const assistantSend = assistantForm.querySelector('button');
const assistantHistory = [];
const quickQuestions = ['How do I order a website?', 'How do I pay?', 'What does it cost?'];
let assistantStarted = false;
let assistantBusy = false;
let hintTimer;

function clearHints() {
  clearTimeout(hintTimer);
  document.querySelectorAll('.is-hinted').forEach((node) => node.classList.remove('is-hinted'));
}

function highlightTargets(ids) {
  clearHints();

  ids.forEach((id) => {
    document.querySelectorAll(`[data-tile="${id}"], [data-target="${id}"]`).forEach((node) => node.classList.add('is-hinted'));
  });

  document.querySelector(`[data-tile="${ids[0]}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  hintTimer = setTimeout(clearHints, 8000);
}

document.addEventListener('click', (event) => {
  if (event.target.closest('.is-hinted')) clearHints();
});

async function askAssistant(messages) {
  const response = await fetch(config.assistantEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages })
  });

  if (!response.ok) throw new Error('Assistant request failed');

  const data = await response.json();
  const text = [data.reply, data.text, data.message, data.choices?.[0]?.message?.content].find((value) => typeof value === 'string');

  if (!text) throw new Error('Empty reply');
  return text;
}

function parseReply(raw) {
  const ids = [...raw.matchAll(/\[\[show:([a-z]+)\]\]/g)].map((match) => match[1]);

  return {
    text: raw.replace(/\[\[show:[a-z]+\]\]/g, '').trim(),
    targets: [...new Set(ids)].filter((id) => sections[id]).slice(0, 2)
  };
}

function addMessage(role, text, targets = []) {
  const message = createElement('div', `assistant__msg assistant__msg--${role}`);
  message.append(createElement('p', '', text));

  if (targets.length) {
    const chips = createElement('div', 'assistant__chips');

    targets.forEach((id) => {
      const chip = createElement('button', 'assistant__chip', `Show: ${sections[id].title}`);
      chip.type = 'button';

      chip.addEventListener('click', () => {
        highlightTargets([id]);
        if (window.matchMedia('(max-width: 960px)').matches) setAssistantOpen(false);
      });

      chips.append(chip);
    });

    message.append(chips);
  }

  assistantMessages.append(message);
  assistantMessages.scrollTop = assistantMessages.scrollHeight;
  return message;
}

function addTyping() {
  const typing = createElement('div', 'assistant__msg assistant__msg--assistant assistant__msg--typing');
  typing.append(createElement('span'), createElement('span'), createElement('span'));
  assistantMessages.append(typing);
  assistantMessages.scrollTop = assistantMessages.scrollHeight;
  return typing;
}

async function sendAssistantMessage(text) {
  if (assistantBusy || !text) return;

  assistantBusy = true;
  assistantSend.disabled = true;
  assistantMessages.querySelector('.assistant__chips:not(.assistant__msg .assistant__chips)')?.remove();

  addMessage('user', text);
  assistantHistory.push({ role: 'user', content: text });

  const typing = addTyping();

  try {
    const { text: reply, targets } = parseReply(await askAssistant(assistantHistory.slice(-10)));

    typing.remove();
    assistantHistory.push({ role: 'assistant', content: reply });
    addMessage('assistant', reply, targets);

    if (targets.length && window.matchMedia('(min-width: 961px)').matches) highlightTargets(targets);
  } catch {
    typing.remove();
    assistantHistory.pop();
    addMessage('assistant', 'The assistant is unavailable right now. Please try again later or use Contact us.');
  } finally {
    assistantBusy = false;
    assistantSend.disabled = false;
  }
}

function startAssistant() {
  assistantStarted = true;
  addMessage('assistant', 'Hi! I can help you order a website, find prices or answer questions about FORMIS.');

  const chips = createElement('div', 'assistant__chips');

  quickQuestions.forEach((question) => {
    const chip = createElement('button', 'assistant__chip', question);
    chip.type = 'button';
    chip.addEventListener('click', () => sendAssistantMessage(question));
    chips.append(chip);
  });

  assistantMessages.append(chips);
}

function setAssistantOpen(open) {
  assistant.classList.toggle('is-open', open);
  assistant.inert = !open;
  assistantToggle.setAttribute('aria-expanded', String(open));

  if (!open) return;

  if (!assistantStarted) startAssistant();
  if (window.matchMedia('(hover: hover)').matches) assistantInput.focus();
}

assistantToggle.addEventListener('click', () => setAssistantOpen(!assistant.classList.contains('is-open')));
assistant.querySelector('.assistant__close').addEventListener('click', () => setAssistantOpen(false));

assistantForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const text = assistantInput.value.trim();
  assistantInput.value = '';
  sendAssistantMessage(text);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && assistant.classList.contains('is-open') && !modal.open) setAssistantOpen(false);
});

assistant.inert = true;
