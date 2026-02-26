const en = {
  app: {
    title: 'World Window — AI News Cards',
  },
  hero: {
    eyebrow: 'World Window · Daily Highlights',
    heading: 'Explore global trends, save your AI news cards',
    lede: 'Aggregating the latest news via RSS, fused into visual cards with AI image prompts. Browse, bookmark, and keep loading.',
    refresh: 'Refresh Today',
    loadMore: 'Load More',
    viewFavorites: 'Favorites',
  },
  card: {
    aiBadge: 'AI',
    prompt: 'Prompt',
    seed: 'Seed',
    favorite: 'Save',
    favorited: 'Saved',
    unfavorite: 'Unsave',
    viewOriginal: 'Source',
    unknownTime: 'Unknown',
  },
  cardGrid: {
    title: "Today's Headlines",
    empty: 'No cards yet. Click "Refresh Today" to get started.',
  },
  favorites: {
    title: 'Favorites',
    refresh: 'Refresh',
    empty: 'No favorites yet',
    remove: 'Remove',
  },
  toast: {
    favorited: 'Added to favorites',
    unfavorited: 'Removed from favorites',
    noMore: 'No more cards',
    loading: 'Loading…',
  },
  lang: {
    switch: '中文',
  },
} as const;

export default en;
