import * as Rest from './rest'

export function goShaInfo(item: Rest.FileDescriptor) {
    window.location.href = `#/info/${encodeURIComponent(JSON.stringify(item))}`
}