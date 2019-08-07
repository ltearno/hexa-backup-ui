import * as Rest from './rest'

export function getDirectoryUrl(sha: string, name: string, currentTerm: string) {
    return `#/directories/${sha}?name=${encodeURIComponent(currentTerm ? (currentTerm + '/' + name) : name)}`
}

export function getReferenceUrl(name: string) {
    return `#/refs/${name}`
}

export function getPlaylistUrl(name: string) {
    return `#/playlists/${name}`
}


export function goShaInfo(item: Rest.FileDescriptor) {
    window.location.href = `#/info/${encodeURIComponent(JSON.stringify(item))}`
}

export function goSearchItems(term: string) {
    const url = `#/search/${term}`
    window.location.href = url
}

export function goReference(name: string) {
    window.location.href = getReferenceUrl(name)
}

export function goPlaylist(name: string) {
    window.location.href = getPlaylistUrl(name)
}