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

export interface DirectoryDescriptorFile {
    name: string
    isDirectory: boolean
    size: number
    lastWrite: number
    contentSha: string
}

export interface DirectoryDescriptor {
    files: DirectoryDescriptorFile[]
}

export interface SearchResult {
    directories: DirectorySearchResult[]
    files: FileDescriptor[]
    items: FileDescriptor[]
}

export const HEXA_BACKUP_BASE_URL = window.location.hostname == "home.lteconsulting.fr" ? "https://home.lteconsulting.fr" : "https://localhost:5005"

export async function search(searchText: string, mimeType: string): Promise<SearchResult> {
    try {
        let searchSpec: any = {
            name: searchText,
            mimeType: mimeType
        }

        const { resultDirectories, resultFilesddd, items } = await Network.postData(`${HEXA_BACKUP_BASE_URL}/search`, searchSpec)

        return {
            directories: resultDirectories,
            files: resultFilesddd,
            items
        }
    }
    catch (err) {
        return null
    }
}

export async function getDirectoryDescriptor(sha: string): Promise<DirectoryDescriptor> {
    return await Network.getData(`${HEXA_BACKUP_BASE_URL}/sha/${sha}/content?type=application/json`)
}

export async function getReferences(): Promise<string[]> {
    return await Network.getData(`${HEXA_BACKUP_BASE_URL}/refs`)
}

export async function getReference(name: string): Promise<{ currentCommitSha: string }> {
    return await Network.getData(`${HEXA_BACKUP_BASE_URL}/refs/${name}`)
}

export async function getCommit(sha: string): Promise<{ directoryDescriptorSha: string }> {
    return await Network.getData(`${HEXA_BACKUP_BASE_URL}/sha/${sha}/content?type=application/json`)
}

export function getShaContentUrl(sha: string, mimeType: string, name: string, isDownload: boolean) {
    let base = `${HEXA_BACKUP_BASE_URL}/sha/${sha}/content?type=${encodeURIComponent(mimeType)}`
    if (isDownload)
        base += `&fileName=${encodeURIComponent(name || sha)}`
    return base
}