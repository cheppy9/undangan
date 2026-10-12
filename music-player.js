const musicAudio = document.querySelector('[data-music-audio]');
const musicToggle = document.querySelector('[data-music-toggle]');

if (musicAudio && musicToggle) {
  function updateMusicToggle(isPlaying) {
    const label = isPlaying ? 'Jeda musik' : 'Putar musik';
    musicToggle.setAttribute('aria-label', label);
    musicToggle.setAttribute('aria-pressed', String(isPlaying));
    musicToggle.title = label;
  }

  musicToggle.addEventListener('click', async () => {
    if (musicAudio.paused) {
      try {
        await musicAudio.play();
      } catch {
        musicToggle.setAttribute('aria-label', 'Musik tidak dapat diputar');
        musicToggle.title = 'Musik tidak dapat diputar';
      }
      return;
    }

    musicAudio.pause();
  });

  musicAudio.addEventListener('play', () => updateMusicToggle(true));
  musicAudio.addEventListener('pause', () => updateMusicToggle(false));
  musicAudio.addEventListener('ended', () => updateMusicToggle(false));
  musicAudio.addEventListener('error', () => {
    musicToggle.setAttribute('aria-label', 'Musik tidak dapat diputar');
    musicToggle.title = 'Musik tidak dapat diputar';
  });
}
