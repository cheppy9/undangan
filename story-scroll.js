const storyTrack = document.querySelector('.story-scroll');
const story = storyTrack?.querySelector('.story');
const storyTitle = story?.querySelector('.story__title');
const storyChapters = [...(story?.querySelectorAll('.story__chapter') ?? [])];

if (storyTrack && story && storyChapters.length) {
  let visibleChapterCount = 0;
  updateVisibleChapters(0);
  let isTitleAnimationStarted = false;
  let isTitleAnimationComplete = false;
  let isComplete = false;
  let wheelLocked = false;
  let finalRevealTimer = 0;
  const wheelStepCooldown = 420;
  let touchStart = null;
  let touchCaptured = false;

  storyTrack.classList.add('is-stepping');

  function updateVisibleChapters(nextCount) {
    visibleChapterCount = Math.max(
      0,
      Math.min(storyChapters.length, nextCount)
    );

    storyChapters.forEach((chapter, index) => {
      const isVisible = index < visibleChapterCount;
      chapter.classList.toggle('is-visible', isVisible);
    });
  }

  function isStoryPinned() {
    const storyBounds = story.getBoundingClientRect();
    return (
      storyBounds.top <= 1 &&
      storyBounds.bottom >=
        Math.min(window.innerHeight, document.documentElement.clientHeight) - 1
    );
  }

  function startTitleAnimation() {
    if (isTitleAnimationStarted || !storyTitle) return;
    isTitleAnimationStarted = true;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      isTitleAnimationComplete = true;
      return;
    }

    storyTitle.addEventListener(
      'animationend',
      () => {
        isTitleAnimationComplete = true;
      },
      { once: true }
    );
    storyTitle.classList.add('is-typing');
  }

  function releaseStory(isFinished) {
    window.clearTimeout(finalRevealTimer);
    storyTrack.classList.add('is-released');

    if (isFinished) {
      isComplete = true;
      storyTrack.classList.add('is-complete');
    }
  }

  function advanceStory(direction) {
    if (direction < 0 && visibleChapterCount === 0) {
      releaseStory(false);
      return false;
    }

    updateVisibleChapters(visibleChapterCount + direction);

    if (visibleChapterCount === storyChapters.length) {
      finalRevealTimer = window.setTimeout(() => {
        if (visibleChapterCount === storyChapters.length) {
          releaseStory(true);
        }
      }, 700);
    } else {
      window.clearTimeout(finalRevealTimer);
    }

    return true;
  }

  function handleScrollIntent(direction, event) {
    if (isComplete) return false;

    if (!isStoryPinned()) return false;

    if (direction > 0) storyTrack.classList.remove('is-released');

    if (direction > 0 && visibleChapterCount === storyChapters.length) {
      event?.preventDefault();
      return true;
    }

    if (direction < 0 && visibleChapterCount === 0) {
      releaseStory(false);
      return false;
    }

    event?.preventDefault();
    advanceStory(direction);
    return true;
  }

  document.addEventListener(
    'wheel',
    (event) => {
      const direction = Math.sign(event.deltaY);
      if (!direction || isComplete) return;

      if (!isStoryPinned()) return;
      if (direction > 0 && !isTitleAnimationComplete) {
        event.preventDefault();
        return;
      }

      if (wheelLocked) {
        event.preventDefault();
        return;
      }

      if (handleScrollIntent(direction, event)) {
        wheelLocked = true;
        window.setTimeout(() => {
          wheelLocked = false;
        }, wheelStepCooldown);
      }
    },
    { passive: false }
  );

  document.addEventListener('keydown', (event) => {
    let direction = 0;
    if (
      ['ArrowDown', 'PageDown', 'End'].includes(event.key) ||
      event.code === 'Space'
    ) {
      direction = 1;
    } else if (['ArrowUp', 'PageUp'].includes(event.key)) {
      direction = -1;
    }
    if (!direction || isComplete) return;

    if (!isStoryPinned()) return;
    if (direction > 0 && !isTitleAnimationComplete) {
      event.preventDefault();
      return;
    }

    if (event.repeat) {
      event.preventDefault();
      return;
    }

    handleScrollIntent(direction, event);
  });

  document.addEventListener(
    'touchstart',
    (event) => {
      if (isComplete || !event.touches.length) return;
      touchStart = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      };
      touchCaptured = isStoryPinned();
    },
    { passive: true }
  );

  document.addEventListener(
    'touchmove',
    (event) => {
      if (isComplete || !touchStart || !event.touches.length) return;

      const touch = event.touches[0];
      const deltaY = touchStart.y - touch.clientY;
      const deltaX = touchStart.x - touch.clientX;
      if (Math.abs(deltaY) < 12 || Math.abs(deltaY) < Math.abs(deltaX)) return;

      const direction = Math.sign(deltaY);
      if (!touchCaptured) {
        touchCaptured = isStoryPinned();
      }
      if (!touchCaptured) return;

      if (direction < 0 && visibleChapterCount === 0) {
        releaseStory(false);
        touchCaptured = false;
        return;
      }

      if (event.cancelable) event.preventDefault();
    },
    { passive: false }
  );

  document.addEventListener(
    'touchend',
    (event) => {
      if (!touchCaptured || !touchStart) {
        touchStart = null;
        touchCaptured = false;
        return;
      }

      const touch = event.changedTouches[0];
      const deltaY = touchStart.y - touch.clientY;
      if (Math.abs(deltaY) > 40 && (deltaY < 0 || isTitleAnimationComplete)) {
        advanceStory(Math.sign(deltaY));
      }

      touchStart = null;
      touchCaptured = false;
    },
    { passive: true }
  );

  window.addEventListener(
    'scroll',
    () => {
      if (isComplete || storyTrack.classList.contains('is-released')) return;

      const storyTop = story.getBoundingClientRect().top;
      if (storyTop < -1) {
        window.scrollTo({
          top: window.scrollY + storyTop,
          behavior: 'instant',
        });
      } else if (isStoryPinned()) {
        startTitleAnimation();
      }
    },
    { passive: true }
  );

  if (isStoryPinned()) startTitleAnimation();
}
