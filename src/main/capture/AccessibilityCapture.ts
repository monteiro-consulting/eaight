// Accessibility Tree Capture Module

import { tabManager } from '../tabs';
import { logger } from '../utils/logger';

export interface AccessibilityNode {
  role: string;
  name?: string;
  description?: string;
  value?: string;
  children?: AccessibilityNode[];
}

export async function captureAccessibilityTree(): Promise<AccessibilityNode | null> {
  const activeTab = tabManager.getActiveTab();
  if (!activeTab) {
    logger.warn('No active tab for accessibility capture');
    return null;
  }

  try {
    const tree = await activeTab.webContents.executeJavaScript(`
      (function() {
        function getAccessibleInfo(element, depth = 0) {
          if (depth > 10) return null;

          const role = element.getAttribute('role') ||
                       element.tagName.toLowerCase();

          const name = element.getAttribute('aria-label') ||
                       element.getAttribute('alt') ||
                       element.getAttribute('title') ||
                       element.getAttribute('name');

          const description = element.getAttribute('aria-description');

          let value = null;
          if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            value = element.value;
          } else if (element.tagName === 'SELECT') {
            value = element.options[element.selectedIndex]?.text;
          }

          const info = { role };
          if (name) info.name = name;
          if (description) info.description = description;
          if (value) info.value = value;

          const children = [];
          for (const child of element.children) {
            if (child.nodeType === 1) {
              const childInfo = getAccessibleInfo(child, depth + 1);
              if (childInfo) children.push(childInfo);
            }
          }

          if (children.length > 0) info.children = children;

          return info;
        }

        return getAccessibleInfo(document.body);
      })()
    `);

    logger.debug('Accessibility tree captured');
    return tree;
  } catch (error) {
    logger.error('Failed to capture accessibility tree', { error });
    return null;
  }
}
