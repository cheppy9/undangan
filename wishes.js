const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbwah7gQ0yX7ExlG3HmXRXjt7-vH8ir-ZjIxosw2UY_JFuOQbPnRt1DhmuIEfldMww/exec';

const wishesForm = document.querySelector('[data-wishes-form]');
const wishesSubmit = document.querySelector('[data-wishes-submit]');
const wishesStatus = document.querySelector('[data-wishes-status]');
const wishesEmpty = document.querySelector('[data-wishes-empty]');
const wishesList = document.querySelector('[data-wishes-list]');
const submissionFrame = document.querySelector(
  'iframe[name="wishes-submit-frame"]'
);

let pendingNonce = '';
let submissionTimeout;

function setWishesStatus(message, state = '') {
  wishesStatus.textContent = message;
  wishesStatus.dataset.state = state;
}

function showEmptyState(message) {
  wishesEmpty.hidden = false;
  wishesEmpty.textContent = message;
}

function renderWishes(items) {
  wishesList.replaceChildren();
  const validItems = Array.isArray(items)
    ? items.filter((item) => item?.name && item?.message).slice(0, 50)
    : [];

  if (validItems.length === 0) {
    showEmptyState('Belum ada ucapan yang ditampilkan.');
    return;
  }

  wishesEmpty.hidden = true;

  validItems.forEach((item) => {
    const article = document.createElement('article');
    const name = document.createElement('h4');
    const message = document.createElement('p');

    article.className = 'wish';
    name.className = 'wish__name';
    message.className = 'wish__message';
    name.textContent = String(item.name);
    message.textContent = String(item.message);
    article.append(name, message);
    wishesList.append(article);
  });
}

function createNonce() {
  const bytes = new Uint8Array(16);
  if (!window.crypto?.getRandomValues) return '';
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(
    ''
  );
}

function loadApprovedWishes() {
  const callbackName = `__wishesCallback_${createNonce()}`;
  const script = document.createElement('script');
  let finished = false;
  let timeoutId;

  const cleanup = () => {
    window.clearTimeout(timeoutId);
    script.remove();
    delete window[callbackName];
  };

  const finish = (items, error) => {
    if (finished) return;
    finished = true;
    cleanup();
    if (error) {
      showEmptyState('Ucapan belum dapat dimuat. Silakan coba lagi nanti.');
      return;
    }
    renderWishes(items);
  };

  timeoutId = window.setTimeout(() => finish([], true), 12000);
  window[callbackName] = (response) => {
    finish(response?.wishes, response?.ok !== true);
  };
  script.onerror = () => finish([], true);
  script.src = `${APPS_SCRIPT_URL}?action=approved&callback=${callbackName}`;
  document.head.append(script);
}

function finishSubmission(result) {
  window.clearTimeout(submissionTimeout);
  pendingNonce = '';
  wishesSubmit.disabled = false;

  if (!result.ok) {
    setWishesStatus(
      result.message || 'Ucapan belum berhasil dikirim.',
      'error'
    );
    return;
  }

  wishesForm.reset();
  setWishesStatus(
    'Terima kasih! Ucapan Anda akan ditampilkan setelah dikonfirmasi.',
    'success'
  );
  loadApprovedWishes();
}

if (!APPS_SCRIPT_URL) {
  wishesSubmit.disabled = true;
  setWishesStatus('Form akan aktif setelah spreadsheet ucapan terhubung.');
  showEmptyState('Ucapan akan tampil setelah spreadsheet terhubung.');
} else {
  wishesForm.action = APPS_SCRIPT_URL;
  loadApprovedWishes();

  wishesForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (pendingNonce) return;

    pendingNonce = createNonce();
    if (!pendingNonce) {
      setWishesStatus('Browser ini belum mendukung pengiriman aman.', 'error');
      return;
    }

    wishesForm.elements.nonce.value = pendingNonce;
    wishesSubmit.disabled = true;
    setWishesStatus('Mengirim ucapan...');
    submissionTimeout = window.setTimeout(() => {
      finishSubmission({
        ok: false,
        message: 'Ucapan kamu perlu dikonfirmasi dulu ya.',
      });
    }, 20000);
    wishesForm.submit();
  });

  window.addEventListener('message', (event) => {
    const result = event.data;
    if (
      !/^https:\/\/(script\.google\.com|[^/]+\.googleusercontent\.com)$/.test(
        event.origin
      ) ||
      result?.type !== 'wishes-submit-result' ||
      result?.nonce !== pendingNonce ||
      !pendingNonce
    ) {
      return;
    }

    finishSubmission(result);
  });
}
