const recipient = document.querySelector('[data-recipient]');
const recipientName = new URLSearchParams(window.location.search)
  .get('to')
  ?.trim();

if (recipientName) recipient.textContent = recipientName;