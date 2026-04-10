"use strict";
// Settings Types
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_SETTINGS = void 0;
exports.DEFAULT_SETTINGS = {
    general: {
        startPage: 'https://www.google.com',
        searchEngine: 'google',
        language: 'fr',
        downloadPath: '~/Downloads',
    },
    appearance: {
        theme: 'dark',
        customThemePath: null,
        showAIPanel: true,
        aiPanelPosition: 'right',
        aiPanelWidth: 350,
    },
    security: {
        mcpAuth: {
            enabled: true,
            type: 'token',
            allowedApps: ['claude-code', 'codex-cli', 'gemini-cli'],
            requireApproval: false,
        },
        dataSharing: {
            shareScreenshots: true,
            shareDOM: true,
            shareCookies: false,
            sharePasswords: false,
        },
    },
    privacy: {
        doNotTrack: true,
        clearDataOnExit: false,
        blockThirdPartyCookies: true,
    },
    advanced: {
        mcpPort: 9222,
        enableDevTools: true,
        hardwareAcceleration: true,
        proxy: {
            enabled: false,
            type: 'http',
            host: '',
            port: 8080,
        },
    },
};
//# sourceMappingURL=settings.js.map