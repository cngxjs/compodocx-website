import oceanUrl from '../styles/vendor/compodocx/themes/ocean.css?url';
import midnightUrl from '../styles/vendor/compodocx/themes/midnight.css?url';
import nordUrl from '../styles/vendor/compodocx/themes/nord.css?url';
import rosePineUrl from '../styles/vendor/compodocx/themes/rose-pine.css?url';
import emberUrl from '../styles/vendor/compodocx/themes/ember.css?url';
import neonUrl from '../styles/vendor/compodocx/themes/neon.css?url';
import brutalistUrl from '../styles/vendor/compodocx/themes/brutalist.css?url';

const STORAGE_KEY = 'compodocx-website-theme';
const DEFAULT_THEME = 'default';

const URLS: Record<string, string> = {
  ocean: oceanUrl,
  midnight: midnightUrl,
  nord: nordUrl,
  'rose-pine': rosePineUrl,
  ember: emberUrl,
  neon: neonUrl,
  brutalist: brutalistUrl,
};

function readSaved(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

function applyTheme(id: string): void {
  const existing = document.head.querySelector('link[data-active-theme]');
  if (existing) existing.remove();
  if (id !== DEFAULT_THEME && URLS[id]) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = URLS[id];
    link.setAttribute('data-active-theme', id);
    document.head.appendChild(link);
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
