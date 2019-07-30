import * as Network from './network'


export interface DirectorySearchResult {
    name: string
    sha: string
}

export interface FileDescriptor {
    sha: string
    name: string
    mimeType: string
    size: number
    lastWrite: number
}

export interface SearchResult {
    directories: DirectorySearchResult[]
    files: FileDescriptor[]
}

export const HEXA_BACKUP_BASE_URL = window.location.hostname == "home.lteconsulting.fr" ? "https://home.lteconsulting.fr" : "https://localhost:5005"

export async function search(searchText: string, mimeType: string): Promise<SearchResult> {
    try {
        let searchSpec: any = {
            name: searchText,
            mimeType: mimeType
        }

        const { resultDirectories, resultFilesddd } = await Network.postData(`${HEXA_BACKUP_BASE_URL}/search`, searchSpec)

        return {
            directories: resultDirectories,
            files: resultFilesddd
        }
    }
    catch (err) {
        return null
    }
}