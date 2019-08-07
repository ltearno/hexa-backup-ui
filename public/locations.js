"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getDirectoryUrl(sha, name, currentTerm) {
    const url = `#/directories/${sha}?name=${encodeURIComponent(currentTerm ? (currentTerm + '/' + name) : name)}`;
    window.location.href = url;
}
exports.getDirectoryUrl = getDirectoryUrl;
function goShaInfo(item) {
    window.location.href = `#/info/${encodeURIComponent(JSON.stringify(item))}`;
}
exports.goShaInfo = goShaInfo;
//# sourceMappingURL=locations.js.map