import * as Rest from './rest'

export function getDirectoryUrl(sha: string, name: string, currentTerm: string) {
    const url = `#/directories/${sha}?name=${encodeURIComponent(currentTerm ? (currentTerm + '/' + name) : name)}`
    window.location.href = url
}

export function goShaInfo(item: Rest.FileDescriptor) {
    window.location.href = `#/info/${encodeURIComponent(JSON.stringify(item))}`
}