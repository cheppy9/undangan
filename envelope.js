const copyAccountButton = document.querySelector('[data-copy-account]');
const copyStatus = document.querySelector('[data-copy-status]');

copyAccountButton.addEventListener('click', async () => {
  const accountNumber = copyAccountButton.dataset.accountNumber;

  try {
    if (!navigator.clipboard?.writeText)
      throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(accountNumber);
    copyStatus.textContent = 'Nomor rekening berhasil disalin.';
  } catch {
    copyStatus.textContent =
      'Nomor belum tersalin. Silakan salin secara manual.';
  }
});
