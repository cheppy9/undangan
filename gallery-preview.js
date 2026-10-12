const galleryButtons = [
  ...document.querySelectorAll('.gallery__preview-button'),
];
const galleryDialog = document.querySelector('[data-gallery-dialog]');
const galleryTrack = document.querySelector('[data-gallery-track]');
const galleryCounter = document.querySelector('[data-gallery-counter]');
const galleryClose = document.querySelector('[data-gallery-close]');
const galleryPrevious = document.querySelector('[data-gallery-previous]');
const galleryNext = document.querySelector('[data-gallery-next]');
const galleryImages = galleryButtons.map((button) =>
  button.querySelector('img')
);

let activeGalleryIndex = 0;
let scrollFrame = 0;

function getPreviewSource(source) {
  const previewUrl = new URL(source, document.baseURI);
  if (previewUrl.hostname === 'images.unsplash.com') {
    previewUrl.searchParams.set('w', '1800');
    previewUrl.searchParams.set('q', '90');
  }
  return previewUrl.href;
}

function renderGallerySlides() {
  const slides = galleryImages.map((image, index) => {
    const slide = document.createElement('figure');
    const previewImage = document.createElement('img');

    slide.className = 'gallery-preview__slide';
    previewImage.src = getPreviewSource(image.currentSrc || image.src);
    previewImage.alt = image.alt;
    previewImage.loading = index === activeGalleryIndex ? 'eager' : 'lazy';
    slide.append(previewImage);
    return slide;
  });

  galleryTrack.replaceChildren(...slides);
}

function updateGalleryPosition() {
  if (!galleryTrack.clientWidth) return;
  activeGalleryIndex = Math.min(
    galleryImages.length - 1,
    Math.max(0, Math.round(galleryTrack.scrollLeft / galleryTrack.clientWidth))
  );
  galleryCounter.textContent = `${activeGalleryIndex + 1} / ${galleryImages.length}`;
  galleryPrevious.disabled = activeGalleryIndex === 0;
  galleryNext.disabled = activeGalleryIndex === galleryImages.length - 1;
}

function scrollToGalleryIndex(index) {
  const nextIndex = Math.min(galleryImages.length - 1, Math.max(0, index));
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  activeGalleryIndex = nextIndex;
  galleryCounter.textContent = `${activeGalleryIndex + 1} / ${galleryImages.length}`;
  galleryPrevious.disabled = activeGalleryIndex === 0;
  galleryNext.disabled = activeGalleryIndex === galleryImages.length - 1;
  galleryTrack.scrollTo({
    left: nextIndex * galleryTrack.clientWidth,
    behavior: prefersReducedMotion ? 'instant' : 'smooth',
  });
}

galleryButtons.forEach((button, index) => {
  button.addEventListener('click', () => {
    activeGalleryIndex = index;
    renderGallerySlides();
    galleryDialog.showModal();
    galleryCounter.textContent = `${index + 1} / ${galleryImages.length}`;
    galleryPrevious.disabled = index === 0;
    galleryNext.disabled = index === galleryImages.length - 1;
    requestAnimationFrame(() => {
      galleryTrack.scrollLeft = index * galleryTrack.clientWidth;
    });
  });
});

galleryClose.addEventListener('click', () => galleryDialog.close());
galleryPrevious.addEventListener('click', () => {
  scrollToGalleryIndex(activeGalleryIndex - 1);
});
galleryNext.addEventListener('click', () => {
  scrollToGalleryIndex(activeGalleryIndex + 1);
});

galleryTrack.addEventListener('scroll', () => {
  if (scrollFrame) return;
  scrollFrame = requestAnimationFrame(() => {
    scrollFrame = 0;
    updateGalleryPosition();
  });
});

galleryDialog.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    event.preventDefault();
    galleryDialog.close();
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault();
    scrollToGalleryIndex(activeGalleryIndex - 1);
  } else if (event.key === 'ArrowRight') {
    event.preventDefault();
    scrollToGalleryIndex(activeGalleryIndex + 1);
  }
});

galleryDialog.addEventListener('click', (event) => {
  if (event.target === galleryDialog) galleryDialog.close();
});

galleryDialog.addEventListener('close', () => {
  galleryButtons[activeGalleryIndex]?.focus();
});
