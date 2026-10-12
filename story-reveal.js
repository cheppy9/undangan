const story = document.querySelector('.story');
const storyChapters = [...(story?.querySelectorAll('.story__chapter') ?? [])];

if (story && storyChapters.length) {
  let animationFrame = 0;

  function revealStoryChapters() {
    const storyBounds = story.getBoundingClientRect();
    const scrollDistance = window.innerHeight + storyBounds.height;
    const progress = Math.max(
      0,
      Math.min(1, (window.innerHeight - storyBounds.top) / scrollDistance)
    );
    const visibleCount = Math.ceil(progress * storyChapters.length);

    story.classList.add('story--revealing');
    storyChapters.forEach((chapter, index) => {
      if (index < visibleCount) chapter.classList.add('is-visible');
    });

    if (storyBounds.bottom <= 0) {
      story.classList.add('story--passed');
      storyChapters.forEach((chapter) => chapter.classList.add('is-visible'));
    }
  }

  function scheduleStoryReveal() {
    if (animationFrame) return;
    animationFrame = window.requestAnimationFrame(() => {
      animationFrame = 0;
      revealStoryChapters();
    });
  }

  window.addEventListener('scroll', scheduleStoryReveal, { passive: true });
  window.addEventListener('resize', scheduleStoryReveal);
  revealStoryChapters();
}
