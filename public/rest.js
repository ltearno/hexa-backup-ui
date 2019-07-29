"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function search(searchText, mimeType) {
    try {
        let searchSpec = {
            name: searchText,
            mimeType: mimeType
        };
        const headers = new Headers();
        headers.set('Content-Type', 'application/json');
        const resp = await fetch(`${HEXA_BACKUP_BASE_URL}/search`, {
            headers,
            method: 'post',
            body: JSON.stringify(searchSpec)
        });
        const { resultDirectories, resultFilesddd } = await resp.json();
        return {
            directories: resultDirectories,
            files: resultFilesddd
        };
    }
    catch (err) {
        return null;
    }
}
exports.search = search;
//# sourceMappingURL=rest.js.map