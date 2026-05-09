const BOUND = new WeakSet<HTMLButtonElement>();
const DIALOGS = new WeakSet<HTMLDialogElement>();
const IMG_BOUND = new WeakSet<HTMLImageElement>();

function markLoaded(img: HTMLImageElement): void {
  img.dataset.loaded = 'true';
}

function extractCssVarUrl(el: HTMLElement, varName: string): string | null {
  const raw = getComputedStyle(el).getPropertyValue(varName).trim();
  const match = raw.match(/url\(["']?([^"')]+)["']?\)/);
  return match?.[1] ?? null;
}

export function initLightbox(): void {
  document.querySelectorAll<HTMLImageElement>('.screenshot-zoom > img').forEach((img) => {
    if (IMG_BOUND.has(img)) {
      return;
    }
    IMG_BOUND.add(img);
    if (img.complete && img.naturalWidth > 0) {
      markLoaded(img);
    } else {
      img.addEventListener('load', () => markLoaded(img), { once: true });
    }
  });

  const dialog = document.getElementById('screenshot-lightbox');
  const img = document.getElementById('lightbox-img');
  const frame = document.getElementById('lightbox-frame');
  const caption = document.getElementById('lightbox-caption');
  if (
    !(dialog instanceof HTMLDialogElement) ||
    !(img instanceof HTMLImageElement) ||
    !(frame instanceof HTMLElement) ||
    !(caption instanceof HTMLElement)
  ) {
    return;
  }

  document.querySelectorAll<HTMLButtonElement>('button.screenshot-zoom').forEach((btn) => {
    if (BOUND.has(btn)) {
      return;
    }
    BOUND.add(btn);
    btn.addEventListener('click', () => {
      const isDark = document.documentElement.classList.contains('dark');
      const highRes = isDark ? btn.dataset.zoomDark : btn.dataset.zoomLight;
      const lqip = extractCssVarUrl(btn, isDark ? '--lqip-dark' : '--lqip-light');
      const alt = btn.dataset.zoomAlt ?? '';
      if (!highRes) {
        return;
      }

      delete img.dataset.loaded;
      img.removeAttribute('src');
      frame.style.backgroundImage = lqip ? `url("${lqip}")` : '';
      img.alt = alt;
      caption.textContent = alt;
      dialog.showModal();
      img.src = highRes;
    });
  });

  if (DIALOGS.has(dialog)) {
    return;
  }
  DIALOGS.add(dialog);

  img.addEventListener('load', () => {
    if (dialog.open && img.naturalWidth > 0) {
      markLoaded(img);
    }
  });

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });

  dialog.addEventListener('close', () => {
    delete img.dataset.loaded;
    img.removeAttribute('src');
    frame.style.backgroundImage = '';
    caption.textContent = '';
  });

  const closeBtn = dialog.querySelector<HTMLButtonElement>('.lightbox-close');
  closeBtn?.addEventListener('click', () => dialog.close());
}
