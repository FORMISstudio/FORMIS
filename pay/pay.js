const config = {
  endpoint: 'https://script.google.com/macros/s/AKfycbwT317xHa5NF9fqSABOFfmMmb1ofQPxHUdxTRcMofQySKvo42D85aOHg_hC_CGdmFcamQ/exec'
};

const countryCodes = 'AD AE AF AG AI AL AM AO AR AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BR BS BT BW BY BZ CA CD CF CG CH CI CK CL CM CN CO CR CU CV CW CY CZ DE DJ DK DM DO DZ EC EE EG ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GT GU GW GY HK HN HR HT HU ID IE IL IM IN IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MQ MR MS MT MU MV MW MX MY MZ NA NC NE NG NI NL NO NP NR NZ OM PA PE PF PG PH PK PL PM PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SI SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TG TH TJ TL TM TN TO TR TT TV TW TZ UA UG US UY UZ VA VC VE VG VI VN VU WS XK YE YT ZA ZM ZW'.split(' ');

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

const countries = countryCodes
  .map((code) => {
    try {
      return { code, name: regionNames.of(code) };
    } catch {
      return { code, name: code };
    }
  })
  .sort((a, b) => a.name.localeCompare(b.name));

const panel = document.getElementById('panel');
const summary = document.getElementById('summary');
const stepNodes = document.querySelectorAll('#steps li');
const state = { id: '', order: null, country: null, methods: [], method: null, recorded: new Set(), pending: null };

class UserError extends Error {}

function make(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function safeUrl(value) {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url : null;
  } catch {
    return null;
  }
}

async function getJson(query) {
  const response = await fetch(`${config.endpoint}?${query}`);
  if (!response.ok) throw new Error('Request failed');
  return response.json();
}

async function postJson(body) {
  const response = await fetch(config.endpoint, { method: 'POST', body: JSON.stringify(body) });
  const result = await response.json();
  if (!result.ok) throw new Error('Request failed');
  return result;
}

function friendly(error, fallback) {
  return error instanceof UserError ? error.message : fallback;
}

function setStep(number) {
  stepNodes.forEach((node, index) => {
    node.classList.toggle('is-active', index + 1 === number);
    node.classList.toggle('is-done', index + 1 < number);
  });
}

function showPanel(step, label, title, body) {
  const head = make('div', 'panel__head');
  head.append(make('p', 'label', label), make('h1', 'panel__title', title));
  panel.replaceChildren(head, body);
  setStep(step);
}

function mask(name) {
  const clean = String(name || '').replace(/\s*\(.*\)\s*$/, '').replace(/^@/, '');
  return clean ? `${clean.slice(0, 2)}***` : '—';
}

function summaryRow(label, value, className) {
  const row = make('div', 'summary__row');
  const term = make('dt', 'label', label);
  const detail = make('dd', className);

  if (value instanceof Node) detail.append(value);
  else detail.textContent = value;

  row.append(term, detail);
  return row;
}

function renderSummary() {
  const order = state.order;
  const list = make('dl');

  if (!order) {
    summary.replaceChildren();
    return;
  }

  const status = make('span', `status ${order.paid ? 'status--paid' : 'status--unpaid'}`, order.paid ? 'Paid' : 'Awaiting payment');

  list.append(
    summaryRow('Order', state.id),
    summaryRow('Client', mask(order.username)),
    summaryRow('Amount', order.amount, 'summary__amount'),
    summaryRow('Status', status)
  );

  summary.replaceChildren(list);
}

function noticeNode(text, kind = '') {
  const node = make('p', `notice ${kind}`.trim(), text);
  node.hidden = !text;
  return node;
}

function renderOrderStep(errorText = '') {
  const form = make('form', 'panel__body');
  const field = make('div', 'field');
  const label = make('label', 'label', 'Order number');
  const input = make('input', 'input');
  const error = noticeNode(errorText, 'notice--error');
  const submit = make('button', 'btn', 'Continue');

  input.id = 'order-input';
  label.htmlFor = input.id;
  input.type = 'text';
  input.value = state.id;
  input.placeholder = '12345';
  input.autocomplete = 'off';
  input.maxLength = 24;
  submit.type = 'submit';

  field.append(label, input);
  form.append(make('p', 'hint', 'The order number was shown after you sent your request and in our message to you.'), field, error, submit);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const id = input.value.trim();

    if (!id) {
      error.textContent = 'Enter your order number.';
      error.hidden = false;
      return;
    }

    error.hidden = true;
    submit.disabled = true;
    submit.textContent = 'Checking…';

    try {
      await loadOrder(id);
    } catch (err) {
      error.textContent = friendly(err, 'Could not load the order. Please try again later.');
      error.hidden = false;
      submit.disabled = false;
      submit.textContent = 'Continue';
    }
  });

  showPanel(1, 'Step 1 of 4', 'Enter your order number', form);
  input.focus({ preventScroll: true });
}

async function loadOrder(id) {
  const data = await getJson(`order=${encodeURIComponent(id)}`);

  if (!data.found) throw new UserError('Order not found. Check the number and try again.');

  Object.assign(state, { id, order: data, country: null, methods: [], method: null });
  state.recorded.clear();
  renderSummary();

  if (data.paid) renderDone('paid');
  else renderCountryStep();
}

function renderCountryStep(errorText = '') {
  const body = make('div', 'panel__body');
  const search = make('input', 'input');
  const list = make('div', 'countries');
  const error = noticeNode(errorText, 'notice--error');
  const actions = make('div', 'actions');
  const next = make('button', 'btn', 'Continue');
  const back = make('button', 'btn btn--ghost', 'Change order');

  search.type = 'search';
  search.placeholder = 'Search country';
  search.autocomplete = 'off';
  search.setAttribute('aria-label', 'Search country');
  next.type = 'button';
  next.disabled = !state.country;
  back.type = 'button';

  function draw() {
    const query = search.value.trim().toLowerCase();
    const found = countries.filter((item) => item.name.toLowerCase().includes(query) || item.code.toLowerCase() === query);

    list.replaceChildren(
      ...found.map((item) => {
        const button = make('button');
        button.type = 'button';
        button.setAttribute('aria-pressed', String(state.country?.code === item.code));
        button.append(item.name, make('code', '', item.code));
        button.addEventListener('click', () => {
          state.country = item;
          next.disabled = false;
          draw();
        });
        return button;
      })
    );

    if (!found.length) list.replaceChildren(make('p', 'notice', 'No countries found.'));
  }

  search.addEventListener('input', draw);
  back.addEventListener('click', () => renderOrderStep());

  next.addEventListener('click', async () => {
    error.hidden = true;
    next.disabled = true;
    next.textContent = 'Loading…';

    try {
      await loadMethods();
    } catch (err) {
      renderCountryStep(friendly(err, 'Could not load payment methods. Please try again later.'));
    }
  });

  actions.append(next, back);
  body.append(search, list, error, actions);
  showPanel(2, 'Step 2 of 4', 'Where are you paying from?', body);
  draw();
}

async function loadMethods() {
  const query = `methods=1&order=${encodeURIComponent(state.id)}&country=${state.country.code}`;
  const data = await getJson(query);

  if (!data.found) throw new UserError('Order not found. Please start again.');
  if (!Array.isArray(data.methods)) throw new UserError('Payment methods are temporarily unavailable. Please contact us.');
  if (!data.methods.length) throw new UserError('No payment method is set up for this country yet. Please contact us.');

  state.methods = data.methods;
  state.method = data.methods[0];
  renderPaymentStep();
}

function fill(text) {
  return text
    .replace(/\{order\}/g, state.id)
    .replace(/\{amount\}/g, state.order.amount)
    .replace(/\{details\}/g, state.method.details);
}

function detailBlock(label, value) {
  const wrap = make('div', 'detail');
  const row = make('div', 'detail__row');
  const copy = make('button', 'detail__copy', 'Copy');

  copy.type = 'button';

  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(/^[\d\s]+$/.test(value) ? value.replace(/\s+/g, '') : value);
      copy.textContent = 'Copied';
    } catch {
      copy.textContent = 'Select and copy';
    }

    setTimeout(() => {
      copy.textContent = 'Copy';
    }, 1800);
  });

  row.append(make('div', 'detail__value', value), copy);
  wrap.append(make('p', 'label', label), row);
  return wrap;
}

function recordMethod() {
  const key = state.method.method;

  if (state.recorded.has(key)) return;

  state.recorded.add(key);
  state.pending = postJson({ action: 'method', order: state.id, method: key, country: state.country.code }).catch(() => {
    state.recorded.delete(key);
  });
}

function createCertForm() {
  const form = make('form', 'field');
  const label = make('label', 'label', 'Certificate code');
  const input = make('input', 'input');
  const error = noticeNode('', 'notice--error');
  const submit = make('button', 'btn', 'Send certificate');

  input.id = 'cert-input';
  label.htmlFor = input.id;
  input.type = 'text';
  input.maxLength = 200;
  input.autocomplete = 'off';
  submit.type = 'submit';
  form.append(label, input, error, submit);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const code = input.value.trim();

    if (!code) {
      error.textContent = 'Enter the certificate code.';
      error.hidden = false;
      return;
    }

    error.hidden = true;
    submit.disabled = true;
    submit.textContent = 'Sending…';

    try {
      await state.pending;
      await postJson({ action: 'cert', order: state.id, code });
      renderDone('cert');
    } catch {
      error.textContent = 'Could not send the certificate. Please try again later.';
      error.hidden = false;
      submit.disabled = false;
      submit.textContent = 'Send certificate';
    }
  });

  return form;
}

function createPaidButton() {
  const wrap = make('div', 'field');
  const error = noticeNode('', 'notice--error');
  const button = make('button', 'btn', 'I have paid');

  button.type = 'button';
  wrap.append(button, error);

  button.addEventListener('click', async () => {
    error.hidden = true;
    button.disabled = true;
    button.textContent = 'Sending…';

    try {
      await postJson({ action: 'paid', order: state.id });
      renderDone('reported');
    } catch {
      error.textContent = 'Could not send. Please try again later.';
      error.hidden = false;
      button.disabled = false;
      button.textContent = 'I have paid';
    }
  });

  return wrap;
}

function renderSteps(text) {
  const groups = [{ title: '', items: [] }];

  text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      if (line.startsWith('# ')) groups.push({ title: line.slice(2), items: [] });
      else groups[groups.length - 1].items.push(line);
    });

  const wrap = make('div', 'guide');

  groups
    .filter((group) => group.items.length)
    .forEach((group) => {
      const list = make('ol', 'instructions');
      group.items.forEach((line) => list.append(make('li', '', fill(line))));

      if (group.title) wrap.append(make('h2', 'instructions__title', group.title));
      wrap.append(list);
    });

  return wrap;
}

function renderPaymentStep() {
  const method = state.method;
  const body = make('div', 'panel__body');
  const url = safeUrl(method.details);

  if (state.methods.length > 1) {
    const tabs = make('div', 'tabs');
    tabs.setAttribute('role', 'tablist');

    state.methods.forEach((item) => {
      const tab = make('button', '', item.title || item.method);
      tab.type = 'button';
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', String(item === method));
      tab.addEventListener('click', () => {
        state.method = item;
        renderPaymentStep();
      });
      tabs.append(tab);
    });

    body.append(tabs);
  }

  body.append(detailBlock('Amount to pay', state.order.amount), detailBlock('Payment reference (order number)', state.id));

  if (url) {
    const link = make('a', 'btn', method.method === 'cert' ? 'Open gift card shop' : 'Open payment page');
    link.href = url.href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    body.append(link);
  } else if (method.details) {
    body.append(detailBlock(method.method === 'card' ? 'Card number' : 'Payment details', method.details));
  }

  if (method.steps) body.append(renderSteps(method.steps));

  if (method.note) body.append(noticeNode(fill(method.note)));

  body.append(method.method === 'cert' ? createCertForm() : createPaidButton());

  const back = make('button', 'btn btn--ghost', 'Change country');
  back.type = 'button';
  back.addEventListener('click', () => renderCountryStep());
  body.append(back);

  showPanel(3, 'Step 3 of 4', method.title || 'Payment', body);
  recordMethod();
}

function renderDone(kind) {
  const texts = {
    paid: ['This order is already paid', 'Thank you! Nothing else is needed for this order.'],
    reported: ['Payment reported', 'Thank you! We will check the payment and update the status of your order. This can take some time.'],
    cert: ['Certificate received', 'Thank you! We will check your certificate and update the status of your order. This can take some time.'],
  };
  const [title, text] = texts[kind];
  const body = make('div', 'panel__body');
  const actions = make('div', 'actions');
  const track = make('a', 'btn', 'Track my order');
  const home = make('a', 'btn btn--ghost', 'Back to formis.space');

  track.href = `/?order=${encodeURIComponent(state.id)}`;
  home.href = '/';
  actions.append(track, home);
  body.append(noticeNode(text, 'notice--ok'), actions);
  showPanel(4, 'Step 4 of 4', title, body);
}

const brandImage = document.querySelector('.brand img');

function useBrandText() {
  brandImage.replaceWith(make('span', 'brand__text', 'FORMIS Pay'));
}

if (brandImage.complete && brandImage.naturalWidth === 0) useBrandText();
else brandImage.addEventListener('error', useBrandText, { once: true });

renderSummary();

const linkedOrder = new URLSearchParams(window.location.search).get('order');

if (linkedOrder) {
  loadOrder(linkedOrder.trim()).catch((err) => renderOrderStep(friendly(err, 'Could not load the order. Please try again later.')));
} else {
  renderOrderStep();
}
