function activate(tab: HTMLButtonElement, allTabs: HTMLButtonElement[]): void {
  const panelId = tab.getAttribute('aria-controls');
  if (!panelId) return;
  const root = tab.closest<HTMLElement>('[data-tabs]');
  if (!root) return;

  allTabs.forEach((t) => {
    const isActive = t === tab;
    t.setAttribute('aria-selected', isActive ? 'true' : 'false');
    t.setAttribute('tabindex', isActive ? '0' : '-1');
  });

  root.querySelectorAll<HTMLElement>('[role="tabpanel"]').forEach((panel) => {
    panel.toggleAttribute('hidden', panel.id !== panelId);
  });
}

export function initTabs(): void {
  const groups = document.querySelectorAll<HTMLElement>('[data-tabs]');
  groups.forEach((group) => {
    const tabs = Array.from(group.querySelectorAll<HTMLButtonElement>('button[role="tab"]'));
    if (tabs.length === 0) return;

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activate(tab, tabs));
      tab.addEventListener('keydown', (event) => {
        let nextIndex: number | null = null;
        switch (event.key) {
          case 'ArrowRight':
            nextIndex = (index + 1) % tabs.length;
            break;
          case 'ArrowLeft':
            nextIndex = (index - 1 + tabs.length) % tabs.length;
            break;
          case 'Home':
            nextIndex = 0;
            break;
          case 'End':
            nextIndex = tabs.length - 1;
            break;
        }
        if (nextIndex === null) return;
        event.preventDefault();
        const next = tabs[nextIndex];
        if (next) {
          activate(next, tabs);
          next.focus();
        }
      });
    });
  });
}
