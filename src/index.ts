const BASE_URL = "/public/"
const HEXA_BACKUP_BASE_URL = window.location.hostname == "home.lteconsulting.fr" ? "https://home.lteconsulting.fr" : "https://192.168.0.2:5005"
const PUBLIC_BASE_URL = "https://home.lteconsulting.fr"

const el: <T extends HTMLElement> (selector: string) => T = document.querySelector.bind(document)
const els: <T extends HTMLElement> (selector: string) => NodeListOf<T> = document.querySelectorAll.bind(document)

let EXTENDED = localStorage.getItem('EXTENDED') === 'true'
el<HTMLInputElement>('#extended').checked = EXTENDED

let STREAM_RAW_VIDEO = localStorage.getItem('STREAM_RAW_VIDEO') === 'true'
el<HTMLInputElement>('#stream-raw-video').checked = STREAM_RAW_VIDEO

let SHOW_FULL_COMMIT_HISTORY = localStorage.getItem('SHOW_FULL_COMMIT_HISTORY') === 'true'
el<HTMLInputElement>('#show-full-commit-history').checked = SHOW_FULL_COMMIT_HISTORY

let SHOW_UNLIKED_ITEMS = localStorage.getItem('SHOW_UNLIKED_ITEMS') === 'true'
el<HTMLInputElement>('#show-unliked-items').checked = SHOW_UNLIKED_ITEMS

let SORT_ORDER = localStorage.getItem('SORT_ORDER') || "name"
el<HTMLInputElement>('#display-order').value = SORT_ORDER

let currentClientId = null
let currentDirectoryDescriptorSha = null
let currentPictureIndex = -1
let currentAudioIndex = -1
let currentVideoIndex = -1
let filesPool = []
let filesShaLikeMetadata = {}
let imagesPool = []
let videosPool = []
let audioPool = []

let displayedDirectoryDescriptorSha = null
let displayedClientId = null
let displayedPictureIndex = null
let displayedExtended = EXTENDED
let displayedSortOrder = SORT_ORDER
let displayedStreamRawVideo = STREAM_RAW_VIDEO
let displayedShowFullCommitHistory = SHOW_FULL_COMMIT_HISTORY
let displayedShowUnlikedItems = SHOW_UNLIKED_ITEMS

const wait = (ms) => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve()
        }, ms)
    })
}

const DATE_DISPLAY_OPTIONS = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
}
const displayDate = date => date ? (typeof date === 'number' ? new Date(date) : date).toLocaleString('fr', DATE_DISPLAY_OPTIONS) : null

let lastPushedHistoryState = null
const publishHistoryState = () => {
    let footprint = `${currentDirectoryDescriptorSha}#${currentClientId}`
    if (currentPictureIndex >= 0)
        footprint += `-${currentPictureIndex}`

    if (footprint != lastPushedHistoryState) {
        lastPushedHistoryState = footprint
        history.pushState({ currentDirectoryDescriptorSha, currentClientId, currentPictureIndex },
            `directory ${currentDirectoryDescriptorSha}`,
            `${BASE_URL}#${currentDirectoryDescriptorSha}${currentPictureIndex >= 0 ? `-${currentPictureIndex}` : ''}`)
    }
}

async function goDirectory(directoryDescriptorSha) {
    el("#menu").classList.add("is-hidden")

    currentPictureIndex = -1
    currentDirectoryDescriptorSha = directoryDescriptorSha
    publishHistoryState()

    await syncUi()
}

async function goRef(ref) {
    el("#menu").classList.add("is-hidden")

    currentClientId = ref
    currentDirectoryDescriptorSha = await getClientDefaultDirectoryDescriptorSha(ref)
    publishHistoryState()

    await syncUi()
}

async function goPicture(index) {
    currentPictureIndex = index
    publishHistoryState()

    await syncUi()
}

async function goPreviousPicture() {
    if (currentPictureIndex <= 0)
        return

    currentPictureIndex--
    publishHistoryState()

    await syncUi()
}

async function goNextPicture() {
    if (currentPictureIndex < 0 || !imagesPool || !imagesPool.length || currentPictureIndex == imagesPool.length - 1) {
        stopSlideshow()
        return
    }

    currentPictureIndex++
    publishHistoryState()

    await syncUi()
}

async function goNoPicture() {
    currentPictureIndex = -1

    publishHistoryState()

    await syncUi()
}

function stopSlideshow() {
    if (slideshowTimer) {
        clearInterval(slideshowTimer)
        slideshowTimer = null
    }
    el('#toggle-picture-slideshow').innerText = 'Play'
}

let slideshowTimer = null
async function togglePictureSlideshow() {
    if (slideshowTimer) {
        stopSlideshow()
    }
    else {
        slideshowTimer = setInterval(goNextPicture, 5000)
        el('#toggle-picture-slideshow').innerText = 'Stop'
    }
}

let loaders = []

let startLoading = (text) => {
    const refreshLoadersHtml = () => el('#status').innerHTML = loaders.join('<br>')

    let isDisplayed = false

    let timeout = setTimeout(() => {
        loaders.push(text)
        isDisplayed = true
        refreshLoadersHtml()
    }, 500)

    return () => {
        clearTimeout(timeout)
        if (isDisplayed) {
            loaders = loaders.filter(l => l != text)
            refreshLoadersHtml()
            isDisplayed = false
        }
    }
}

async function viewDirectories(directories: { name: string; lastWrite: number; contentSha: string }[]) {
    el('#directories').innerHTML = ''

    let finishLoading = startLoading(`refreshing ${directories.length} directories...`)

    let directoriesContent = directories.sort((a, b) => {
        let sa = a.name.toLocaleLowerCase()
        let sb = b.name.toLocaleLowerCase()
        return sa.localeCompare(sb)
    })
        .map(file => {
            let htmlParents = `<a href='#' class='small' onclick='event.preventDefault() || showParents("${file.contentSha}")'>[..]</a>`

            return EXTENDED ?
                `<div><span class='small'>${displayDate(file.lastWrite)} ${file.contentSha ? file.contentSha.substr(0, 7) : '-'}</span> <a href='#' onclick='event.preventDefault() || goDirectory("${file.contentSha}")'>${file.name}</a>${htmlParents}</div>` :
                `<div><a href='${BASE_URL}#${file.contentSha}' onclick='event.preventDefault() || goDirectory("${file.contentSha}")'>${file.name}</a> ${htmlParents}</div>`
        })
    if (directoriesContent.length) {
        el('#directories').classList.remove('is-hidden')
        el('#directories').innerHTML = `<h2>Directories <small>(${directoriesContent.length})</small></h2><div id='directories-container'>${directoriesContent.join('')}</div>`
    }
    else {
        el('#directories').classList.add('is-hidden')
    }

    finishLoading()
}

function sortFiles(files) {
    const lexicalCompare = (a, b) => {
        let sa = a.fileName.toLocaleLowerCase()
        let sb = b.fileName.toLocaleLowerCase()
        return sa.localeCompare(sb)
    }

    const dateCompare = (a, b) => {
        if (a.lastWrite == b.lastWrite)
            return 0
        return a.lastWrite > b.lastWrite ? 1 : -1
    }

    const lexicalSorter = (a, b) => {
        let res = lexicalCompare(a, b)
        if (!res)
            return dateCompare(a, b)
        return res
    }

    const dateSorter = (a, b) => {
        let res = dateCompare(a, b)
        if (!res)
            return lexicalCompare(a, b)
        return res
    }

    let sorter = null
    switch (displayedSortOrder) {
        case "name":
            sorter = lexicalSorter
            break
        case "date":
            sorter = dateSorter
            break
    }

    return files.sort(sorter)
}

async function showDirectory(directoryDescriptorSha) {
    el('#directories').innerHTML = ''
    el('#files').innerHTML = ''
    el('#images').innerHTML = ''

    if (!directoryDescriptorSha)
        return

    let finishLoading = startLoading(`loading directory descriptor ${directoryDescriptorSha.substr(0, 7)}...`)
    let directoryDescriptor = await fetchDirectoryDescriptor(directoryDescriptorSha)
    finishLoading()

    if (!directoryDescriptor || !directoryDescriptor.files) {
        el('#directories').innerHTML = `error fetching ${directoryDescriptorSha}`
        return
    }

    let files = directoryDescriptor.files

    let directories = files
        .filter(file => file.isDirectory)
    viewDirectories(directories)

    let images = []
    let videos = []
    let audios = []

    filesPool = files
        .filter(file => !file.isDirectory)
        .map(file => {
            return {
                sha: file.contentSha,
                mimeType: getMimeType(file.name),
                fileName: file.name,
                lastWrite: file.lastWrite * 1,
                size: file.size * 1
            }
        })

    filesPool = sortFiles(filesPool)

    await loadLikesFiles()

    filesPool.forEach(file => {
        if (file.mimeType.startsWith('image/'))
            images.push(file)

        if (file.mimeType.startsWith('video/'))
            videos.push(file)

        if (file.mimeType.startsWith('audio/'))
            audios.push(file)
    })

    currentAudioIndex = -1
    audioPool = audios

    await restartFilePool()

    await wait(1)

    imagesPool = images
    await restartImagesPool()

    currentVideoIndex = -1
    videosPool = videos
}

const maxImagesSeen = 100
const imagesStep = 100

let infiniteScrollerStop = null

function getMimeType(fileName) {
    let pos = fileName.lastIndexOf('.')
    if (pos >= 0) {
        let extension = fileName.substr(pos + 1).toLocaleLowerCase()
        if (extension in MimeTypes)
            return MimeTypes[extension]
    }

    return 'application/octet-stream'
}

async function restartFilePool() {
    el('#video-player').classList.add('is-hidden')

    let audioIndex = 0
    let videoIndex = 0
    let filesContent = ''

    let currentPrefix = ''

    let finishLoading = startLoading(`refreshing ${filesPool.length} files...`)

    for (let index = 0; index < filesPool.length; index++) {
        const file = filesPool[index]

        /*if (index < filesPool.length - 1) {
            let pl = findPrefix(filesPool[index].fileName, filesPool[index + 1].fileName)
            let maybeNewPrefix = filesPool[index].fileName.substr(0, pl)

            if (maybeNewPrefix != currentPrefix && (!maybeNewPrefix.match(/^[0-9]+$/)) && (!currentPrefix.length || !maybeNewPrefix.startsWith(currentPrefix))) {
                currentPrefix = maybeNewPrefix
                filesContent += `<div><b>${currentPrefix.trim()}</b></div>`
            }
        }*/

        let mimeTypes = ['application/octet-stream']
        if (file.mimeType != 'application/octet-stream')
            mimeTypes.push(file.mimeType)

        let links = mimeTypes.map((mimeType, index) => `[<a href='${HEXA_BACKUP_BASE_URL}/sha/${file.sha}/content?type=${mimeType}${index == 0 ? `&fileName=${file.fileName}` : ''}' >${EXTENDED ? mimeType : (index == 0 ? 'dl' : (mimeType.indexOf('/') ? mimeType.substr(mimeType.indexOf('/') + 1) : mimeType))}</a>]`).join(' ')

        let htmlPrefix = ''
        let html = ''
        let classes = []
        let action = 'false'

        if (file.mimeType.startsWith('audio/')) {
            classes.push(`audio-${audioIndex}`)
            action = `listenAudio(${audioIndex})`
            htmlPrefix = `<a href='#' onclick='event.preventDefault() || listenAudio(${audioIndex})'>🎶 ▶</a> `

            audioIndex++
        }
        else if (file.mimeType.startsWith('video/')) {
            classes.push(`video-${videoIndex}`)
            action = `showVideo(${videoIndex})`
            htmlPrefix = `<a href='#' onclick='event.preventDefault() || showVideo(${videoIndex})'>🎞️ ▶</a> `

            videoIndex++
        }

        let likeHtml = `<a class='like' onclick='event.preventDefault() || toggleLikeFile(${index})'>like ♡</a>`
        let htmlParents = `<a href='#' onclick='event.preventDefault() || showParents("${file.sha}")'>[..]</a>`

        if (EXTENDED) {
            let date = `<span class='small'>${displayDate(file.lastWrite)} ${file.sha ? file.sha.substr(0, 7) : '-'}</span>`
            html = `${date} <a href='#' onclick='event.preventDefault() || ${action}'>${file.fileName}</a> <span class='small'>${file.size} ${links} ${htmlParents} ${likeHtml}</span>`
        }
        else {
            let displayedName: string = file.fileName.substr(currentPrefix.length)
            if (action != 'false') {
                let ie = displayedName.lastIndexOf('.')
                if (ie)
                    displayedName = displayedName.substr(0, ie)
            }
            html = `<a href='#' onclick='event.preventDefault() || ${action}'>${displayedName}</a> <span class='small'>${htmlParents} ${likeHtml}</span>`

            if (displayedSortOrder == 'date') {
                let date = `<span class='small'>${displayDate(file.lastWrite)}</span>`
                html = date + ' ' + html
            }
        }

        filesContent += `<div id='file-${index}' class='${classes.join(' ')}'>${htmlPrefix}${html}</div>`

        if (index % 200 == 199)
            await wait(15)
    }

    if (filesContent.length) {
        el('#files').classList.remove('is-hidden')
        el('#files').innerHTML = `<h2>Files <small>(${filesPool.length})</small></h2><div id="files-container">${filesContent}</div> `
    }
    else {
        el('#files').classList.add('is-hidden')
    }

    await viewLikesFiles()

    finishLoading()
}

async function loadLikesFiles() {
    let allShas = [...new Set(filesPool.map(f => f.sha))]

    filesShaLikeMetadata = {}
    const BATCH_SIZE = 20
    let startIndex = 0
    while (startIndex < allShas.length) {
        let batchSize = Math.min(BATCH_SIZE, allShas.length - startIndex)
        let partResults = await (await fetch(`${HEXA_BACKUP_BASE_URL}/metadata/likes-sha?q=${JSON.stringify({
            shaList: allShas.slice(startIndex, startIndex + batchSize)
        })}`)).json()

        startIndex += batchSize

        if (!partResults)
            continue

        Object.getOwnPropertyNames(partResults).forEach(sha => filesShaLikeMetadata[sha] = partResults[sha])
    }
}

async function viewLikesFiles() {
    for (let i in filesPool) {
        let file = filesPool[i]
        let metadata = filesShaLikeMetadata[file.sha]
        if (metadata && metadata.status)
            el(`#file-${i}`).classList.add('liked')
    }
}

async function viewLikedFiles(likes) {
    if (!likes)
        return

    filesPool = likes.map(like => {
        return {
            sha: like.sha,
            fileName: like.value.knownAs.fileName,
            mimeType: like.value.knownAs.mimeType,

            size: 0,
        }
    })

    await loadLikesFiles()

    await restartFilePool()
}

async function getShaNames(sha: string, statusCb: () => any) {
    let resp = await fetch(`${HEXA_BACKUP_BASE_URL}/names/${sha}`)
    let names = await resp.json()

    statusCb()

    return names || []
}

async function getShaParentsHtml(sha: string, statusCb: () => any) {
    let resp = await fetch(`${HEXA_BACKUP_BASE_URL}/parents/${sha}`)
    let parents = await resp.json()

    statusCb()

    if (!parents || !parents.length)
        return ''

    let res = []
    for (let parentSha of parents) {
        res.push(`<li><a href='#' onclick='event.preventDefault() || goDirectory("${parentSha}")'><span class='small'>${parentSha.substr(0, 7)}</span> ${(await getShaNames(parentSha, statusCb)).join(' / ')}</a> <a href='#' class='small' onclick='event.preventDefault() || showParents("${parentSha}")'>[..]</a> ${await getShaParentsHtml(parentSha, statusCb)}</li>`)
    }

    return `<ul>${res.join('')}</ul>`
}

async function showParents(sha: string) {
    let itemsLoaded = 0
    let statusCb = () => {
        itemsLoaded++
        el('#parents').innerHTML = `<h2>Parents of ${sha.substr(0, 7)}</h2>loaded ${itemsLoaded} items...</ul>`
    }

    el('#parents').innerHTML = `<h2>Parents of ${sha.substr(0, 7)}</h2>loading...</ul>`
    el('#parents').innerHTML = `<h2>Parents of <span class='small'>${sha.substr(0, 7)}</span> ${(await getShaNames(sha, statusCb)).join(' / ')}</h2>${await getShaParentsHtml(sha, statusCb)}</ul>`
}


async function toggleLikeFile(index) {
    if (!filesPool || index < 0 || index >= filesPool.length)
        return

    let file = filesPool[index]

    let status = await toggleShaLike(file.sha, file.mimeType, file.fileName)

    if (status)
        el(`#file-${index}`).classList.add('liked')
    else
        el(`#file-${index}`).classList.remove('liked')
}




async function restartImagesPool() {
    if (infiniteScrollerStop) {
        infiniteScrollerStop()
        infiniteScrollerStop = null
    }

    if (imagesPool.length) {
        el('#images-container').classList.remove('is-hidden')
        el('#images').innerHTML = ''
        infiniteScrollerStop = infiniteScroll(imagesPool,
            ({ sha, mimeType, fileName }, index) => `<div><img loading="lazy" onclick='goPicture(${index})' src="${HEXA_BACKUP_BASE_URL}/sha/${sha}/plugins/image/thumbnail?type=${mimeType}"/></div>`,
            el('#images-container'),
            el('#images'))
    }
    else {
        el('#images-container').classList.add('is-hidden')
        el('#images').innerHTML = ''
        // <a href='/sha/${sha}/content?type=${mimeType}'></a>
    }
}

async function showVideo(index) {
    els(".playing").forEach(e => (e as HTMLElement).classList.remove("playing"))
    if (index < 0 || index >= videosPool.length)
        return

    el('#video-player').classList.remove('is-hidden')

    currentVideoIndex = index
    let { sha, mimeType, fileName } = videosPool[index]
    el('#video-player').setAttribute('src', STREAM_RAW_VIDEO ? `${HEXA_BACKUP_BASE_URL}/sha/${sha}/content?type=${mimeType}` : `${HEXA_BACKUP_BASE_URL}/sha/${sha}/plugins/video/small?type=${mimeType}`)
    el('#video-player').setAttribute('type', mimeType)
    el<HTMLAudioElement>('#video-player').play()

    el(`.video-${index}`).style.fontWeight = 'bold'
    el(`.video-${index}`).classList.add('playing')
}

async function showNextVideo() {
    showVideo(currentVideoIndex + 1)
}

async function viewLikedVideos(likes) {
    if (!likes)
        likes = []

    videosPool = likes.map(like => {
        return {
            sha: like.sha,
            fileName: like.value.knownAs.fileName,
            mimeType: like.value.knownAs.mimeType
        }
    })
}

async function listenAudio(index) {
    els(".playing").forEach(e => (e as HTMLElement).classList.remove("playing"))
    el("#audio-player").classList.remove("is-hidden")

    if (index < 0 || index >= audioPool.length)
        return

    currentAudioIndex = index
    let { sha, mimeType, fileName } = audioPool[index]
    el('#audio-player').setAttribute('src', `${HEXA_BACKUP_BASE_URL}/sha/${sha}/content?type=${mimeType}`)
    el('#audio-player').setAttribute('type', mimeType)
    el<HTMLAudioElement>('#audio-player').play()

    el(`.audio-${index}`).style.fontWeight = 'bold'
    el(`.audio-${index}`).classList.add('playing')
}

async function toggleShaLike(sha: string, mimeType: string, fileName: string) {
    let metadata = filesShaLikeMetadata[sha]
    if (!metadata) {
        metadata = {
            dates: [Date.now()],
            status: false,
            knownAs: { mimeType, fileName, currentClientId, currentDirectoryDescriptorSha }
        }
    }

    metadata.status = !metadata.status
    if (!metadata.dates)
        metadata.dates = [Date.now()]
    else
        metadata.dates.push(Date.now())

    filesShaLikeMetadata[sha] = metadata

    // we are optimistic, we do not wait for server's response !
    const headers = new Headers()
    headers.set('Content-Type', 'application/json')
    fetch(`${HEXA_BACKUP_BASE_URL}/metadata/likes-sha/${sha}`, {
        headers,
        method: 'post',
        body: JSON.stringify(metadata)
    })

    return metadata.status
}

async function listenNext() {
    listenAudio(currentAudioIndex + 1)
}

async function listenToLiked(likes) {
    if (!likes)
        likes = []

    audioPool = likes.map(like => {
        return {
            sha: like.sha,
            fileName: like.value.knownAs.fileName,
            mimeType: like.value.knownAs.mimeType
        }
    })
}

function findPrefix(s1: string, s2: string) {
    for (let i = 0; i < s1.length && i < s2.length; i++) {
        if (s1.charCodeAt(i) !== s2.charCodeAt(i))
            return i
    }

    return Math.min(s1.length, s2.length)
}

async function showPicture(index) {
    el('#image-full-aligner').innerHTML = ''
    if (index < 0)
        return
    let { sha, mimeType, fileName } = imagesPool[index]
    let displayedUrl = displayedStreamRawVideo ? `${HEXA_BACKUP_BASE_URL}/sha/${sha}/content?type=${mimeType}` : `${HEXA_BACKUP_BASE_URL}/sha/${sha}/plugins/image/medium?type=${mimeType}`
    el('#image-full-aligner').innerHTML += `<a style='width:100%;height:100%;display:flex;align-items:center;justify-content: center;' href='${HEXA_BACKUP_BASE_URL}/sha/${sha}/content?type=${mimeType}'><img loading="lazy" class='image-full' src='${displayedUrl}'/></a>`
}

async function getClientDefaultDirectoryDescriptorSha(ref) {
    if (!ref)
        return null

    let clientState = await (await fetch(`${HEXA_BACKUP_BASE_URL}/refs/${ref}`)).json()
    if (!clientState)
        return null

    let commitSha = clientState.currentCommitSha
    if (commitSha == null)
        return null

    let finishLoading = startLoading(`loading commit ${commitSha.substr(0, 7)}...`)

    let commit = await fetchCommit(commitSha)

    finishLoading()

    if (!commit)
        return null

    return commit.directoryDescriptorSha
}

async function showRef(ref) {
    el('#refName').innerText = ref || ''
    el('#commitHistory').innerHTML = ''

    if (!ref)
        return null

    let clientState = await (await fetch(`${HEXA_BACKUP_BASE_URL}/refs/${ref}`)).json()
    if (!clientState)
        return null

    let commitSha = clientState.currentCommitSha
    let firstDirectoryDescriptorSha = null

    let finishLoading = startLoading(`loading commit history...`)

    while (commitSha != null) {
        let commit = await fetchCommit(commitSha)
        if (!commit)
            break

        let date = new Date(commit.commitDate)
        let directoryDescriptorSha = commit.directoryDescriptorSha
        if (directoryDescriptorSha) {
            if (!firstDirectoryDescriptorSha)
                firstDirectoryDescriptorSha = directoryDescriptorSha
            el('#commitHistory').innerHTML += `<div>${commitSha.substr(0, 7)} ${displayDate(date)} - <a href='#' onclick='event.preventDefault() || goDirectory("${directoryDescriptorSha}")'>${directoryDescriptorSha.substr(0, 7)}</a></div>`
        } else {
            el('#commitHistory').innerHTML += `<div>${commitSha.substr(0, 7)} no directory descriptor in commit !</div>`
        }

        if (!SHOW_FULL_COMMIT_HISTORY)
            break

        commitSha = commit.parentSha
    }

    finishLoading()

    return firstDirectoryDescriptorSha
}

async function fetchCommit(sha) {
    let mimeType = 'text/json'
    let content = await fetch(`${HEXA_BACKUP_BASE_URL}/sha/${sha}/content?type=${mimeType}`)
    return await content.json()
}

async function fetchDirectoryDescriptor(sha) {
    let mimeType = 'text/json'
    let content = await fetch(`${HEXA_BACKUP_BASE_URL}/sha/${sha}/content?type=${mimeType}`)
    return await content.json()
}

function infiniteScroll(db, domCreator, scrollContainer, scrollContent) {
    let nextElementToInsert = 0
    let poolSize = 5
    let stopped = false
    let waitContinueResolver = null

    async function run() {
        if (!db || !db.length)
            return

        const shouldAdd = () => scrollContent.lastChild.offsetTop - (scrollContainer.offsetHeight / 1) <= scrollContainer.scrollTop + scrollContainer.offsetHeight

        const scrollListener = event => {
            if (waitContinueResolver && shouldAdd()) {
                let r = waitContinueResolver
                waitContinueResolver = null
                r()
            }
        }
        scrollContainer.addEventListener('scroll', scrollListener)

        stopped = false
        while (!stopped) {
            if (nextElementToInsert >= db.length)
                break

            let index = nextElementToInsert++
            let elem = db[index]

            scrollContent.innerHTML += domCreator(elem, index)

            if (nextElementToInsert % poolSize == 0) {
                await wait(150)

                if (!shouldAdd())
                    await new Promise(resolve => waitContinueResolver = resolve)
            }
        }

        scrollContainer.removeEventListener('scroll', scrollListener)
    }

    function stop() {
        stopped = true
        if (waitContinueResolver) {
            waitContinueResolver()
            waitContinueResolver = null
        }
    }

    run()

    return stop
}

declare let L: any;
let geoSearchBox = null

var mymap = L.map('mapid').setView([47.14378830236092, 2.2063121440860023], 4)
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoibHRlYXJubyIsImEiOiJjanY5ZXJqb2UwbzlyNGVtanpwMWRjMWJoIn0.vNNsUQ_cnIDfBLU3QHsuGQ'
}).addTo(mymap);

let mapCb = (event) => {
    let bounds = mymap.getBounds()
    let nw = bounds.getNorthWest()
    let se = bounds.getSouthEast()

    geoSearchBox = {
        nw: { lat: nw.lat, lng: nw.lng },
        se: { lat: se.lat, lng: se.lng }
    }
}

mymap.on('zoom', mapCb)
mymap.on('move', mapCb)

let markersToRemove = []

async function submitSearch() {
    el("#menu").classList.add("is-hidden")

    const searchText = el<HTMLInputElement>('#search-text').value || ''

    let finishLoading = startLoading(`searching '${searchText}'...`)

    markersToRemove.forEach(marker => marker.remove())
    markersToRemove = []

    try {
        let searchSpec: any = {
            name: searchText,
            mimeType: el<HTMLInputElement>('#search-mimeType').value + '%'
        }

        if (geoSearchBox) {
            searchSpec.geoSearch = geoSearchBox
        }

        let searchDate = el<HTMLInputElement>('#search-date').value || null
        if (searchDate) {
            let interval = (parseInt(el<HTMLInputElement>('#search-date-day-interval').value || '0')) * 1000 * 60 * 60 * 24
            searchSpec.dateMin = new Date(searchDate).getTime() - interval
            searchSpec.dateMax = new Date(searchDate).getTime() + interval
        }

        const headers = new Headers()
        headers.set('Content-Type', 'application/json')
        const resp = await fetch(`${HEXA_BACKUP_BASE_URL}/search`, {
            headers,
            method: 'post',
            body: JSON.stringify(searchSpec)
        })
        const respJson = await resp.json()
        let { resultDirectories, resultFilesddd } = respJson

        // TODO manage liked directories
        el('#directories').classList.add('is-hidden')
        el('#video-player').classList.add('is-hidden')
        el('#images-container').classList.add('is-hidden')

        await viewDirectories(resultDirectories.map(i => ({
            name: i.name,
            lastWrite: 0,
            contentSha: i.sha
        })))

        filesPool = resultFilesddd.map(i => ({
            sha: i.sha,
            fileName: i.name,
            mimeType: i.mimeType,
            size: i.size * 1,
            lastWrite: i.lastWrite * 1
        }))
        filesPool = sortFiles(filesPool)
        imagesPool = filesPool.filter(i => i.mimeType.startsWith('image/'))
        audioPool = filesPool.filter(i => i.mimeType.startsWith('audio/'))
        videosPool = filesPool.filter(i => i.mimeType.startsWith('video/'))
        await loadLikesFiles()
        await restartFilePool()
        await restartImagesPool()

        if (geoSearchBox && !el('#extSearch').classList.contains('is-hidden')) {
            resultFilesddd.forEach(file => {
                if (file.lat && file.lng) {
                    let marker = L.marker([file.lat, file.lng])
                    marker.addTo(mymap)
                    markersToRemove.push(marker)
                }
            })
        }

        if (searchSpec.mimeType.startsWith('image')) {
            el('html').scrollTop = 1000000
        }
    }
    catch (err) {
        console.error(err)
    }

    finishLoading()

    return false
}

window.addEventListener('load', async () => {
    let resp = await fetch(`${HEXA_BACKUP_BASE_URL}/refs`)
    let refs = (await resp.json()).filter(e => e.startsWith('CLIENT_')).map(e => e.substr(7))
    el('#refs-list').innerHTML = refs.map(ref => `<div><a href='#' onclick='event.preventDefault() || goRef("${ref}")'>${ref}</a></div>`).join('')

    let user = await fetch(`${PUBLIC_BASE_URL}/well-known/v1/me`)
    el('#userId').innerText = (await user.json()).uuid
})

el('#fullScreen').addEventListener('click', event => {
    event.preventDefault();
    (el('body') as any).webkitRequestFullScreen()
})

el('#extended').addEventListener('change', () => {
    EXTENDED = !!el<HTMLInputElement>('#extended').checked
    localStorage.setItem('EXTENDED', `${EXTENDED}`)

    syncUi()
})

el('#stream-raw-video').addEventListener('change', () => {
    STREAM_RAW_VIDEO = !!el<HTMLInputElement>('#stream-raw-video').checked
    localStorage.setItem('STREAM_RAW_VIDEO', `${STREAM_RAW_VIDEO}`)

    syncUi()
})

el('#show-unliked-items').addEventListener('change', () => {
    SHOW_UNLIKED_ITEMS = !!el<HTMLInputElement>('#show-unliked-items').checked
    localStorage.setItem('SHOW_UNLIKED_ITEMS', `${SHOW_UNLIKED_ITEMS}`)

    syncUi()
})

el('#show-full-commit-history').addEventListener('change', () => {
    SHOW_FULL_COMMIT_HISTORY = !!el<HTMLInputElement>('#show-full-commit-history').checked
    localStorage.setItem('SHOW_FULL_COMMIT_HISTORY', `${SHOW_FULL_COMMIT_HISTORY}`)

    syncUi()
})

el('#display-order').addEventListener('change', () => {
    syncUi()
})

el('#audio-player').addEventListener('ended', () => {
    listenNext()
})

el('#video-player').addEventListener('ended', () => {
    showNextVideo()
})

el('#toggleExtSearch').addEventListener('click', e => {
    el('#extSearch').classList.toggle('is-hidden')
    mymap.invalidateSize(true)
    e.preventDefault()
    refreshBannerPlaceholderSize()
})

window.onpopstate = function (event) {
    if (event.state) {
        currentDirectoryDescriptorSha = event.state.currentDirectoryDescriptorSha
        currentClientId = event.state.currentClientId
        currentPictureIndex = event.state.currentPictureIndex || 0

        if (!currentClientId)
            el("#menu").classList.remove("is-hidden")

        syncUi()
    }
    else {
        fromHash()

        syncUi()
    }
}

if (history.state) {
    currentDirectoryDescriptorSha = history.state.currentDirectoryDescriptorSha
    currentClientId = history.state.currentClientId
    currentPictureIndex = history.state.currentPictureIndex || 0

    if (currentClientId)
        el("#menu").classList.add("is-hidden")

    syncUi()
}
else {
    fromHash()

    publishHistoryState()

    syncUi()
}

function fromHash() {
    if (window.location.hash && window.location.hash.startsWith('#') && window.location.hash != '#null' && window.location.hash != '#undefined') {
        currentDirectoryDescriptorSha = window.location.hash.substr(1)
        currentClientId = null

        currentPictureIndex = -1
        let dashIndex = currentDirectoryDescriptorSha.indexOf('-')
        if (dashIndex >= 0) {
            currentPictureIndex = parseInt(currentDirectoryDescriptorSha.substr(dashIndex + 1))
            currentDirectoryDescriptorSha = currentDirectoryDescriptorSha.substr(0, dashIndex)
        }

        el("#menu").classList.add("is-hidden")
    }
}

async function viewLikes() {
    el("#menu").classList.add("is-hidden")

    let likes = await (await fetch(`${HEXA_BACKUP_BASE_URL}/metadata/likes-sha`)).json()
    if (!likes)
        likes = {}

    // TODO manage liked directories
    el('#directories').classList.add('is-hidden')
    el('#video-player').classList.add('is-hidden')
    // TODO manage liked images
    el('#images-container').classList.add('is-hidden')

    let likesArray = Object.getOwnPropertyNames(likes).map(sha => ({ sha, value: likes[sha] }))

    if (!SHOW_UNLIKED_ITEMS)
        likesArray = likesArray.filter(like => like.value.status)

    await viewLikedFiles(likesArray)
    await listenToLiked(likesArray.filter(like => like.value.knownAs.mimeType.startsWith('audio/')))
    await viewLikedVideos(likesArray.filter(like => like.value.knownAs.mimeType.startsWith('video/')))
}

function refreshBannerPlaceholderSize() {
    setTimeout(() => {
        el('#banner-placeholder').style.height = `${el('#banner').offsetHeight}px`
    }, 5)
}

async function syncUi() {
    if (currentPictureIndex < 0) {
        el('#image-full-container').classList.add('is-hidden')
        el('#images-container').classList.remove('is-hidden')
        el('#banner').classList.remove('is-hidden')
        el('#main').classList.remove('is-hidden')
    }
    else {
        el('#image-full-container').classList.remove('is-hidden')
        el('#images-container').classList.add('is-hidden')
        el('#banner').classList.add('is-hidden')
        el('#main').classList.add('is-hidden')
    }

    const orderChange = displayedSortOrder != el<HTMLInputElement>('#display-order').value
    displayedSortOrder = el<HTMLInputElement>('#display-order').value
    localStorage.setItem('SORT_ORDER', `${displayedSortOrder}`)

    const extChange = displayedExtended != EXTENDED
    displayedExtended = EXTENDED

    const streamRawVideoChange = displayedStreamRawVideo != STREAM_RAW_VIDEO
    displayedStreamRawVideo = STREAM_RAW_VIDEO

    const fullHistoryChange = displayedShowFullCommitHistory != SHOW_FULL_COMMIT_HISTORY
    displayedShowFullCommitHistory = SHOW_FULL_COMMIT_HISTORY

    const showUnlikedItemsChange = displayedShowUnlikedItems != SHOW_UNLIKED_ITEMS
    displayedShowUnlikedItems = SHOW_UNLIKED_ITEMS

    if (showUnlikedItemsChange || streamRawVideoChange || extChange || orderChange || currentDirectoryDescriptorSha != displayedDirectoryDescriptorSha)
        await showDirectory(currentDirectoryDescriptorSha)

    if (showUnlikedItemsChange || extChange || fullHistoryChange || currentClientId != displayedClientId)
        await showRef(currentClientId)

    el('#video-player').classList.add('is-hidden')

    if (!imagesPool.length)
        el('#images-container').classList.add('is-hidden')

    if (currentPictureIndex != displayedPictureIndex)
        await showPicture(currentPictureIndex)

    displayedDirectoryDescriptorSha = currentDirectoryDescriptorSha
    displayedClientId = currentClientId
    displayedPictureIndex = currentPictureIndex

    refreshBannerPlaceholderSize()
}