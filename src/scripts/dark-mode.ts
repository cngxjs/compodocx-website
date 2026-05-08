const STORAGE_KEY = 'compodocx-website-darkmode';

export function initDarkToggle(): void {
  const button = document.getElementById('dark-toggle');
  if (!(button instanceof HTMLButtonElement)) return;

  const sync = (): void => {
    const dark = document.documentElement.classList.contains('dark');
    button.setAttribute('aria-pressed', dark ? 'true' : 'false');
  };

  sync();

  button.addEventListener('click', () => {
    const next = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      // storage may be blocked (private mode, quota); silently fall back to runtime-only toggle
    }
    sync();
  });
}
