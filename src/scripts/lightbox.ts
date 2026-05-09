const BOUND = new WeakSet<HTMLButtonElement>();
const DIALOGS = new WeakSet<HTMLDialogElement>();

export function initLightbox(): void {
  const dialog = document.getElementById('screenshot-lightbox');
  const img = document.getElementById('lightbox-img');
  if (!(dialog instanceof HTMLDialogElement) || !(img instanceof HTMLImageElement)) return;

  document.querySelectorAll<HTMLButtonElement>('button.screenshot-zoom').forEach((btn) => {
    if (BOUND.has(btn)) return;
    BOUND.add(btn);
    btn.addEventListener('click', () => {
      const isDark = document.documentElement.classList.contains('dark');
      const src = isDark ? btn.dataset.zoomDark : btn.dataset.zoomLight;
      const alt = btn.dataset.zoomAlt ?? '';
      if (!src) return;
      img.src = src;
      img.alt = alt;
      dialog.showModal();
    });
  });

  if (DIALOGS.has(dialog)) return;
  DIALOGS.add(dialog);

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener('close', () => {
    img.removeAttribute('src');
  });

  const closeBtn = dialog.querySelector<HTMLButtonElement>('.lightbox-close');
  closeBtn?.addEventListener('click', () => dialog.close());
}
