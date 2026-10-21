const recipient = document.querySelector('[data-recipient]');
const wishesName = document.querySelector('[data-wishes-form] [name="name"]');
const recipientName = new URLSearchParams(window.location.search)
  .get('to')
  ?.trim();

const receptionType = new URLSearchParams(window.location.search)
  .get('reception')
  ?.trim();

const receptionTimes = {
  '1': '10.00–12.00 WIB',
  '2': '12.00–14.00 WIB',
};

const sessionLabels = {
  '1': 'Sesi 1 • 10.00–12.00 WIB',
  '2': 'Sesi 2 • 12.00–14.00 WIB',
};

if (recipientName) {
  recipient.textContent = recipientName;
  wishesName.value = recipientName;
  wishesName.defaultValue = recipientName;
  wishesName.readOnly = true;
}

if (receptionType && receptionTimes[receptionType]) {
  const receptionTimeElement = document.querySelector('[data-reception-time]');
  if (receptionTimeElement) {
    receptionTimeElement.textContent = receptionTimes[receptionType];
  }

  const coverSessionElement = document.querySelector('[data-cover-session]');
  if (coverSessionElement) {
    coverSessionElement.textContent = sessionLabels[receptionType];
  }

  // Update calendar link with correct reception time
  const calendarLink = document.querySelector('.calendar-link');
  if (calendarLink) {
    const receptionTimeDetails = receptionType === '1' 
      ? 'Resepsi%3A+10.00-12.00+WIB' 
      : 'Resepsi%3A+12.00-14.00+WIB';
    const currentHref = calendarLink.href;
    const updatedHref = currentHref.replace(
      /Resepsi%3A+\d+\.\d+-\d+\.\d+WIB/,
      receptionTimeDetails
    );
    calendarLink.href = updatedHref;
  }
}
