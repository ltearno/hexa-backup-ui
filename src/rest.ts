export async function search(searchText: string, mimeType: string) {
    try {
        let searchSpec: any = {
            name: searchText,
            mimeType: mimeType
        }

        const headers = new Headers()
        headers.set('Content-Type', 'application/json')
        const resp = await fetch(`${HEXA_BACKUP_BASE_URL}/search`, {
            headers,
            method: 'post',
            body: JSON.stringify(searchSpec)
        })
        const { resultDirectories, resultFilesddd } = await resp.json()

        return {
            directories: resultDirectories as { name: string; sha: string }[],
            files: resultFilesddd as { sha: string; fileName: string; mimeType: string; size: number; lastWrite: number }[]
        }
    }
    catch (err) {
        return null
    }
}