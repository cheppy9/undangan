const WISHES_SHEET_NAME = 'Ucapan';
const WISHES_HEADERS = ['Waktu', 'Nama', 'Ucapan', 'Status'];

function setupWishesSpreadsheet() {
  const spreadsheet = SpreadsheetApp.create(
    'Ucapan Pernikahan Sheka dan Cheppy'
  );
  const sheet = spreadsheet.getSheets()[0];
  sheet.setName(WISHES_SHEET_NAME);
  sheet.getRange(1, 1, 1, WISHES_HEADERS.length).setValues([WISHES_HEADERS]);
  sheet.getRange(1, 1, 1, WISHES_HEADERS.length).setFontWeight('bold');
  sheet.getRange('B:C').setNumberFormat('@');
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, WISHES_HEADERS.length);
  PropertiesService.getScriptProperties().setProperty(
    'WISHES_SPREADSHEET_ID',
    spreadsheet.getId()
  );
  console.log(spreadsheet.getUrl());
  return spreadsheet.getUrl();
}

function doPost(event) {
  const parameters = event && event.parameter ? event.parameter : {};
  const nonce = String(parameters.nonce || '');

  if (!/^[a-f0-9]{32}$/.test(nonce)) {
    return createSubmissionResponse('', false, 'Permintaan tidak valid.');
  }

  if (String(parameters.website || '').trim()) {
    return createSubmissionResponse(
      nonce,
      true,
      'Terima kasih. Ucapan menunggu persetujuan sebelum ditampilkan.'
    );
  }

  const name = String(parameters.name || '')
    .trim()
    .replace(/\s+/g, ' ');
  const message = String(parameters.message || '')
    .replace(/\r\n?/g, '\n')
    .trim();

  if (!name || !message || name.length > 60 || message.length > 500) {
    return createSubmissionResponse(
      nonce,
      false,
      'Isi nama maksimal 60 karakter dan ucapan maksimal 500 karakter.'
    );
  }

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) {
    return createSubmissionResponse(
      nonce,
      false,
      'Layanan sedang sibuk. Silakan coba lagi.'
    );
  }

  try {
    const sheet = getWishesSheet();
    const nextRow = sheet.getLastRow() + 1;
    sheet.getRange(nextRow, 2, 1, 2).setNumberFormat('@');
    sheet
      .getRange(nextRow, 1, 1, WISHES_HEADERS.length)
      .setValues([[new Date(), name, message, 'pending']]);
    return createSubmissionResponse(
      nonce,
      true,
      'Terima kasih. Ucapan menunggu persetujuan sebelum ditampilkan.'
    );
  } catch (error) {
    console.error(error);
    return createSubmissionResponse(
      nonce,
      false,
      'Ucapan belum dapat disimpan. Silakan coba lagi nanti.'
    );
  } finally {
    lock.releaseLock();
  }
}

function doGet(event) {
  const parameters = event && event.parameter ? event.parameter : {};
  const callback = String(parameters.callback || '');

  if (!/^[A-Za-z_$][A-Za-z0-9_$]{0,63}$/.test(callback)) {
    return ContentService.createTextOutput('void 0;').setMimeType(
      ContentService.MimeType.JAVASCRIPT
    );
  }

  try {
    const sheet = getWishesSheet();
    const lastRow = sheet.getLastRow();
    const firstRow = Math.max(2, lastRow - 999);
    const rowCount = Math.max(0, lastRow - firstRow + 1);
    const rows = rowCount
      ? sheet.getRange(firstRow, 1, rowCount, WISHES_HEADERS.length).getValues()
      : [];
    const wishes = rows
      .filter((row) => String(row[3] || '').toLowerCase() === 'approved')
      .slice(-50)
      .reverse()
      .map((row) => ({
        name: String(row[1] || ''),
        message: String(row[2] || ''),
      }));

    return createJsonpResponse(callback, { ok: true, wishes: wishes });
  } catch (error) {
    console.error(error);
    return createJsonpResponse(callback, { ok: false, wishes: [] });
  }
}

function getWishesSheet() {
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty(
    'WISHES_SPREADSHEET_ID'
  );
  if (!spreadsheetId) {
    throw new Error('Run setupWishesSpreadsheet before deploying the web app.');
  }

  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  const sheet = spreadsheet.getSheetByName(WISHES_SHEET_NAME);
  if (!sheet) throw new Error('The wishes sheet was not found.');
  return sheet;
}

function createSubmissionResponse(nonce, ok, message) {
  const safeNonce = /^[a-f0-9]{32}$/.test(nonce) ? nonce : '';
  const payload = JSON.stringify({
    type: 'wishes-submit-result',
    nonce: safeNonce,
    ok: ok,
    message: message,
  }).replace(/</g, '\\u003c');
  const html =
    '<!doctype html><html><body><script>window.top.postMessage(' +
    payload +
    ', "*");<\/script></body></html>';

  return HtmlService.createHtmlOutput(html).setXFrameOptionsMode(
    HtmlService.XFrameOptionsMode.ALLOWALL
  );
}

function createJsonpResponse(callback, payload) {
  const json = JSON.stringify(payload).replace(/</g, '\\u003c');
  return ContentService.createTextOutput(
    callback + '(' + json + ');'
  ).setMimeType(ContentService.MimeType.JAVASCRIPT);
}
