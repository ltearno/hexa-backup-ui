let cache = {}
try {
    cache = JSON.parse(localStorage.getItem('play-cache'))
}
catch (err) {
}
if (!cache || !(typeof cache === 'object'))
    cache = {}

export function setPlayed(sha: string) {
    cache[sha] = true
    localStorage.setItem('play-cache', JSON.stringify(cache))
}

export function hasBeenPlayed(sha: string): boolean {
    return cache[sha] || false
}

export function clearCache() {
    cache = {}
    localStorage.setItem('play-cache', JSON.stringify(cache))
}