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

// by default serves on the same host
export const HEXA_BACKUP_BASE_URL = `https://${window.location.host}`

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

export async function searchEx(searchSpec: any): Promise<SearchResult> {
    try {
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

export interface JobDescriptor {
    clientName: string
    id: string
    name: string
}

export interface JobsResponse {
    running: JobDescriptor
    waiting: JobDescriptor[]
}

export async function getJobs(): Promise<JobsResponse> {
    return await Network.getData(`${HEXA_BACKUP_BASE_URL}/jobs`)
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

export async function getShaInfo(sha: string): Promise<{
    sha: string
    names: string[]
    mimeTypes: string[]
    writeDates: number[]
    sizes: number[]
    parents: string[]
    sources: string[]
    exifs: any[]
    audioMetadata: any[]
}> {
    return await Network.getData(`${HEXA_BACKUP_BASE_URL}/sha/${sha}/info`)
}

export async function enqueueYoutubeDownload(youtubeUrl: string) {
    Network.postData(`${HEXA_BACKUP_BASE_URL}/plugins/youtube/fetch`, { url: youtubeUrl })
}

export function getShaContentUrl(sha: string, mimeType: string, name: string, withPhantom: boolean, isDownload: boolean) {
    if (!sha)
        return '#'

    let base = withPhantom ?
        `${HEXA_BACKUP_BASE_URL}/sha/${sha}/content/${encodeURIComponent(name)}?type=${encodeURIComponent(mimeType)}` :
        `${HEXA_BACKUP_BASE_URL}/sha/${sha}/content?type=${encodeURIComponent(mimeType)}`

    if (isDownload)
        base += `&fileName=${encodeURIComponent(name || sha)}`
    return base
}

export function getShaImageThumbnailUrl(sha: string, mimeType: string) {
    return `${HEXA_BACKUP_BASE_URL}/sha/${sha}/plugins/image/thumbnail?type=${mimeType}`
}

export function getShaImageMediumThumbnailUrl(sha: string, mimeType: string) {
    return `${HEXA_BACKUP_BASE_URL}/sha/${sha}/plugins/image/medium?type=${mimeType}`
}

export async function getPlaylists(): Promise<string[]> {
    return Network.getData(`${HEXA_BACKUP_BASE_URL}/plugins/playlists`)
}

export async function putItemToPlaylist(playlistName: string, sha: string, mimeType: string, name: string): Promise<any> {
    let payload = {
        items: [
            {
                name,
                date: Date.now(),
                isDirectory: mimeType == 'application/directory',
                mimeType,
                sha
            }
        ]
    }

    return await Network.putData(`${HEXA_BACKUP_BASE_URL}/plugins/playlists/${playlistName}`, payload)
}