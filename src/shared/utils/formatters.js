"use strict";
// Formatting utilities
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatBytes = formatBytes;
exports.formatDuration = formatDuration;
exports.formatTimestamp = formatTimestamp;
exports.formatUrl = formatUrl;
exports.extractDomain = extractDomain;
exports.formatTabTitle = formatTabTitle;
exports.generateId = generateId;
function formatBytes(bytes) {
    if (bytes === 0)
        return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
function formatDuration(ms) {
    if (ms < 1000)
        return `${ms}ms`;
    if (ms < 60000)
        return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}
function formatTimestamp(timestamp) {
    return new Date(timestamp).toISOString();
}
function formatUrl(url, maxLength = 50) {
    if (url.length <= maxLength)
        return url;
    try {
        const parsed = new URL(url);
        const host = parsed.hostname;
        const path = parsed.pathname;
        const remaining = maxLength - host.length - 3;
        if (remaining > 10) {
            return `${host}${path.slice(0, remaining)}...`;
        }
        return `${host.slice(0, maxLength - 3)}...`;
    }
    catch {
        return url.slice(0, maxLength - 3) + '...';
    }
}
function extractDomain(url) {
    try {
        return new URL(url).hostname;
    }
    catch {
        return url;
    }
}
function formatTabTitle(title, maxLength = 30) {
    if (!title)
        return 'New Tab';
    if (title.length <= maxLength)
        return title;
    return title.slice(0, maxLength - 3) + '...';
}
function generateId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
//# sourceMappingURL=formatters.js.map