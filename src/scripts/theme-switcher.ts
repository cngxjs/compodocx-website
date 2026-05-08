const STORAGE_KEY = 'compodocx-website-theme';
const DEFAULT_THEME = 'default';

const KNOWN_THEMES = new Set([
  'default',
  'ocean',
  'midnight',
  'nord',
  'rose-pine',
  'ember',
  'neon',
  'brutalist',
]);

function readSaved(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

function applyTheme(id: string): void {
  if (!KNOWN_THEMES.has(id)) return;
  if (id === DEFAULT_THEME) {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', id);
  }
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // storage blocked — runtime-only switch
  }
}

function syncCardStates(active: string): void {
  document.querySelectorAll<HTMLButtonElement>('button[data-theme-id]').forEach((btn) => {
    btn.setAttribute('aria-pressed', btn.dataset.themeId === active ? 'true' : 'false');
  });
}

export function initThemeSwitcher(): void {
  const cards = document.querySelectorAll<HTMLButtonElement>('button[data-theme-id]');
  if (cards.length === 0) return;

  syncCardStates(readSaved());

  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const id = card.dataset.themeId;
      if (!id) return;
      applyTheme(id);
      syncCardStates(id);
    });
  });
}
