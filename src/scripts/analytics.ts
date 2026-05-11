const BOUND = new WeakSet<HTMLElement>();

declare global {
  interface Window {
    plausible?: (eventName: string, options?: { props?: Record<string, string> }) => void;
  }

  interface HTMLElementEventMap {
    'compodocx:copy-success': CustomEvent<{ targetId: string; text: string }>;
  }
}

function track(eventName: string, props?: Record<string, string>): void {
  window.plausible?.(eventName, props ? { props } : undefined);
}

function eventForLink(link: HTMLAnchorElement): string | null {
  const url = new URL(link.href);
  if (url.hostname === 'github.com' && url.pathname.split('/').slice(1, 3).join('/') === 'cngxjs/compodocx') {
    return 'click_github';
  }
  if (url.hostname === 'www.npmjs.com' && url.pathname === '/package/@cngxjs/compodocx') return 'click_npm';
  if (url.hostname === 'stackblitz.com') return 'click_stackblitz';
  if (link.hash === '#screenshots') return 'click_demo';
  if (link.pathname.includes('/guides/getting-started/')) return 'click_getting_started';
  if (link.pathname.includes('/guides/')) return 'click_guides';
  return null;
}

export function initAnalyticsEvents(): void {
  document.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((link) => {
    if (BOUND.has(link)) return;
    BOUND.add(link);
    link.addEventListener('click', () => {
      const eventName = eventForLink(link);
      if (!eventName) return;
      track(eventName, { href: link.href });
    });
  });

  document.querySelectorAll<HTMLButtonElement>('button[data-copy-target]').forEach((button) => {
    if (BOUND.has(button)) return;
    BOUND.add(button);
    button.addEventListener('compodocx:copy-success', (event) => {
      const targetId = event.detail.targetId;
      const command = event.detail.text.trim();
      if (!targetId || !command) return;
      const eventName = command.startsWith('ng add')
        ? 'copy_ng_add_command'
        : command.includes('@cngxjs/compodocx')
          ? 'copy_install_command'
          : 'copy_command';
      track(eventName, { target: targetId });
    });
  });
}
