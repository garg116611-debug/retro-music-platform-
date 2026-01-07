// SwarSmriti: script.js (improved + WebAudio effects)

// ---------- App state ----------
const state = {
  view:'home',
  selectedMood:null,
  intensity:60,
  favorites: JSON.parse(localStorage.getItem('ss_favs')||'[]')
};

// ---------- Helpers ----------
const el = (q,ctx=document)=>ctx.querySelector(q);
const els = (q,ctx=document)=>Array.from(ctx.querySelectorAll(q));

// ---------- Rendering (artists/songs) ----------
function renderArtists(){
  const grid = el('#artistsGrid'); grid.innerHTML='';
  DATA.artists.forEach(a=>{
    const d=document.createElement('div'); d.className='artist-card card';
    d.innerHTML = `<div style="font-weight:600">${a.name}</div><div class="muted small">${a.genres.join(', ')} • ${a.era}</div>`;
    d.onclick=()=>openArtist(a.id);
    grid.appendChild(d);
  })
}

function getThumbHtml(song){
  if(song.thumbnail){
    return `<img src="${song.thumbnail}" style="width:64px;height:64px;border-radius:8px;object-fit:cover">`;
  }
  return '<div class="song-thumb">🎵</div>';
}

function renderSongs(list){
  const wrap = el('#songsList'); wrap.innerHTML='';
  list.forEach(s=>{
    const song = DATA.songs.find(x=>x.id===s.id);
    const art = DATA.artists.find(x=>x.id===song.artist) || {name:'Unknown'};
    const d = document.createElement('div'); d.className='song-card';
    const thumbHtml = getThumbHtml(song);
    d.innerHTML = `
      <div class="song-thumb-wrap">${thumbHtml}</div>
      <div style="flex:1">
        <div style="font-weight:600">${song.title}</div>
        <div class="muted small">${art.name} • ${song.year} • ${song.tempo}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">
        <div class="badge">${song.moods.join(', ')}</div>
        <div class="fav" data-id="${song.id}">${state.favorites.includes(song.id)?'♥':'♡'}</div>
      </div>`;
    // hover preview
    d.onmouseenter = ()=>startPreview(song);
    d.onmouseleave = ()=>stopPreview();
    d.onclick = (e)=>{
      if(e.target.classList && e.target.classList.contains('fav')){
        toggleFav(song.id); e.stopPropagation();
      } else openSong(song.id);
    };
    wrap.appendChild(d);
  })
  el('#resultsCount').innerText = list.length;
}

function renderSongsInContainer(list, container){
  container.innerHTML=''; list.forEach(li=>{
    const song = DATA.songs.find(x=>x.id===li.id);
    const art = DATA.artists.find(x=>x.id===song.artist) || {name:'Unknown'};
    const d = document.createElement('div'); d.className='song-card';
    const thumbHtml = getThumbHtml(song);
    d.innerHTML = `
      <div class="song-thumb-wrap">${thumbHtml}</div>
      <div style="flex:1">
        <div style="font-weight:600">${song.title}</div>
        <div class="muted small">${art.name} • ${song.year}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">
        <div class="badge">${song.moods.join(', ')}</div>
        <div class="fav" data-id="${song.id}">${state.favorites.includes(song.id)?'♥':'♡'}</div>
      </div>`;
    d.onmouseenter = ()=>startPreview(song);
    d.onmouseleave = ()=>stopPreview();
    d.onclick = (e)=>{ if(e.target.classList && e.target.classList.contains('fav')){ toggleFav(song.id); e.stopPropagation(); } else openSong(song.id);};
    container.appendChild(d);
  })
}

// ---------- Mood chips & ranking ----------
function initMoodChips(){
  const chips = el('#moodChips'); chips.innerHTML='';
  DATA.moods.forEach(m=>{
    const c=document.createElement('div'); c.className='chip'; c.innerHTML=`${m.emoji} ${m.label}`; c.dataset.id=m.id;
    c.onclick=()=>{
      state.selectedMood = m.id;
      els('.chip').forEach(x=>x.classList.remove('active'));
      c.classList.add('active');
      applyMoodFilter();
    };
    chips.appendChild(c);
  })
}

function applyMoodFilter(){
  if(!state.selectedMood){
    renderSongs(DATA.songs.slice(0,12).map(s=>({id:s.id}))); return;
  }
  const intensity = state.intensity/100;
  const tempoPreference = intensity;
  let scored = DATA.songs.map(s=>{
    let score = 0;
    if(s.moods.includes(state.selectedMood)) score += 2.0;
    const desiredBpm = 60 + tempoPreference * 60; // 60..120
    const bpmDiff = Math.abs((s.bpm||80) - desiredBpm);
    score += Math.max(0, 1.2 - (bpmDiff/60));
    if((s.tempo==='slow' && tempoPreference<0.4) || (s.tempo==='fast' && tempoPreference>0.6)) score += 0.3;
    if(s.artist==='a_jagjit' && state.selectedMood==='nostalgic') score += 0.35;
    return {id:s.id,score};
  });
  scored.sort((a,b)=>b.score-a.score);
  renderSongs(scored.slice(0,40));
}

// ---------- Local audio preview & modal player (pre-WebAudio fallback) ----------
let previewAudio = null;
let previewTimeout = null;

function startPreview(song){
  stopPreview();
  const area = el('#previewArea');
  area.innerHTML = '';
  const src = song.preview || song.audio;
  if(!src){
    area.innerText = 'Preview not available';
    return;
  }
  previewAudio = new Audio(src);
  previewAudio.volume = 0.35;
  previewAudio.loop = false;
  const playPromise = previewAudio.play();
  if(playPromise !== undefined){
    playPromise.then(()=>{
      const info = document.createElement('div');
      info.style.textAlign = 'center';
      info.innerHTML = `<div style="font-weight:600">${song.title}</div><div class="muted small">preview</div>`;
      area.appendChild(info);
      previewTimeout = setTimeout(()=>{ stopPreview(); }, 6000);
    }).catch(()=>{
      area.innerHTML = `<button class="chip">Play preview</button>`;
      area.querySelector('button').onclick = ()=>{ previewAudio.play(); };
    });
  }
}

function stopPreview(){
  if(previewTimeout){ clearTimeout(previewTimeout); previewTimeout=null; }
  if(previewAudio){ try{ previewAudio.pause(); previewAudio.currentTime=0; }catch(e){} previewAudio=null; }
  const area = el('#previewArea'); if(area) area.innerHTML='No preview playing';
}

// ---------- WebAudio Effects Engine ----------
let audioCtx = null;
let currentNodes = null;
let convolverBuffer = null;
let centerCancelEnabled = false;

function ensureAudioContext(){
  if(!audioCtx){ audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
  if(audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

// try to load optional IR file for reverb
function loadImpulseIfAvailable(){
  fetch('assets/ir-small.wav').then(resp=>{
    if(!resp.ok) throw new Error('no ir');
    return resp.arrayBuffer();
  }).then(arr=>ensureAudioContext().decodeAudioData(arr))
    .then(buf=>{ convolverBuffer = buf; console.log('IR loaded'); })
    .catch(()=>{ convolverBuffer = null; });
}
loadImpulseIfAvailable();

function buildAudioGraph(audioEl){
  const ctx = ensureAudioContext();
  const source = ctx.createMediaElementSource(audioEl);
  const preGain = ctx.createGain(); preGain.gain.value = 1.0;
  const bassFilter = ctx.createBiquadFilter(); bassFilter.type='lowshelf'; bassFilter.frequency.value=200; bassFilter.gain.value=0;
  const trebleFilter = ctx.createBiquadFilter(); trebleFilter.type='highshelf'; trebleFilter.frequency.value=3000; trebleFilter.gain.value=0;
  const convolver = ctx.createConvolver();
  if(convolverBuffer) convolver.buffer = convolverBuffer;
  const reverbWet = ctx.createGain(); reverbWet.gain.value = 0;
  const reverbDry = ctx.createGain(); reverbDry.gain.value = 1;
  const outGain = ctx.createGain(); outGain.gain.value = 1.0;

  source.connect(preGain);
  preGain.connect(bassFilter);
  bassFilter.connect(trebleFilter);

  if(convolverBuffer){
    trebleFilter.connect(convolver);
    convolver.connect(reverbWet);
  }
  trebleFilter.connect(reverbDry);

  reverbWet.connect(outGain);
  reverbDry.connect(outGain);
  outGain.connect(ctx.destination);

  // channel split/merge nodes prepared for center cancel when toggled
  const splitter = ctx.createChannelSplitter(2);
  const inverterGain = ctx.createGain(); inverterGain.gain.value = -1;
  const merger = ctx.createChannelMerger(2);

  currentNodes = { ctx, source, preGain, bassFilter, trebleFilter, convolver, reverbWet, reverbDry, outGain, splitter, inverterGain, merger };
  return currentNodes;
}

function cleanupAudioGraph(){
  if(!currentNodes) return;
  try{ Object.values(currentNodes).forEach(n=>{ if(n && n.disconnect) try{ n.disconnect(); }catch(e){} }); }catch(e){}
  currentNodes = null;
  centerCancelEnabled = false;
}

function applyFilterValues(values){
  if(!currentNodes) return;
  const {bassFilter, trebleFilter, reverbWet, reverbDry, outGain} = currentNodes;
  if(bassFilter) bassFilter.gain.value = Number(values.bass || 0);
  if(trebleFilter) trebleFilter.gain.value = Number(values.treble || 0);
  if(reverbWet && reverbDry){
    const r = Number(values.reverb || 0);
    reverbWet.gain.value = r;
    reverbDry.gain.value = 1 - r;
  }
  if(outGain) outGain.gain.value = Number(values.volume || 1.0);
}

function enableCenterCancel(){
  if(!currentNodes) return;
  const {source, splitter, inverterGain, merger, outGain} = currentNodes;
  try{
    source.connect(splitter);
    splitter.connect(merger, 0, 0);
    splitter.connect(inverterGain, 1);
    inverterGain.connect(merger, 0, 0);
    merger.connect(outGain);
    centerCancelEnabled = true;
  }catch(e){ console.warn('center cancel failed', e); }
}

function disableCenterCancel(){
  if(!currentNodes) return;
  try{
    // attempt to disconnect center-cancel wiring; exact nodes may differ across browsers
    const {splitter, inverterGain, merger} = currentNodes;
    if(splitter && splitter.disconnect) splitter.disconnect();
    if(inverterGain && inverterGain.disconnect) inverterGain.disconnect();
    if(merger && merger.disconnect) merger.disconnect();
    centerCancelEnabled = false;
  }catch(e){}
}

// ---------- openSong (modal with effects) ----------
function openSong(id){
  const s = DATA.songs.find(x=>x.id===id);
  if(!s) return;
  cleanupAudioGraph();

  el('#modalTitle').innerText = s.title;
  el('#modalArtist').innerText = (DATA.artists.find(a=>a.id===s.artist)||{name:'Unknown'}).name;

  const playerDiv = el('#modalPlayer');
  playerDiv.innerHTML = '';
  const audioEl = document.createElement('audio');
  audioEl.src = s.audio || s.preview || '';
  audioEl.controls = true;
  audioEl.autoplay = true;
  audioEl.style.width = '100%';
  playerDiv.appendChild(audioEl);

  const nodes = buildAudioGraph(audioEl);

  // playbackRate control
  const pr = el('#playbackRate'), prVal = el('#playbackVal');
  if(pr){ pr.value = 1; pr.oninput = ()=>{ audioEl.playbackRate = Number(pr.value); prVal.innerText = Number(pr.value).toFixed(2) + 'x'; }; }

  // bass/treble/reverb controls wiring
  const bass = el('#bass'), treble = el('#treble'), rev = el('#reverb');
  const bassVal = el('#bassVal'), trebleVal = el('#trebleVal'), revVal = el('#reverbVal');

  if(bass){ bass.value = 0; bass.oninput = ()=>{ bassVal.innerText = Number(bass.value).toFixed(1)+' dB'; applyFilterValues({bass:bass.value, treble:treble.value, reverb:rev.value}); }; }
  if(treble){ treble.value = 0; treble.oninput = ()=>{ trebleVal.innerText = Number(treble.value).toFixed(1)+' dB'; applyFilterValues({bass:bass.value, treble:treble.value, reverb:rev.value}); }; }
  if(rev){ rev.value = 0; rev.oninput = ()=>{ revVal.innerText = Math.round(Number(rev.value)*100)+'%'; applyFilterValues({bass:bass.value, treble:treble.value, reverb:rev.value}); }; }

  // vocal center cancel
  const vocalBtn = el('#vocalToggle');
  if(vocalBtn){
    centerCancelEnabled = false;
    vocalBtn.innerText = 'Center Cancel: Off';
    vocalBtn.onclick = ()=>{
      if(!centerCancelEnabled){ enableCenterCancel(); vocalBtn.innerText = 'Center Cancel: On'; }
      else { disableCenterCancel(); vocalBtn.innerText = 'Center Cancel: Off'; }
    };
  }

  applyFilterValues({bass:0, treble:0, reverb:0, volume:1});
  el('#modal').style.display = 'grid';

  el('#closeModal').onclick = ()=>{
    try{ audioEl.pause(); }catch(e){}
    el('#modal').style.display = 'none';
    cleanupAudioGraph();
  };
}

// ---------- favorites ----------
function toggleFav(songId){
  if(state.favorites.includes(songId)) state.favorites = state.favorites.filter(x=>x!==songId);
  else state.favorites.push(songId);
  localStorage.setItem('ss_favs', JSON.stringify(state.favorites));
  renderFavCount();
  if(state.view && state.view.startsWith('artist:')) openArtist(state.view.split(':')[1]);
  else if(state.view==='favorites') showFavorites();
  else applyMoodFilter();
}
function renderFavCount(){ el('#favCount').innerText = state.favorites.length; }

// ---------- artist page / favorites / search ----------
function openArtist(id){
  const a = DATA.artists.find(x=>x.id===id); if(!a) return;
  state.view = 'artist:'+id;
  const main = document.querySelector('main > section'); main.innerHTML='';
  const card = document.createElement('div'); card.className='card';
  card.innerHTML = `<div style="display:flex;gap:16px"><div style="width:160px;height:160px;border-radius:8px;background:linear-gradient(135deg,#08122a,#2a0d2a);display:grid;place-items:center;font-family:'Playfair Display';font-size:28px;color:var(--accent)">${a.name.split(' ').map(x=>x[0]).join('')}</div><div><h2>${a.name}</h2><div class="muted">${a.genres.join(', ')} • ${a.era} • ${a.region}</div><p style="margin-top:12px" class="small">${a.bio}</p></div></div>`;
  main.appendChild(card);
  const songsCard = document.createElement('div'); songsCard.className='card'; songsCard.style.marginTop='12px'; songsCard.innerHTML='<strong>Notable songs</strong><div id="artistSongs"></div>';
  main.appendChild(songsCard);
  const list = DATA.songs.filter(s=>s.artist===id).map(s=>({id:s.id}));
  renderSongsInContainer(list, el('#artistSongs', songsCard));
}

function showFavorites(){
  state.view='favorites';
  const main = document.querySelector('main > section'); main.innerHTML='';
  const card = document.createElement('div'); card.className='card'; card.innerHTML='<h2>Your Favorites</h2><p class="muted small">Manage your saved songs.</p><div id="favList"></div>';
  main.appendChild(card);
  const favList = state.favorites.map(id=>({id}));
  if(favList.length===0) el('#favList').innerHTML = '<div class="muted small">No favorites yet — add a song by clicking the heart.</div>';
  else renderSongsInContainer(favList, el('#favList', card));
}

function applySearch(q){
  if(!q || q.length<2) return;
  const ql = q.toLowerCase();
  const songMatches = DATA.songs.filter(s=>s.title.toLowerCase().includes(ql) || s.moods.join(' ').toLowerCase().includes(ql));
  const artistMatches = DATA.artists.filter(a=>a.name.toLowerCase().includes(ql));
  if(songMatches.length>0) renderSongs(songMatches.map(s=>({id:s.id})));
  else if(artistMatches.length>0) openArtist(artistMatches[0].id);
}

// ---------- initial load & events ----------
function loadHome(){
  state.view='home';
  const main = document.querySelector('main > section'); main.innerHTML = '';
  const homeHTML = `
  <div class="card hero" id="homeHero">
    <div style="flex:1">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:16px">
        <div><h2 id="featuredTitle">Featured: Jagjit Singh</h2><div class="muted">Ghazal legend • Featured playlist: Nostalgic Evenings</div></div>
        <div style="display:flex;gap:8px;align-items:center"><button class="chip" id="playFeatured">▶ Play featured</button><button class="chip" id="openMood">Explore moods</button></div>
      </div>
      <p class="small muted" style="margin-top:12px">Tip: hover a song card to hear a short preview. Click a song to open its page and play with sound.</p>
    </div>
    <div class="art">JS</div>
  </div>
  <div style="height:12px"></div>
  <div class="card"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px"><div style="display:flex;gap:12px;align-items:center"><strong>Top Legends</strong><span class="muted">(click to open)</span></div><div class="muted small">Sorted by legacy</div></div><div class="grid" id="artistsGrid"></div></div>
  <div style="height:12px"></div>
  <div class="card"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px"><strong id="listTitle">Latest additions</strong><div class="muted small">Seed dataset</div></div><div id="songsList"></div></div>
  `;
  main.innerHTML = homeHTML;
  renderArtists(); renderSongs(DATA.songs.slice(0,12).map(s=>({id:s.id}))); initMoodChips();
}

window.addEventListener('DOMContentLoaded', ()=>{
  renderArtists(); renderSongs(DATA.songs.slice(0,12).map(s=>({id:s.id}))); initMoodChips(); renderFavCount();

  el('#intensity').oninput = (e)=>{ state.intensity = e.target.value; el('#intensityVal').innerText = state.intensity; if(state.selectedMood) applyMoodFilter(); };
  el('#navMood').onclick = ()=>{ state.selectedMood = null; initMoodChips(); openMoodExplorer(); };
  el('#openMood').onclick = ()=>{ openMoodExplorer(); };
  el('#viewFavorites').onclick = ()=>{ showFavorites(); };
  el('#playFeatured').onclick = ()=>{ alert('Featured playlist coming soon!'); };

  el('#searchInput').onkeyup = (e)=>{ const q=e.target.value; if(q.length<2) return; applySearch(q); };

  el('#closeModal').onclick = ()=>{ el('#modal').style.display='none'; el('#modalPlayer').innerHTML=''; cleanupAudioGraph(); };
  el('#clearFav').onclick = ()=>{ state.favorites=[]; localStorage.setItem('ss_favs','[]'); renderFavCount(); showFavorites(); };
  el('#openMood').onclick = ()=>{ openMoodExplorer(); };
});

// mood explorer view
function openMoodExplorer(){
  state.view='mood';
  const main = document.querySelector('main > section'); main.innerHTML = '';
  const hero = document.createElement('div'); hero.className='card'; hero.innerHTML = `<h2>Mood Explorer</h2><p class="muted small">Pick a mood and adjust intensity. Results update live.</p><div id="moodExplorerResults"></div>`;
  main.appendChild(hero);
  initMoodChips();
  applyMoodFilter();
}
