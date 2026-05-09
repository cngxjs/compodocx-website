const COPIED_DURATION_MS = 2000;
const BOUND = new WeakSet<HTMLButtonElement>();

export function initCopyButtons(): void {
  const buttons = document.querySelectorAll<HTMLButtonElement>('button[data-copy-target]');
  buttons.forEach((button) => {
    if (BOUND.has(button)) return;
    BOUND.add(button);
    button.addEventListener('click', async () => {
      const targetId = button.dataset.copyTarget;
      if (!targetId) return;
      const target = document.getElementById(targetId);
      if (!target) return;
      const text = (target.textContent ?? '').trim();
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        return;
      }
      const labelEl = button.querySelector<HTMLElement>('[data-copy-label]');
      const liveEl = button.querySelector<HTMLElement>('[data-copy-live]');
      const originalLabel = labelEl?.textContent ?? '';
      if (labelEl) labelEl.textContent = 'Copied';
      if (liveEl) liveEl.textContent = 'Command copied to clipboard';
      button.dataset.copied = 'true';
      window.setTimeout(() => {
        if (labelEl) labelEl.textContent = originalLabel;
        if (liveEl) liveEl.textContent = '';
        delete button.dataset.copied;
      }, COPIED_DURATION_MS);
    });
  });
}
