const tiles = document.querySelectorAll('.tile');
const navItems = document.querySelectorAll('.nav__item');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const maxTilt = 4;
const config = {
  sheets: {
    pricing: '1kp7bSXEfGT-DuPdD8g8U8N_P9Sn95YkCH5HTYPV03Z4',
    reviews: '11L3pRFrOdZsefk7LNERb96tr4-uMbkK149www4NbpwA',
    works: '1PIGR6IhORhHIA7xJDAPFZv8IKL6ys94xYM1reEirn9g'
  },
  orderEndpoint: 'https://script.google.com/macros/s/AKfycbxr4mtZRZAB2mGRyif1urCk0tq_xRYcLIB2T_VtE8PI7RFeJd5ShvAJ1X0ULqsM_rjp/exec'
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
];

const sections = {
  order: { title: 'Order a website', render: renderOrder },
  reviews: { title: 'Reviews', render: renderReviews },
  work: { title: 'Our work', render: renderWork },
  about: { title: 'About us', render: renderAbout },
  pricing: { title: 'Pricing', render: renderPricing }
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

function createSuccess(messenger) {
  const success = createElement('div', 'success');
  success.append(
    createElement('h3', 'card__title', 'Request sent'),
    createElement('p', 'card__text', `Thank you! We will contact you in ${messenger} once we review your request. It may take a little time, but we always reply.`)
  );
  return success;
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
      website: trap.value
    };

    if (!data.siteType || !data.messenger || !data.username || !data.description) {
      error.textContent = 'Please choose a website type and messenger, then fill in your username and description.';
      return;
    }

    error.textContent = '';
    submit.disabled = true;
    submit.textContent = 'Sending…';

    try {
      await sendOrder(data);
      modalBody.replaceChildren(createSuccess(data.messenger));
    } catch {
      error.textContent = 'Could not send the form. Check your connection and try again.';
      submit.disabled = false;
      submit.textContent = 'Send request';
    }
  });

  return form;
}

async function openSection(name) {
  const section = sections[name];
  activeSection = name;

  modalTitle.textContent = section.title;
  modalBody.replaceChildren(createElement('div', 'loader'));
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

modal.querySelector('.modal__close').addEventListener('click', closeModal);

modal.addEventListener('click', (event) => {
  if (event.target === modal) closeModal();
});

modal.addEventListener('cancel', (event) => {
  event.preventDefault();
  closeModal();
});

async function sendOrder(data) {
  await fetch(config.orderEndpoint, {
    method: 'POST',
    mode: 'no-cors',
    body: JSON.stringify(data)
  });
}
