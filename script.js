// SwarSmriti: script.js (Enhanced with YouTube integration)

// ---------- App state ----------
const state = {
  view: 'home',
  selectedMood: null,
  intensity: 60,
  favorites: JSON.parse(localStorage.getItem('ss_favs') || '[]')
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
    d.innerHTML = `
      ${thumbHtml}
      <div style="flex:1;min-width:0">
        <div style="font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${song.title}</div>
        <div class="muted small">${art.name} • ${song.year} • ${song.album || ''}</div>
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
function openSong(id) {
  const s = DATA.songs.find(x => x.id === id);
  if (!s) return;

  cleanupAudioGraph();

  el('#modalTitle').innerText = s.title;
  el('#modalArtist').innerText = (DATA.artists.find(a => a.id === s.artist) || { name: 'Unknown' }).name;

  const playerDiv = el('#modalPlayer');
  playerDiv.innerHTML = '';

  // Check if song has YouTube ID
  if (s.youtubeId) {
    // Create YouTube embed
    const youtubeContainer = document.createElement('div');
    youtubeContainer.style.cssText = 'position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin-top:16px';
    youtubeContainer.innerHTML = `
      <iframe 
        src="https://www.youtube.com/embed/${s.youtubeId}?autoplay=1&rel=0" 
        style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;border-radius:12px"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen>
      </iframe>
    `;
    playerDiv.appendChild(youtubeContainer);

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

    const nodes = buildAudioGraph(audioEl);

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

  el('#closeModal').onclick = () => {
    el('#modal').style.display = 'none';
    el('#modalPlayer').innerHTML = '';
    cleanupAudioGraph();
  };
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
  renderArtists();
  renderSongs(DATA.songs.slice(0, 15).map(s => ({ id: s.id })));
  initMoodChips();
  renderFavCount();
  updateStats();

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
