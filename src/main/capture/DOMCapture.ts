// DOM Capture Module

import { tabManager } from '../tabs';
import { logger } from '../utils/logger';

export interface DOMCaptureOptions {
  simplified?: boolean;
  maxDepth?: number;
  includeScripts?: boolean;
  includeStyles?: boolean;
}

export async function captureDOM(options: DOMCaptureOptions = {}): Promise<string> {
  const activeTab = tabManager.getActiveTab();
  if (!activeTab) {
    logger.warn('No active tab for DOM capture');
    return '<html></html>';
  }

  const {
    simplified = true,
    includeScripts = false,
    includeStyles = false,
  } = options;

  try {
    const dom = await activeTab.webContents.executeJavaScript(`
      (function() {
        const clone = document.documentElement.cloneNode(true);

        ${!includeScripts ? "clone.querySelectorAll('script').forEach(el => el.remove());" : ''}
        ${!includeStyles ? "clone.querySelectorAll('style, link[rel=\"stylesheet\"]').forEach(el => el.remove());" : ''}

        if (${simplified}) {
          // Remove comments
          const walker = document.createTreeWalker(clone, NodeFilter.SHOW_COMMENT);
          const comments = [];
          while (walker.nextNode()) comments.push(walker.currentNode);
          comments.forEach(c => c.remove());

          // Remove hidden elements
          clone.querySelectorAll('[hidden], [style*="display: none"], [style*="display:none"]').forEach(el => el.remove());

          // Remove empty text nodes
          const textWalker = document.createTreeWalker(clone, NodeFilter.SHOW_TEXT);
          const emptyTexts = [];
          while (textWalker.nextNode()) {
            if (!textWalker.currentNode.textContent.trim()) {
              emptyTexts.push(textWalker.currentNode);
            }
          }
          emptyTexts.forEach(t => t.remove());
        }

        return clone.outerHTML;
      })()
    `);

    logger.debug('DOM captured', { simplified });
    return dom;
  } catch (error) {
    logger.error('Failed to capture DOM', { error });
    return '<html><body>Error capturing DOM</body></html>';
  }
}

export async function captureText(): Promise<string> {
  const activeTab = tabManager.getActiveTab();
  if (!activeTab) {
    return '';
  }

  try {
    const text = await activeTab.webContents.executeJavaScript(`
      document.body.innerText || document.body.textContent || ''
    `);
    return text;
  } catch (error) {
    logger.error('Failed to capture text', { error });
    return '';
  }
}
