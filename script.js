const tiles = document.querySelectorAll('.tile');
const navItems = document.querySelectorAll('.nav__item');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const maxTilt = 4;
const config = {
  sheets: {
    pricing: '1kp7bSXEfGT-DuPdD8g8U8N_P9Sn95YkCH5HTYPV03Z4',
    reviews: '11L3pRFrOdZsefk7LNERb96tr4-uMbkK149www4NbpwA',
    works: '1PIGR6IhORhHIA7xJDAPFZv8IKL6ys94xYM1reEirn9g',
    guides: '1CqmaXEMdm8mryOhGViVcjk4DUFRIC-GZLaeZw9gxOnk',
    status: '1R3e0keNNJf3CYm4KqgP3-qKTtpMhEX5O8IxGA3Sb2-Q'
  },
  orderEndpoint: 'https://script.google.com/macros/s/AKfycbwT317xHa5NF9fqSABOFfmMmb1ofQPxHUdxTRcMofQySKvo42D85aOHg_hC_CGdmFcamQ/exec'
};

const uk = {
  "Order a website": "Замовити сайт",
  "Reviews": "Відгуки",
  "Our work": "Наші роботи",
  "About us": "Про нас",
  "Pricing": "Прайс",
  "Pay for an order": "Оплатити замовлення",
  "Instructions": "Інструкції",
  "Tell us about your business and get a site built around it.": "Розкажіть про свій бізнес, і ми зробимо сайт під нього.",
  "What our clients say": "Що кажуть клієнти",
  "Who builds your website": "Хто створює ваш сайт",
  "Websites we have designed and built": "Сайти, які ми створили",
  "Clear packages, no surprises": "Зрозумілі пакети без сюрпризів",
  "Enter your order number": "Введіть номер замовлення",
  "How to order and pay": "Як замовити та оплатити",
  "FORMIS is a design and web development studio. We build websites for people and businesses, from one-page bio sites to full projects.": "FORMIS — студія дизайну та веб-розробки. Ми створюємо сайти для людей і бізнесу, від односторінкових біо-сайтів до великих проєктів.",
  "We take care of the whole path: design, development and launch. You describe the idea, we turn it into a clean and fast website.": "Ми беремо на себе весь шлях: дизайн, розробку та запуск. Ви описуєте ідею, а ми перетворюємо її на чистий і швидкий сайт.",
  "Every project is made by hand and adjusted to the person behind it.": "Кожен проєкт робиться вручну та підлаштовується під людину, яка за ним стоїть.",
  "Phone number": "Номер телефону",
  "Username or phone number": "Юзернейм або номер телефону",
  "Order number: {code}": "Номер замовлення: {code}",
  "Save this number, you will need it to pay and check your order. We will contact you in {messenger} once we review your request. It may take a little time, but we always reply.": "Збережіть цей номер, він потрібен для оплати та перевірки замовлення. Ми зв’яжемося з вами в {messenger}, щойно розглянемо заявку. Це може зайняти трохи часу, але ми завжди відповідаємо.",
  "Could not load this section. Please try again later.": "Не вдалося завантажити розділ. Спробуйте пізніше.",
  "Prices will appear here soon.": "Ціни скоро з’являться тут.",
  "Reviews will appear here soon.": "Відгуки скоро з’являться тут.",
  "Our work will appear here soon.": "Наші роботи скоро з’являться тут.",
  "Instructions will appear here soon.": "Інструкції скоро з’являться тут.",
  "Website type": "Тип сайту",
  "Messenger": "Месенджер",
  "Your username": "Ваш юзернейм",
  "Description": "Опис",
  "Note": "Примітка",
  "Choose a messenger first": "Спочатку оберіть месенджер",
  "What should the website be about?": "Про що має бути сайт?",
  "Anything else we should know (optional)": "Що ще нам варто знати (необов’язково)",
  "Send request": "Надіслати заявку",
  "Sending…": "Надсилаємо…",
  "After you send the form, we will contact you in the messenger you chose. It will not be instant, but we always reply.": "Після надсилання форми ми зв’яжемося з вами в обраному месенджері. Це буде не миттєво, але ми завжди відповідаємо.",
  "Please choose a website type and messenger, then fill in your username and description.": "Оберіть тип сайту та месенджер, потім вкажіть юзернейм і опис.",
  "Could not send the form. Check your connection and try again.": "Не вдалося надіслати форму. Перевірте з’єднання та спробуйте ще раз.",
  "Request sent": "Заявку надіслано",
  "Order number": "Номер замовлення",
  "For example, 12345": "Наприклад, 12345",
  "Find order": "Знайти замовлення",
  "Searching…": "Шукаємо…",
  "Enter your order number.": "Введіть номер замовлення.",
  "Order not found. Check the number and try again.": "Замовлення не знайдено. Перевірте номер і спробуйте ще раз.",
  "Could not load the order. Please try again later.": "Не вдалося завантажити замовлення. Спробуйте пізніше.",
  "Client": "Клієнт",
  "Amount to pay": "Сума до оплати",
  "Status": "Статус",
  "Paid": "Оплачено",
  "Not paid": "Не оплачено",
  "Card number": "Номер картки",
  "Stage": "Етап",
  "This order is already paid. Thank you!": "Це замовлення вже оплачено. Дякуємо!",
  "Go to payment": "Перейти до оплати",
  "Copy card number": "Скопіювати номер картки",
  "Card number copied": "Номер картки скопійовано",
  "Copy failed, select the number manually": "Не вдалося скопіювати, виділіть номер вручну",
  "I have paid": "Я оплатив(-ла)",
  "Thank you! We will check the payment soon.": "Дякуємо! Незабаром перевіримо оплату.",
  "Could not send. Try again later.": "Не вдалося надіслати. Спробуйте пізніше.",
  "← All instructions": "← Усі інструкції",
  "Read instruction": "Читати інструкцію",
  "Deadline": "Терміни",
  "Example": "Приклад",
  "Promo code": "Промокод",
  "Desired deadline (optional)": "Бажані терміни (необов’язково)",
  "Link to a site you like (optional)": "Посилання на сайт, який подобається (необов’язково)",
  "Promo code (optional)": "Промокод (необов’язково)",
  "Promo code applied: -{discount}%": "Промокод застосовано: -{discount}%",
  "Promo code not found. The order was created at full price.": "Промокод не знайдено. Замовлення створено за повною ціною.",
  "I agree with the [terms of work]": "Я погоджуюся з [умовами роботи]",
  "Please accept the terms of work to continue.": "Підтвердьте згоду з умовами роботи, щоб продовжити.",
  "Add more details": "Додати подробиці"
};
 
const ru = {
  "Order a website": "Заказать сайт",
  "Reviews": "Отзывы",
  "Our work": "Наши работы",
  "About us": "О нас",
  "Pricing": "Прайс",
  "Pay for an order": "Оплатить заказ",
  "Instructions": "Инструкции",
  "Tell us about your business and get a site built around it.": "Расскажите о своём бизнесе, и мы сделаем сайт под него.",
  "What our clients say": "Что говорят клиенты",
  "Who builds your website": "Кто создаёт ваш сайт",
  "Websites we have designed and built": "Сайты, которые мы создали",
  "Clear packages, no surprises": "Понятные пакеты без сюрпризов",
  "Enter your order number": "Введите номер заказа",
  "How to order and pay": "Как заказать и оплатить",
  "FORMIS is a design and web development studio. We build websites for people and businesses, from one-page bio sites to full projects.": "FORMIS — студия дизайна и веб-разработки. Мы создаём сайты для людей и бизнеса, от одностраничных био-сайтов до крупных проектов.",
  "We take care of the whole path: design, development and launch. You describe the idea, we turn it into a clean and fast website.": "Мы берём на себя весь путь: дизайн, разработку и запуск. Вы описываете идею, а мы превращаем её в чистый и быстрый сайт.",
  "Every project is made by hand and adjusted to the person behind it.": "Каждый проект делается вручную и подстраивается под человека, который за ним стоит.",
  "Phone number": "Номер телефона",
  "Username or phone number": "Юзернейм или номер телефона",
  "Order number: {code}": "Номер заказа: {code}",
  "Save this number, you will need it to pay and check your order. We will contact you in {messenger} once we review your request. It may take a little time, but we always reply.": "Сохраните этот номер, он нужен для оплаты и проверки заказа. Мы свяжемся с вами в {messenger}, как только рассмотрим заявку. Это может занять немного времени, но мы всегда отвечаем.",
  "Could not load this section. Please try again later.": "Не удалось загрузить раздел. Попробуйте позже.",
  "Prices will appear here soon.": "Цены скоро появятся здесь.",
  "Reviews will appear here soon.": "Отзывы скоро появятся здесь.",
  "Our work will appear here soon.": "Наши работы скоро появятся здесь.",
  "Instructions will appear here soon.": "Инструкции скоро появятся здесь.",
  "Website type": "Тип сайта",
  "Messenger": "Мессенджер",
  "Your username": "Ваш юзернейм",
  "Description": "Описание",
  "Note": "Примечание",
  "Choose a messenger first": "Сначала выберите мессенджер",
  "What should the website be about?": "О чём должен быть сайт?",
  "Anything else we should know (optional)": "Что ещё нам стоит знать (необязательно)",
  "Send request": "Отправить заявку",
  "Sending…": "Отправляем…",
  "After you send the form, we will contact you in the messenger you chose. It will not be instant, but we always reply.": "После отправки формы мы свяжемся с вами в выбранном мессенджере. Это будет не мгновенно, но мы всегда отвечаем.",
  "Please choose a website type and messenger, then fill in your username and description.": "Выберите тип сайта и мессенджер, затем укажите юзернейм и описание.",
  "Could not send the form. Check your connection and try again.": "Не удалось отправить форму. Проверьте соединение и попробуйте ещё раз.",
  "Request sent": "Заявка отправлена",
  "Order number": "Номер заказа",
  "For example, 12345": "Например, 12345",
  "Find order": "Найти заказ",
  "Searching…": "Ищем…",
  "Enter your order number.": "Введите номер заказа.",
  "Order not found. Check the number and try again.": "Заказ не найден. Проверьте номер и попробуйте ещё раз.",
  "Could not load the order. Please try again later.": "Не удалось загрузить заказ. Попробуйте позже.",
  "Client": "Клиент",
  "Amount to pay": "Сумма к оплате",
  "Status": "Статус",
  "Paid": "Оплачено",
  "Not paid": "Не оплачено",
  "Card number": "Номер карты",
  "Stage": "Этап",
  "This order is already paid. Thank you!": "Этот заказ уже оплачен. Спасибо!",
  "Go to payment": "Перейти к оплате",
  "Copy card number": "Скопировать номер карты",
  "Card number copied": "Номер карты скопирован",
  "Copy failed, select the number manually": "Не удалось скопировать, выделите номер вручную",
  "I have paid": "Я оплатил(а)",
  "Thank you! We will check the payment soon.": "Спасибо! Скоро проверим оплату.",
  "Could not send. Try again later.": "Не удалось отправить. Попробуйте позже.",
  "← All instructions": "← Все инструкции",
  "Read instruction": "Читать инструкцию",
  "Deadline": "Сроки",
  "Example": "Пример",
  "Promo code": "Промокод",
  "Desired deadline (optional)": "Желаемые сроки (необязательно)",
  "Link to a site you like (optional)": "Ссылка на сайт, который нравится (необязательно)",
  "Promo code (optional)": "Промокод (необязательно)",
  "Promo code applied: -{discount}%": "Промокод применён: -{discount}%",
  "Promo code not found. The order was created at full price.": "Промокод не найден. Заказ создан по полной цене.",
  "I agree with the [terms of work]": "Я согласен(на) с [условиями работы]",
  "Please accept the terms of work to continue.": "Подтвердите согласие с условиями работы, чтобы продолжить.",
  "Add more details": "Добавить подробности"
};
 
const dictionaries = { uk, ru };
 
function readLang() {
  try {
    const saved = localStorage.getItem('lang');
    if (['en', 'uk', 'ru'].includes(saved)) return saved;
  } catch {}
  const system = navigator.language.slice(0, 2);
  return ['uk', 'ru'].includes(system) ? system : 'en';
}
 
let lang = readLang();
 
function t(text, vars = {}) {
  const base = dictionaries[lang]?.[text] || text;
  return base.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? '');
}
 
function localize(record) {
  if (lang === 'en') return record;
 
  const copy = { ...record };
  Object.keys(record)
    .filter((key) => key.endsWith(`_${lang}`) && record[key])
    .forEach((key) => {
      copy[key.slice(0, -3)] = record[key];
    });
  return copy;
}
 
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
];
 
const sections = {
  order: { title: 'Order a website', render: renderOrder },
  reviews: { title: 'Reviews', render: renderReviews },
  work: { title: 'Our work', render: renderWork },
  about: { title: 'About us', render: renderAbout },
  pricing: { title: 'Pricing', render: renderPricing },
  pay: { title: 'Pay for an order', render: renderPay },
  guides: { title: 'Instructions', render: renderGuides }
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
  if (sheetCache[name]) return sheetCache[name].map(localize);
 
  const url = `https://docs.google.com/spreadsheets/d/${config.sheets[name]}/gviz/tq?tqx=out:csv`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Sheet request failed');
 
  const [headers, ...rows] = parseCsv(await response.text());
  const keys = headers.map((header) => header.trim().toLowerCase());
 
  sheetCache[name] = rows
    .map((row) => Object.fromEntries(keys.map((key, index) => [key, (row[index] || '').trim()])))
    .filter((record) => Object.values(record).some(Boolean));
 
  return sheetCache[name].map(localize);
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
  aboutText.forEach((paragraph) => text.append(createElement('p', '', t(paragraph))));
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
  }, t('Prices will appear here soon.'));
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
  }, t('Reviews will appear here soon.'));
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
  }, t('Our work will appear here soon.'));
}
 
async function renderGuides() {
  const records = await loadSheet('guides');
 
  return createCards(records, (item) => {
    const card = createElement('button', 'card card--button');
    card.type = 'button';
    card.append(
      createElement('h3', 'card__title', item.title),
      createElement('p', 'card__link', t('Read instruction'))
    );
    card.addEventListener('click', () => showGuide(item));
    return card;
  }, t('Instructions will appear here soon.'));
}
 
function showGuide(item) {
  const article = createElement('article', 'guide');
  const back = createElement('button', 'guide__back', t('← All instructions'));
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
    createElement('h3', 'card__title', t('Request sent')),
    createElement('p', 'card__price', t('Order number: {code}', { code })),
    createElement('p', 'card__text', t('Save this number, you will need it to pay and check your order. We will contact you in {messenger} once we review your request. It may take a little time, but we always reply.', { messenger }))
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
  const toggle = createElement('button', 'more__toggle', t('Add more details'));
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
  const [before, linkText, after] = t('I agree with the [terms of work]').split(/[\[\]]/);
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
  const username = createInput('input', t('Choose a messenger first'), 'Username', 64);
  const messenger = createChoice(messengers, (value) => {
    username.placeholder = t(usernameHints[value]);
  });
  const description = createInput('textarea', t('What should the website be about?'), 'Website description', 1500);
  const note = createInput('textarea', t('Anything else we should know (optional)'), t('Note'), 800);
  const deadline = createInput('input', t('Desired deadline (optional)'), t('Deadline'), 64);
  const example = createInput('input', t('Link to a site you like (optional)'), t('Example'), 200);
  const promo = createInput('input', t('Promo code (optional)'), t('Promo code'), 32);
  const more = createMore([
    createField(t('Deadline'), deadline),
    createField(t('Example'), example),
    createField(t('Promo code'), promo)
  ]);
  const consent = createConsent();
  const trap = createElement('input', 'form__trap');
  const error = createElement('p', 'form__error');
  const submit = createElement('button', 'form__submit', t('Send request'));
  const hint = createElement('p', 'form__hint', t('After you send the form, we will contact you in the messenger you chose. It will not be instant, but we always reply.'));
 
  trap.type = 'text';
  trap.tabIndex = -1;
  trap.autocomplete = 'off';
  trap.setAttribute('aria-hidden', 'true');
  error.setAttribute('role', 'alert');
  submit.type = 'submit';
 
  form.append(
    createField(t('Website type'), siteType.node),
    createField(t('Messenger'), messenger.node),
    createField(t('Your username'), username),
    createField(t('Description'), description),
    createField(t('Note'), note),
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
      error.textContent = t('Please choose a website type and messenger, then fill in your username and description.');
      return;
    }
 
    if (!consent.box.checked) {
      error.textContent = t('Please accept the terms of work to continue.');
      return;
    }
 
    error.textContent = '';
    submit.disabled = true;
    submit.textContent = t('Sending…');
 
    try {
      const { code, promo: promoStatus, discount } = await sendOrder(data);
      const view = createSuccess(data.messenger, code);
 
      if (promoStatus === 'applied') {
        view.append(createElement('p', 'card__text', t('Promo code applied: -{discount}%', { discount })));
      }
 
      if (promoStatus === 'invalid') {
        view.append(createElement('p', 'form__error', t('Promo code not found. The order was created at full price.')));
      }
 
      modalBody.replaceChildren(view);
    } catch {
      error.textContent = t('Could not send the form. Check your connection and try again.');
      submit.disabled = false;
      submit.textContent = t('Send request');
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
  return createElement('span', `status ${paid ? 'status--paid' : 'status--unpaid'}`, paid ? t('Paid') : t('Not paid'));
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
    const link = createElement('a', 'form__submit', t('Go to payment'));
    link.href = url.href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    return link;
  }
 
  const button = createElement('button', 'form__submit', t('Copy card number'));
  button.type = 'button';
 
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(order.payment);
      button.textContent = t('Card number copied');
    } catch {
      button.textContent = t('Copy failed, select the number manually');
    }
 
    setTimeout(() => {
      button.textContent = t('Copy card number');
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
  const button = createElement('button', 'form__submit form__submit--ghost', t('I have paid'));
  button.type = 'button';
 
  button.addEventListener('click', async () => {
    button.disabled = true;
 
    try {
      await sendPaid(id);
      button.textContent = t('Thank you! We will check the payment soon.');
    } catch {
      button.textContent = t('Could not send. Try again later.');
      button.disabled = false;
    }
  });
 
  return button;
}
 
function createOrderView(order, id) {
  const view = createElement('div', 'receipt');
  const list = createElement('dl', 'receipt__list');
 
  list.append(
    createReceiptRow(t('Client'), order.username),
    createReceiptRow(t('Amount to pay'), order.amount),
    createReceiptRow(t('Status'), createStatus(order.paid))
  );
 
  if (order.stage) list.append(createReceiptRow(t('Stage'), order.stage));
 
  if (!order.paid && !isPaymentLink(order.payment)) {
    list.append(createReceiptRow(t('Card number'), order.payment));
  }
 
  view.append(list);
 
  if (order.paid) {
    view.append(createElement('p', 'modal__note', t('This order is already paid. Thank you!')));
  } else {
    view.append(createPayAction(order), createPaidButton(id));
  }
 
  return view;
}
 
function renderPay() {
  const form = createElement('form', 'form');
  const input = createInput('input', t('For example, 12345'), t('Order number'), 32);
  const error = createElement('p', 'form__error');
  const submit = createElement('button', 'form__submit', t('Find order'));
  const result = createElement('div', 'pay__result');
 
  form.noValidate = true;
  submit.type = 'submit';
  error.setAttribute('role', 'alert');
 
  form.append(createField(t('Order number'), input), error, submit, result);
 
  if (pendingOrder) {
    input.value = pendingOrder;
    pendingOrder = '';
    setTimeout(() => form.requestSubmit(), 0);
  }
 
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
 
    const id = input.value.trim();
 
    if (!id) {
      error.textContent = t('Enter your order number.');
      return;
    }
 
    error.textContent = '';
    result.replaceChildren();
    submit.disabled = true;
    submit.textContent = t('Searching…');
 
    try {
      const order = await findOrder(id);
 
      if (order.found) result.replaceChildren(createOrderView(order, id));
      else error.textContent = t('Order not found. Check the number and try again.');
    } catch {
      error.textContent = t('Could not load the order. Please try again later.');
    }
 
    submit.disabled = false;
    submit.textContent = t('Find order');
  });
 
  return form;
}
 
async function openSection(name) {
  const section = sections[name];
  activeSection = name;
 
  modalTitle.textContent = t(section.title);
  modalBody.replaceChildren(createSkeleton());
  if (!modal.open) modal.showModal();
 
  try {
    const content = await section.render();
    if (activeSection === name) modalBody.replaceChildren(content);
  } catch {
    if (activeSection === name) {
      modalBody.replaceChildren(createElement('p', 'modal__note', t('Could not load this section. Please try again later.')));
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
 
const langGroup = document.querySelector('.lang');
const langButtons = langGroup.querySelectorAll('[data-lang]');
const langOrder = ['en', 'uk', 'ru'];
 
function applyStatic(animate = false) {
  document.documentElement.lang = lang;
 
  document.querySelectorAll('.nav__item, .tile__title, .tile__text, .pay__title, .pay__text').forEach((node, index) => {
    node.dataset.en ||= node.textContent;
    node.textContent = t(node.dataset.en);
 
    if (animate && !reducedMotion) {
      node.animate(
        [
          { opacity: 0, transform: 'translateY(6px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ],
        { duration: 450, delay: index * 18, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)', fill: 'backwards' }
      );
    }
  });
 
  langGroup.style.setProperty('--i', langOrder.indexOf(lang));
 
  langButtons.forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.lang === lang));
  });
}
 
langButtons.forEach((button) => {
  button.addEventListener('click', () => {
    if (button.dataset.lang === lang) return;
 
    lang = button.dataset.lang;
 
    try {
      localStorage.setItem('lang', lang);
    } catch {}
 
    applyStatic(true);
    updateBadge();
    if (modal.open && activeSection) openSection(activeSection);
  });
});
 
applyStatic();
 
function createSkeleton() {
  const list = createElement('div', 'skeleton');
  for (let i = 0; i < 3; i++) list.append(createElement('div', 'skeleton__card'));
  return list;
}
 
async function updateBadge() {
  const host = document.querySelector('.tile--order');
 
  try {
    const [record] = await loadSheet('status');
    host.querySelector('.badge')?.remove();
    if (!record || !record.text) return;
 
    const isOpen = record.state.toLowerCase() === 'open';
    host.prepend(createElement('span', isOpen ? 'badge' : 'badge badge--busy', record.text));
  } catch {}
}
 
updateBadge();
 
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
    modalTitle.textContent = t('Instructions');
    if (!modal.open) modal.showModal();
    showGuide(records[index]);
  } catch {}
}
 
const linkedGuide = new URLSearchParams(window.location.search).get('guide');
 
if (linkedGuide) openLinkedGuide(linkedGuide);