// SwarSmriti: script.js (Enhanced with YouTube integration)

// ---------- App state ----------
const state = {
  view: 'home',
  selectedMood: null,
  intensity: 60,
  favorites: JSON.parse(localStorage.getItem('ss_favs') || '[]'),
  // Playback state
  currentQueue: [],
  currentIndex: -1,
  shuffleMode: false,
  repeatMode: 'off', // 'off', 'one', 'all'
  recentlyPlayed: JSON.parse(localStorage.getItem('ss_recent') || '[]'),
  // Day 2 features
  playlists: JSON.parse(localStorage.getItem('ss_playlists') || '[]'),
  theme: localStorage.getItem('ss_theme') || 'dark',
  currentSongForPlaylist: null,
  // Day 4 features
  playCounts: JSON.parse(localStorage.getItem('ss_playCounts') || '{}'),
  selectedGenre: null,
  selectedEra: null,
  sleepTimer: null,
  equalizerPreset: 'normal',
  // Day 5 features
  songRatings: JSON.parse(localStorage.getItem('ss_ratings') || '{}'),
  customTheme: JSON.parse(localStorage.getItem('ss_customTheme') || 'null'),
  crossfadeEnabled: JSON.parse(localStorage.getItem('ss_crossfade') || 'false'),
  crossfadeDuration: JSON.parse(localStorage.getItem('ss_crossfadeDuration') || '3'),
  viewMode: localStorage.getItem('ss_viewMode') || 'list', // 'list', 'album', 'artist'
  selectedArtist: null
};

// ---------- Helpers ----------
const el = (q, ctx = document) => ctx.querySelector(q);
const els = (q, ctx = document) => Array.from(ctx.querySelectorAll(q));

// ---------- Update Stats ----------
function updateStats() {
  const statArtists = el('#statArtists');
  const statSongs = el('#statSongs');
  if (statArtists) statArtists.textContent = DATA.artists.length;
  if (statSongs) statSongs.textContent = DATA.songs.length;
}

// ---------- Rendering (artists/songs) ----------
function renderArtists() {
  const grid = el('#artistsGrid');
  if (!grid) return;
  grid.innerHTML = '';

  DATA.artists.forEach((a, index) => {
    const d = document.createElement('div');
    d.className = 'artist-card';
    d.style.animationDelay = `${index * 0.05}s`;
    d.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
        <span style="font-size:28px">${a.image || '🎵'}</span>
        <div>
          <div style="font-weight:600;font-size:16px">${a.name}</div>
          <div class="muted small">${a.era}</div>
        </div>
      </div>
      <div class="muted small">${a.genres.join(' • ')}</div>
    `;
    d.onclick = () => openArtist(a.id);
    grid.appendChild(d);
  });
}

function getThumbHtml(song) {
  // Generate a colorful gradient based on song mood
  const moodColors = {
    romantic: 'linear-gradient(135deg, #8B2942, #D4A84B)',
    nostalgic: 'linear-gradient(135deg, #1A5F5F, #D4A84B)',
    sad: 'linear-gradient(135deg, #2E4057, #048A81)',
    energetic: 'linear-gradient(135deg, #D4A84B, #8B2942)',
    hopeful: 'linear-gradient(135deg, #048A81, #D4A84B)',
    devotional: 'linear-gradient(135deg, #5C3D2E, #D4A84B)',
    peaceful: 'linear-gradient(135deg, #1A5F5F, #0D3B3E)'
  };

  const mood = song.moods[0] || 'nostalgic';
  const gradient = moodColors[mood] || moodColors.nostalgic;

  return `
    <div class="song-thumb" style="background:${gradient}">
      <span style="font-size:24px">🎵</span>
    </div>
  `;
}

function renderSongs(list) {
  const wrap = el('#songsList');
  if (!wrap) return;
  wrap.innerHTML = '';

  list.forEach((s, index) => {
    const song = DATA.songs.find(x => x.id === s.id);
    if (!song) return;

    const art = DATA.artists.find(x => x.id === song.artist) || { name: 'Unknown' };
    const d = document.createElement('div');
    d.className = 'song-card';
    d.style.animationDelay = `${index * 0.05}s`;

    const thumbHtml = getThumbHtml(song);
    const isInQueue = state.currentQueue.includes(song.id);
    d.innerHTML = `
      ${thumbHtml}
      <div style="flex:1;min-width:0">
        <div style="font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${song.title}</div>
        <div class="muted small">${art.name} • ${song.year} • ${song.album || ''}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">
        <div class="badge">${song.moods[0]}</div>
        <div style="display:flex;gap:6px;align-items:center">
          <button class="share-song-btn" data-id="${song.id}" title="Share">📤</button>
          <button class="add-to-playlist-btn" data-id="${song.id}" title="Add to Playlist">📝</button>
          <div class="queue-btn" data-id="${song.id}" title="Add to Queue" style="cursor:pointer">${isInQueue ? '✅' : '➕'}</div>
          <div class="fav" data-id="${song.id}">${state.favorites.includes(song.id) ? '❤️' : '🤍'}</div>
        </div>
      </div>
    `;

    d.onmouseenter = () => startPreview(song);
    d.onmouseleave = () => stopPreview();
    d.onclick = (e) => {
      if (e.target.classList && e.target.classList.contains('fav')) {
        toggleFav(song.id);
        e.stopPropagation();
      } else if (e.target.classList && e.target.classList.contains('queue-btn')) {
        addToQueue(song.id);
        e.target.innerHTML = '✅';
        e.stopPropagation();
      } else if (e.target.classList && e.target.classList.contains('add-to-playlist-btn')) {
        showAddToPlaylistModal(song.id);
        e.stopPropagation();
      } else if (e.target.classList && e.target.classList.contains('share-song-btn')) {
        shareSong(song.id);
        e.stopPropagation();
      } else {
        openSong(song.id);
      }
    };
    wrap.appendChild(d);
  });

  const resultsCount = el('#resultsCount');
  if (resultsCount) resultsCount.innerText = list.length;
}

function renderSongsInContainer(list, container) {
  if (!container) return;
  container.innerHTML = '';

  list.forEach((li, index) => {
    const song = DATA.songs.find(x => x.id === li.id);
    if (!song) return;

    const art = DATA.artists.find(x => x.id === song.artist) || { name: 'Unknown' };
    const d = document.createElement('div');
    d.className = 'song-card';
    d.style.animationDelay = `${index * 0.05}s`;

    const thumbHtml = getThumbHtml(song);
    d.innerHTML = `
      ${thumbHtml}
      <div style="flex:1;min-width:0">
        <div style="font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${song.title}</div>
        <div class="muted small">${art.name} • ${song.year}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">
        <div class="badge">${song.moods[0]}</div>
        <div class="fav" data-id="${song.id}">${state.favorites.includes(song.id) ? '❤️' : '🤍'}</div>
      </div>
    `;

    d.onmouseenter = () => startPreview(song);
    d.onmouseleave = () => stopPreview();
    d.onclick = (e) => {
      if (e.target.classList && e.target.classList.contains('fav')) {
        toggleFav(song.id);
        e.stopPropagation();
      } else {
        openSong(song.id);
      }
    };
    container.appendChild(d);
  });
}

// ---------- Mood chips & ranking ----------
function initMoodChips() {
  const chips = el('#moodChips');
  if (!chips) return;
  chips.innerHTML = '';

  DATA.moods.forEach(m => {
    const c = document.createElement('div');
    c.className = 'chip' + (state.selectedMood === m.id ? ' active' : '');
    c.innerHTML = `${m.emoji} ${m.label}`;
    c.dataset.id = m.id;
    c.onclick = () => {
      state.selectedMood = m.id;
      els('.chip', chips).forEach(x => x.classList.remove('active'));
      c.classList.add('active');
      applyMoodFilter();
    };
    chips.appendChild(c);
  });
}

function applyMoodFilter() {
  if (!state.selectedMood) {
    renderSongs(DATA.songs.slice(0, 15).map(s => ({ id: s.id })));
    return;
  }

  const intensity = state.intensity / 100;
  const tempoPreference = intensity;

  let scored = DATA.songs.map(s => {
    let score = 0;
    if (s.moods.includes(state.selectedMood)) score += 2.0;

    const desiredBpm = 60 + tempoPreference * 60;
    const bpmDiff = Math.abs((s.bpm || 80) - desiredBpm);
    score += Math.max(0, 1.2 - (bpmDiff / 60));

    if ((s.tempo === 'slow' && tempoPreference < 0.4) || (s.tempo === 'fast' && tempoPreference > 0.6)) {
      score += 0.3;
    }

    return { id: s.id, score };
  });

  scored.sort((a, b) => b.score - a.score);
  renderSongs(scored.slice(0, 40));
}

// ---------- Local audio preview ----------
let previewAudio = null;
let previewTimeout = null;

function startPreview(song) {
  stopPreview();
  const area = el('#previewArea');
  if (!area) return;

  area.innerHTML = `
    <div style="text-align:center">
      <div style="font-weight:600;color:var(--accent-gold)">${song.title}</div>
      <div class="muted small">Hover to preview</div>
      ${song.youtubeId ? '<div class="muted small" style="margin-top:4px">🎬 Click to play on YouTube</div>' : ''}
    </div>
  `;
}

function stopPreview() {
  if (previewTimeout) {
    clearTimeout(previewTimeout);
    previewTimeout = null;
  }
  if (previewAudio) {
    try {
      previewAudio.pause();
      previewAudio.currentTime = 0;
    } catch (e) { }
    previewAudio = null;
  }
  const area = el('#previewArea');
  if (area) area.innerHTML = '<span class="muted">No preview playing</span>';
}

// ---------- WebAudio Effects Engine ----------
let audioCtx = null;
let currentNodes = null;
let convolverBuffer = null;
let centerCancelEnabled = false;

function ensureAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function buildAudioGraph(audioEl) {
  const ctx = ensureAudioContext();
  const source = ctx.createMediaElementSource(audioEl);
  const preGain = ctx.createGain();
  preGain.gain.value = 1.0;

  const bassFilter = ctx.createBiquadFilter();
  bassFilter.type = 'lowshelf';
  bassFilter.frequency.value = 200;
  bassFilter.gain.value = 0;

  const trebleFilter = ctx.createBiquadFilter();
  trebleFilter.type = 'highshelf';
  trebleFilter.frequency.value = 3000;
  trebleFilter.gain.value = 0;

  const convolver = ctx.createConvolver();
  if (convolverBuffer) convolver.buffer = convolverBuffer;

  const reverbWet = ctx.createGain();
  reverbWet.gain.value = 0;
  const reverbDry = ctx.createGain();
  reverbDry.gain.value = 1;

  const outGain = ctx.createGain();
  outGain.gain.value = 1.0;

  source.connect(preGain);
  preGain.connect(bassFilter);
  bassFilter.connect(trebleFilter);

  if (convolverBuffer) {
    trebleFilter.connect(convolver);
    convolver.connect(reverbWet);
  }
  trebleFilter.connect(reverbDry);

  reverbWet.connect(outGain);
  reverbDry.connect(outGain);
  outGain.connect(ctx.destination);

  const splitter = ctx.createChannelSplitter(2);
  const inverterGain = ctx.createGain();
  inverterGain.gain.value = -1;
  const merger = ctx.createChannelMerger(2);

  currentNodes = {
    ctx, source, preGain, bassFilter, trebleFilter,
    convolver, reverbWet, reverbDry, outGain,
    splitter, inverterGain, merger
  };
  return currentNodes;
}

function cleanupAudioGraph() {
  if (!currentNodes) return;
  try {
    Object.values(currentNodes).forEach(n => {
      if (n && n.disconnect) try { n.disconnect(); } catch (e) { }
    });
  } catch (e) { }
  currentNodes = null;
  centerCancelEnabled = false;
}

function applyFilterValues(values) {
  if (!currentNodes) return;
  const { bassFilter, trebleFilter, reverbWet, reverbDry, outGain } = currentNodes;
  if (bassFilter) bassFilter.gain.value = Number(values.bass || 0);
  if (trebleFilter) trebleFilter.gain.value = Number(values.treble || 0);
  if (reverbWet && reverbDry) {
    const r = Number(values.reverb || 0);
    reverbWet.gain.value = r;
    reverbDry.gain.value = 1 - r;
  }
  if (outGain) outGain.gain.value = Number(values.volume || 1.0);
}

// ---------- openSong (modal with YouTube or audio) ----------
let ytPlayer = null;

// Add song to recently played
function addToRecentlyPlayed(songId) {
  state.recentlyPlayed = state.recentlyPlayed.filter(id => id !== songId);
  state.recentlyPlayed.unshift(songId);
  if (state.recentlyPlayed.length > 20) state.recentlyPlayed.pop();
  localStorage.setItem('ss_recent', JSON.stringify(state.recentlyPlayed));
  renderRecentlyPlayed();
}

// Get next song index based on shuffle/repeat
function getNextIndex() {
  if (state.repeatMode === 'one') return state.currentIndex;

  if (state.shuffleMode) {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * state.currentQueue.length);
    } while (newIndex === state.currentIndex && state.currentQueue.length > 1);
    return newIndex;
  }

  const nextIndex = state.currentIndex + 1;
  if (nextIndex >= state.currentQueue.length) {
    return state.repeatMode === 'all' ? 0 : -1;
  }
  return nextIndex;
}

// Get previous song index
function getPrevIndex() {
  if (state.shuffleMode) {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * state.currentQueue.length);
    } while (newIndex === state.currentIndex && state.currentQueue.length > 1);
    return newIndex;
  }

  const prevIndex = state.currentIndex - 1;
  if (prevIndex < 0) {
    return state.repeatMode === 'all' ? state.currentQueue.length - 1 : -1;
  }
  return prevIndex;
}

// Play next song
function playNextSong() {
  const nextIndex = getNextIndex();
  if (nextIndex >= 0 && nextIndex < state.currentQueue.length) {
    state.currentIndex = nextIndex;
    openSong(state.currentQueue[nextIndex]);
  }
}

// Play previous song
function playPrevSong() {
  const prevIndex = getPrevIndex();
  if (prevIndex >= 0 && prevIndex < state.currentQueue.length) {
    state.currentIndex = prevIndex;
    openSong(state.currentQueue[prevIndex]);
  }
}

// Initialize queue from current view
function initQueueFromSongs(songIds, startIndex = 0) {
  state.currentQueue = [...songIds];
  state.currentIndex = startIndex;
}

function openSong(id) {
  const s = DATA.songs.find(x => x.id === id);
  if (!s) return;

  // Add to recently played
  addToRecentlyPlayed(id);

  // If queue is empty, initialize with all songs
  if (state.currentQueue.length === 0) {
    state.currentQueue = DATA.songs.map(s => s.id);
    state.currentIndex = state.currentQueue.indexOf(id);
  } else if (!state.currentQueue.includes(id)) {
    // If song not in queue, add it
    state.currentQueue.push(id);
    state.currentIndex = state.currentQueue.length - 1;
  } else {
    state.currentIndex = state.currentQueue.indexOf(id);
  }

  cleanupAudioGraph();

  el('#modalTitle').innerText = s.title;
  el('#modalArtist').innerText = (DATA.artists.find(a => a.id === s.artist) || { name: 'Unknown' }).name;

  const playerDiv = el('#modalPlayer');
  playerDiv.innerHTML = '';

  // Check if song has YouTube ID
  if (s.youtubeId) {
    // Create container for YouTube player
    const youtubeContainer = document.createElement('div');
    youtubeContainer.id = 'ytPlayerContainer';
    youtubeContainer.style.cssText = 'position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin-top:16px';

    const playerFrame = document.createElement('div');
    playerFrame.id = 'ytPlayerFrame';
    playerFrame.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%';
    youtubeContainer.appendChild(playerFrame);
    playerDiv.appendChild(youtubeContainer);

    // Load YouTube IFrame API if not loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);

      window.onYouTubeIframeAPIReady = () => {
        createYTPlayer(s.youtubeId);
      };
    } else {
      createYTPlayer(s.youtubeId);
    }

    // Hide audio controls when using YouTube
    const audioControls = el('#audioControls');
    if (audioControls) audioControls.style.display = 'none';

  } else if (s.audio || s.preview) {
    // Use audio element for local files
    const audioEl = document.createElement('audio');
    audioEl.src = s.audio || s.preview || '';
    audioEl.controls = true;
    audioEl.autoplay = true;
    audioEl.style.width = '100%';
    audioEl.style.marginTop = '16px';
    audioEl.style.borderRadius = '8px';
    playerDiv.appendChild(audioEl);

    // Auto-play next when audio ends
    audioEl.onended = () => {
      playNextSong();
    };

    const nodes = buildAudioGraph(audioEl);

    // Day 2: Initialize visualizer for local audio
    initVisualizer();

    // Show audio controls
    const audioControls = el('#audioControls');
    if (audioControls) audioControls.style.display = 'grid';

    // Playback rate control
    const pr = el('#playbackRate'), prVal = el('#playbackVal');
    if (pr) {
      pr.value = 1;
      pr.oninput = () => {
        audioEl.playbackRate = Number(pr.value);
        prVal.innerText = Number(pr.value).toFixed(2) + 'x';
      };
    }

    // Bass/treble/reverb controls
    const bass = el('#bass'), treble = el('#treble'), rev = el('#reverb');
    const bassVal = el('#bassVal'), trebleVal = el('#trebleVal'), revVal = el('#reverbVal');

    if (bass) {
      bass.value = 0;
      bass.oninput = () => {
        bassVal.innerText = Number(bass.value).toFixed(1) + ' dB';
        applyFilterValues({ bass: bass.value, treble: treble.value, reverb: rev.value });
      };
    }
    if (treble) {
      treble.value = 0;
      treble.oninput = () => {
        trebleVal.innerText = Number(treble.value).toFixed(1) + ' dB';
        applyFilterValues({ bass: bass.value, treble: treble.value, reverb: rev.value });
      };
    }
    if (rev) {
      rev.value = 0;
      rev.oninput = () => {
        revVal.innerText = Math.round(Number(rev.value) * 100) + '%';
        applyFilterValues({ bass: bass.value, treble: treble.value, reverb: rev.value });
      };
    }

    applyFilterValues({ bass: 0, treble: 0, reverb: 0, volume: 1 });
  } else {
    // No audio available
    playerDiv.innerHTML = `
      <div style="text-align:center;padding:40px;color:var(--text-muted)">
        <div style="font-size:48px;margin-bottom:16px">🎵</div>
        <div>Audio not available for this track</div>
        <div class="small muted" style="margin-top:8px">This is a demo version with limited content</div>
      </div>
    `;
    const audioControls = el('#audioControls');
    if (audioControls) audioControls.style.display = 'none';
  }

  el('#modal').style.display = 'grid';

  // Initialize playback controls and update UI
  initPlaybackControls();
  updatePlaybackControlsUI();

  // Day 2: Start progress bar updates
  startProgressUpdates();

  el('#closeModal').onclick = () => {
    el('#modal').style.display = 'none';
    el('#modalPlayer').innerHTML = '';
    if (ytPlayer) {
      ytPlayer.destroy();
      ytPlayer = null;
    }
    cleanupAudioGraph();
    // Day 2: Stop progress and visualizer
    stopProgressUpdates();
    stopVisualizer();
  };
}

// Create YouTube player with IFrame API
function createYTPlayer(videoId) {
  if (ytPlayer) {
    ytPlayer.destroy();
  }

  ytPlayer = new YT.Player('ytPlayerFrame', {
    videoId: videoId,
    playerVars: {
      autoplay: 1,
      rel: 0,
      modestbranding: 1
    },
    events: {
      onStateChange: onYTStateChange
    }
  });
}

// Handle YouTube player state changes
function onYTStateChange(event) {
  // YT.PlayerState.ENDED = 0
  if (event.data === 0) {
    playNextSong();
  }
}

// ---------- Shuffle/Repeat Toggle Functions ----------
function toggleShuffle() {
  state.shuffleMode = !state.shuffleMode;
  updatePlaybackControlsUI();
}

function toggleRepeat() {
  const modes = ['off', 'one', 'all'];
  const currentIdx = modes.indexOf(state.repeatMode);
  state.repeatMode = modes[(currentIdx + 1) % modes.length];
  updatePlaybackControlsUI();
}

function updatePlaybackControlsUI() {
  const shuffleBtn = el('#btnShuffle');
  const repeatBtn = el('#btnRepeat');
  const queuePos = el('#queuePosition');
  const queueTotal = el('#queueTotal');

  if (shuffleBtn) {
    shuffleBtn.innerHTML = state.shuffleMode ? '🔀 On' : '🔀 Off';
    shuffleBtn.style.background = state.shuffleMode ? 'var(--accent-gold)' : '';
    shuffleBtn.style.color = state.shuffleMode ? 'var(--bg-dark)' : '';
  }

  if (repeatBtn) {
    const repeatLabels = { off: '🔁 Off', one: '🔂 One', all: '🔁 All' };
    repeatBtn.innerHTML = repeatLabels[state.repeatMode];
    repeatBtn.style.background = state.repeatMode !== 'off' ? 'var(--accent-gold)' : '';
    repeatBtn.style.color = state.repeatMode !== 'off' ? 'var(--bg-dark)' : '';
  }

  if (queuePos && queueTotal) {
    queuePos.textContent = state.currentIndex + 1;
    queueTotal.textContent = state.currentQueue.length;
  }
}

// Initialize playback control buttons
function initPlaybackControls() {
  const btnPrev = el('#btnPrev');
  const btnNext = el('#btnNext');
  const btnShuffle = el('#btnShuffle');
  const btnRepeat = el('#btnRepeat');

  if (btnPrev) btnPrev.onclick = playPrevSong;
  if (btnNext) btnNext.onclick = playNextSong;
  if (btnShuffle) btnShuffle.onclick = toggleShuffle;
  if (btnRepeat) btnRepeat.onclick = toggleRepeat;
}

// ---------- Queue Management ----------
function addToQueue(songId) {
  if (!state.currentQueue.includes(songId)) {
    state.currentQueue.push(songId);
    renderQueue();
  }
}

function removeFromQueue(songId) {
  const index = state.currentQueue.indexOf(songId);
  if (index > -1) {
    state.currentQueue.splice(index, 1);
    // Adjust currentIndex if needed
    if (index < state.currentIndex) {
      state.currentIndex--;
    } else if (index === state.currentIndex) {
      state.currentIndex = Math.min(state.currentIndex, state.currentQueue.length - 1);
    }
    renderQueue();
  }
}

function clearQueue() {
  state.currentQueue = [];
  state.currentIndex = -1;
  renderQueue();
}

function renderQueue() {
  const queueList = el('#queueList');
  if (!queueList) return;

  if (state.currentQueue.length === 0) {
    queueList.innerHTML = '<span class="muted small">Queue is empty</span>';
    return;
  }

  queueList.innerHTML = '';
  state.currentQueue.forEach((songId, index) => {
    const song = DATA.songs.find(s => s.id === songId);
    if (!song) return;

    const isPlaying = index === state.currentIndex;
    const item = document.createElement('div');
    item.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 8px;
      border-radius: 6px;
      margin-bottom: 4px;
      background: ${isPlaying ? 'var(--accent-gold)' : 'rgba(255,255,255,0.05)'};
      color: ${isPlaying ? 'var(--bg-dark)' : 'inherit'};
      cursor: pointer;
    `;

    item.innerHTML = `
      <span style="font-size:12px;width:20px;text-align:center">${index + 1}</span>
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${song.title}</div>
      </div>
      <span class="remove-queue" data-id="${songId}" style="cursor:pointer;opacity:0.6" title="Remove">✕</span>
    `;

    item.onclick = (e) => {
      if (e.target.classList.contains('remove-queue')) {
        removeFromQueue(songId);
        e.stopPropagation();
      } else {
        state.currentIndex = index;
        openSong(songId);
      }
    };

    queueList.appendChild(item);
  });
}

// Initialize queue controls
function initQueueControls() {
  const clearQueueBtn = el('#clearQueue');
  if (clearQueueBtn) {
    clearQueueBtn.onclick = clearQueue;
  }
}

// ---------- Recently Played ----------
function renderRecentlyPlayed() {
  const recentList = el('#recentlyPlayedList');
  if (!recentList) return;

  if (state.recentlyPlayed.length === 0) {
    recentList.innerHTML = '<span class="muted small">No history yet</span>';
    return;
  }

  recentList.innerHTML = '';
  // Show up to 10 recent songs
  state.recentlyPlayed.slice(0, 10).forEach((songId, index) => {
    const song = DATA.songs.find(s => s.id === songId);
    if (!song) return;

    const item = document.createElement('div');
    item.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 8px;
      border-radius: 6px;
      margin-bottom: 4px;
      background: rgba(255,255,255,0.05);
      cursor: pointer;
      transition: background 0.2s;
    `;
    item.onmouseenter = () => item.style.background = 'rgba(255,255,255,0.1)';
    item.onmouseleave = () => item.style.background = 'rgba(255,255,255,0.05)';

    item.innerHTML = `
      <span style="font-size:16px">🎵</span>
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${song.title}</div>
      </div>
    `;

    item.onclick = () => openSong(songId);
    recentList.appendChild(item);
  });
}

function clearRecentlyPlayed() {
  state.recentlyPlayed = [];
  localStorage.setItem('ss_recent', '[]');
  renderRecentlyPlayed();
}

function initRecentlyPlayedControls() {
  const clearRecentBtn = el('#clearRecent');
  if (clearRecentBtn) {
    clearRecentBtn.onclick = clearRecentlyPlayed;
  }
}

// ---------- favorites ----------
function toggleFav(songId) {
  if (state.favorites.includes(songId)) {
    state.favorites = state.favorites.filter(x => x !== songId);
  } else {
    state.favorites.push(songId);
  }
  localStorage.setItem('ss_favs', JSON.stringify(state.favorites));
  renderFavCount();

  if (state.view && state.view.startsWith('artist:')) {
    openArtist(state.view.split(':')[1]);
  } else if (state.view === 'favorites') {
    showFavorites();
  } else {
    applyMoodFilter();
  }
}

function renderFavCount() {
  const favCount = el('#favCount');
  if (favCount) favCount.innerText = state.favorites.length;
}

// ---------- artist page / favorites / search ----------
function openArtist(id) {
  const a = DATA.artists.find(x => x.id === id);
  if (!a) return;

  state.view = 'artist:' + id;
  const main = document.querySelector('main > section');
  if (!main) return;

  main.innerHTML = '';

  // Artist header card
  const card = document.createElement('div');
  card.className = 'card hero';
  card.innerHTML = `
    <div style="flex:1">
      <h2>${a.image || '🎵'} ${a.name}</h2>
      <div class="muted">${a.genres.join(' • ')} • ${a.era} • ${a.region}</div>
      <p style="margin-top:16px;line-height:1.6">${a.bio}</p>
      <button class="chip" style="margin-top:16px" onclick="loadHome()">← Back to Home</button>
    </div>
    <div class="art">${a.name.split(' ').map(x => x[0]).join('')}</div>
  `;
  main.appendChild(card);

  // Songs by this artist
  const songsCard = document.createElement('div');
  songsCard.className = 'card';
  songsCard.style.marginTop = '20px';
  songsCard.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
      <strong style="font-size:18px">🎶 Songs by ${a.name}</strong>
      <div class="badge">${DATA.songs.filter(s => s.artist === id).length} tracks</div>
    </div>
    <div id="artistSongs"></div>
  `;
  main.appendChild(songsCard);

  const list = DATA.songs.filter(s => s.artist === id).map(s => ({ id: s.id }));
  renderSongsInContainer(list, el('#artistSongs', songsCard));
}

function showFavorites() {
  state.view = 'favorites';
  const main = document.querySelector('main > section');
  if (!main) return;

  main.innerHTML = '';

  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
      <div>
        <h2>❤️ Your Favorites</h2>
        <p class="muted small">Your saved songs collection</p>
      </div>
      <button class="chip" onclick="loadHome()">← Back to Home</button>
    </div>
    <div id="favList"></div>
  `;
  main.appendChild(card);

  const favList = state.favorites.map(id => ({ id }));
  const favListEl = el('#favList', card);

  if (favList.length === 0) {
    favListEl.innerHTML = `
      <div style="text-align:center;padding:40px;color:var(--text-muted)">
        <div style="font-size:48px;margin-bottom:16px">💔</div>
        <div>No favorites yet</div>
        <div class="small" style="margin-top:8px">Click the heart icon on any song to add it here</div>
      </div>
    `;
  } else {
    renderSongsInContainer(favList, favListEl);
  }
}

function applySearch(q) {
  if (!q || q.length < 2) return;

  const ql = q.toLowerCase();
  const songMatches = DATA.songs.filter(s =>
    s.title.toLowerCase().includes(ql) ||
    s.moods.join(' ').toLowerCase().includes(ql) ||
    (s.album && s.album.toLowerCase().includes(ql))
  );
  const artistMatches = DATA.artists.filter(a => a.name.toLowerCase().includes(ql));

  if (songMatches.length > 0) {
    renderSongs(songMatches.map(s => ({ id: s.id })));
  } else if (artistMatches.length > 0) {
    openArtist(artistMatches[0].id);
  }
}

// ---------- DAY 2 FEATURES ----------

// ========== THEME TOGGLE ==========
function initTheme() {
  const savedTheme = localStorage.getItem('ss_theme') || 'dark';
  state.theme = savedTheme;
  if (savedTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  }
  updateThemeButton();
}

function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  if (state.theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  localStorage.setItem('ss_theme', state.theme);
  updateThemeButton();
}

function updateThemeButton() {
  const btn = el('#themeToggle');
  if (btn) {
    btn.innerHTML = state.theme === 'dark' ? '<span>🌙</span>' : '<span>☀️</span>';
  }
}

// ========== PLAYLIST MANAGEMENT ==========
function savePlaylists() {
  localStorage.setItem('ss_playlists', JSON.stringify(state.playlists));
}

function createPlaylist(name) {
  if (!name || name.trim() === '') return;

  const playlist = {
    id: 'pl_' + Date.now(),
    name: name.trim(),
    songs: [],
    createdAt: Date.now()
  };

  state.playlists.push(playlist);
  savePlaylists();
  renderPlaylists();
  closePlaylistModal();
}

function deletePlaylist(playlistId) {
  state.playlists = state.playlists.filter(p => p.id !== playlistId);
  savePlaylists();
  renderPlaylists();
}

function addSongToPlaylist(playlistId, songId) {
  const playlist = state.playlists.find(p => p.id === playlistId);
  if (playlist && !playlist.songs.includes(songId)) {
    playlist.songs.push(songId);
    savePlaylists();
    closeAddToPlaylistModal();
    renderPlaylists();
  }
}

function removeSongFromPlaylist(playlistId, songId) {
  const playlist = state.playlists.find(p => p.id === playlistId);
  if (playlist) {
    playlist.songs = playlist.songs.filter(id => id !== songId);
    savePlaylists();
  }
}

function openPlaylist(playlistId) {
  const playlist = state.playlists.find(p => p.id === playlistId);
  if (!playlist) return;

  state.view = 'playlist:' + playlistId;
  const main = document.querySelector('main > section');
  if (!main) return;

  main.innerHTML = '';

  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
      <div>
        <h2>📝 ${playlist.name}</h2>
        <p class="muted small">${playlist.songs.length} songs</p>
      </div>
      <button class="chip" onclick="loadHome()">← Back to Home</button>
    </div>
    <div id="playlistSongsList"></div>
  `;
  main.appendChild(card);

  const listEl = el('#playlistSongsList', card);
  if (playlist.songs.length === 0) {
    listEl.innerHTML = `
      <div style="text-align:center;padding:40px;color:var(--text-muted)">
        <div style="font-size:48px;margin-bottom:16px">📭</div>
        <div>This playlist is empty</div>
        <div class="small" style="margin-top:8px">Add songs using the ➕ button on song cards</div>
      </div>
    `;
  } else {
    renderSongsInContainer(playlist.songs.map(id => ({ id })), listEl);
  }
}

function renderPlaylists() {
  const container = el('#playlistsList');
  if (!container) return;

  if (state.playlists.length === 0) {
    container.innerHTML = '<span class="muted small">No playlists yet</span>';
    return;
  }

  container.innerHTML = '';
  state.playlists.forEach(playlist => {
    const item = document.createElement('div');
    item.className = 'playlist-item';
    item.innerHTML = `
      <span class="playlist-name">📝 ${playlist.name}</span>
      <span class="playlist-count">${playlist.songs.length} songs</span>
      <span class="delete-playlist" data-id="${playlist.id}">🗑️</span>
    `;

    item.onclick = (e) => {
      if (e.target.classList.contains('delete-playlist')) {
        deletePlaylist(playlist.id);
        e.stopPropagation();
      } else {
        openPlaylist(playlist.id);
      }
    };

    container.appendChild(item);
  });
}

function showAddToPlaylistModal(songId) {
  state.currentSongForPlaylist = songId;
  const modal = el('#addToPlaylistModal');
  const optionsContainer = el('#playlistOptions');

  if (state.playlists.length === 0) {
    optionsContainer.innerHTML = `
      <div style="text-align:center;padding:20px;color:var(--text-muted)">
        <div>No playlists yet</div>
        <button class="chip" style="margin-top:12px" onclick="closeAddToPlaylistModal();showPlaylistModal();">Create Playlist</button>
      </div>
    `;
  } else {
    optionsContainer.innerHTML = '';
    state.playlists.forEach(playlist => {
      const alreadyIn = playlist.songs.includes(songId);
      const option = document.createElement('div');
      option.className = 'playlist-option';
      option.innerHTML = `
        <span>📝</span>
        <span style="flex:1">${playlist.name}</span>
        <span class="muted small">${alreadyIn ? '✅ Added' : ''}</span>
      `;

      if (!alreadyIn) {
        option.onclick = () => addSongToPlaylist(playlist.id, songId);
      } else {
        option.style.opacity = '0.6';
        option.style.cursor = 'default';
      }

      optionsContainer.appendChild(option);
    });
  }

  modal.style.display = 'grid';
}

function closeAddToPlaylistModal() {
  el('#addToPlaylistModal').style.display = 'none';
  state.currentSongForPlaylist = null;
}

function showPlaylistModal() {
  el('#playlistModal').style.display = 'grid';
  el('#playlistNameInput').value = '';
  el('#playlistNameInput').focus();
}

function closePlaylistModal() {
  el('#playlistModal').style.display = 'none';
  el('#playlistNameInput').value = '';
}

function initPlaylistControls() {
  const newBtn = el('#newPlaylist');
  if (newBtn) newBtn.onclick = showPlaylistModal;

  const viewBtn = el('#viewPlaylists');
  if (viewBtn) viewBtn.onclick = showPlaylistModal;

  const createBtn = el('#createPlaylist');
  if (createBtn) {
    createBtn.onclick = () => {
      const name = el('#playlistNameInput').value;
      createPlaylist(name);
    };
  }

  const cancelBtn = el('#cancelPlaylist');
  if (cancelBtn) cancelBtn.onclick = closePlaylistModal;

  const closeBtn = el('#closePlaylistModal');
  if (closeBtn) closeBtn.onclick = closePlaylistModal;

  const closeAddBtn = el('#closeAddToPlaylistModal');
  if (closeAddBtn) closeAddBtn.onclick = closeAddToPlaylistModal;

  // Enter key to create playlist
  const nameInput = el('#playlistNameInput');
  if (nameInput) {
    nameInput.onkeydown = (e) => {
      if (e.key === 'Enter') {
        createPlaylist(nameInput.value);
      }
    };
  }
}

// ========== AUDIO VISUALIZER ==========
let visualizerAnimationId = null;
let analyserNode = null;

function initVisualizer() {
  if (!currentNodes || !currentNodes.ctx) return;

  const ctx = currentNodes.ctx;
  analyserNode = ctx.createAnalyser();
  analyserNode.fftSize = 128;

  // Connect to audio graph
  if (currentNodes.outGain) {
    currentNodes.outGain.disconnect();
    currentNodes.outGain.connect(analyserNode);
    analyserNode.connect(ctx.destination);
  }

  drawVisualizer();
}

function drawVisualizer() {
  const canvas = el('#visualizer');
  if (!canvas || !analyserNode) return;

  const canvasCtx = canvas.getContext('2d');
  const bufferLength = analyserNode.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  function draw() {
    visualizerAnimationId = requestAnimationFrame(draw);

    analyserNode.getByteFrequencyData(dataArray);

    // Clear canvas
    canvasCtx.fillStyle = 'rgba(10, 31, 31, 0.2)';
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 2;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * canvas.height * 0.9;

      // Gradient colors (gold to burgundy)
      const gradient = canvasCtx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
      gradient.addColorStop(0, '#D4A84B');
      gradient.addColorStop(0.5, '#E8C97A');
      gradient.addColorStop(1, '#8B2942');

      canvasCtx.fillStyle = gradient;

      // Draw bar with rounded top
      canvasCtx.beginPath();
      canvasCtx.roundRect(x, canvas.height - barHeight, barWidth - 2, barHeight, 2);
      canvasCtx.fill();

      x += barWidth;
    }
  }

  draw();
}

function stopVisualizer() {
  if (visualizerAnimationId) {
    cancelAnimationFrame(visualizerAnimationId);
    visualizerAnimationId = null;
  }
  analyserNode = null;

  // Clear canvas
  const canvas = el('#visualizer');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

// ========== PROGRESS BAR WITH SEEK ==========
let progressAnimationId = null;

function formatTime(seconds) {
  if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function updateProgressBar() {
  const progressFill = el('#progressFill');
  const currentTimeEl = el('#currentTime');
  const totalTimeEl = el('#totalTime');

  if (!progressFill) return;

  let currentTime = 0;
  let duration = 0;

  // Check for YouTube player
  if (ytPlayer && typeof ytPlayer.getCurrentTime === 'function') {
    try {
      currentTime = ytPlayer.getCurrentTime() || 0;
      duration = ytPlayer.getDuration() || 0;
    } catch (e) { }
  }

  // Check for audio element
  const audioEl = el('#modalPlayer audio');
  if (audioEl) {
    currentTime = audioEl.currentTime || 0;
    duration = audioEl.duration || 0;
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  progressFill.style.width = progress + '%';

  if (currentTimeEl) currentTimeEl.textContent = formatTime(currentTime);
  if (totalTimeEl) totalTimeEl.textContent = formatTime(duration);
}

function startProgressUpdates() {
  stopProgressUpdates();
  progressAnimationId = setInterval(updateProgressBar, 500);
}

function stopProgressUpdates() {
  if (progressAnimationId) {
    clearInterval(progressAnimationId);
    progressAnimationId = null;
  }
}

function seekTo(percentage) {
  let duration = 0;

  // Check for YouTube player
  if (ytPlayer && typeof ytPlayer.getDuration === 'function') {
    try {
      duration = ytPlayer.getDuration() || 0;
      if (duration > 0) {
        ytPlayer.seekTo(duration * percentage, true);
      }
    } catch (e) { }
    return;
  }

  // Check for audio element
  const audioEl = el('#modalPlayer audio');
  if (audioEl && audioEl.duration) {
    audioEl.currentTime = audioEl.duration * percentage;
  }
}

function initProgressBar() {
  const progressBar = el('#progressBar');
  if (!progressBar) return;

  let isDragging = false;

  progressBar.onclick = (e) => {
    const rect = progressBar.getBoundingClientRect();
    const percentage = (e.clientX - rect.left) / rect.width;
    seekTo(Math.max(0, Math.min(1, percentage)));
    updateProgressBar();
  };

  progressBar.onmousedown = (e) => {
    isDragging = true;
    e.preventDefault();
  };

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const rect = progressBar.getBoundingClientRect();
    const percentage = (e.clientX - rect.left) / rect.width;
    seekTo(Math.max(0, Math.min(1, percentage)));
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });
}

// ========== ENHANCED SONG CARDS WITH ADD TO PLAYLIST ==========
// Override renderSongs to include Add to Playlist button
const originalRenderSongs = renderSongs;

// ---------- initial load & events ----------
function loadHome() {
  state.view = 'home';
  const main = document.querySelector('main > section');
  if (!main) return;

  main.innerHTML = `
    <div class="card hero" id="homeHero">
      <div style="flex:1">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap">
          <div>
            <h2 id="featuredTitle">✨ Featured: Jagjit Singh</h2>
            <div class="muted">Ghazal Legend • Nostalgic Evenings Collection</div>
          </div>
          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
            <button class="chip" id="playFeatured">▶️ Play Featured</button>
            <button class="chip" id="openMood">🌙 Explore Moods</button>
          </div>
        </div>
        <p class="small muted" style="margin-top:16px">
          💡 Hover over any song to preview • Click to play with YouTube
        </p>
      </div>
      <div class="art">JS</div>
    </div>
    
    <div style="height:20px"></div>
    
    <div class="card">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
        <div style="display:flex;gap:12px;align-items:center">
          <strong style="font-size:18px">🏆 Top Legends</strong>
          <span class="muted small">(click to explore)</span>
        </div>
        <div class="badge">Curated Collection</div>
      </div>
      <div class="grid" id="artistsGrid"></div>
    </div>
    
    <div style="height:20px"></div>
    
    <div class="card">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
        <strong style="font-size:18px" id="listTitle">🎶 Latest Additions</strong>
        <div class="badge">Classic Hits</div>
      </div>
      <div id="songsList"></div>
    </div>
  `;

  renderArtists();
  renderSongs(DATA.songs.slice(0, 15).map(s => ({ id: s.id })));
  initMoodChips();

  // Re-bind event listeners
  const playFeatured = el('#playFeatured');
  if (playFeatured) {
    playFeatured.onclick = () => {
      const jagjitSongs = DATA.songs.filter(s => s.artist === 'a_jagjit');
      if (jagjitSongs.length > 0) openSong(jagjitSongs[0].id);
    };
  }

  const openMoodBtn = el('#openMood');
  if (openMoodBtn) openMoodBtn.onclick = () => openMoodExplorer();
}

window.addEventListener('DOMContentLoaded', () => {
  // Initialize theme first
  initTheme();

  renderArtists();
  renderSongs(DATA.songs.slice(0, 15).map(s => ({ id: s.id })));
  initMoodChips();
  renderFavCount();
  updateStats();
  initQueueControls();
  renderQueue();
  initRecentlyPlayedControls();
  renderRecentlyPlayed();

  // Day 2: Initialize playlists
  initPlaylistControls();
  renderPlaylists();

  // Day 2: Initialize progress bar
  initProgressBar();

  // Day 2: Theme toggle
  const themeToggle = el('#themeToggle');
  if (themeToggle) themeToggle.onclick = toggleTheme;

  // Intensity slider
  const intensitySlider = el('#intensity');
  if (intensitySlider) {
    intensitySlider.oninput = (e) => {
      state.intensity = e.target.value;
      el('#intensityVal').innerText = state.intensity;
      if (state.selectedMood) applyMoodFilter();
    };
  }

  // Navigation buttons
  const navMood = el('#navMood');
  if (navMood) navMood.onclick = () => openMoodExplorer();

  const openMoodBtn = el('#openMood');
  if (openMoodBtn) openMoodBtn.onclick = () => openMoodExplorer();

  const viewFavorites = el('#viewFavorites');
  if (viewFavorites) viewFavorites.onclick = () => showFavorites();

  const playFeatured = el('#playFeatured');
  if (playFeatured) {
    playFeatured.onclick = () => {
      const jagjitSongs = DATA.songs.filter(s => s.artist === 'a_jagjit');
      if (jagjitSongs.length > 0) openSong(jagjitSongs[0].id);
    };
  }

  // Search
  const searchInput = el('#searchInput');
  if (searchInput) {
    searchInput.onkeyup = (e) => {
      const q = e.target.value;
      if (q.length < 2) {
        applyMoodFilter();
        return;
      }
      applySearch(q);
    };
  }

  // Modal close
  const closeModal = el('#closeModal');
  if (closeModal) {
    closeModal.onclick = () => {
      el('#modal').style.display = 'none';
      el('#modalPlayer').innerHTML = '';
      cleanupAudioGraph();
    };
  }

  // Clear favorites
  const clearFav = el('#clearFav');
  if (clearFav) {
    clearFav.onclick = () => {
      state.favorites = [];
      localStorage.setItem('ss_favs', '[]');
      renderFavCount();
      showFavorites();
    };
  }

  // Close modal on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = el('#modal');
      if (modal && modal.style.display !== 'none') {
        modal.style.display = 'none';
        el('#modalPlayer').innerHTML = '';
        cleanupAudioGraph();
      }
    }
  });

  // Close modal on backdrop click
  const modal = el('#modal');
  if (modal) {
    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
        el('#modalPlayer').innerHTML = '';
        cleanupAudioGraph();
      }
    };
  }
});

// Mood explorer view
function openMoodExplorer() {
  state.view = 'mood';
  const main = document.querySelector('main > section');
  if (!main) return;

  main.innerHTML = '';

  const hero = document.createElement('div');
  hero.className = 'card';
  hero.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
      <div>
        <h2>🎭 Mood Explorer</h2>
        <p class="muted small">Pick a mood and adjust intensity. Results update live.</p>
      </div>
      <button class="chip" onclick="loadHome()">← Back to Home</button>
    </div>
    <div id="moodExplorerResults"></div>
  `;
  main.appendChild(hero);

  initMoodChips();
  applyMoodFilter();
}

// Make loadHome globally available
window.loadHome = loadHome;

// ========== DAY 3 FEATURES ==========

// ========== KEYBOARD SHORTCUTS ==========
let keyboardShortcutsEnabled = true;

function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Don't trigger shortcuts when typing in inputs
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (!keyboardShortcutsEnabled) return;

    const modal = el('#modal');
    const isModalOpen = modal && modal.style.display !== 'none';
    const miniPlayer = el('#miniPlayer');
    const isMiniPlayerVisible = miniPlayer && miniPlayer.classList.contains('visible');

    // Only handle shortcuts when player is active
    if (!isModalOpen && !isMiniPlayerVisible) return;

    switch (e.key.toLowerCase()) {
      case ' ': // Space - Play/Pause
        e.preventDefault();
        togglePlayPause();
        break;
      case 'arrowright': // Next song
        if (e.shiftKey) {
          seekForward(10); // Shift + Right = Skip 10 seconds
        } else {
          playNextSong();
        }
        break;
      case 'arrowleft': // Previous song
        if (e.shiftKey) {
          seekBackward(10); // Shift + Left = Go back 10 seconds
        } else {
          playPrevSong();
        }
        break;
      case 'arrowup': // Volume up
        e.preventDefault();
        adjustVolume(0.1);
        break;
      case 'arrowdown': // Volume down
        e.preventDefault();
        adjustVolume(-0.1);
        break;
      case 'm': // Mute toggle
        toggleMute();
        break;
      case 's': // Shuffle toggle
        toggleShuffle();
        break;
      case 'r': // Repeat toggle
        toggleRepeat();
        break;
      case 'q': // Show queue panel
        if (e.ctrlKey) {
          e.preventDefault();
          toggleQueuePanel();
        }
        break;
    }
  });
}

// Toggle play/pause for current player
function togglePlayPause() {
  // Check for YouTube player
  if (ytPlayer && typeof ytPlayer.getPlayerState === 'function') {
    try {
      const state = ytPlayer.getPlayerState();
      if (state === 1) { // Playing
        ytPlayer.pauseVideo();
        updateMiniPlayerPlayState(false);
      } else {
        ytPlayer.playVideo();
        updateMiniPlayerPlayState(true);
      }
    } catch (e) { }
    return;
  }

  // Check for audio element
  const audioEl = el('#modalPlayer audio');
  if (audioEl) {
    if (audioEl.paused) {
      audioEl.play();
      updateMiniPlayerPlayState(true);
    } else {
      audioEl.pause();
      updateMiniPlayerPlayState(false);
    }
  }
}

// Seek forward by seconds
function seekForward(seconds) {
  if (ytPlayer && typeof ytPlayer.getCurrentTime === 'function') {
    try {
      const current = ytPlayer.getCurrentTime();
      ytPlayer.seekTo(current + seconds, true);
    } catch (e) { }
    return;
  }

  const audioEl = el('#modalPlayer audio');
  if (audioEl) {
    audioEl.currentTime = Math.min(audioEl.duration, audioEl.currentTime + seconds);
  }
}

// Seek backward by seconds
function seekBackward(seconds) {
  if (ytPlayer && typeof ytPlayer.getCurrentTime === 'function') {
    try {
      const current = ytPlayer.getCurrentTime();
      ytPlayer.seekTo(Math.max(0, current - seconds), true);
    } catch (e) { }
    return;
  }

  const audioEl = el('#modalPlayer audio');
  if (audioEl) {
    audioEl.currentTime = Math.max(0, audioEl.currentTime - seconds);
  }
}

// Toggle queue panel visibility
function toggleQueuePanel() {
  const queueCard = el('#queueList').closest('.card');
  if (queueCard) {
    queueCard.style.display = queueCard.style.display === 'none' ? 'block' : 'none';
  }
}

// ========== VOLUME CONTROL ==========
let currentVolume = 1.0;
let isMuted = false;
let previousVolume = 1.0;

function adjustVolume(delta) {
  currentVolume = Math.max(0, Math.min(1, currentVolume + delta));
  applyVolume(currentVolume);
  updateVolumeUI();
}

function setVolume(value) {
  currentVolume = Math.max(0, Math.min(1, value));
  applyVolume(currentVolume);
  updateVolumeUI();
}

function applyVolume(volume) {
  // Apply to YouTube player
  if (ytPlayer && typeof ytPlayer.setVolume === 'function') {
    try {
      ytPlayer.setVolume(volume * 100);
    } catch (e) { }
  }

  // Apply to audio element
  const audioEl = el('#modalPlayer audio');
  if (audioEl) {
    audioEl.volume = volume;
  }

  // Apply to Web Audio API
  if (currentNodes && currentNodes.outGain) {
    currentNodes.outGain.gain.value = volume;
  }
}

function toggleMute() {
  if (isMuted) {
    // Unmute
    isMuted = false;
    currentVolume = previousVolume;
    applyVolume(currentVolume);
  } else {
    // Mute
    isMuted = true;
    previousVolume = currentVolume;
    currentVolume = 0;
    applyVolume(0);
  }
  updateVolumeUI();
}

function updateVolumeUI() {
  const volumeSlider = el('#volumeSlider');
  const volumeIcon = el('#volumeIcon');
  const volumeVal = el('#volumeVal');

  if (volumeSlider) {
    volumeSlider.value = currentVolume;
  }

  if (volumeIcon) {
    if (isMuted || currentVolume === 0) {
      volumeIcon.innerHTML = '🔇';
    } else if (currentVolume < 0.5) {
      volumeIcon.innerHTML = '🔉';
    } else {
      volumeIcon.innerHTML = '🔊';
    }
  }

  if (volumeVal) {
    volumeVal.textContent = Math.round(currentVolume * 100) + '%';
  }
}

function initVolumeControl() {
  const volumeSlider = el('#volumeSlider');
  const volumeIcon = el('#volumeIcon');

  if (volumeSlider) {
    volumeSlider.value = currentVolume;
    volumeSlider.oninput = (e) => {
      setVolume(Number(e.target.value));
      isMuted = false;
    };
  }

  if (volumeIcon) {
    volumeIcon.onclick = toggleMute;
    volumeIcon.style.cursor = 'pointer';
  }

  updateVolumeUI();
}

// ========== SHARE SONG FEATURE ==========
function shareSong(songId) {
  const song = DATA.songs.find(s => s.id === songId);
  if (!song) return;

  const artist = DATA.artists.find(a => a.id === song.artist);
  const baseUrl = window.location.origin + window.location.pathname;
  const shareUrl = `${baseUrl}?play=${songId}`;
  const shareText = `🎵 Listen to "${song.title}" by ${artist?.name || 'Unknown'} on SwarSmriti!`;

  showShareModal(song, shareUrl, shareText);
}

function showShareModal(song, shareUrl, shareText) {
  // Create share modal if it doesn't exist
  let shareModal = el('#shareModal');
  if (!shareModal) {
    shareModal = document.createElement('div');
    shareModal.id = 'shareModal';
    shareModal.className = 'modal';
    shareModal.style.display = 'none';
    document.body.appendChild(shareModal);
  }

  const artist = DATA.artists.find(a => a.id === song.artist);

  shareModal.innerHTML = `
    <div class="player card" style="max-width:450px">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <strong style="font-size:18px">📤 Share Song</strong>
        <div class="close" id="closeShareModal">✕</div>
      </div>
      <div style="margin-top:20px">
        <div style="display:flex;gap:12px;align-items:center;margin-bottom:16px;padding:12px;background:rgba(255,255,255,0.05);border-radius:8px">
          <span style="font-size:32px">🎵</span>
          <div>
            <div style="font-weight:600">${song.title}</div>
            <div class="muted small">${artist?.name || 'Unknown'} • ${song.year}</div>
          </div>
        </div>
        
        <div style="margin-bottom:16px">
          <label class="muted small" style="display:block;margin-bottom:6px">Share Link</label>
          <div style="display:flex;gap:8px">
            <input type="text" id="shareUrlInput" class="search" value="${shareUrl}" readonly style="flex:1;min-width:auto">
            <button class="chip" id="copyLinkBtn">📋 Copy</button>
          </div>
        </div>
        
        <div style="margin-bottom:12px">
          <label class="muted small" style="display:block;margin-bottom:8px">Share On</label>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <button class="pill share-btn" data-platform="whatsapp" style="background:#25D366;border:none">
              📱 WhatsApp
            </button>
            <button class="pill share-btn" data-platform="twitter" style="background:#1DA1F2;border:none">
              🐦 Twitter
            </button>
            <button class="pill share-btn" data-platform="facebook" style="background:#1877F2;border:none">
              📘 Facebook
            </button>
            <button class="pill share-btn" data-platform="telegram" style="background:#0088cc;border:none">
              ✈️ Telegram
            </button>
          </div>
        </div>
        
        ${song.youtubeId ? `
        <div style="margin-top:16px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.1)">
          <a href="https://youtube.com/watch?v=${song.youtubeId}" target="_blank" class="pill" style="display:inline-flex;gap:6px;text-decoration:none;background:#FF0000;border:none">
            ▶️ Open on YouTube
          </a>
        </div>
        ` : ''}
      </div>
    </div>
  `;

  shareModal.style.display = 'grid';

  // Close button
  el('#closeShareModal').onclick = () => {
    shareModal.style.display = 'none';
  };

  // Click outside to close
  shareModal.onclick = (e) => {
    if (e.target === shareModal) {
      shareModal.style.display = 'none';
    }
  };

  // Copy link button
  el('#copyLinkBtn').onclick = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      el('#copyLinkBtn').innerHTML = '✅ Copied!';
      setTimeout(() => {
        el('#copyLinkBtn').innerHTML = '📋 Copy';
      }, 2000);
    } catch (e) {
      // Fallback for older browsers
      const input = el('#shareUrlInput');
      input.select();
      document.execCommand('copy');
      el('#copyLinkBtn').innerHTML = '✅ Copied!';
      setTimeout(() => {
        el('#copyLinkBtn').innerHTML = '📋 Copy';
      }, 2000);
    }
  };

  // Social share buttons
  els('.share-btn').forEach(btn => {
    btn.onclick = () => {
      const platform = btn.dataset.platform;
      openSocialShare(platform, shareUrl, shareText);
    };
  });
}

function openSocialShare(platform, url, text) {
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);

  const shareUrls = {
    whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`
  };

  if (shareUrls[platform]) {
    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  }
}

// Share current song (for modal)
function shareCurrentSong() {
  if (state.currentQueue.length > 0 && state.currentIndex >= 0) {
    shareSong(state.currentQueue[state.currentIndex]);
  }
}

// ========== MINI PLAYER BAR ==========
let miniPlayerVisible = false;

function createMiniPlayer() {
  if (el('#miniPlayer')) return; // Already exists

  const miniPlayer = document.createElement('div');
  miniPlayer.id = 'miniPlayer';
  miniPlayer.className = 'mini-player';
  miniPlayer.innerHTML = `
    <div class="mini-player-content">
      <div class="mini-player-info">
        <div class="mini-thumb">🎵</div>
        <div class="mini-details">
          <div class="mini-title">No song playing</div>
          <div class="mini-artist muted small">-</div>
        </div>
      </div>
      
      <div class="mini-controls">
        <button class="mini-btn" id="miniPrev" title="Previous (←)">⏮️</button>
        <button class="mini-btn mini-play" id="miniPlayPause" title="Play/Pause (Space)">▶️</button>
        <button class="mini-btn" id="miniNext" title="Next (→)">⏭️</button>
      </div>
      
      <div class="mini-progress">
        <div class="mini-progress-bar">
          <div class="mini-progress-fill"></div>
        </div>
      </div>
      
      <div class="mini-actions">
        <button class="mini-btn" id="miniShare" title="Share">📤</button>
        <button class="mini-btn" id="miniExpand" title="Expand Player">🔼</button>
      </div>
    </div>
  `;

  document.body.appendChild(miniPlayer);

  // Event listeners
  el('#miniPrev').onclick = playPrevSong;
  el('#miniNext').onclick = playNextSong;
  el('#miniPlayPause').onclick = togglePlayPause;
  el('#miniShare').onclick = shareCurrentSong;
  el('#miniExpand').onclick = () => {
    if (state.currentQueue.length > 0 && state.currentIndex >= 0) {
      openSong(state.currentQueue[state.currentIndex]);
    }
  };

  // Click on song info to expand
  el('.mini-player-info').onclick = () => {
    if (state.currentQueue.length > 0 && state.currentIndex >= 0) {
      openSong(state.currentQueue[state.currentIndex]);
    }
  };
}

function showMiniPlayer() {
  const miniPlayer = el('#miniPlayer');
  if (miniPlayer) {
    miniPlayer.classList.add('visible');
    miniPlayerVisible = true;
  }
}

function hideMiniPlayer() {
  const miniPlayer = el('#miniPlayer');
  if (miniPlayer) {
    miniPlayer.classList.remove('visible');
    miniPlayerVisible = false;
  }
}

function updateMiniPlayer(song) {
  if (!song) return;

  const artist = DATA.artists.find(a => a.id === song.artist);

  const titleEl = el('.mini-title');
  const artistEl = el('.mini-artist');

  if (titleEl) titleEl.textContent = song.title;
  if (artistEl) artistEl.textContent = artist?.name || 'Unknown';
}

function updateMiniPlayerProgress() {
  const progressFill = el('.mini-progress-fill');
  if (!progressFill) return;

  let currentTime = 0;
  let duration = 0;

  if (ytPlayer && typeof ytPlayer.getCurrentTime === 'function') {
    try {
      currentTime = ytPlayer.getCurrentTime() || 0;
      duration = ytPlayer.getDuration() || 0;
    } catch (e) { }
  }

  const audioEl = el('#modalPlayer audio');
  if (audioEl) {
    currentTime = audioEl.currentTime || 0;
    duration = audioEl.duration || 0;
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  progressFill.style.width = progress + '%';
}

function updateMiniPlayerPlayState(isPlaying) {
  const playBtn = el('#miniPlayPause');
  if (playBtn) {
    playBtn.innerHTML = isPlaying ? '⏸️' : '▶️';
  }
}

// Start mini player progress updates
let miniPlayerProgressInterval = null;

function startMiniPlayerUpdates() {
  if (miniPlayerProgressInterval) clearInterval(miniPlayerProgressInterval);
  miniPlayerProgressInterval = setInterval(updateMiniPlayerProgress, 500);
}

function stopMiniPlayerUpdates() {
  if (miniPlayerProgressInterval) {
    clearInterval(miniPlayerProgressInterval);
    miniPlayerProgressInterval = null;
  }
}

// ========== SAVE QUEUE AS PLAYLIST ==========
function saveQueueAsPlaylist() {
  if (state.currentQueue.length === 0) {
    alert('Queue is empty! Add some songs first.');
    return;
  }

  const name = prompt('Enter playlist name:', `Queue Playlist ${new Date().toLocaleDateString()}`);
  if (!name || name.trim() === '') return;

  const playlist = {
    id: 'pl_' + Date.now(),
    name: name.trim(),
    songs: [...state.currentQueue],
    createdAt: Date.now()
  };

  state.playlists.push(playlist);
  savePlaylists();
  renderPlaylists();

  // Show confirmation
  const queueHeader = el('#queueList').parentElement.querySelector('strong');
  if (queueHeader) {
    const originalText = queueHeader.innerHTML;
    queueHeader.innerHTML = '✅ Saved!';
    setTimeout(() => {
      queueHeader.innerHTML = originalText;
    }, 2000);
  }
}

// ========== URL PARAMETER HANDLING ==========
function handleUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const playSongId = params.get('play');

  if (playSongId) {
    const song = DATA.songs.find(s => s.id === playSongId);
    if (song) {
      // Small delay to ensure everything is initialized
      setTimeout(() => {
        openSong(playSongId);
      }, 500);
    }
  }
}

// ========== KEYBOARD SHORTCUTS HELP ==========
function showKeyboardShortcuts() {
  let shortcutsModal = el('#shortcutsModal');
  if (!shortcutsModal) {
    shortcutsModal = document.createElement('div');
    shortcutsModal.id = 'shortcutsModal';
    shortcutsModal.className = 'modal';
    document.body.appendChild(shortcutsModal);
  }

  shortcutsModal.innerHTML = `
    <div class="player card" style="max-width:400px">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <strong style="font-size:18px">⌨️ Keyboard Shortcuts</strong>
        <div class="close" id="closeShortcutsModal">✕</div>
      </div>
      <div style="margin-top:20px">
        <div class="shortcut-list">
          <div class="shortcut-item">
            <span class="key">Space</span>
            <span>Play / Pause</span>
          </div>
          <div class="shortcut-item">
            <span class="key">←</span>
            <span>Previous Song</span>
          </div>
          <div class="shortcut-item">
            <span class="key">→</span>
            <span>Next Song</span>
          </div>
          <div class="shortcut-item">
            <span class="key">Shift + ←</span>
            <span>Seek Back 10s</span>
          </div>
          <div class="shortcut-item">
            <span class="key">Shift + →</span>
            <span>Seek Forward 10s</span>
          </div>
          <div class="shortcut-item">
            <span class="key">↑</span>
            <span>Volume Up</span>
          </div>
          <div class="shortcut-item">
            <span class="key">↓</span>
            <span>Volume Down</span>
          </div>
          <div class="shortcut-item">
            <span class="key">M</span>
            <span>Mute / Unmute</span>
          </div>
          <div class="shortcut-item">
            <span class="key">S</span>
            <span>Toggle Shuffle</span>
          </div>
          <div class="shortcut-item">
            <span class="key">R</span>
            <span>Toggle Repeat</span>
          </div>
          <div class="shortcut-item">
            <span class="key">Esc</span>
            <span>Close Modal</span>
          </div>
        </div>
      </div>
    </div>
  `;

  shortcutsModal.style.display = 'grid';

  el('#closeShortcutsModal').onclick = () => {
    shortcutsModal.style.display = 'none';
  };

  shortcutsModal.onclick = (e) => {
    if (e.target === shortcutsModal) {
      shortcutsModal.style.display = 'none';
    }
  };
}

// ========== INITIALIZE DAY 3 FEATURES ==========
function initDay3Features() {
  // Create mini player
  createMiniPlayer();

  // Initialize keyboard shortcuts
  initKeyboardShortcuts();

  // Initialize volume control
  initVolumeControl();

  // Handle URL parameters
  handleUrlParams();

  // Add save queue button
  const clearQueueBtn = el('#clearQueue');
  if (clearQueueBtn && !el('#saveQueueBtn')) {
    const saveBtn = document.createElement('button');
    saveBtn.id = 'saveQueueBtn';
    saveBtn.className = 'badge';
    saveBtn.style.cursor = 'pointer';
    saveBtn.innerHTML = '💾 Save';
    saveBtn.title = 'Save queue as playlist';
    saveBtn.onclick = saveQueueAsPlaylist;
    clearQueueBtn.parentElement.insertBefore(saveBtn, clearQueueBtn);
  }
}

// Update DOMContentLoaded to initialize Day 3 features
document.addEventListener('DOMContentLoaded', () => {
  // Wait for main initialization to complete
  setTimeout(initDay3Features, 100);
});

// Update openSong to manage mini player
const originalOpenSong = openSong;
window.openSong = function (id) {
  originalOpenSong(id);

  // Update mini player
  const song = DATA.songs.find(s => s.id === id);
  if (song) {
    updateMiniPlayer(song);
    updateMiniPlayerPlayState(true);
    startMiniPlayerUpdates();
  }
};

// Update modal close to show mini player
const originalCloseModal = el('#closeModal')?.onclick;
document.addEventListener('DOMContentLoaded', () => {
  const closeModal = el('#closeModal');
  if (closeModal) {
    closeModal.onclick = () => {
      el('#modal').style.display = 'none';

      // Show mini player if song was playing
      if (state.currentQueue.length > 0 && state.currentIndex >= 0) {
        showMiniPlayer();
      }

      // Keep YouTube player running in background or pause
      if (ytPlayer) {
        // Pause for now - can be changed to keep playing
        try { ytPlayer.pauseVideo(); } catch (e) { }
      }

      const audioEl = el('#modalPlayer audio');
      if (audioEl) {
        audioEl.pause();
      }

      cleanupAudioGraph();
      stopProgressUpdates();
      stopVisualizer();
    };
  }
});

// Make share function globally available
window.shareSong = shareSong;
window.showKeyboardShortcuts = showKeyboardShortcuts;

// ========== DAY 4 FEATURES ==========

// ========== SONG DETAILS MODAL ==========
function showSongDetails() {
  if (state.currentQueue.length === 0 || state.currentIndex < 0) return;

  const songId = state.currentQueue[state.currentIndex];
  const song = DATA.songs.find(s => s.id === songId);
  if (!song) return;

  const artist = DATA.artists.find(a => a.id === song.artist);
  const playCount = state.playCounts[songId] || 0;
  const isFavorite = state.favorites.includes(songId);

  const modal = el('#songDetailsModal');
  const content = el('#songDetailsContent');

  if (!modal || !content) return;

  // Get mood labels
  const moodLabels = song.moods.map(moodId => {
    const mood = DATA.moods.find(m => m.id === moodId);
    return mood ? `${mood.emoji} ${mood.label}` : moodId;
  }).join(', ');

  // Calculate estimated duration
  const estimatedDuration = song.bpm ? Math.round(60000 / song.bpm * 4) : 'N/A';

  content.innerHTML = `
    <div class="song-details-header" style="display:flex;gap:20px;align-items:flex-start;margin-bottom:24px">
      <div class="song-details-thumb" style="width:120px;height:120px;border-radius:16px;background:var(--gradient-accent);display:grid;place-items:center;font-size:48px;flex-shrink:0">
        ${artist?.image || '🎵'}
      </div>
      <div style="flex:1">
        <h3 style="margin:0 0 8px 0;font-size:24px">${song.title}</h3>
        <div class="muted" style="margin-bottom:12px">${artist?.name || 'Unknown Artist'}</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${isFavorite ? '<span class="badge" style="background:rgba(139,41,66,0.3);color:#FF6B8A">❤️ Favorited</span>' : ''}
          <span class="badge">🎧 ${playCount} plays</span>
        </div>
      </div>
    </div>

    <div class="song-details-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">
      <div class="detail-item" style="padding:16px;background:var(--bg-card);border-radius:12px">
        <div class="muted small" style="margin-bottom:4px">Album</div>
        <div style="font-weight:600">📀 ${song.album || 'Single'}</div>
      </div>
      <div class="detail-item" style="padding:16px;background:var(--bg-card);border-radius:12px">
        <div class="muted small" style="margin-bottom:4px">Year</div>
        <div style="font-weight:600">📅 ${song.year}</div>
      </div>
      <div class="detail-item" style="padding:16px;background:var(--bg-card);border-radius:12px">
        <div class="muted small" style="margin-bottom:4px">Tempo</div>
        <div style="font-weight:600">⏱️ ${song.tempo} (${song.bpm} BPM)</div>
      </div>
      <div class="detail-item" style="padding:16px;background:var(--bg-card);border-radius:12px">
        <div class="muted small" style="margin-bottom:4px">Moods</div>
        <div style="font-weight:600">${moodLabels}</div>
      </div>
    </div>

    <div class="detail-item" style="padding:16px;background:var(--bg-card);border-radius:12px;margin-bottom:20px">
      <div class="muted small" style="margin-bottom:8px">Artist Info</div>
      <div style="display:flex;gap:12px;align-items:center">
        <span style="font-size:32px">${artist?.image || '🎤'}</span>
        <div>
          <div style="font-weight:600">${artist?.name || 'Unknown'}</div>
          <div class="muted small">${artist?.era || ''} • ${artist?.region || ''}</div>
          <div class="small" style="margin-top:4px">${artist?.bio || ''}</div>
        </div>
      </div>
    </div>

    ${artist?.genres ? `
    <div class="detail-item" style="padding:16px;background:var(--bg-card);border-radius:12px;margin-bottom:20px">
      <div class="muted small" style="margin-bottom:8px">Genres</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${artist.genres.map(g => `<span class="badge">${g}</span>`).join('')}
      </div>
    </div>
    ` : ''}

    <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">
      <button class="chip" onclick="shareSong('${songId}')">📤 Share Song</button>
      <button class="chip" onclick="showLyricsModal('${songId}')">📜 View Lyrics</button>
      ${song.youtubeId ? `
      <a href="https://youtube.com/watch?v=${song.youtubeId}" target="_blank" class="chip" style="text-decoration:none">▶️ YouTube</a>
      ` : ''}
    </div>
  `;

  modal.style.display = 'grid';

  // Close button handler
  el('#closeSongDetailsModal').onclick = () => {
    modal.style.display = 'none';
  };

  // Click outside to close
  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  };
}

// ========== SLEEP TIMER ==========
let sleepTimerInterval = null;
let sleepTimerEndTime = null;

function showSleepTimer() {
  const modal = el('#sleepTimerModal');
  if (modal) {
    modal.style.display = 'grid';
    updateSleepTimerStatus();
  }

  // Close button handler
  el('#closeSleepTimerModal').onclick = () => {
    modal.style.display = 'none';
  };

  // Click outside to close
  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  };
}

function setSleepTimer(minutes) {
  // Cancel existing timer
  if (sleepTimerInterval) {
    clearInterval(sleepTimerInterval);
    sleepTimerInterval = null;
  }

  if (minutes === 0) {
    cancelSleepTimer();
    return;
  }

  sleepTimerEndTime = Date.now() + (minutes * 60 * 1000);
  state.sleepTimer = sleepTimerEndTime;

  // Update status display
  updateSleepTimerStatus();

  // Start countdown interval
  sleepTimerInterval = setInterval(() => {
    const remaining = sleepTimerEndTime - Date.now();

    if (remaining <= 0) {
      // Timer expired - stop playback
      stopPlayback();
      cancelSleepTimer();
      showSleepTimerNotification();
    } else {
      updateSleepTimerStatus();
    }
  }, 1000);

  // Highlight selected option
  els('.timer-option').forEach(btn => {
    btn.classList.remove('active');
    if (parseInt(btn.dataset.minutes) === minutes) {
      btn.classList.add('active');
    }
  });

  // Update sleep timer button in modal
  updateSleepTimerButton();
}

function cancelSleepTimer() {
  if (sleepTimerInterval) {
    clearInterval(sleepTimerInterval);
    sleepTimerInterval = null;
  }
  sleepTimerEndTime = null;
  state.sleepTimer = null;

  const statusEl = el('#sleepTimerStatus');
  if (statusEl) {
    statusEl.innerHTML = 'Timer not set';
  }

  // Remove active class from all options
  els('.timer-option').forEach(btn => {
    btn.classList.remove('active');
  });

  updateSleepTimerButton();
}

function updateSleepTimerStatus() {
  const statusEl = el('#sleepTimerStatus');
  if (!statusEl) return;

  if (!sleepTimerEndTime) {
    statusEl.innerHTML = 'Timer not set';
    return;
  }

  const remaining = sleepTimerEndTime - Date.now();
  if (remaining <= 0) {
    statusEl.innerHTML = 'Timer expired';
    return;
  }

  const totalSeconds = Math.ceil(remaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  statusEl.innerHTML = `
    <div style="font-size:32px;font-weight:600;color:var(--accent-gold)">${minutes}:${seconds.toString().padStart(2, '0')}</div>
    <div class="muted small" style="margin-top:8px">⏰ Music will pause automatically</div>
  `;
}

function updateSleepTimerButton() {
  const btn = el('#sleepTimerBtn');
  if (!btn) return;

  if (sleepTimerEndTime) {
    const remaining = sleepTimerEndTime - Date.now();
    const minutes = Math.ceil(remaining / 60000);
    btn.innerHTML = `⏰ ${minutes}m`;
    btn.style.background = 'rgba(212, 168, 75, 0.3)';
  } else {
    btn.innerHTML = '⏰ Timer';
    btn.style.background = '';
  }
}

function stopPlayback() {
  // Stop YouTube player
  if (ytPlayer && typeof ytPlayer.pauseVideo === 'function') {
    try {
      ytPlayer.pauseVideo();
    } catch (e) { }
  }

  // Stop audio element
  const audioEl = el('#modalPlayer audio');
  if (audioEl) {
    audioEl.pause();
  }

  // Update mini player state
  updateMiniPlayerPlayState(false);
}

function showSleepTimerNotification() {
  // Create a notification toast
  let toast = el('#sleepToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'sleepToast';
    toast.className = 'sleep-toast';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <span>😴</span>
    <span>Sleep timer ended. Music paused.</span>
  `;
  toast.classList.add('visible');

  setTimeout(() => {
    toast.classList.remove('visible');
  }, 4000);
}

// ========== LYRICS DISPLAY ==========
// Note: Lyrics are not stored locally to respect copyright.
// The modal provides links to search for lyrics online.
const LYRICS_DATABASE = {
  // Lyrics are fetched dynamically or user is directed to search online
};

function showLyricsModal(songId) {
  const song = DATA.songs.find(s => s.id === songId);
  if (!song) return;

  const artist = DATA.artists.find(a => a.id === song.artist);

  // Create lyrics modal if not exists
  let lyricsModal = el('#lyricsModal');
  if (!lyricsModal) {
    lyricsModal = document.createElement('div');
    lyricsModal.id = 'lyricsModal';
    lyricsModal.className = 'modal';
    document.body.appendChild(lyricsModal);
  }

  const lyricsData = LYRICS_DATABASE[songId];
  const hasLyrics = !!lyricsData;

  lyricsModal.innerHTML = `
    <div class="player card lyrics-modal-content" style="max-width:550px;max-height:80vh;overflow:hidden;display:flex;flex-direction:column">
      <div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:16px;border-bottom:1px solid var(--glass-border)">
        <div>
          <strong style="font-size:18px">📜 Lyrics</strong>
          <div class="muted small">${song.title} - ${artist?.name || 'Unknown'}</div>
        </div>
        <div class="close" id="closeLyricsModal">✕</div>
      </div>
      <div class="lyrics-content" style="flex:1;overflow-y:auto;padding:20px 0">
        ${hasLyrics ? `
          <pre style="font-family:inherit;white-space:pre-wrap;word-wrap:break-word;line-height:1.8;font-size:15px;margin:0">${lyricsData.lyrics}</pre>
        ` : `
          <div style="text-align:center;padding:40px 20px">
            <div style="font-size:48px;margin-bottom:16px">📝</div>
            <div style="font-size:18px;font-weight:600;margin-bottom:8px">Lyrics Not Available</div>
            <div class="muted">We don't have lyrics for this song yet.</div>
            <div class="muted small" style="margin-top:16px">
              Try searching online for "${song.title}" lyrics
            </div>
            <a href="https://www.google.com/search?q=${encodeURIComponent(song.title + ' ' + (artist?.name || '') + ' lyrics')}" 
               target="_blank" 
               class="chip" 
               style="margin-top:20px;display:inline-block;text-decoration:none">
              🔍 Search Lyrics
            </a>
          </div>
        `}
      </div>
    </div>
  `;

  lyricsModal.style.display = 'grid';

  // Close button handler
  el('#closeLyricsModal').onclick = () => {
    lyricsModal.style.display = 'none';
  };

  // Click outside to close
  lyricsModal.onclick = (e) => {
    if (e.target === lyricsModal) {
      lyricsModal.style.display = 'none';
    }
  };
}

// ========== GENRE & ERA FILTERING ==========
function initGenreFilters() {
  const genreContainer = el('#genreFilters');
  const eraContainer = el('#eraFilters');

  if (!genreContainer || !eraContainer) return;

  // Get unique genres from all artists
  const allGenres = new Set();
  DATA.artists.forEach(artist => {
    if (artist.genres) {
      artist.genres.forEach(genre => allGenres.add(genre));
    }
  });

  // Define eras
  const eras = [
    { id: '1950s', label: '1950s', range: [1950, 1959] },
    { id: '1960s', label: '1960s', range: [1960, 1969] },
    { id: '1970s', label: '1970s', range: [1970, 1979] },
    { id: '1980s', label: '1980s', range: [1980, 1989] },
    { id: '1990s', label: '1990s', range: [1990, 1999] },
    { id: '2000s', label: '2000s+', range: [2000, 2030] }
  ];

  // Render genre chips
  genreContainer.innerHTML = `
    <button class="chip genre-filter ${state.selectedGenre === null ? 'active' : ''}" data-genre="all">All</button>
    ${Array.from(allGenres).map(genre => `
      <button class="chip genre-filter ${state.selectedGenre === genre ? 'active' : ''}" data-genre="${genre}">${genre}</button>
    `).join('')}
  `;

  // Render era chips
  eraContainer.innerHTML = `
    <button class="chip era-filter ${state.selectedEra === null ? 'active' : ''}" data-era="all">All</button>
    ${eras.map(era => `
      <button class="chip era-filter ${state.selectedEra === era.id ? 'active' : ''}" data-era="${era.id}">${era.label}</button>
    `).join('')}
  `;

  // Genre filter click handlers
  els('.genre-filter').forEach(btn => {
    btn.onclick = () => {
      const genre = btn.dataset.genre;
      state.selectedGenre = genre === 'all' ? null : genre;

      // Update active states
      els('.genre-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      applyFilters();
    };
  });

  // Era filter click handlers
  els('.era-filter').forEach(btn => {
    btn.onclick = () => {
      const era = btn.dataset.era;
      state.selectedEra = era === 'all' ? null : era;

      // Update active states
      els('.era-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      applyFilters();
    };
  });
}

function applyFilters() {
  let filteredSongs = [...DATA.songs];

  // Apply genre filter
  if (state.selectedGenre) {
    const artistsInGenre = DATA.artists
      .filter(a => a.genres && a.genres.includes(state.selectedGenre))
      .map(a => a.id);

    filteredSongs = filteredSongs.filter(s => artistsInGenre.includes(s.artist));
  }

  // Apply era filter
  if (state.selectedEra) {
    const eraRanges = {
      '1950s': [1950, 1959],
      '1960s': [1960, 1969],
      '1970s': [1970, 1979],
      '1980s': [1980, 1989],
      '1990s': [1990, 1999],
      '2000s': [2000, 2030]
    };

    const range = eraRanges[state.selectedEra];
    if (range) {
      filteredSongs = filteredSongs.filter(s => s.year >= range[0] && s.year <= range[1]);
    }
  }

  // Apply mood filter if selected
  if (state.selectedMood) {
    filteredSongs = filteredSongs.filter(s => s.moods && s.moods.includes(state.selectedMood));
  }

  // Re-render songs with filters
  renderSongs(filteredSongs);

  // Update results count
  const resultsCount = el('#resultsCount');
  if (resultsCount) {
    resultsCount.textContent = filteredSongs.length;
  }

  // Update title
  const listTitle = el('#listTitle');
  if (listTitle) {
    const genreText = state.selectedGenre ? ` • ${state.selectedGenre}` : '';
    const eraText = state.selectedEra ? ` • ${state.selectedEra}` : '';
    listTitle.innerHTML = `🎶 Songs${genreText}${eraText}`;
  }
}

// ========== MOST PLAYED SECTION ==========
function renderMostPlayed() {
  const container = el('#mostPlayedList');
  if (!container) return;

  // Get songs sorted by play count
  const songCounts = Object.entries(state.playCounts)
    .map(([songId, count]) => ({ songId, count }))
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5

  if (songCounts.length === 0) {
    container.innerHTML = '<span class="muted small">No plays yet</span>';
    return;
  }

  container.innerHTML = songCounts.map((item, index) => {
    const song = DATA.songs.find(s => s.id === item.songId);
    if (!song) return '';

    const artist = DATA.artists.find(a => a.id === song.artist);

    return `
      <div class="most-played-item" onclick="openSong('${item.songId}')" style="display:flex;align-items:center;gap:12px;padding:10px;margin-bottom:8px;border-radius:10px;background:var(--gradient-card);cursor:pointer;transition:all 0.3s ease">
        <span style="font-size:16px;font-weight:700;color:var(--accent-gold);width:20px">${index + 1}</span>
        <div style="flex:1;min-width:0">
          <div style="font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${song.title}</div>
          <div class="muted small">${artist?.name || 'Unknown'}</div>
        </div>
        <span class="badge">${item.count} plays</span>
      </div>
    `;
  }).join('');
}

// Clear play counts
function clearPlayCounts() {
  state.playCounts = {};
  localStorage.setItem('ss_playCounts', '{}');
  renderMostPlayed();
}

// ========== LISTENING STATISTICS ==========
function showStatistics() {
  const modal = el('#statsModal');
  const content = el('#statsContent');

  if (!modal || !content) return;

  // Calculate statistics
  const totalPlays = Object.values(state.playCounts).reduce((sum, count) => sum + count, 0);
  const uniqueSongsPlayed = Object.keys(state.playCounts).length;
  const favoriteCount = state.favorites.length;
  const playlistCount = state.playlists.length;
  const recentlyPlayedCount = state.recentlyPlayed ? state.recentlyPlayed.length : 0;

  // Most played artist
  const artistPlayCounts = {};
  Object.entries(state.playCounts).forEach(([songId, count]) => {
    const song = DATA.songs.find(s => s.id === songId);
    if (song) {
      artistPlayCounts[song.artist] = (artistPlayCounts[song.artist] || 0) + count;
    }
  });

  const topArtistId = Object.entries(artistPlayCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0];
  const topArtist = DATA.artists.find(a => a.id === topArtistId);

  // Most played mood
  const moodPlayCounts = {};
  Object.entries(state.playCounts).forEach(([songId, count]) => {
    const song = DATA.songs.find(s => s.id === songId);
    if (song && song.moods) {
      song.moods.forEach(mood => {
        moodPlayCounts[mood] = (moodPlayCounts[mood] || 0) + count;
      });
    }
  });

  const topMoodId = Object.entries(moodPlayCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0];
  const topMood = DATA.moods.find(m => m.id === topMoodId);

  content.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(2, 1fr);gap:16px;margin-bottom:24px">
      <div class="stat-card" style="padding:20px;background:var(--bg-card);border-radius:16px;text-align:center">
        <div style="font-size:36px;font-weight:700;color:var(--accent-gold)">${totalPlays}</div>
        <div class="muted small">Total Plays</div>
      </div>
      <div class="stat-card" style="padding:20px;background:var(--bg-card);border-radius:16px;text-align:center">
        <div style="font-size:36px;font-weight:700;color:var(--accent-gold)">${uniqueSongsPlayed}</div>
        <div class="muted small">Unique Songs</div>
      </div>
      <div class="stat-card" style="padding:20px;background:var(--bg-card);border-radius:16px;text-align:center">
        <div style="font-size:36px;font-weight:700;color:var(--accent-burgundy)">${favoriteCount}</div>
        <div class="muted small">Favorites</div>
      </div>
      <div class="stat-card" style="padding:20px;background:var(--bg-card);border-radius:16px;text-align:center">
        <div style="font-size:36px;font-weight:700;color:var(--accent-teal)">${playlistCount}</div>
        <div class="muted small">Playlists</div>
      </div>
    </div>

    ${topArtist ? `
    <div style="padding:16px;background:var(--bg-card);border-radius:12px;margin-bottom:16px">
      <div class="muted small" style="margin-bottom:8px">📊 Top Artist</div>
      <div style="display:flex;align-items:center;gap:12px">
        <span style="font-size:32px">${topArtist.image || '🎤'}</span>
        <div>
          <div style="font-weight:600">${topArtist.name}</div>
          <div class="muted small">${artistPlayCounts[topArtistId]} plays</div>
        </div>
      </div>
    </div>
    ` : ''}

    ${topMood ? `
    <div style="padding:16px;background:var(--bg-card);border-radius:12px;margin-bottom:16px">
      <div class="muted small" style="margin-bottom:8px">🎭 Favorite Mood</div>
      <div style="display:flex;align-items:center;gap:12px">
        <span style="font-size:32px">${topMood.emoji}</span>
        <div>
          <div style="font-weight:600">${topMood.label}</div>
          <div class="muted small">${moodPlayCounts[topMoodId]} plays</div>
        </div>
      </div>
    </div>
    ` : ''}

    <div style="padding:16px;background:var(--bg-card);border-radius:12px">
      <div class="muted small" style="margin-bottom:12px">📚 Library</div>
      <div style="display:grid;gap:8px">
        <div style="display:flex;justify-content:space-between">
          <span>Total Artists</span>
          <span style="font-weight:600">${DATA.artists.length}</span>
        </div>
        <div style="display:flex;justify-content:space-between">
          <span>Total Songs</span>
          <span style="font-weight:600">${DATA.songs.length}</span>
        </div>
        <div style="display:flex;justify-content:space-between">
          <span>Recently Played</span>
          <span style="font-weight:600">${recentlyPlayedCount}</span>
        </div>
      </div>
    </div>
  `;

  modal.style.display = 'grid';

  // Close button handler
  el('#closeStatsModal').onclick = () => {
    modal.style.display = 'none';
  };

  // Click outside to close
  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  };
}

// ========== EQUALIZER PRESETS ==========
const EQUALIZER_PRESETS = {
  normal: { bass: 0, treble: 0, reverb: 0, name: 'Normal' },
  rock: { bass: 4, treble: 3, reverb: 0.2, name: 'Rock' },
  pop: { bass: 2, treble: 4, reverb: 0.1, name: 'Pop' },
  classical: { bass: 0, treble: 2, reverb: 0.4, name: 'Classical' },
  jazz: { bass: 3, treble: 2, reverb: 0.3, name: 'Jazz' },
  bass: { bass: 8, treble: 0, reverb: 0.1, name: 'Bass Boost' }
};

function applyEqualizerPreset(presetName) {
  const preset = EQUALIZER_PRESETS[presetName];
  if (!preset) return;

  state.equalizerPreset = presetName;

  // Update sliders
  const bassEl = el('#bass');
  const trebleEl = el('#treble');
  const reverbEl = el('#reverb');

  if (bassEl) {
    bassEl.value = preset.bass;
    el('#bassVal').textContent = preset.bass + ' dB';
  }
  if (trebleEl) {
    trebleEl.value = preset.treble;
    el('#trebleVal').textContent = preset.treble + ' dB';
  }
  if (reverbEl) {
    reverbEl.value = preset.reverb;
    el('#reverbVal').textContent = Math.round(preset.reverb * 100) + '%';
  }

  // Apply to audio
  applyFilterValues({ bass: preset.bass, treble: preset.treble, reverb: preset.reverb });

  // Update active preset button
  els('.eq-preset').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.preset === presetName) {
      btn.classList.add('active');
    }
  });
}

// ========== INITIALIZE DAY 4 FEATURES ==========
function initDay4Features() {
  // Initialize genre and era filters
  initGenreFilters();

  // Render most played section
  renderMostPlayed();

  // Add clear play counts handler
  const clearPlayCountsBtn = el('#clearPlayCounts');
  if (clearPlayCountsBtn) {
    clearPlayCountsBtn.onclick = clearPlayCounts;
  }

  // Set default equalizer preset
  els('.eq-preset').forEach(btn => {
    if (btn.dataset.preset === 'normal') {
      btn.classList.add('active');
    }
  });
}

// Update DOMContentLoaded to initialize Day 4 features
document.addEventListener('DOMContentLoaded', () => {
  // Wait for main initialization to complete
  setTimeout(initDay4Features, 200);
});

// Make Day 4 functions globally available
window.showSongDetails = showSongDetails;
window.showSleepTimer = showSleepTimer;
window.setSleepTimer = setSleepTimer;
window.cancelSleepTimer = cancelSleepTimer;
window.showLyricsModal = showLyricsModal;
window.showStatistics = showStatistics;
window.applyEqualizerPreset = applyEqualizerPreset;

// ========== DAY 5 FEATURES ==========

// ========== TOAST NOTIFICATIONS ==========
function showToast(title, message, type = 'info', duration = 4000) {
  let container = el('#toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️'
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <span class="toast-close" onclick="this.parentElement.remove()">✕</span>
  `;

  container.appendChild(toast);

  // Auto remove after duration
  setTimeout(() => {
    toast.style.animation = 'slideInRight 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, duration);

  return toast;
}

// ========== EXPORT/IMPORT PLAYLISTS ==========
function exportPlaylists() {
  const exportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    playlists: state.playlists,
    favorites: state.favorites,
    ratings: state.songRatings,
    theme: state.theme,
    customTheme: state.customTheme
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `swarsmriti-backup-${new Date().toISOString().split('T')[0]}.json`;
  link.click();

  URL.revokeObjectURL(url);

  showToast('Export Successful', 'Your playlists and data have been exported.', 'success');
}

function importPlaylists() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';

  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);

        if (!data.version || !data.playlists) {
          throw new Error('Invalid backup file format');
        }

        // Merge playlists
        const existingNames = state.playlists.map(p => p.name);
        data.playlists.forEach(playlist => {
          if (!existingNames.includes(playlist.name)) {
            state.playlists.push(playlist);
          } else {
            // Optional: merge songs from imported playlist
            const existing = state.playlists.find(p => p.name === playlist.name);
            playlist.songs.forEach(songId => {
              if (!existing.songs.includes(songId)) {
                existing.songs.push(songId);
              }
            });
          }
        });

        // Merge favorites
        if (data.favorites) {
          data.favorites.forEach(songId => {
            if (!state.favorites.includes(songId)) {
              state.favorites.push(songId);
            }
          });
        }

        // Merge ratings
        if (data.ratings) {
          Object.assign(state.songRatings, data.ratings);
        }

        // Save to localStorage
        localStorage.setItem('ss_playlists', JSON.stringify(state.playlists));
        localStorage.setItem('ss_favs', JSON.stringify(state.favorites));
        localStorage.setItem('ss_ratings', JSON.stringify(state.songRatings));

        // Update UI
        renderPlaylists();
        updateFavCount();

        showToast('Import Successful', `Imported ${data.playlists.length} playlists.`, 'success');
      } catch (error) {
        console.error('Import error:', error);
        showToast('Import Failed', 'Could not read the backup file.', 'error');
      }
    };

    reader.readAsText(file);
  };

  input.click();
}

function showExportImportModal() {
  let modal = el('#exportImportModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'exportImportModal';
    modal.className = 'modal';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="player card" style="max-width:450px">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <strong style="font-size:18px">💾 Export / Import Data</strong>
        <div class="close" id="closeExportImportModal">✕</div>
      </div>
      <div style="margin-top:20px">
        <p class="muted small" style="margin-bottom:20px">
          Export your playlists, favorites, and ratings to a JSON file for backup. 
          Import to restore your data on another device.
        </p>
        
        <div style="display:flex;flex-direction:column;gap:12px">
          <button class="export-import-btn primary" onclick="exportPlaylists()">
            📤 Export All Data
          </button>
          <button class="export-import-btn" onclick="importPlaylists()">
            📥 Import from File
          </button>
        </div>
        
        <div style="margin-top:20px;padding:16px;background:var(--bg-card);border-radius:12px">
          <div class="small" style="font-weight:600;margin-bottom:8px">What's included:</div>
          <ul class="muted small" style="margin:0;padding-left:20px">
            <li>${state.playlists.length} playlists</li>
            <li>${state.favorites.length} favorited songs</li>
            <li>${Object.keys(state.songRatings).length} song ratings</li>
            <li>Theme preferences</li>
          </ul>
        </div>
      </div>
    </div>
  `;

  modal.style.display = 'grid';

  el('#closeExportImportModal').onclick = () => modal.style.display = 'none';
  modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
}

// ========== SONG RATINGS ==========
function rateSong(songId, rating) {
  state.songRatings[songId] = rating;
  localStorage.setItem('ss_ratings', JSON.stringify(state.songRatings));

  // Update UI if song details modal is open
  const ratingContainer = el(`#rating-${songId}`);
  if (ratingContainer) {
    ratingContainer.innerHTML = renderStarRating(songId, rating);
  }

  showToast('Rating Saved', `You rated this song ${rating} star${rating > 1 ? 's' : ''}.`, 'success', 2000);
}

function renderStarRating(songId, currentRating = 0) {
  const rating = currentRating || state.songRatings[songId] || 0;
  let html = '<div class="star-rating">';

  for (let i = 1; i <= 5; i++) {
    const filled = i <= rating ? 'filled' : '';
    html += `<span class="star ${filled}" onclick="rateSong('${songId}', ${i})" data-rating="${i}">★</span>`;
  }

  html += '</div>';
  return html;
}

function renderStarRatingDisplay(songId) {
  const rating = state.songRatings[songId] || 0;
  let html = '<span class="star-rating-display">';

  for (let i = 1; i <= 5; i++) {
    const className = i <= rating ? 'star' : 'star empty';
    html += `<span class="${className}">★</span>`;
  }

  html += '</span>';
  return html;
}

// ========== CUSTOM THEMES ==========
const PRESET_THEMES = {
  default: {
    name: 'Deep Teal (Default)',
    primary: '#0A1F1F',
    secondary: '#0D2B2B',
    accent: '#D4A84B',
    burgundy: '#8B2942'
  },
  midnight: {
    name: 'Midnight Blue',
    primary: '#0D1117',
    secondary: '#161B22',
    accent: '#58A6FF',
    burgundy: '#F85149'
  },
  sunset: {
    name: 'Sunset Warmth',
    primary: '#1A0F0F',
    secondary: '#2D1515',
    accent: '#FF6B35',
    burgundy: '#E63946'
  },
  forest: {
    name: 'Forest Grove',
    primary: '#0F1A14',
    secondary: '#1A2E22',
    accent: '#4ADE80',
    burgundy: '#7C3AED'
  },
  lavender: {
    name: 'Lavender Dreams',
    primary: '#1A1A2E',
    secondary: '#16213E',
    accent: '#A78BFA',
    burgundy: '#F472B6'
  },
  coffee: {
    name: 'Coffee Shop',
    primary: '#1C1410',
    secondary: '#2C221A',
    accent: '#C19A6B',
    burgundy: '#8B4513'
  }
};

function showThemeModal() {
  let modal = el('#themeModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'themeModal';
    modal.className = 'modal';
    document.body.appendChild(modal);
  }

  const currentThemeName = state.customTheme?.name || 'default';

  modal.innerHTML = `
    <div class="player card" style="max-width:550px">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <strong style="font-size:18px">🎨 Theme Settings</strong>
        <div class="close" id="closeThemeModal">✕</div>
      </div>
      <div style="margin-top:20px">
        <div style="display:flex;gap:12px;margin-bottom:20px">
          <button class="chip ${state.theme === 'dark' ? 'active' : ''}" onclick="setThemeMode('dark')">
            🌙 Dark Mode
          </button>
          <button class="chip ${state.theme === 'light' ? 'active' : ''}" onclick="setThemeMode('light')">
            ☀️ Light Mode
          </button>
        </div>
        
        <div class="muted small" style="margin-bottom:12px">Color Themes</div>
        <div class="theme-picker">
          ${Object.entries(PRESET_THEMES).map(([key, theme]) => `
            <div class="theme-option ${currentThemeName === key ? 'active' : ''}" onclick="applyPresetTheme('${key}')">
              <div class="theme-preview">
                <div class="theme-preview-bar" style="background:${theme.primary}"></div>
                <div class="theme-preview-bar" style="background:${theme.accent}"></div>
                <div class="theme-preview-bar" style="background:${theme.burgundy}"></div>
              </div>
              <div class="theme-name">${theme.name}</div>
            </div>
          `).join('')}
        </div>
        
        <div style="margin-top:24px;padding-top:20px;border-top:1px solid var(--glass-border)">
          <div class="muted small" style="margin-bottom:12px">Custom Colors</div>
          <div class="color-input-group">
            <label>Primary</label>
            <input type="color" id="customPrimary" value="${state.customTheme?.primary || '#0A1F1F'}" onchange="updateCustomTheme()">
          </div>
          <div class="color-input-group">
            <label>Accent</label>
            <input type="color" id="customAccent" value="${state.customTheme?.accent || '#D4A84B'}" onchange="updateCustomTheme()">
          </div>
          <div class="color-input-group">
            <label>Highlight</label>
            <input type="color" id="customBurgundy" value="${state.customTheme?.burgundy || '#8B2942'}" onchange="updateCustomTheme()">
          </div>
          <button class="chip" style="margin-top:12px" onclick="resetTheme()">Reset to Default</button>
        </div>
      </div>
    </div>
  `;

  modal.style.display = 'grid';

  el('#closeThemeModal').onclick = () => modal.style.display = 'none';
  modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
}

function setThemeMode(mode) {
  state.theme = mode;
  localStorage.setItem('ss_theme', mode);
  document.documentElement.setAttribute('data-theme', mode);

  // Update theme toggle button
  const themeBtn = el('#themeToggle');
  if (themeBtn) {
    themeBtn.innerHTML = mode === 'dark' ? '<span>🌙</span>' : '<span>☀️</span>';
  }

  // Refresh modal if open
  if (el('#themeModal')?.style.display === 'grid') {
    showThemeModal();
  }
}

function applyPresetTheme(themeKey) {
  const theme = PRESET_THEMES[themeKey];
  if (!theme) return;

  state.customTheme = { name: themeKey, ...theme };
  localStorage.setItem('ss_customTheme', JSON.stringify(state.customTheme));

  applyCustomColors(theme);
  showThemeModal(); // Refresh modal

  showToast('Theme Applied', `Now using ${theme.name} theme.`, 'success', 2000);
}

function updateCustomTheme() {
  const primary = el('#customPrimary')?.value;
  const accent = el('#customAccent')?.value;
  const burgundy = el('#customBurgundy')?.value;

  if (primary && accent && burgundy) {
    const theme = { name: 'custom', primary, accent, burgundy };
    state.customTheme = theme;
    localStorage.setItem('ss_customTheme', JSON.stringify(theme));
    applyCustomColors(theme);
  }
}

function applyCustomColors(theme) {
  const root = document.documentElement;

  if (theme.primary) {
    root.style.setProperty('--bg-primary', theme.primary);
    // Calculate secondary color (slightly lighter)
    root.style.setProperty('--bg-secondary', lightenColor(theme.primary, 10));
  }

  if (theme.accent) {
    root.style.setProperty('--accent-gold', theme.accent);
    root.style.setProperty('--accent-gold-light', lightenColor(theme.accent, 15));
  }

  if (theme.burgundy) {
    root.style.setProperty('--accent-burgundy', theme.burgundy);
  }
}

function resetTheme() {
  state.customTheme = null;
  localStorage.removeItem('ss_customTheme');

  // Reset CSS variables
  const root = document.documentElement;
  root.style.removeProperty('--bg-primary');
  root.style.removeProperty('--bg-secondary');
  root.style.removeProperty('--accent-gold');
  root.style.removeProperty('--accent-gold-light');
  root.style.removeProperty('--accent-burgundy');

  showThemeModal(); // Refresh modal
  showToast('Theme Reset', 'Restored default theme.', 'info', 2000);
}

function lightenColor(color, percent) {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
  const B = Math.min(255, (num & 0x0000FF) + amt);
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

// ========== CROSSFADE BETWEEN SONGS ==========
let crossfadeAudio = null;
let crossfadeTimeout = null;

function toggleCrossfade() {
  state.crossfadeEnabled = !state.crossfadeEnabled;
  localStorage.setItem('ss_crossfade', JSON.stringify(state.crossfadeEnabled));

  showToast(
    state.crossfadeEnabled ? 'Crossfade Enabled' : 'Crossfade Disabled',
    state.crossfadeEnabled
      ? `Songs will fade over ${state.crossfadeDuration} seconds.`
      : 'Songs will play without fading.',
    'info',
    2000
  );

  updateCrossfadeUI();
}

function setCrossfadeDuration(seconds) {
  state.crossfadeDuration = seconds;
  localStorage.setItem('ss_crossfadeDuration', JSON.stringify(seconds));
}

function updateCrossfadeUI() {
  const btn = el('#crossfadeBtn');
  if (btn) {
    btn.classList.toggle('active', state.crossfadeEnabled);
    btn.innerHTML = state.crossfadeEnabled
      ? `🔀 Crossfade: ${state.crossfadeDuration}s`
      : '🔀 Crossfade: Off';
  }
}

function initCrossfadeMonitor() {
  if (!state.crossfadeEnabled) return;

  // Monitor current playback and start crossfade near end
  const checkInterval = setInterval(() => {
    if (!state.crossfadeEnabled) {
      clearInterval(checkInterval);
      return;
    }

    const duration = getCurrentDuration();
    const currentTime = getCurrentTime();

    if (duration > 0 && currentTime > 0) {
      const remaining = duration - currentTime;
      const fadeStart = state.crossfadeDuration;

      if (remaining <= fadeStart && remaining > 0) {
        // Start crossfade
        startCrossfade();
        clearInterval(checkInterval);
      }
    }
  }, 1000);
}

function startCrossfade() {
  // Show crossfade indicator
  showCrossfadeIndicator();

  // Get next song
  const nextIndex = getNextIndex();
  if (nextIndex === state.currentIndex) return;

  // Start fading out current
  fadeOutCurrent();
}

function showCrossfadeIndicator() {
  let indicator = el('#crossfadeIndicator');
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.id = 'crossfadeIndicator';
    indicator.className = 'crossfade-indicator';
    indicator.innerHTML = `
      <div class="crossfade-bars">
        <div class="crossfade-bar"></div>
        <div class="crossfade-bar"></div>
        <div class="crossfade-bar"></div>
      </div>
      <span>Crossfading...</span>
    `;
    document.body.appendChild(indicator);
  }

  indicator.classList.add('visible');

  setTimeout(() => {
    indicator.classList.remove('visible');
  }, state.crossfadeDuration * 1000);
}

function fadeOutCurrent() {
  // Gradual volume reduction for YouTube player
  if (ytPlayer && typeof ytPlayer.setVolume === 'function') {
    const startVolume = currentVolume * 100;
    const steps = 20;
    const stepDuration = (state.crossfadeDuration * 1000) / steps;
    let step = 0;

    const fadeInterval = setInterval(() => {
      step++;
      const newVolume = startVolume * (1 - step / steps);
      try {
        ytPlayer.setVolume(Math.max(0, newVolume));
      } catch (e) { }

      if (step >= steps) {
        clearInterval(fadeInterval);
      }
    }, stepDuration);
  }
}

// Helper functions for crossfade
function getCurrentDuration() {
  if (ytPlayer && typeof ytPlayer.getDuration === 'function') {
    try {
      return ytPlayer.getDuration();
    } catch (e) { }
  }
  return 0;
}

function getCurrentTime() {
  if (ytPlayer && typeof ytPlayer.getCurrentTime === 'function') {
    try {
      return ytPlayer.getCurrentTime();
    } catch (e) { }
  }
  return 0;
}

// ========== ENHANCED ARTIST VIEW ==========
function showArtistPage(artistId) {
  const artist = DATA.artists.find(a => a.id === artistId);
  if (!artist) return;

  state.selectedArtist = artistId;
  state.view = 'artist';

  // Get artist's songs
  const artistSongs = DATA.songs.filter(s => s.artist === artistId);

  // Calculate stats
  const totalPlays = artistSongs.reduce((sum, s) => sum + (state.playCounts[s.id] || 0), 0);
  const avgRating = artistSongs.reduce((sum, s) => sum + (state.songRatings[s.id] || 0), 0) /
    (artistSongs.filter(s => state.songRatings[s.id]).length || 1);

  // Group by album
  const albums = {};
  artistSongs.forEach(song => {
    const albumName = song.album || 'Singles';
    if (!albums[albumName]) {
      albums[albumName] = { songs: [], year: song.year };
    }
    albums[albumName].songs.push(song);
  });

  // Update main content
  const listTitle = el('#listTitle');
  if (listTitle) {
    listTitle.innerHTML = `🎤 ${artist.name}`;
  }

  const songsList = el('#songsList');
  if (songsList) {
    songsList.innerHTML = `
      <div class="artist-hero">
        <div class="artist-hero-image">${artist.image || '🎤'}</div>
        <div class="artist-hero-info">
          <h2>${artist.name}</h2>
          <div class="muted">${artist.era} • ${artist.region}</div>
          <p class="small" style="margin-top:8px">${artist.bio}</p>
          <div class="artist-genres">
            ${artist.genres.map(g => `<span class="badge">${g}</span>`).join('')}
          </div>
          <div class="artist-stats">
            <div class="artist-stat">
              <div class="artist-stat-value">${artistSongs.length}</div>
              <div class="artist-stat-label">Songs</div>
            </div>
            <div class="artist-stat">
              <div class="artist-stat-value">${totalPlays}</div>
              <div class="artist-stat-label">Plays</div>
            </div>
            <div class="artist-stat">
              <div class="artist-stat-value">${avgRating > 0 ? avgRating.toFixed(1) : '-'}</div>
              <div class="artist-stat-label">Avg Rating</div>
            </div>
          </div>
        </div>
      </div>
      
      <div style="display:flex;gap:10px;margin-bottom:20px">
        <button class="chip" onclick="playAllArtistSongs('${artistId}')">▶️ Play All</button>
        <button class="chip" onclick="shuffleArtistSongs('${artistId}')">🔀 Shuffle</button>
        <button class="chip" onclick="goBackToHome()">← Back</button>
      </div>
      
      ${Object.entries(albums).sort((a, b) => (b[1].year || 0) - (a[1].year || 0)).map(([albumName, album]) => `
        <div class="album-group">
          <div class="album-header">
            <div class="album-cover">💿</div>
            <div class="album-info">
              <h3>${albumName}</h3>
              <div class="album-meta">${album.year || 'Unknown'} • ${album.songs.length} songs</div>
            </div>
          </div>
          <div class="album-songs" id="album-${albumName.replace(/\s/g, '-')}"></div>
        </div>
      `).join('')}
    `;

    // Render songs in each album
    Object.entries(albums).forEach(([albumName, album]) => {
      const container = el(`#album-${albumName.replace(/\s/g, '-')}`);
      if (container) {
        renderSongsInContainer(album.songs, container);
      }
    });
  }
}

function playAllArtistSongs(artistId) {
  const artistSongs = DATA.songs.filter(s => s.artist === artistId);
  if (artistSongs.length === 0) return;

  initQueueFromSongs(artistSongs.map(s => s.id), 0);
  openSong(artistSongs[0].id);
}

function shuffleArtistSongs(artistId) {
  const artistSongs = DATA.songs.filter(s => s.artist === artistId);
  if (artistSongs.length === 0) return;

  const shuffled = [...artistSongs].sort(() => Math.random() - 0.5);
  initQueueFromSongs(shuffled.map(s => s.id), 0);
  openSong(shuffled[0].id);
}

function goBackToHome() {
  state.view = 'home';
  state.selectedArtist = null;

  const listTitle = el('#listTitle');
  if (listTitle) {
    listTitle.innerHTML = '🎶 Latest Additions';
  }

  renderSongs(DATA.songs);
}

// ========== ALBUM GROUPING VIEW ==========
function toggleAlbumView() {
  if (state.viewMode === 'album') {
    state.viewMode = 'list';
    renderSongs(DATA.songs);
  } else {
    state.viewMode = 'album';
    renderAlbumGroupedView();
  }

  localStorage.setItem('ss_viewMode', state.viewMode);
}

function renderAlbumGroupedView() {
  // Group all songs by album
  const albums = {};
  DATA.songs.forEach(song => {
    const albumName = song.album || 'Singles';
    const artist = DATA.artists.find(a => a.id === song.artist);
    const key = `${albumName}-${artist?.name || 'Unknown'}`;

    if (!albums[key]) {
      albums[key] = {
        name: albumName,
        artist: artist?.name || 'Unknown',
        artistImage: artist?.image || '🎵',
        year: song.year,
        songs: []
      };
    }
    albums[key].songs.push(song);
  });

  const songsList = el('#songsList');
  if (songsList) {
    const listTitle = el('#listTitle');
    if (listTitle) {
      listTitle.innerHTML = '💿 Albums';
    }

    songsList.innerHTML = Object.values(albums)
      .sort((a, b) => (b.year || 0) - (a.year || 0))
      .map(album => `
        <div class="album-group">
          <div class="album-header">
            <div class="album-cover">${album.artistImage}</div>
            <div class="album-info">
              <h3>${album.name}</h3>
              <div class="album-meta">${album.artist} • ${album.year || 'Unknown'} • ${album.songs.length} songs</div>
            </div>
            <button class="chip" onclick="playAlbum('${album.name}', '${album.artist}')">▶️ Play</button>
          </div>
          <div class="album-songs" id="album-view-${album.name.replace(/\s/g, '-')}-${album.artist.replace(/\s/g, '-')}"></div>
        </div>
      `).join('');

    // Render songs in each album
    Object.values(albums).forEach(album => {
      const container = el(`#album-view-${album.name.replace(/\s/g, '-')}-${album.artist.replace(/\s/g, '-')}`);
      if (container) {
        renderSongsInContainer(album.songs, container);
      }
    });
  }
}

function playAlbum(albumName, artistName) {
  const albumSongs = DATA.songs.filter(s => {
    const artist = DATA.artists.find(a => a.id === s.artist);
    return (s.album || 'Singles') === albumName && (artist?.name || 'Unknown') === artistName;
  });

  if (albumSongs.length === 0) return;

  initQueueFromSongs(albumSongs.map(s => s.id), 0);
  openSong(albumSongs[0].id);
}

// ========== INITIALIZE DAY 5 FEATURES ==========
function initDay5Features() {
  // Apply saved custom theme
  if (state.customTheme && state.customTheme.name !== 'default') {
    applyCustomColors(state.customTheme);
  }

  // Add export/import button to playlists section
  const playlistsHeader = el('#newPlaylist')?.parentElement;
  if (playlistsHeader && !el('#exportImportBtn')) {
    const exportBtn = document.createElement('button');
    exportBtn.id = 'exportImportBtn';
    exportBtn.className = 'badge';
    exportBtn.style.cursor = 'pointer';
    exportBtn.innerHTML = '💾';
    exportBtn.title = 'Export/Import Data';
    exportBtn.onclick = showExportImportModal;
    playlistsHeader.appendChild(exportBtn);
  }

  // Add theme button click handler
  const themeToggle = el('#themeToggle');
  if (themeToggle) {
    themeToggle.ondblclick = showThemeModal; // Double-click for theme modal
  }

  // Add crossfade toggle to playback controls
  const playbackControls = el('#playbackControls');
  if (playbackControls && !el('#crossfadeBtn')) {
    const crossfadeBtn = document.createElement('button');
    crossfadeBtn.id = 'crossfadeBtn';
    crossfadeBtn.className = 'pill';
    crossfadeBtn.innerHTML = state.crossfadeEnabled
      ? `🔀 Crossfade: ${state.crossfadeDuration}s`
      : '🔀 Crossfade: Off';
    crossfadeBtn.onclick = toggleCrossfade;
    if (state.crossfadeEnabled) crossfadeBtn.classList.add('active');
    playbackControls.appendChild(crossfadeBtn);
  }

  // Add view toggle button
  const listTitleEl = el('#listTitle')?.parentElement;
  if (listTitleEl && !el('#viewToggleBtn')) {
    const viewBtn = document.createElement('button');
    viewBtn.id = 'viewToggleBtn';
    viewBtn.className = 'badge';
    viewBtn.style.cursor = 'pointer';
    viewBtn.innerHTML = '💿 Albums';
    viewBtn.title = 'Toggle Album View';
    viewBtn.onclick = toggleAlbumView;
    listTitleEl.appendChild(viewBtn);
  }

  // Initialize crossfade monitoring when song plays
  if (state.crossfadeEnabled) {
    initCrossfadeMonitor();
  }

  console.log('Day 5 features initialized');
}

// Update DOMContentLoaded to initialize Day 5 features
document.addEventListener('DOMContentLoaded', () => {
  // Wait for main initialization to complete
  setTimeout(initDay5Features, 300);
});

// Make Day 5 functions globally available
window.showToast = showToast;
window.exportPlaylists = exportPlaylists;
window.importPlaylists = importPlaylists;
window.showExportImportModal = showExportImportModal;
window.rateSong = rateSong;
window.renderStarRating = renderStarRating;
window.showThemeModal = showThemeModal;
window.setThemeMode = setThemeMode;
window.applyPresetTheme = applyPresetTheme;
window.updateCustomTheme = updateCustomTheme;
window.resetTheme = resetTheme;
window.toggleCrossfade = toggleCrossfade;
window.showArtistPage = showArtistPage;
window.playAllArtistSongs = playAllArtistSongs;
window.shuffleArtistSongs = shuffleArtistSongs;
window.goBackToHome = goBackToHome;
window.toggleAlbumView = toggleAlbumView;
window.playAlbum = playAlbum;
