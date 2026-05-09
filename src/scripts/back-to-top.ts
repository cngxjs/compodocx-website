const SHOW_AFTER_PX = 600;
const BOUND = new WeakSet<HTMLButtonElement>();
const SCROLL_BOUND = new WeakSet<Window>();

function update(btn: HTMLButtonElement): void {
  btn.classList.toggle('is-visible', window.scrollY > SHOW_AFTER_PX);
}

export function initBackToTop(): void {
  const btn = document.getElementById('back-to-top');
  if (!(btn instanceof HTMLButtonElement)) return;

  if (!BOUND.has(btn)) {
    BOUND.add(btn);
    btn.addEventListener('click', () => {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  }

  update(btn);

  if (SCROLL_BOUND.has(window)) return;
  SCROLL_BOUND.add(window);
  let ticking = false;
  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const currentBtn = document.getElementById('back-to-top');
        if (currentBtn instanceof HTMLButtonElement) update(currentBtn);
        ticking = false;
      });
    },
    { passive: true },
  );
}
