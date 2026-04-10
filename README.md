# Eaight

An AI-native web browser that exposes a full Model Context Protocol (MCP) server, letting Claude Code, Codex CLI, and Gemini CLI see and control the browser in real time.

## What it does

Eaight is a Chromium-based desktop browser built for AI-assisted workflows. It works like any browser for daily use, but runs a built-in MCP server that gives AI tools direct access to the page:

- **18 browser automation tools**: navigate, click, type, scroll, screenshot, extract elements, execute JavaScript — all available as MCP tools
- **9 live resources**: DOM, text content, accessibility tree, network logs, console output, cookies, screenshots — streamed to the AI in real time
- **5 interaction prompts**: pre-built templates for page analysis, form filling, data extraction, and navigation
- **Multi-transport**: WebSocket and SSE transports run simultaneously for maximum compatibility
- **Auto-discovery**: Claude Code detects the browser automatically via a discovery file — no manual configuration needed

### Beyond automation

- Tab management with groups
- Chrome extension support (install from Chrome Web Store)
- Prompt library with GitHub sync
- Custom new tab page with 3D animation
- Light/dark/system themes
- Security controls for MCP data sharing (screenshots, DOM, cookies — each toggleable)

## Built with

- **Desktop**: [Electron](https://www.electronjs.org/) 28 + TypeScript
- **Frontend**: React 18 + [Zustand](https://zustand-demo.pmnd.rs/) + Tailwind CSS
- **MCP**: [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol) 1.0.4
- **AI SDKs**: [@anthropic-ai/sdk](https://github.com/anthropics/anthropic-sdk-typescript) 0.32.1
- **Graphics**: [Three.js](https://threejs.org/) (new tab page animation)
- **Build**: Vite + electron-builder

## Architecture

```
Claude Code / Codex / Gemini CLI
         │
         │ JSON-RPC (stdio or WebSocket)
         ▼
┌─────────────────────────────────┐
│  MCP Server (port 9222)         │
│                                 │
│  ┌───────────┐  ┌────────────┐  │
│  │ 18 Tools  │  │ 9 Resources│  │
│  │ navigate  │  │ dom        │  │
│  │ click     │  │ text       │  │
│  │ type      │  │ screenshot │  │
│  │ scroll    │  │ a11y tree  │  │
│  │ screenshot│  │ network    │  │
│  │ ...       │  │ console    │  │
│  └─────┬─────┘  └─────┬──────┘  │
│        │              │          │
│        ▼              ▼          │
│  ┌─────────────────────────┐    │
│  │  Tab Manager            │    │
│  │  (Electron BrowserView) │    │
│  └─────────────────────────┘    │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  React UI                       │
│  Tab Bar │ URL Bar │ AI Panel   │
│  Bookmarks │ Settings           │
└─────────────────────────────────┘
```

The MCP server runs inside the Electron main process with direct access to BrowserViews. A stdio bridge (`mcp-stdio-bridge.ts`) translates between Claude Code's stdio protocol and the internal WebSocket, so Claude Code can connect without network configuration.

Auto-discovery writes connection info to `%APPDATA%/eaight/mcp-server.json`, which Claude Code reads to find the browser.

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) (to use the MCP integration)

### Installation

```bash
npm install
npm run dev
```

The MCP server starts automatically on port 9222. Claude Code detects it via auto-discovery.

### CLI

Control the browser from the command line:

```bash
node eaight-cli.js nav https://example.com
node eaight-cli.js text          # extract page text
node eaight-cli.js screenshot    # capture screenshot
node eaight-cli.js click "button.submit"
```

### Configuration

Settings are available in the browser UI (gear icon):

- **AI Settings**: MCP server port, authentication mode
- **Security**: control what data is shared with AI (screenshots, DOM, cookies)
- **Appearance**: theme, AI panel position

## License

[MIT](LICENSE)
