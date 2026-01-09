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
  currentSongForPlaylist: null
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
