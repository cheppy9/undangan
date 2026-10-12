const recipient = document.querySelector('[data-recipient]');
const wishesName = document.querySelector('[data-wishes-form] [name="name"]');
const recipientName = new URLSearchParams(window.location.search)
  .get('to')
  ?.trim();

if (recipientName) {
  recipient.textContent = recipientName;
  wishesName.value = recipientName;
  wishesName.defaultValue = recipientName;
  wishesName.readOnly = true;
}
