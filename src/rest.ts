import * as Network from './network'

export const HEXA_BACKUP_BASE_URL = window.location.hostname == "home.lteconsulting.fr" ? "https://home.lteconsulting.fr" : "https://localhost:5005"

export async function search(searchText: string, mimeType: string) {
    try {
        let searchSpec: any = {
            name: searchText,
            mimeType: mimeType
        }

        const { resultDirectories, resultFilesddd } = await Network.postData(`${HEXA_BACKUP_BASE_URL}/search`, searchSpec)

        return {
            directories: resultDirectories as { name: string; sha: string }[],
            files: resultFilesddd as { sha: string; name: string; mimeType: string; size: number; lastWrite: number }[]
        }
    }
    catch (err) {
        return null
    }
}