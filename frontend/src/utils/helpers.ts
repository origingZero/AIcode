const COLORS = [
  '#6366f1', '#f59e0b', '#10b981', '#ef4444',
  '#ec4899', '#8b5cf6', '#06b6d4', '#f97316',
];

export function pickColor(seed: number): string {
  return COLORS[Math.abs(seed) % COLORS.length];
}

export function formatTime(iso: string, fallback: string): string {
  if (!iso) return fallback;
  try {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return iso;
  }
}

export function stripHtml(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

export function truncate(text: string, len: number): string {
  if (text.length <= len) return text;
  return text.slice(0, len) + '…';
}
