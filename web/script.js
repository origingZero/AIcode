const grid = document.getElementById('card-grid');
const emptyState = document.getElementById('empty-state');
const favoritesView = document.getElementById('favorites');
const toastEl = document.getElementById('toast');

const btnRefresh = document.getElementById('btn-refresh');
const btnMore = document.getElementById('btn-more');
const btnFavorites = document.getElementById('btn-favorites');
const btnFavRefresh = document.getElementById('btn-fav-refresh');

let currentOffset = 5;
let cardBuffer = [];
let toastTimer = null;

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316'];

function pickColor(seed) {
  return COLORS[Math.abs(seed) % COLORS.length];
}

function showToast(message, type) {
  clearTimeout(toastTimer);
  toastEl.className = 'toast' + (type === 'success' ? ' toast-success' : '');
  toastEl.innerHTML = (type === 'success'
    ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
    : '') + message;
  toastEl.hidden = false;
  toastTimer = setTimeout(() => (toastEl.hidden = true), 2400);
}

function showSkeletons(count) {
  grid.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const sk = document.createElement('div');
    sk.className = 'skeleton';
    sk.style.minHeight = (140 + Math.random() * 100) + 'px';
    grid.appendChild(sk);
  }
}

function formatTime(iso) {
  if (!iso) return '未知时间';
  try {
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return iso;
  }
}

function stripHtml(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

function truncate(text, len) {
  if (text.length <= len) return text;
  return text.slice(0, len) + '…';
}

function buildCard(card, index) {
  const el = document.createElement('article');
  el.className = 'card animate-in';
  el.style.animationDelay = (index * 60) + 'ms';

  const color = pickColor(card.image_seed);
  const cleanSummary = truncate(stripHtml(card.summary), 160);
  const cleanPrompt = truncate(stripHtml(card.image_prompt), 100);

  el.innerHTML = `
    <div class="card-color-bar" style="background: linear-gradient(90deg, ${color}, ${color}88)"></div>
    <div class="card-body">
      <div class="card-header">
        <h3>${stripHtml(card.title)}</h3>
        <span class="badge">AI</span>
      </div>
      <p class="card-summary">${cleanSummary}</p>
      <div class="card-prompt"><strong>Prompt</strong>　${cleanPrompt}</div>
      <div class="card-meta">
        <span class="meta-tag">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          ${formatTime(card.published)}
        </span>
        <span class="meta-tag">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          种子 ${card.image_seed}
        </span>
        <span class="meta-tag" style="color: ${color}; border-color: ${color}33; background: ${color}0d">
          <span style="width:8px;height:8px;border-radius:50%;background:${color};display:inline-block"></span>
          ${color}
        </span>
      </div>
    </div>
    <div class="card-footer">
      <button class="primary" data-action="favorite">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        收藏
      </button>
      <a class="ghost" href="${card.link}" target="_blank" rel="noreferrer">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        原文
      </a>
    </div>
  `;

  const favBtn = el.querySelector('[data-action="favorite"]');
  favBtn.addEventListener('click', async () => {
    favBtn.classList.add('saved');
    favBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> 已收藏';
    await saveFavorite(card);
    showToast('已添加到收藏夹', 'success');
    await loadFavorites();
  });

  return el;
}

function renderCards(cards) {
  cardBuffer = cards;
  grid.innerHTML = '';
  if (!cards.length) {
    emptyState.hidden = false;
    return;
  }
  emptyState.hidden = true;
  cards.forEach((card, i) => grid.appendChild(buildCard(card, i)));
}

async function saveFavorite(card) {
  await fetch('/api/favorites', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ card }),
  });
}

async function loadFavorites() {
  const res = await fetch('/api/favorites');
  const cards = await res.json();
  favoritesView.innerHTML = '';
  if (!cards.length) {
    favoritesView.innerHTML = '<div class="fav-empty"><div class="fav-empty-icon">&#9825;</div><p>尚未收藏任何卡片</p></div>';
    return;
  }
  cards.forEach((card) => {
    const row = document.createElement('div');
    row.className = 'fav-item';
    const color = pickColor(card.image_seed);
    row.style.setProperty('--fav-color', color);
    row.querySelector || null;
    row.innerHTML = `
      <div style="position:absolute;left:0;top:0;bottom:0;width:3px;border-radius:0 3px 3px 0;background:${color}"></div>
      <h4>${stripHtml(card.title)}</h4>
      <p class="fav-summary">${truncate(stripHtml(card.summary), 80)}</p>
      <span class="fav-time">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        ${formatTime(card.published)}
      </span>
    `;
    favoritesView.appendChild(row);
  });
}

async function fetchDaily() {
  showSkeletons(6);
  const res = await fetch('/api/daily?limit=5');
  const data = await res.json();
  currentOffset = data.length;
  renderCards(data);
}

async function fetchMore() {
  btnMore.disabled = true;
  btnMore.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation:spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> 加载中…';
  const res = await fetch(`/api/more?offset=${currentOffset}&batch=3`);
  const data = await res.json();
  btnMore.disabled = false;
  btnMore.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg> 加载更多';
  if (!data.length) {
    showToast('没有更多卡片了');
    return;
  }
  renderCards([...cardBuffer, ...data]);
  currentOffset += data.length;
}

btnRefresh.addEventListener('click', fetchDaily);
btnMore.addEventListener('click', fetchMore);
btnFavorites.addEventListener('click', loadFavorites);
btnFavRefresh.addEventListener('click', loadFavorites);

const style = document.createElement('style');
style.textContent = '@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }';
document.head.appendChild(style);

fetchDaily();
loadFavorites();
