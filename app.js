const YOUTUBE_API_KEY = 'AIzaSyCvb3xxkzkOl-rqaIYRJf3hfYjtTcanLPw';

const DEFAULT_TRACKS = [
  {
    title: 'Midnight City',
    artist: 'M83',
    image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80',
    videoId: 'dX3k_QDnzHE',
    channel: 'M83',
    views: '499M views'
  },
  {
    title: 'Sunset Drive',
    artist: 'The Wave',
    image: 'https://images.unsplash.com/photo-1493225457124-dc58bca32b4a?auto=format&fit=crop&w=900&q=80',
    videoId: '5qap5aO4i9A',
    channel: 'The Wave',
    views: '120K views'
  },
  {
    title: 'Sapphire Dream',
    artist: 'Nova Echo',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80',
    videoId: 'ScMzIvxBSi4',
    channel: 'Nova Echo',
    views: '40M views'
  },
  {
    title: 'Luna Calls',
    artist: 'Sora Bloom',
    image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&w=900&q=80',
    videoId: 'fJ9rUzIMcZQ',
    channel: 'Sora Bloom',
    views: '18M views'
  }
];

let currentTrackIndex = 0;
let player;
let isPlayerReady = false;
let isPlaying = false;
let progressInterval = null;
let queue = [...DEFAULT_TRACKS];

const playerTitle = document.getElementById('playerTitle');
const playerArtist = document.getElementById('playerArtist');
const playerImage = document.getElementById('playerImage');
const npTitle = document.getElementById('npTitle');
const npArtist = document.getElementById('npArtist');
const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const progressFill = document.getElementById('progressFill');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const nowPlayingTime = document.getElementById('nowPlayingTime');
const heroImage = document.getElementById('heroImage');
const viewCount = document.getElementById('viewCount');
const playlistQueue = document.getElementById('playlistQueue');
const trendingList = document.getElementById('trendingList');
const playlistList = document.getElementById('playlistList');
const searchResults = document.getElementById('searchResults');
const searchSection = document.getElementById('searchSection');
const mainContent = document.getElementById('mainContent');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const searchNavBtn = document.getElementById('searchNavBtn');
const searchShowBtn = document.getElementById('searchShowBtn');

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function setPlayerInfo(track) {
  playerTitle.textContent = track.title;
  playerArtist.textContent = track.artist;
  playerImage.src = track.image;
  npTitle.textContent = track.title;
  npArtist.textContent = track.artist;
  heroImage.style.backgroundImage = `url('${track.image}')`;
  viewCount.textContent = track.views || '0 views';

  document.querySelector('.now-playing-image').style.backgroundImage = `url('${track.image}')`;
  document.getElementById('nowPlayingTime').textContent = '0:00';
  currentTimeEl.textContent = '0:00';
  durationEl.textContent = '0:00';
  progressFill.style.width = '0%';
}

function renderQueue() {
  if (!queue.length) {
    playlistQueue.innerHTML = '<div class="loading-text">No songs yet</div>';
    return;
  }

  playlistQueue.innerHTML = queue
    .map((track, index) => `
      <button class="queue-item ${index === currentTrackIndex ? 'active' : ''}" data-index="${index}">
        <div class="queue-art" style="background-image:url('${track.image}')"></div>
        <div>
          <strong>${track.title}</strong>
          <small>${track.artist}</small>
        </div>
        <span>3:12</span>
      </button>
    `)
    .join('');

  playlistQueue.querySelectorAll('.queue-item').forEach((button) => {
    button.addEventListener('click', () => {
      const idx = Number(button.dataset.index);
      playTrack(idx);
    });
  });
}

function renderPlaylistCards() {
  playlistList.innerHTML = queue
    .map((track, index) => `
      <button class="playlist-item ${index === currentTrackIndex ? 'active' : ''}" data-index="${index}">
        <span class="cover" style="background-image:url('${track.image}')"></span>
        <span class="meta">
          <strong>${track.title}</strong>
          <small>${track.artist}</small>
        </span>
      </button>
    `)
    .join('');

  playlistList.querySelectorAll('.playlist-item').forEach((button) => {
    button.addEventListener('click', () => {
      const idx = Number(button.dataset.index);
      playTrack(idx);
    });
  });
}

function renderTrending(list) {
  trendingList.innerHTML = list
    .map((track, index) => `
      <div class="list-item" data-index="${index}" data-title="${track.title}" data-artist="${track.artist}" data-image="${track.image}" data-video-id="${track.videoId}">
        <div class="rank">${String(index + 1).padStart(2, '0')}</div>
        <div class="list-cover" style="background-image:url('${track.image}')"></div>
        <div class="song-meta">
          <strong>${track.title}</strong>
          <small>${track.artist}</small>
        </div>
        <span class="duration">3:12</span>
      </div>
    `)
    .join('');

  trendingList.querySelectorAll('.list-item').forEach((item) => {
    item.addEventListener('click', () => {
      queue = [
        {
          title: item.dataset.title,
          artist: item.dataset.artist,
          image: item.dataset.image,
          videoId: item.dataset.videoId,
          views: 'YouTube'
        },
        ...queue.filter((track) => track.videoId !== item.dataset.videoId)
      ];
      currentTrackIndex = 0;
      renderQueue();
      renderPlaylistCards();
      playTrack(0);
    });
  });
}

function renderSearchResults(items) {
  if (!items.length) {
    searchResults.innerHTML = '<div class="loading-text">No results found.</div>';
    return;
  }

  searchResults.innerHTML = items
    .map((item) => `
      <article class="track-card" data-title="${item.snippet.title}" data-artist="${item.snippet.channelTitle}" data-image="${item.snippet.thumbnails.high.url}" data-video-id="${item.id.videoId}">
        <div class="art" style="background-image:url('${item.snippet.thumbnails.high.url}')"></div>
        <button class="mini-play">▶</button>
        <h3>${item.snippet.title}</h3>
        <p>${item.snippet.channelTitle}</p>
      </article>
    `)
    .join('');

  searchResults.querySelectorAll('.track-card').forEach((card) => {
    card.addEventListener('click', () => {
      const track = {
        title: card.dataset.title,
        artist: card.dataset.artist,
        image: card.dataset.image,
        videoId: card.dataset.videoId,
        views: 'YouTube Search'
      };

      const existingIndex = queue.findIndex((item) => item.videoId === track.videoId);
      if (existingIndex >= 0) {
        queue.splice(existingIndex, 1);
      }
      queue.unshift(track);
      currentTrackIndex = 0;
      renderQueue();
      renderPlaylistCards();
      playTrack(0);
    });
  });
}

function togglePlayback() {
  if (!queue.length) return;

  if (!player) {
    playTrack(currentTrackIndex);
    return;
  }

  if (isPlaying) {
    player.pauseVideo();
    isPlaying = false;
    playPauseBtn.textContent = '▶';
  } else {
    player.playVideo();
    isPlaying = true;
    playPauseBtn.textContent = '⏸';
  }
}

function stopProgress() {
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
}

function startProgress() {
  stopProgress();
  progressInterval = setInterval(() => {
    if (!player || !player.getCurrentTime) return;
    const current = player.getCurrentTime();
    const total = player.getDuration();
    if (Number.isFinite(total) && total > 0) {
      const progress = (current / total) * 100;
      progressFill.style.width = `${progress}%`;
      currentTimeEl.textContent = formatTime(current);
      durationEl.textContent = formatTime(total);
      nowPlayingTime.textContent = formatTime(current);
    }
  }, 500);
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    isPlaying = true;
    playPauseBtn.textContent = '⏸';
    startProgress();
  } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
    isPlaying = false;
    playPauseBtn.textContent = '▶';
    if (event.data === YT.PlayerState.ENDED) {
      playNext();
    }
    stopProgress();
  }
}

function playTrack(index) {
  if (!queue[index]) return;

  currentTrackIndex = index;
  const track = queue[index];
  setPlayerInfo(track);
  renderQueue();
  renderPlaylistCards();

  if (!player) {
    const playerContainer = document.getElementById('youtubePlayer');
    playerContainer.classList.remove('hidden');
    player = new YT.Player('youtubePlayer', {
      height: '200',
      width: '100%',
      videoId: track.videoId,
      playerVars: {
        autoplay: 1,
        controls: 1,
        rel: 0,
        modestbranding: 1
      },
      events: {
        onReady: (event) => {
          isPlayerReady = true;
          event.target.playVideo();
          isPlaying = true;
          playPauseBtn.textContent = '⏸';
          startProgress();
        },
        onStateChange: onPlayerStateChange
      }
    });
  } else {
    player.loadVideoById(track.videoId);
    player.playVideo();
    isPlaying = true;
    playPauseBtn.textContent = '⏸';
  }
}

function playNext() {
  if (!queue.length) return;
  const nextIndex = (currentTrackIndex + 1) % queue.length;
  playTrack(nextIndex);
}

function playPrev() {
  if (!queue.length) return;
  const prevIndex = (currentTrackIndex - 1 + queue.length) % queue.length;
  playTrack(prevIndex);
}

async function fetchTrendingVideos() {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=US&maxResults=5&key=${YOUTUBE_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.items) {
      renderTrending(DEFAULT_TRACKS);
      return;
    }

    const transformed = data.items.map((item) => ({
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      image: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
      videoId: item.id,
      views: `${Number(item.statistics?.viewCount || 0).toLocaleString()} views`
    }));

    queue = [...transformed, ...DEFAULT_TRACKS.filter((track) => !transformed.some((item) => item.videoId === track.videoId))].slice(0, 8);
    currentTrackIndex = 0;
    renderQueue();
    renderPlaylistCards();
    renderTrending(transformed.slice(0, 4));
    setPlayerInfo(queue[0]);
  } catch (error) {
    console.error('Trending fetch error:', error);
    queue = [...DEFAULT_TRACKS];
    renderQueue();
    renderPlaylistCards();
    renderTrending(DEFAULT_TRACKS);
    setPlayerInfo(queue[0]);
  }
}

async function searchYouTube(query) {
  if (!query.trim()) return;

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=8&q=${encodeURIComponent(query)}&key=${YOUTUBE_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.items) {
      renderSearchResults([]);
      return;
    }

    renderSearchResults(data.items);
  } catch (error) {
    console.error('Search error:', error);
    renderSearchResults([]);
  }
}

searchBtn.addEventListener('click', () => {
  searchYouTube(searchInput.value);
});

searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    searchYouTube(searchInput.value);
  }
});

searchNavBtn.addEventListener('click', () => {
  searchSection.classList.remove('hidden');
  mainContent.classList.add('hidden');
});

searchShowBtn.addEventListener('click', () => {
  searchSection.classList.remove('hidden');
  mainContent.classList.add('hidden');
});

document.getElementById('refreshTrending').addEventListener('click', fetchTrendingVideos);
playPauseBtn.addEventListener('click', togglePlayback);
prevBtn.addEventListener('click', playPrev);
nextBtn.addEventListener('click', playNext);

document.getElementById('heroPlayBtn').addEventListener('click', () => {
  playTrack(currentTrackIndex >= 0 ? currentTrackIndex : 0);
});

window.addEventListener('load', () => {
  renderQueue();
  renderPlaylistCards();
  fetchTrendingVideos();
  setPlayerInfo(DEFAULT_TRACKS[0]);
  searchResults.innerHTML = '<div class="loading-text">Search for songs using the YouTube API.</div>';
});

window.onYouTubeIframeAPIReady = () => {
  if (queue.length) {
    playTrack(0);
  }
};
