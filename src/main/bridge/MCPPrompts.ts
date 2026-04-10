// MCP Prompts - Pre-defined interaction templates

import { MCPPrompt } from '../../shared/types/mcp';

export const prompts: MCPPrompt[] = [
  {
    name: 'eaight_capabilities',
    description: 'Learn about eaight browser capabilities and available tools',
    arguments: [],
  },
  {
    name: 'analyze_page',
    description: 'Analyze the current page structure and content',
    arguments: [],
  },
  {
    name: 'fill_form',
    description: 'Fill out a form on the current page',
    arguments: [
      {
        name: 'data',
        description: 'JSON object with field names and values',
        required: true,
      },
    ],
  },
  {
    name: 'extract_data',
    description: 'Extract structured data from the page',
    arguments: [
      {
        name: 'schema',
        description: 'JSON schema describing data to extract',
        required: true,
      },
    ],
  },
  {
    name: 'navigate_to',
    description: 'Navigate to accomplish a goal',
    arguments: [
      {
        name: 'goal',
        description: 'What the user wants to accomplish',
        required: true,
      },
    ],
  },
];

export interface PromptResult {
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export function getPrompt(name: string, args: Record<string, string> = {}): PromptResult | null {
  switch (name) {
    case 'eaight_capabilities':
      return {
        messages: [
          {
            role: 'user',
            content: `You are connected to eaight, an AI-powered web browser. You have FULL CONTROL over the browser through MCP tools.

## Available Tools (use these to control the browser):

### Navigation
- **browser_navigate** - Navigate to any URL: \`{ "url": "https://example.com" }\`
- **browser_back** - Go back in history
- **browser_forward** - Go forward in history
- **browser_reload** - Reload the current page

### Tab Management
- **browser_new_tab** - Open a new tab: \`{ "url": "https://..." }\` (optional)
- **browser_close_tab** - Close a tab: \`{ "tabId": "..." }\` (optional, closes current if omitted)
- **browser_switch_tab** - Switch to a tab: \`{ "tabId": "..." }\`

### Page Interactions
- **browser_click** - Click an element: \`{ "selector": "button.submit" }\` or \`{ "text": "Submit" }\` or \`{ "coordinates": { "x": 100, "y": 200 } }\`
- **browser_type** - Type in an input: \`{ "selector": "input[name='email']", "text": "hello@example.com", "pressEnter": true }\`
- **browser_scroll** - Scroll the page: \`{ "direction": "down", "amount": 500 }\`
- **browser_hover** - Hover over an element: \`{ "selector": ".menu-item" }\`
- **browser_select** - Select dropdown option: \`{ "selector": "select#country", "value": "US" }\`

### Data Extraction
- **browser_get_elements** - Get elements info: \`{ "selector": "a", "attributes": ["href", "text"], "limit": 10 }\`
- **browser_get_attribute** - Get single attribute: \`{ "selector": "#logo", "attribute": "src" }\`
- **browser_execute_js** - Run JavaScript: \`{ "code": "document.title" }\`

### Waiting
- **browser_wait** - Wait for conditions: \`{ "type": "selector", "value": ".loaded" }\` or \`{ "type": "timeout", "value": "2000" }\`

### Screenshots
- **browser_screenshot** - Capture screenshot: \`{ "fullPage": true }\` or \`{ "selector": ".content" }\`

## Available Resources (read these to understand the page):

- **browser://state** - Current browser state (URL, title, loading status)
- **browser://dom** - Simplified HTML DOM of the page
- **browser://text** - Text content of the page
- **browser://tabs** - List of all open tabs
- **browser://screenshot** - Screenshot of visible area
- **browser://cookies** - Cookies for current domain
- **browser://console** - JavaScript console logs
- **browser://network** - Recent network requests

## How to Use:

1. **First**, read \`browser://state\` to see the current URL
2. **Navigate** using \`browser_navigate\` with a URL
3. **Read** \`browser://dom\` or \`browser://text\` to understand the page
4. **Interact** using click, type, scroll tools
5. **Verify** by reading resources again or taking screenshots

## Example - Navigate to Facebook:
1. Call tool: \`browser_navigate\` with \`{ "url": "https://facebook.com" }\`
2. Wait: \`browser_wait\` with \`{ "type": "selector", "value": "input[name='email']" }\`
3. Read: \`browser://dom\` to see the login form
4. Type email: \`browser_type\` with \`{ "selector": "input[name='email']", "text": "user@example.com" }\`

You have full browser automation capabilities. Start by reading browser://state to see where you are!`,
          },
        ],
      };

    case 'analyze_page':
      return {
        messages: [
          {
            role: 'user',
            content: `Analyze the current page. First, read the browser://dom and browser://text resources to understand the page structure and content. Then provide a summary of:
1. The page title and main purpose
2. Key navigation elements
3. Main content sections
4. Interactive elements (forms, buttons, links)
5. Any potential issues or notable features`,
          },
        ],
      };

    case 'fill_form':
      return {
        messages: [
          {
            role: 'user',
            content: `Fill out the form on the current page with the following data:
${JSON.stringify(args.data, null, 2)}

First, read browser://dom to identify form fields. Then use browser_type and browser_select tools to fill in each field. Finally, verify the form is correctly filled.`,
          },
        ],
      };

    case 'extract_data':
      return {
        messages: [
          {
            role: 'user',
            content: `Extract data from the current page according to this schema:
${args.schema}

Read browser://dom and browser://text to find the relevant information. Use browser_get_elements if needed to locate specific elements. Return the extracted data in JSON format.`,
          },
        ],
      };

    case 'navigate_to':
      return {
        messages: [
          {
            role: 'user',
            content: `Help me accomplish this goal: ${args.goal}

Start by reading browser://state and browser://dom to understand the current page. Then guide me through the necessary steps, using browser tools (navigate, click, type, etc.) as needed.`,
          },
        ],
      };

    default:
      return null;
  }
}

export default { prompts, getPrompt };
