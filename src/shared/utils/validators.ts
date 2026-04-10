// Input validation utilities

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function normalizeUrl(input: string): string {
  const trimmed = input.trim();

  // If empty, return about:blank
  if (!trimmed) return 'about:blank';

  // If it already has a protocol, use it as-is
  if (/^[a-z]+:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // If it's localhost or an IP address, add http://
  if (/^(localhost|(\d{1,3}\.){3}\d{1,3})(:\d+)?/.test(trimmed)) {
    return `http://${trimmed}`;
  }

  // If it looks like a domain (has a dot and no spaces), add https://
  if (/^[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/.test(trimmed) && !/\s/.test(trimmed)) {
    return `https://${trimmed}`;
  }

  // Otherwise, treat it as a Google search query
  return `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`;
}

export function isValidSelector(selector: string): boolean {
  try {
    document.querySelector(selector);
    return true;
  } catch {
    return false;
  }
}

export function isValidPort(port: number): boolean {
  return Number.isInteger(port) && port >= 1 && port <= 65535;
}

export function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

export function validateTabId(tabId: unknown): tabId is string {
  return typeof tabId === 'string' && tabId.length > 0;
}

export function validateCoordinates(
  coords: unknown
): coords is { x: number; y: number } {
  return (
    typeof coords === 'object' &&
    coords !== null &&
    typeof (coords as Record<string, unknown>).x === 'number' &&
    typeof (coords as Record<string, unknown>).y === 'number'
  );
}
