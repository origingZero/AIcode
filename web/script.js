const grid = document.getElementById('card-grid');
const emptyState = document.getElementById('empty-state');
const favoritesView = document.getElementById('favorites');
const toast = document.getElementById('toast');

const btnRefresh = document.getElementById('btn-refresh');
const btnMore = document.getElementById('btn-more');
const btnFavorites = document.getElementById('btn-favorites');
const btnFavRefresh = document.getElementById('btn-fav-refresh');

let currentOffset = 5;
let cardBuffer = [];

const paletteFromText = (text) => text.split(',').map((c) => c.trim()).filter(Boolean);

function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  setTimeout(() => (toast.hidden = true), 2000);
}

function renderCards(cards) {
  cardBuffer = cards;
  grid.innerHTML = '';
  if (!cards.length) {
    emptyState.hidden = false;
    return;
  }
  emptyState.hidden = true;

  cards.forEach((card) => {
    const el = document.createElement('article');
    el.className = 'card';

    const palette = paletteFromText(card.image_palette);
    const swatches = palette
      .map((color) => `<span class="swatch" title="${color}" style="background:${color}"></span>`)
      .join('');

    el.innerHTML = `
      <span class="badge">AI 图像</span>
      <h3>${card.title}</h3>
      <p>${card.summary}</p>
      <div class="meta">发布于：${card.published || '未知时间'}</div>
      <div class="meta">提示词：${card.image_prompt}</div>
      <div class="palette">${swatches}</div>
      <div class="meta">随机种子：${card.image_seed}</div>
      <div class="card-actions">
        <button class="primary" data-action="favorite">收藏</button>
        <a class="ghost" href="${card.link}" target="_blank" rel="noreferrer">查看原文</a>
      </div>
    `;

    el.querySelector('[data-action="favorite"]').addEventListener('click', async () => {
      await saveFavorite(card);
      showToast('已收藏');
      await loadFavorites();
    });

    grid.appendChild(el);
  });
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
    favoritesView.innerHTML = '<p class="muted">尚未收藏任何卡片。</p>';
    return;
  }
  cards.forEach((card) => {
    const row = document.createElement('div');
    row.className = 'fav-item';
    row.innerHTML = `
      <h4>${card.title}</h4>
      <p class="muted">${card.summary}</p>
      <div class="meta">提示词：${card.image_prompt}</div>
    `;
    favoritesView.appendChild(row);
  });
}

async function fetchDaily() {
  const res = await fetch('/api/daily?limit=5');
  const data = await res.json();
  currentOffset = data.length;
  renderCards(data);
}

async function fetchMore() {
  const res = await fetch(`/api/more?offset=${currentOffset}&batch=3`);
  const data = await res.json();
  if (!data.length) {
    showToast('没有更多卡片');
    return;
  }
  renderCards([...cardBuffer, ...data]);
  currentOffset += data.length;
}

btnRefresh.addEventListener('click', fetchDaily);
btnMore.addEventListener('click', fetchMore);
btnFavorites.addEventListener('click', loadFavorites);
btnFavRefresh.addEventListener('click', loadFavorites);

fetchDaily();
loadFavorites();
