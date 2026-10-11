document.addEventListener('DOMContentLoaded', () => {
  const playerTitle = document.getElementById('playerTitle');
  const playerArtist = document.getElementById('playerArtist');
  const playerImage = document.getElementById('playerImage');

  const updatePlayer = (title, artist, image) => {
    playerTitle.textContent = title;
    playerArtist.textContent = artist;
    playerImage.src = image;
    playerImage.alt = `${title} by ${artist}`;
  };

  const trackCards = document.querySelectorAll('.track-card, .list-item, .playlist-item');

  trackCards.forEach((card) => {
    card.addEventListener('click', () => {
      const title = card.dataset.title || 'Midnight city';
      const artist = card.dataset.artist || 'M83';
      const image = card.dataset.image || 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=800&q=80';

      updatePlayer(title, artist, image);

      document.querySelectorAll('.playlist-item, .list-item, .track-card').forEach((item) => {
        item.classList.remove('active');
      });

      if (card.classList.contains('playlist-item')) {
        card.classList.add('active');
      }
    });
  });

  const playButtons = document.querySelectorAll('.mini-play, .play-large');

  playButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const card = button.closest('.track-card');
      if (card) {
        const title = card.dataset.title;
        const artist = card.dataset.artist;
        const image = card.dataset.image;
        updatePlayer(title, artist, image);
      }
    });
  });
});
