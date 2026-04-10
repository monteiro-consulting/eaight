# eaight MCP API Reference

This document describes the Model Context Protocol (MCP) API exposed by eaight browser.

## Connection

eaight exposes an MCP server via WebSocket at:
```
ws://localhost:9222/mcp
```

Fallback ports: `9223`, `9224` if the primary port is in use.

### Auto-Discovery

The server publishes its connection info at:
- **Windows**: `%APPDATA%\eaight\mcp-server.json`
- **macOS/Linux**: `~/.eaight/mcp-server.json`

Example discovery file:
```json
{
  "name": "eaight",
  "version": "0.1.0",
  "protocol": "mcp",
  "transport": "websocket",
  "endpoint": "ws://localhost:9222/mcp",
  "pid": 12345,
  "startedAt": "2024-01-15T10:30:00Z",
  "capabilities": ["resources", "tools", "prompts"]
}
```

---

## Resources

Resources provide read-only access to browser state and content.

### browser://state

Current browser state including active tab, URL, and navigation status.

| Property | Type | Description |
|----------|------|-------------|
| `mimeType` | `application/json` | |

**Response:**
```json
{
  "activeTab": {
    "id": "tab-123",
    "url": "https://example.com",
    "title": "Example Domain"
  },
  "tabs": [...],
  "canGoBack": true,
  "canGoForward": false,
  "isLoading": false
}
```

---

### browser://dom

Simplified HTML DOM of the current page (scripts and styles removed).

| Property | Type | Description |
|----------|------|-------------|
| `mimeType` | `text/html` | |

**Response:** Simplified HTML string

---

### browser://text

Plain text content of the current page.

| Property | Type | Description |
|----------|------|-------------|
| `mimeType` | `text/plain` | |

**Response:** Text content string

---

### browser://screenshot

Screenshot of the current page as base64-encoded PNG.

| Property | Type | Description |
|----------|------|-------------|
| `mimeType` | `image/png` | |

**Response:** Base64-encoded PNG data

---

### browser://accessibility

Accessibility tree of the current page for screen reader view.

| Property | Type | Description |
|----------|------|-------------|
| `mimeType` | `application/json` | |

**Response:**
```json
{
  "role": "document",
  "name": "Example Domain",
  "children": [
    {
      "role": "heading",
      "name": "Welcome",
      "level": 1
    }
  ]
}
```

---

### browser://network

Recent network requests and responses.

| Property | Type | Description |
|----------|------|-------------|
| `mimeType` | `application/json` | |

**Response:**
```json
{
  "requests": [
    {
      "url": "https://example.com/api",
      "method": "GET",
      "status": 200,
      "timestamp": 1705312200000
    }
  ]
}
```

---

### browser://console

JavaScript console output from the current page.

| Property | Type | Description |
|----------|------|-------------|
| `mimeType` | `application/json` | |

**Response:**
```json
{
  "logs": [
    {
      "level": "log",
      "message": "Hello World",
      "timestamp": 1705312200000
    }
  ]
}
```

---

### browser://cookies

Cookies for the current domain (requires authorization).

| Property | Type | Description |
|----------|------|-------------|
| `mimeType` | `application/json` | |

**Response:**
```json
{
  "cookies": [
    {
      "name": "session",
      "value": "abc123",
      "domain": "example.com"
    }
  ]
}
```

---

### browser://tabs

List of all open tabs.

| Property | Type | Description |
|----------|------|-------------|
| `mimeType` | `application/json` | |

**Response:**
```json
{
  "tabs": [
    {
      "id": "tab-123",
      "url": "https://example.com",
      "title": "Example Domain",
      "isActive": true
    }
  ]
}
```

---

## Tools

Tools allow AI clients to interact with and control the browser.

### Navigation Tools

#### browser_navigate

Navigate to a URL in the current tab.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `url` | string | Yes | URL to navigate to |

**Example:**
```json
{
  "name": "browser_navigate",
  "arguments": {
    "url": "https://example.com"
  }
}
```

---

#### browser_back

Go back in browser history.

**Parameters:** None

---

#### browser_forward

Go forward in browser history.

**Parameters:** None

---

#### browser_reload

Reload the current page.

**Parameters:** None

---

### Tab Management Tools

#### browser_new_tab

Open a new tab.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `url` | string | No | URL to open (defaults to blank page) |

**Example:**
```json
{
  "name": "browser_new_tab",
  "arguments": {
    "url": "https://example.com"
  }
}
```

---

#### browser_close_tab

Close a tab.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `tabId` | string | No | Tab ID to close (current tab if omitted) |

---

#### browser_switch_tab

Switch to a specific tab.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `tabId` | string | Yes | Tab ID to switch to |

---

### Interaction Tools

#### browser_click

Click on an element.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `selector` | string | No* | CSS selector of element to click |
| `text` | string | No* | Text content to find and click |
| `coordinates` | object | No* | `{x, y}` coordinates to click |

*At least one of `selector`, `text`, or `coordinates` is required.

**Examples:**
```json
{
  "name": "browser_click",
  "arguments": {
    "selector": "#submit-button"
  }
}
```

```json
{
  "name": "browser_click",
  "arguments": {
    "text": "Sign In"
  }
}
```

```json
{
  "name": "browser_click",
  "arguments": {
    "coordinates": { "x": 100, "y": 200 }
  }
}
```

---

#### browser_type

Type text into an input field.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `selector` | string | Yes | CSS selector of input element |
| `text` | string | Yes | Text to type |
| `clear` | boolean | No | Clear field before typing (default: true) |
| `pressEnter` | boolean | No | Press Enter after typing (default: false) |

**Example:**
```json
{
  "name": "browser_type",
  "arguments": {
    "selector": "#search-input",
    "text": "hello world",
    "pressEnter": true
  }
}
```

---

#### browser_scroll

Scroll the page or an element.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `direction` | string | Yes | Direction: "up", "down", "left", "right" |
| `amount` | number | No | Pixels to scroll (default: 500) |
| `selector` | string | No | Element to scroll (page if omitted) |

**Example:**
```json
{
  "name": "browser_scroll",
  "arguments": {
    "direction": "down",
    "amount": 1000
  }
}
```

---

#### browser_hover

Hover over an element.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `selector` | string | Yes | CSS selector of element |

---

#### browser_select

Select an option from a dropdown.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `selector` | string | Yes | CSS selector of select element |
| `value` | string | Yes | Value to select |

---

### JavaScript Execution

#### browser_execute_js

Execute JavaScript code in the page context.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `code` | string | Yes | JavaScript code to execute |

**Example:**
```json
{
  "name": "browser_execute_js",
  "arguments": {
    "code": "document.title"
  }
}
```

**Response:**
```json
{
  "result": "Example Domain"
}
```

---

### Extraction Tools

#### browser_get_elements

Get information about elements matching a selector.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `selector` | string | Yes | CSS selector |
| `attributes` | string[] | No | Attributes to extract (default: id, class, text, href) |
| `limit` | number | No | Max elements to return (default: 50) |

**Example:**
```json
{
  "name": "browser_get_elements",
  "arguments": {
    "selector": "a",
    "attributes": ["href", "text"],
    "limit": 10
  }
}
```

**Response:**
```json
{
  "elements": [
    {
      "href": "https://example.com/link",
      "text": "Example Link",
      "rect": { "x": 10, "y": 20, "width": 100, "height": 20 }
    }
  ]
}
```

---

#### browser_get_attribute

Get a specific attribute from an element.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `selector` | string | Yes | CSS selector |
| `attribute` | string | Yes | Attribute name |

---

### Wait Tools

#### browser_wait

Wait for a condition.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `type` | string | Yes | Wait type: "selector", "navigation", "timeout" |
| `value` | string | No | Selector or timeout in ms |
| `timeout` | number | No | Max wait time in ms (default: 30000) |

**Examples:**
```json
{
  "name": "browser_wait",
  "arguments": {
    "type": "selector",
    "value": "#loaded-content",
    "timeout": 5000
  }
}
```

```json
{
  "name": "browser_wait",
  "arguments": {
    "type": "timeout",
    "value": "2000"
  }
}
```

---

### Capture Tools

#### browser_screenshot

Take a screenshot.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `fullPage` | boolean | No | Capture full page (default: false) |
| `selector` | string | No | Capture specific element only |
| `includeUI` | boolean | No | Include browser UI (default: false) |

**Response:**
```json
{
  "data": "base64-encoded-png...",
  "width": 1280,
  "height": 800
}
```

---

## Prompts

Prompts are templates for common AI interactions.

### analyze_page

Analyze the current page structure and content.

**Arguments:** None

**Returns:** Structured analysis of the page including headings, links, forms, and interactive elements.

---

### fill_form

Fill out a form on the current page.

**Arguments:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `data` | object | Yes | JSON object with field names and values |

**Example:**
```json
{
  "name": "fill_form",
  "arguments": {
    "data": {
      "username": "john@example.com",
      "password": "secret123"
    }
  }
}
```

---

### extract_data

Extract structured data from the page.

**Arguments:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `schema` | object | Yes | JSON schema describing data to extract |

**Example:**
```json
{
  "name": "extract_data",
  "arguments": {
    "schema": {
      "type": "object",
      "properties": {
        "products": {
          "type": "array",
          "items": {
            "name": "string",
            "price": "number"
          }
        }
      }
    }
  }
}
```

---

### navigate_to

Navigate to accomplish a goal.

**Arguments:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `goal` | string | Yes | What the user wants to accomplish |

**Example:**
```json
{
  "name": "navigate_to",
  "arguments": {
    "goal": "Find the contact page and get the support email"
  }
}
```

---

## Error Codes

| Code | Name | Description |
|------|------|-------------|
| `NAV_ERROR` | Navigation Error | Failed to navigate to URL |
| `NAV_TIMEOUT` | Navigation Timeout | Navigation took too long |
| `TAB_NOT_FOUND` | Tab Not Found | Specified tab ID does not exist |
| `ELEMENT_NOT_FOUND` | Element Not Found | CSS selector matched no elements |
| `JS_EXECUTION_ERROR` | JS Error | JavaScript execution failed |
| `MCP_AUTH_FAILED` | Auth Failed | Authentication token is invalid |
| `PERMISSION_DENIED` | Permission Denied | Action not allowed |

---

## Protocol Version

eaight implements MCP version `2024-11-05`.

For more information about the MCP protocol, see the [official documentation](https://modelcontextprotocol.io/).
