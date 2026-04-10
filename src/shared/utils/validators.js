"use strict";
// Input validation utilities
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidUrl = isValidUrl;
exports.normalizeUrl = normalizeUrl;
exports.isValidSelector = isValidSelector;
exports.isValidPort = isValidPort;
exports.sanitizeHtml = sanitizeHtml;
exports.truncateText = truncateText;
exports.validateTabId = validateTabId;
exports.validateCoordinates = validateCoordinates;
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
}
function normalizeUrl(input) {
    const trimmed = input.trim();
    // Already a valid URL
    if (isValidUrl(trimmed)) {
        return trimmed;
    }
    // Looks like a URL without protocol
    if (/^[\w-]+\.[\w.-]+/.test(trimmed)) {
        return `https://${trimmed}`;
    }
    // Treat as search query
    return '';
}
function isValidSelector(selector) {
    try {
        document.querySelector(selector);
        return true;
    }
    catch {
        return false;
    }
}
function isValidPort(port) {
    return Number.isInteger(port) && port >= 1 && port <= 65535;
}
function sanitizeHtml(html) {
    return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<!--[\s\S]*?-->/g, '');
}
function truncateText(text, maxLength) {
    if (text.length <= maxLength)
        return text;
    return text.slice(0, maxLength - 3) + '...';
}
function validateTabId(tabId) {
    return typeof tabId === 'string' && tabId.length > 0;
}
function validateCoordinates(coords) {
    return (typeof coords === 'object' &&
        coords !== null &&
        typeof coords.x === 'number' &&
        typeof coords.y === 'number');
}
//# sourceMappingURL=validators.js.map