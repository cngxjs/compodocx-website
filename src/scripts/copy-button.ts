const COPIED_LABEL = 'Copied!';
const COPIED_DURATION_MS = 2000;

export function initCopyButtons(): void {
  const buttons = document.querySelectorAll<HTMLButtonElement>('button[data-copy-target]');
  buttons.forEach((button) => {
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
      const original = button.textContent ?? '';
      button.textContent = COPIED_LABEL;
      button.dataset.copied = 'true';
      window.setTimeout(() => {
        button.textContent = original;
        delete button.dataset.copied;
      }, COPIED_DURATION_MS);
    });
  });
}
