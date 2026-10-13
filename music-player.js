const musicAudio = document.querySelector('[data-music-audio]');
const musicToggle = document.querySelector('[data-music-toggle]');
const openLink = document.querySelector('.open-link');

if (musicAudio && musicToggle) {
  function updateMusicToggle(isPlaying) {
    const label = isPlaying ? 'Jeda musik' : 'Putar musik';
    musicToggle.setAttribute('aria-label', label);
    musicToggle.setAttribute('aria-pressed', String(isPlaying));
    musicToggle.title = label;
  }

  async function startMusic() {
    if (musicAudio.paused) {
      try {
        await musicAudio.play();
        updateMusicToggle(true);
      } catch {
        musicToggle.setAttribute('aria-label', 'Musik tidak dapat diputar');
        musicToggle.title = 'Musik tidak dapat diputar';
      }
    }
  }

  async function toggleMusic() {
    if (musicAudio.paused) {
      await startMusic();
      return;
    }

    musicAudio.pause();
    updateMusicToggle(false);
  }

  musicToggle.addEventListener('click', toggleMusic);

  if (openLink) {
    openLink.addEventListener('click', () => {
      void startMusic();
    });
  }

  document.addEventListener(
    'pointerdown',
    () => {
      if (!musicAudio.paused) return;
      void startMusic();
    },
    { once: true }
  );

  musicAudio.addEventListener('play', () => updateMusicToggle(true));
  musicAudio.addEventListener('pause', () => updateMusicToggle(false));
  musicAudio.addEventListener('ended', () => updateMusicToggle(false));
  musicAudio.addEventListener('error', () => {
    musicToggle.setAttribute('aria-label', 'Musik tidak dapat diputar');
    musicToggle.title = 'Musik tidak dapat diputar';
  });
}
