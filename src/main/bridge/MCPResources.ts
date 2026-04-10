// MCP Resources - Exposes browser state to AI clients

import { MCPResource } from '../../shared/types/mcp';
import { MCPResources as ResourceURIs } from '../../shared/constants/mcp-constants';
import { tabManager } from '../tabs';
import { logger } from '../utils/logger';

// Resource definitions
export const resources: MCPResource[] = [
  {
    uri: ResourceURIs.STATE,
    name: 'Browser State',
    description: 'Current browser state (URL, title, loading status, tabs)',
    mimeType: 'application/json',
  },
  {
    uri: ResourceURIs.DOM,
    name: 'Page DOM',
    description: 'Current page DOM as simplified HTML',
    mimeType: 'text/html',
  },
  {
    uri: ResourceURIs.TEXT,
    name: 'Page Text',
    description: 'Current page text content',
    mimeType: 'text/plain',
  },
  {
    uri: ResourceURIs.SCREENSHOT,
    name: 'Page Screenshot',
    description: 'Current page screenshot as base64 PNG',
    mimeType: 'image/png',
  },
  {
    uri: ResourceURIs.ACCESSIBILITY,
    name: 'Accessibility Tree',
    description: 'Page accessibility tree for screen reader view',
    mimeType: 'application/json',
  },
  {
    uri: ResourceURIs.NETWORK,
    name: 'Network Logs',
    description: 'Recent network requests and responses',
    mimeType: 'application/json',
  },
  {
    uri: ResourceURIs.CONSOLE,
    name: 'Console Logs',
    description: 'JavaScript console output',
    mimeType: 'application/json',
  },
  {
    uri: ResourceURIs.COOKIES,
    name: 'Cookies',
    description: 'Cookies for current domain (if authorized)',
    mimeType: 'application/json',
  },
  {
    uri: ResourceURIs.TABS,
    name: 'Open Tabs',
    description: 'List of all open tabs',
    mimeType: 'application/json',
  },
];

export async function readResource(uri: string): Promise<{ content: string; mimeType: string }> {
  switch (uri) {
    case ResourceURIs.STATE:
      return {
        content: JSON.stringify(await getBrowserState(), null, 2),
        mimeType: 'application/json',
      };

    case ResourceURIs.DOM:
      return {
        content: await getPageDOM(),
        mimeType: 'text/html',
      };

    case ResourceURIs.TEXT:
      return {
        content: await getPageText(),
        mimeType: 'text/plain',
      };

    case ResourceURIs.SCREENSHOT:
      return {
        content: await getScreenshot(),
        mimeType: 'image/png',
      };

    case ResourceURIs.ACCESSIBILITY:
      return {
        content: JSON.stringify(await getAccessibilityTree(), null, 2),
        mimeType: 'application/json',
      };

    case ResourceURIs.NETWORK:
      return {
        content: JSON.stringify(getNetworkLogs(), null, 2),
        mimeType: 'application/json',
      };

    case ResourceURIs.CONSOLE:
      return {
        content: JSON.stringify(getConsoleLogs(), null, 2),
        mimeType: 'application/json',
      };

    case ResourceURIs.COOKIES:
      return {
        content: JSON.stringify(await getCookies(), null, 2),
        mimeType: 'application/json',
      };

    case ResourceURIs.TABS:
      return {
        content: JSON.stringify(tabManager.getAllTabs(), null, 2),
        mimeType: 'application/json',
      };

    default:
      throw new Error(`Unknown resource: ${uri}`);
  }
}

async function getBrowserState(): Promise<object> {
  const activeTab = tabManager.getActiveTab();
  return {
    activeTab: activeTab?.state || null,
    tabs: tabManager.getAllTabs(),
    canGoBack: tabManager.canGoBack(),
    canGoForward: tabManager.canGoForward(),
    tabCount: tabManager.getTabCount(),
  };
}

async function getPageDOM(): Promise<string> {
  const activeTab = tabManager.getActiveTab();
  if (!activeTab) return '<html></html>';

  try {
    const dom = await activeTab.webContents.executeJavaScript(`
      (function() {
        const clone = document.documentElement.cloneNode(true);
        // Remove scripts and styles to simplify
        clone.querySelectorAll('script, style, noscript').forEach(el => el.remove());
        // Remove comments
        const walker = document.createTreeWalker(clone, NodeFilter.SHOW_COMMENT);
        const comments = [];
        while (walker.nextNode()) comments.push(walker.currentNode);
        comments.forEach(c => c.remove());
        return clone.outerHTML;
      })()
    `);
    return dom;
  } catch (error) {
    logger.error('Failed to get DOM', { error });
    return '<html><body>Error getting DOM</body></html>';
  }
}

async function getPageText(): Promise<string> {
  const activeTab = tabManager.getActiveTab();
  if (!activeTab) return '';

  try {
    const text = await activeTab.webContents.executeJavaScript(`
      document.body.innerText || document.body.textContent || ''
    `);
    return text;
  } catch (error) {
    logger.error('Failed to get text', { error });
    return '';
  }
}

async function getScreenshot(): Promise<string> {
  const activeTab = tabManager.getActiveTab();
  if (!activeTab) {
    throw new Error('No active tab available for screenshot');
  }

  try {
    const image = await activeTab.webContents.capturePage();
    const buffer = image.toPNG();

    // Check if image is valid (not empty)
    if (!buffer || buffer.length === 0) {
      throw new Error('Screenshot captured but image buffer is empty');
    }

    const base64 = buffer.toString('base64');
    logger.debug('Screenshot captured successfully', { size: buffer.length });
    return base64;
  } catch (error) {
    logger.error('Failed to capture screenshot', { error });
    throw new Error(`Screenshot capture failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function getAccessibilityTree(): Promise<object> {
  const activeTab = tabManager.getActiveTab();
  if (!activeTab) return {};

  try {
    const tree = await activeTab.webContents.executeJavaScript(`
      (function() {
        function getAccessibleInfo(element, depth = 0) {
          if (depth > 10) return null;

          const role = element.getAttribute('role') || element.tagName.toLowerCase();
          const label = element.getAttribute('aria-label') ||
                        element.getAttribute('alt') ||
                        element.getAttribute('title') ||
                        (element.tagName === 'INPUT' ? element.placeholder : null);

          const info = {
            role,
            label,
            text: element.childNodes.length === 1 && element.childNodes[0].nodeType === 3
                  ? element.textContent.trim().slice(0, 100)
                  : null,
          };

          const children = [];
          for (const child of element.children) {
            const childInfo = getAccessibleInfo(child, depth + 1);
            if (childInfo) children.push(childInfo);
          }

          if (children.length > 0) info.children = children;
          return info;
        }

        return getAccessibleInfo(document.body);
      })()
    `);
    return tree;
  } catch (error) {
    logger.error('Failed to get accessibility tree', { error });
    return {};
  }
}

// Network logs storage (will be populated by network capture)
const networkLogs: object[] = [];

export function addNetworkLog(log: object): void {
  networkLogs.push(log);
  if (networkLogs.length > 100) networkLogs.shift();
}

function getNetworkLogs(): object[] {
  return networkLogs;
}

// Console logs storage (will be populated by console capture)
const consoleLogs: object[] = [];

export function addConsoleLog(log: object): void {
  consoleLogs.push(log);
  if (consoleLogs.length > 100) consoleLogs.shift();
}

function getConsoleLogs(): object[] {
  return consoleLogs;
}

async function getCookies(): Promise<object[]> {
  const activeTab = tabManager.getActiveTab();
  if (!activeTab) return [];

  try {
    const url = activeTab.state.url;
    if (!url || url === 'about:blank') return [];
    const cookies = await activeTab.webContents.session.cookies.get({ url });
    return cookies.map(c => ({
      name: c.name,
      value: c.value,
      domain: c.domain,
      path: c.path,
      secure: c.secure,
      httpOnly: c.httpOnly,
    }));
  } catch (error) {
    logger.error('Failed to get cookies', { error });
    return [];
  }
}

export default { resources, readResource };
