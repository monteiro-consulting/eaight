// MCP Tools - Actions that AI clients can execute

import { MCPTool } from '../../shared/types/mcp';
import { MCPTools as ToolNames } from '../../shared/constants/mcp-constants';
import { tabManager } from '../tabs';
import { windowManager } from '../window';
import { logger } from '../utils/logger';
import { isValidUrl, normalizeUrl } from '../../shared/utils/validators';

// Tool definitions
export const tools: MCPTool[] = [
  // Navigation
  {
    name: ToolNames.NAVIGATE,
    description: 'Navigate to a URL in the current tab',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL to navigate to' },
      },
      required: ['url'],
    },
  },
  {
    name: ToolNames.BACK,
    description: 'Go back in browser history',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: ToolNames.FORWARD,
    description: 'Go forward in browser history',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: ToolNames.RELOAD,
    description: 'Reload the current page',
    inputSchema: { type: 'object', properties: {} },
  },

  // Tabs
  {
    name: ToolNames.NEW_TAB,
    description: 'Open a new tab',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL to open (optional)' },
      },
    },
  },
  {
    name: ToolNames.CLOSE_TAB,
    description: 'Close a tab',
    inputSchema: {
      type: 'object',
      properties: {
        tabId: { type: 'string', description: 'Tab ID to close (current tab if omitted)' },
      },
    },
  },
  {
    name: ToolNames.SWITCH_TAB,
    description: 'Switch to a specific tab',
    inputSchema: {
      type: 'object',
      properties: {
        tabId: { type: 'string', description: 'Tab ID to switch to' },
      },
      required: ['tabId'],
    },
  },

  // Interactions
  {
    name: ToolNames.CLICK,
    description: 'Click on an element',
    inputSchema: {
      type: 'object',
      properties: {
        selector: { type: 'string', description: 'CSS selector of element to click' },
        text: { type: 'string', description: 'Text content to find and click (alternative to selector)' },
        coordinates: {
          type: 'object',
          properties: {
            x: { type: 'number' },
            y: { type: 'number' },
          },
          description: 'X,Y coordinates to click (alternative)',
        },
      },
    },
  },
  {
    name: ToolNames.TYPE,
    description: 'Type text into an input field',
    inputSchema: {
      type: 'object',
      properties: {
        selector: { type: 'string', description: 'CSS selector of input element' },
        text: { type: 'string', description: 'Text to type' },
        clear: { type: 'boolean', description: 'Clear field before typing (default: true)' },
        pressEnter: { type: 'boolean', description: 'Press Enter after typing (default: false)' },
      },
      required: ['selector', 'text'],
    },
  },
  {
    name: ToolNames.SCROLL,
    description: 'Scroll the page',
    inputSchema: {
      type: 'object',
      properties: {
        direction: { type: 'string', enum: ['up', 'down', 'left', 'right'] },
        amount: { type: 'number', description: 'Pixels to scroll (default: 500)' },
        selector: { type: 'string', description: 'Element to scroll (page if omitted)' },
      },
      required: ['direction'],
    },
  },
  {
    name: ToolNames.HOVER,
    description: 'Hover over an element',
    inputSchema: {
      type: 'object',
      properties: {
        selector: { type: 'string', description: 'CSS selector of element' },
      },
      required: ['selector'],
    },
  },
  {
    name: ToolNames.SELECT,
    description: 'Select an option from a dropdown',
    inputSchema: {
      type: 'object',
      properties: {
        selector: { type: 'string', description: 'CSS selector of select element' },
        value: { type: 'string', description: 'Value to select' },
      },
      required: ['selector', 'value'],
    },
  },

  // JavaScript
  {
    name: ToolNames.EXECUTE_JS,
    description: 'Execute JavaScript code in the page context',
    inputSchema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'JavaScript code to execute' },
      },
      required: ['code'],
    },
  },

  // Extraction
  {
    name: ToolNames.GET_ELEMENTS,
    description: 'Get information about elements matching a selector',
    inputSchema: {
      type: 'object',
      properties: {
        selector: { type: 'string', description: 'CSS selector' },
        attributes: {
          type: 'array',
          items: { type: 'string' },
          description: 'Attributes to extract (default: id, class, text, href)',
        },
        limit: { type: 'number', description: 'Max elements to return (default: 50)' },
      },
      required: ['selector'],
    },
  },
  {
    name: ToolNames.GET_ATTRIBUTE,
    description: 'Get a specific attribute from an element',
    inputSchema: {
      type: 'object',
      properties: {
        selector: { type: 'string' },
        attribute: { type: 'string' },
      },
      required: ['selector', 'attribute'],
    },
  },

  // Wait
  {
    name: ToolNames.WAIT,
    description: 'Wait for a condition',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['selector', 'navigation', 'timeout'],
          description: 'What to wait for',
        },
        value: { type: 'string', description: 'Selector or timeout in ms' },
        timeout: { type: 'number', description: 'Max wait time in ms (default: 30000)' },
      },
      required: ['type'],
    },
  },

  // Capture
  {
    name: ToolNames.SCREENSHOT,
    description: 'Take a screenshot',
    inputSchema: {
      type: 'object',
      properties: {
        fullPage: { type: 'boolean', description: 'Capture full scrollable page content (default: false)' },
        selector: { type: 'string', description: 'Capture specific element only' },
        includeUI: { type: 'boolean', description: 'Capture entire browser window including UI (navbar, tabs, etc.)' },
      },
    },
  },
];

// Tool execution handlers
type ToolResult = { success: boolean; result?: unknown; error?: string };

export async function executeTool(name: string, args: Record<string, unknown> = {}): Promise<ToolResult> {
  logger.debug('Executing tool', { name, args });

  try {
    switch (name) {
      case ToolNames.NAVIGATE:
        return await navigateTo(args.url as string);

      case ToolNames.BACK:
        return goBack();

      case ToolNames.FORWARD:
        return goForward();

      case ToolNames.RELOAD:
        return reload();

      case ToolNames.NEW_TAB:
        return newTab(args.url as string | undefined);

      case ToolNames.CLOSE_TAB:
        return closeTab(args.tabId as string | undefined);

      case ToolNames.SWITCH_TAB:
        return switchTab(args.tabId as string);

      case ToolNames.CLICK:
        return await click(args);

      case ToolNames.TYPE:
        return await type(args);

      case ToolNames.SCROLL:
        return await scroll(args);

      case ToolNames.HOVER:
        return await hover(args.selector as string);

      case ToolNames.SELECT:
        return await select(args.selector as string, args.value as string);

      case ToolNames.EXECUTE_JS:
        return await executeJS(args.code as string);

      case ToolNames.GET_ELEMENTS:
        return await getElements(args);

      case ToolNames.GET_ATTRIBUTE:
        return await getAttribute(args.selector as string, args.attribute as string);

      case ToolNames.WAIT:
        return await wait(args);

      case ToolNames.SCREENSHOT:
        return await screenshot(args);

      default:
        return { success: false, error: `Unknown tool: ${name}` };
    }
  } catch (error) {
    logger.error('Tool execution failed', { name, error });
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// Navigation tools
async function navigateTo(url: string): Promise<ToolResult> {
  const normalizedUrl = normalizeUrl(url);
  if (!normalizedUrl || !isValidUrl(normalizedUrl)) {
    return { success: false, error: 'Invalid URL' };
  }

  await tabManager.navigate(normalizedUrl);
  return { success: true, result: { url: normalizedUrl } };
}

function goBack(): ToolResult {
  if (!tabManager.canGoBack()) {
    return { success: false, error: 'Cannot go back' };
  }
  tabManager.goBack();
  return { success: true };
}

function goForward(): ToolResult {
  if (!tabManager.canGoForward()) {
    return { success: false, error: 'Cannot go forward' };
  }
  tabManager.goForward();
  return { success: true };
}

function reload(): ToolResult {
  tabManager.reload();
  return { success: true };
}

// Tab tools
function newTab(url?: string): ToolResult {
  const tab = tabManager.createTab(url);
  return { success: true, result: { tabId: tab.id } };
}

function closeTab(tabId?: string): ToolResult {
  const id = tabId || tabManager.getActiveTabId();
  if (!id) {
    return { success: false, error: 'No tab to close' };
  }
  const closed = tabManager.closeTab(id);
  return { success: closed };
}

function switchTab(tabId: string): ToolResult {
  const switched = tabManager.switchToTab(tabId);
  return { success: switched, error: switched ? undefined : 'Tab not found' };
}

// Interaction tools
async function click(args: Record<string, unknown>): Promise<ToolResult> {
  const activeTab = tabManager.getActiveTab();
  if (!activeTab) return { success: false, error: 'No active tab' };

  const { selector, text, coordinates } = args as {
    selector?: string;
    text?: string;
    coordinates?: { x: number; y: number };
  };

  let script = '';

  if (coordinates) {
    script = `
      const el = document.elementFromPoint(${coordinates.x}, ${coordinates.y});
      if (el) { el.click(); true; } else { false; }
    `;
  } else if (text) {
    script = `
      const elements = [...document.querySelectorAll('*')];
      const el = elements.find(e => e.textContent?.trim() === '${text.replace(/'/g, "\\'")}');
      if (el) { el.click(); true; } else { false; }
    `;
  } else if (selector) {
    script = `
      const el = document.querySelector('${selector.replace(/'/g, "\\'")}');
      if (el) { el.click(); true; } else { false; }
    `;
  } else {
    return { success: false, error: 'Must provide selector, text, or coordinates' };
  }

  const clicked = await activeTab.webContents.executeJavaScript(script);
  return { success: clicked, error: clicked ? undefined : 'Element not found' };
}

async function type(args: Record<string, unknown>): Promise<ToolResult> {
  const activeTab = tabManager.getActiveTab();
  if (!activeTab) return { success: false, error: 'No active tab' };

  const { selector, text, clear = true, pressEnter = false } = args as {
    selector: string;
    text: string;
    clear?: boolean;
    pressEnter?: boolean;
  };

  const script = `
    const el = document.querySelector('${selector.replace(/'/g, "\\'")}');
    if (el) {
      el.focus();
      ${clear ? "el.value = '';" : ''}
      el.value = '${text.replace(/'/g, "\\'")}';
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      ${pressEnter ? "el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));" : ''}
      true;
    } else {
      false;
    }
  `;

  const typed = await activeTab.webContents.executeJavaScript(script);
  return { success: typed, error: typed ? undefined : 'Element not found' };
}

async function scroll(args: Record<string, unknown>): Promise<ToolResult> {
  const activeTab = tabManager.getActiveTab();
  if (!activeTab) return { success: false, error: 'No active tab' };

  const { direction, amount = 500, selector } = args as {
    direction: string;
    amount?: number;
    selector?: string;
  };

  const scrollX = direction === 'left' ? -amount : direction === 'right' ? amount : 0;
  const scrollY = direction === 'up' ? -amount : direction === 'down' ? amount : 0;

  const script = selector
    ? `document.querySelector('${selector.replace(/'/g, "\\'")}')?.scrollBy(${scrollX}, ${scrollY}); true;`
    : `window.scrollBy(${scrollX}, ${scrollY}); true;`;

  await activeTab.webContents.executeJavaScript(script);
  return { success: true };
}

async function hover(selector: string): Promise<ToolResult> {
  const activeTab = tabManager.getActiveTab();
  if (!activeTab) return { success: false, error: 'No active tab' };

  const script = `
    const el = document.querySelector('${selector.replace(/'/g, "\\'")}');
    if (el) {
      el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
      el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      true;
    } else {
      false;
    }
  `;

  const hovered = await activeTab.webContents.executeJavaScript(script);
  return { success: hovered, error: hovered ? undefined : 'Element not found' };
}

async function select(selector: string, value: string): Promise<ToolResult> {
  const activeTab = tabManager.getActiveTab();
  if (!activeTab) return { success: false, error: 'No active tab' };

  const script = `
    const el = document.querySelector('${selector.replace(/'/g, "\\'")}');
    if (el && el.tagName === 'SELECT') {
      el.value = '${value.replace(/'/g, "\\'")}';
      el.dispatchEvent(new Event('change', { bubbles: true }));
      true;
    } else {
      false;
    }
  `;

  const selected = await activeTab.webContents.executeJavaScript(script);
  return { success: selected, error: selected ? undefined : 'Select element not found' };
}

async function executeJS(code: string): Promise<ToolResult> {
  const activeTab = tabManager.getActiveTab();
  if (!activeTab) return { success: false, error: 'No active tab' };

  const result = await activeTab.webContents.executeJavaScript(code);
  return { success: true, result };
}

async function getElements(args: Record<string, unknown>): Promise<ToolResult> {
  const activeTab = tabManager.getActiveTab();
  if (!activeTab) return { success: false, error: 'No active tab' };

  const { selector, attributes = ['id', 'class', 'text', 'href'], limit = 50 } = args as {
    selector: string;
    attributes?: string[];
    limit?: number;
  };

  const script = `
    const elements = [...document.querySelectorAll('${selector.replace(/'/g, "\\'")}')].slice(0, ${limit});
    elements.map(el => {
      const info = { tagName: el.tagName.toLowerCase() };
      ${attributes.includes('id') ? "if (el.id) info.id = el.id;" : ''}
      ${attributes.includes('class') ? "if (el.className) info.className = el.className;" : ''}
      ${attributes.includes('text') ? "info.text = el.textContent?.trim().slice(0, 100);" : ''}
      ${attributes.includes('href') ? "if (el.href) info.href = el.href;" : ''}
      ${attributes.includes('src') ? "if (el.src) info.src = el.src;" : ''}
      ${attributes.includes('value') ? "if (el.value !== undefined) info.value = el.value;" : ''}
      const rect = el.getBoundingClientRect();
      info.rect = { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
      return info;
    });
  `;

  const elements = await activeTab.webContents.executeJavaScript(script);
  return { success: true, result: elements };
}

async function getAttribute(selector: string, attribute: string): Promise<ToolResult> {
  const activeTab = tabManager.getActiveTab();
  if (!activeTab) return { success: false, error: 'No active tab' };

  const script = `document.querySelector('${selector.replace(/'/g, "\\'")}')?.getAttribute('${attribute.replace(/'/g, "\\'")}')`;
  const value = await activeTab.webContents.executeJavaScript(script);
  return { success: true, result: value };
}

async function wait(args: Record<string, unknown>): Promise<ToolResult> {
  const activeTab = tabManager.getActiveTab();
  if (!activeTab) return { success: false, error: 'No active tab' };

  const { type, value, timeout = 30000 } = args as {
    type: string;
    value?: string;
    timeout?: number;
  };

  if (type === 'timeout') {
    const ms = parseInt(value || '1000', 10);
    await new Promise(resolve => setTimeout(resolve, Math.min(ms, timeout)));
    return { success: true };
  }

  if (type === 'selector' && value) {
    const script = `
      new Promise((resolve) => {
        if (document.querySelector('${value.replace(/'/g, "\\'")}')) {
          resolve(true);
          return;
        }
        const observer = new MutationObserver(() => {
          if (document.querySelector('${value.replace(/'/g, "\\'")}')) {
            observer.disconnect();
            resolve(true);
          }
        });
        observer.observe(document.body, { childList: true, subtree: true });
        setTimeout(() => { observer.disconnect(); resolve(false); }, ${timeout});
      })
    `;
    const found = await activeTab.webContents.executeJavaScript(script);
    return { success: found, error: found ? undefined : 'Timeout waiting for selector' };
  }

  if (type === 'navigation') {
    await new Promise(resolve => {
      const handler = () => {
        activeTab.webContents.removeListener('did-finish-load', handler);
        resolve(true);
      };
      activeTab.webContents.on('did-finish-load', handler);
      setTimeout(() => {
        activeTab.webContents.removeListener('did-finish-load', handler);
        resolve(false);
      }, timeout);
    });
    return { success: true };
  }

  return { success: false, error: 'Invalid wait type' };
}

async function screenshot(args: Record<string, unknown>): Promise<ToolResult> {
  const { fullPage = false, selector, includeUI = false } = args as {
    fullPage?: boolean;
    selector?: string;
    includeUI?: boolean;
  };

  try {
    const mainWindow = windowManager.getWindow();

    // Check if overlay (NTP, settings) is visible - capture from main window if so
    if (tabManager.isOverlayVisible()) {
      if (!mainWindow) {
        return { success: false, error: 'Main window not available' };
      }

      logger.debug('Overlay visible, capturing from main window');
      const image = await mainWindow.webContents.capturePage();
      const buffer = image.toPNG();

      if (!buffer || buffer.length === 0) {
        logger.error('Main window screenshot captured but buffer is empty');
        return { success: false, error: 'Screenshot captured but image is empty' };
      }

      const base64 = buffer.toString('base64');
      const size = image.getSize();
      logger.debug('Main window screenshot captured', { size: buffer.length });

      return {
        success: true,
        result: {
          screenshot: base64,
          dimensions: { width: size.width, height: size.height }
        }
      };
    }

    const activeTab = tabManager.getActiveTab();
    if (!activeTab) {
      logger.warn('Screenshot failed: No active tab');
      return { success: false, error: 'No active tab' };
    }

    // Capture entire browser window including UI (navbar, tabs, etc.)
    // Uses direct window capture - works even when window is in background
    if (includeUI) {
      if (!mainWindow) {
        return { success: false, error: 'Main window not available' };
      }

      // Restore if minimized (but don't focus - let user keep working)
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Capture the main window UI (without BrowserView content)
      const uiImage = await mainWindow.capturePage();

      // Capture the BrowserView content separately
      const pageImage = await activeTab.webContents.capturePage();

      // Get the BrowserView bounds to know where to composite
      const viewBounds = activeTab.view.getBounds();

      // Return both UI and page screenshots
      // The UI shows tabs, URL bar, AI panel (BrowserView area may be black)
      // The page shows the web content
      const base64 = uiImage.toPNG().toString('base64');
      const pageBase64 = pageImage.toPNG().toString('base64');
      const size = uiImage.getSize();

      return {
        success: true,
        result: {
          screenshot: base64,
          pageScreenshot: pageBase64,
          includeUI: true,
          dimensions: { width: size.width, height: size.height },
          viewBounds: viewBounds
        }
      };
    }

    // Element-specific screenshot
    if (selector) {
      const elementRect = await activeTab.webContents.executeJavaScript(`
        (function() {
          const el = document.querySelector('${selector.replace(/'/g, "\\'")}');
          if (!el) return null;

          // Scroll element into view
          el.scrollIntoView({ block: 'center', inline: 'center' });

          const rect = el.getBoundingClientRect();
          return {
            x: Math.round(rect.x),
            y: Math.round(rect.y),
            width: Math.round(rect.width),
            height: Math.round(rect.height)
          };
        })()
      `);

      if (!elementRect) {
        return { success: false, error: 'Element not found' };
      }

      // Small delay to ensure scroll is complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Capture the page and crop to element
      const image = await activeTab.webContents.capturePage({
        x: Math.max(0, elementRect.x),
        y: Math.max(0, elementRect.y),
        width: elementRect.width,
        height: elementRect.height,
      });
      const base64 = image.toPNG().toString('base64');

      return { success: true, result: { screenshot: base64, element: selector, rect: elementRect } };
    }

    // Full page screenshot
    if (fullPage) {
      // Get page dimensions and save scroll position
      const pageInfo = await activeTab.webContents.executeJavaScript(`
        (function() {
          return {
            scrollX: window.scrollX,
            scrollY: window.scrollY,
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
            fullWidth: Math.max(document.body.scrollWidth, document.documentElement.scrollWidth),
            fullHeight: Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)
          };
        })()
      `);

      const { viewportWidth, viewportHeight, fullWidth, fullHeight, scrollX, scrollY } = pageInfo;

      // Calculate number of captures needed
      const cols = Math.ceil(fullWidth / viewportWidth);
      const rows = Math.ceil(fullHeight / viewportHeight);

      // Capture all sections
      const captures: { x: number; y: number; data: string }[] = [];

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * viewportWidth;
          const y = row * viewportHeight;

          // Scroll to position
          await activeTab.webContents.executeJavaScript(`window.scrollTo(${x}, ${y})`);
          await new Promise(resolve => setTimeout(resolve, 100));

          // Capture this section
          const image = await activeTab.webContents.capturePage();
          captures.push({ x, y, data: image.toPNG().toString('base64') });
        }
      }

      // Restore scroll position
      await activeTab.webContents.executeJavaScript(`window.scrollTo(${scrollX}, ${scrollY})`);

      // Stitch images together using Canvas in the page
      const stitchedBase64 = await activeTab.webContents.executeJavaScript(`
        (function() {
          const captures = ${JSON.stringify(captures)};
          const fullWidth = ${fullWidth};
          const fullHeight = ${fullHeight};
          const viewportWidth = ${viewportWidth};
          const viewportHeight = ${viewportHeight};

          const canvas = document.createElement('canvas');
          canvas.width = fullWidth;
          canvas.height = fullHeight;
          const ctx = canvas.getContext('2d');

          let loadedCount = 0;
          const totalCaptures = captures.length;

          return new Promise((resolve) => {
            captures.forEach((capture, index) => {
              const img = new Image();
              img.onload = () => {
                // Calculate the actual width/height to draw (handle edge cases)
                const drawWidth = Math.min(viewportWidth, fullWidth - capture.x);
                const drawHeight = Math.min(viewportHeight, fullHeight - capture.y);
                ctx.drawImage(img, 0, 0, drawWidth, drawHeight, capture.x, capture.y, drawWidth, drawHeight);
                loadedCount++;
                if (loadedCount === totalCaptures) {
                  resolve(canvas.toDataURL('image/png').replace('data:image/png;base64,', ''));
                }
              };
              img.src = 'data:image/png;base64,' + capture.data;
            });
          });
        })()
      `);

      return {
        success: true,
        result: {
          screenshot: stitchedBase64,
          fullPage: true,
          dimensions: { width: fullWidth, height: fullHeight }
        }
      };
    }

    // Default: capture visible area only
    const image = await activeTab.webContents.capturePage();
    const buffer = image.toPNG();

    // Validate image is not empty
    if (!buffer || buffer.length === 0) {
      logger.error('Screenshot captured but buffer is empty');
      return { success: false, error: 'Screenshot captured but image is empty' };
    }

    const base64 = buffer.toString('base64');
    logger.debug('Screenshot captured', { size: buffer.length });

    return { success: true, result: { screenshot: base64 } };
  } catch (error) {
    logger.error('Screenshot failed', { error });
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export default { tools, executeTool };
