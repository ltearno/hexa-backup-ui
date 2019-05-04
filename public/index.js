const BASE_URL = "/public/";
const HEXA_BACKUP_BASE_URL = window.location.hostname == "home.lteconsulting.fr" ? "https://home.lteconsulting.fr" : "https://192.168.0.2:5005";
const PUBLIC_BASE_URL = "https://home.lteconsulting.fr";
const el = document.querySelector.bind(document);
const els = document.querySelectorAll.bind(document);
let EXTENDED = localStorage.getItem('EXTENDED') === 'true';
el('#extended').checked = EXTENDED;
let STREAM_RAW_VIDEO = localStorage.getItem('STREAM_RAW_VIDEO') === 'true';
el('#stream-raw-video').checked = STREAM_RAW_VIDEO;
let SHOW_FULL_COMMIT_HISTORY = localStorage.getItem('SHOW_FULL_COMMIT_HISTORY') === 'true';
el('#show-full-commit-history').checked = SHOW_FULL_COMMIT_HISTORY;
let SHOW_UNLIKED_ITEMS = localStorage.getItem('SHOW_UNLIKED_ITEMS') === 'true';
el('#show-unliked-items').checked = SHOW_UNLIKED_ITEMS;
let SORT_ORDER = localStorage.getItem('SORT_ORDER') || "name";
el('#display-order').value = SORT_ORDER;
let currentClientId = null;
let currentDirectoryDescriptorSha = null;
let currentPictureIndex = -1;
let currentAudioIndex = -1;
let currentVideoIndex = -1;
let filesPool = [];
let filesShaLikeMetadata = {};
let imagesPool = [];
let videosPool = [];
let audioPool = [];
let displayedDirectoryDescriptorSha = null;
let displayedClientId = null;
let displayedPictureIndex = null;
let displayedExtended = EXTENDED;
let displayedSortOrder = SORT_ORDER;
let displayedStreamRawVideo = STREAM_RAW_VIDEO;
let displayedShowFullCommitHistory = SHOW_FULL_COMMIT_HISTORY;
let displayedShowUnlikedItems = SHOW_UNLIKED_ITEMS;
const wait = (ms) => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
};
const DATE_DISPLAY_OPTIONS = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
};
const displayDate = date => date ? (typeof date === 'number' ? new Date(date) : date).toLocaleString('fr', DATE_DISPLAY_OPTIONS) : null;
let lastPushedHistoryState = null;
const publishHistoryState = () => {
    let footprint = `${currentDirectoryDescriptorSha}#${currentClientId}`;
    if (currentPictureIndex >= 0)
        footprint += `-${currentPictureIndex}`;
    if (footprint != lastPushedHistoryState) {
        lastPushedHistoryState = footprint;
        history.pushState({ currentDirectoryDescriptorSha, currentClientId, currentPictureIndex }, `directory ${currentDirectoryDescriptorSha}`, `${BASE_URL}#${currentDirectoryDescriptorSha}${currentPictureIndex >= 0 ? `-${currentPictureIndex}` : ''}`);
    }
};
async function goDirectory(directoryDescriptorSha) {
    el("#menu").classList.add("is-hidden");
    currentPictureIndex = -1;
    currentDirectoryDescriptorSha = directoryDescriptorSha;
    publishHistoryState();
    await syncUi();
}
async function goRef(ref) {
    el("#menu").classList.add("is-hidden");
    currentClientId = ref;
    currentDirectoryDescriptorSha = await getClientDefaultDirectoryDescriptorSha(ref);
    publishHistoryState();
    await syncUi();
}
async function goPicture(index) {
    currentPictureIndex = index;
    publishHistoryState();
    await syncUi();
}
async function goPreviousPicture() {
    if (currentPictureIndex <= 0)
        return;
    currentPictureIndex--;
    publishHistoryState();
    await syncUi();
}
async function goNextPicture() {
    if (currentPictureIndex < 0 || !imagesPool || !imagesPool.length || currentPictureIndex == imagesPool.length - 1)
        return;
    currentPictureIndex++;
    publishHistoryState();
    await syncUi();
}
async function goNoPicture() {
    currentPictureIndex = -1;
    publishHistoryState();
    await syncUi();
}
let loaders = [];
let startLoading = (text) => {
    const refreshLoadersHtml = () => el('#status').innerHTML = loaders.join('<br>');
    let isDisplayed = false;
    let timeout = setTimeout(() => {
        loaders.push(text);
        isDisplayed = true;
        refreshLoadersHtml();
    }, 500);
    return () => {
        clearTimeout(timeout);
        if (isDisplayed) {
            loaders = loaders.filter(l => l != text);
            refreshLoadersHtml();
            isDisplayed = false;
        }
    };
};
async function viewDirectories(directories) {
    el('#directories').innerHTML = '';
    let finishLoading = startLoading(`refreshing ${directories.length} directories...`);
    let directoriesContent = directories.sort((a, b) => {
        let sa = a.name.toLocaleLowerCase();
        let sb = b.name.toLocaleLowerCase();
        return sa.localeCompare(sb);
    })
        .map(file => EXTENDED ?
        `<div><span class='small'>${displayDate(file.lastWrite)} ${file.contentSha ? file.contentSha.substr(0, 7) : '-'}</span> <a href='#' onclick='event.preventDefault() || goDirectory("${file.contentSha}")'>${file.name}</a></div>` :
        `<div><a href='${BASE_URL}#${file.contentSha}' onclick='event.preventDefault() || goDirectory("${file.contentSha}")'>${file.name}</a></div>`);
    if (directoriesContent.length) {
        el('#directories').classList.remove('is-hidden');
        el('#directories').innerHTML = `<h2>Directories <small>(${directoriesContent.length})</small></h2><div id='directories-container'>${directoriesContent.join('')}</div>`;
    }
    else {
        el('#directories').classList.add('is-hidden');
    }
    finishLoading();
}
async function showDirectory(directoryDescriptorSha) {
    el('#directories').innerHTML = '';
    el('#files').innerHTML = '';
    el('#images').innerHTML = '';
    if (!directoryDescriptorSha)
        return;
    let finishLoading = startLoading(`loading directory descriptor ${directoryDescriptorSha.substr(0, 7)}...`);
    let directoryDescriptor = await fetchDirectoryDescriptor(directoryDescriptorSha);
    finishLoading();
    if (!directoryDescriptor || !directoryDescriptor.files) {
        el('#directories').innerHTML = `error fetching ${directoryDescriptorSha}`;
        return;
    }
    let files = directoryDescriptor.files;
    let directories = files
        .filter(file => file.isDirectory);
    viewDirectories(directories);
    let images = [];
    let videos = [];
    let audios = [];
    const lexicalSorter = (a, b) => {
        let sa = a.name.toLocaleLowerCase();
        let sb = b.name.toLocaleLowerCase();
        let res = sa.localeCompare(sb);
        if (!res)
            return dateSorter(a, b);
        return res;
    };
    const dateSorter = (a, b) => {
        if (a.lastWrite == b.lastWrite)
            return lexicalSorter(a, b);
        return a.lastWrite > b.lastWrite ? 1 : -1;
    };
    let sorter = null;
    switch (displayedSortOrder) {
        case "name":
            sorter = lexicalSorter;
            break;
        case "date":
            sorter = dateSorter;
            break;
    }
    filesPool = files
        .filter(file => !file.isDirectory)
        .sort(sorter)
        .map((file, index) => {
        return {
            sha: file.contentSha,
            mimeType: getMimeType(file.name),
            fileName: file.name,
            lastWrite: file.lastWrite,
            size: file.size
        };
    });
    await loadLikesFiles();
    filesPool.forEach(file => {
        if (file.mimeType.startsWith('image/'))
            images.push(file);
        if (file.mimeType.startsWith('video/'))
            videos.push(file);
        if (file.mimeType.startsWith('audio/'))
            audios.push(file);
    });
    currentAudioIndex = -1;
    audioPool = audios;
    await restartFilePool();
    await wait(1);
    imagesPool = images;
    await restartImagesPool();
    currentVideoIndex = -1;
    videosPool = videos;
}
const maxImagesSeen = 100;
const imagesStep = 100;
let infiniteScrollerStop = null;
function getMimeType(fileName) {
    let pos = fileName.lastIndexOf('.');
    if (pos >= 0) {
        let extension = fileName.substr(pos + 1).toLocaleLowerCase();
        if (extension in MimeTypes)
            return MimeTypes[extension];
    }
    return 'application/octet-stream';
}
async function restartFilePool() {
    el('#video-player').classList.add('is-hidden');
    let audioIndex = 0;
    let videoIndex = 0;
    let filesContent = '';
    let currentPrefix = '';
    let finishLoading = startLoading(`refreshing ${filesPool.length} files...`);
    for (let index = 0; index < filesPool.length; index++) {
        const file = filesPool[index];
        /*if (index < filesPool.length - 1) {
            let pl = findPrefix(filesPool[index].fileName, filesPool[index + 1].fileName)
            let maybeNewPrefix = filesPool[index].fileName.substr(0, pl)

            if (maybeNewPrefix != currentPrefix && (!maybeNewPrefix.match(/^[0-9]+$/)) && (!currentPrefix.length || !maybeNewPrefix.startsWith(currentPrefix))) {
                currentPrefix = maybeNewPrefix
                filesContent += `<div><b>${currentPrefix.trim()}</b></div>`
            }
        }*/
        let mimeTypes = ['application/octet-stream'];
        if (file.mimeType != 'application/octet-stream')
            mimeTypes.push(file.mimeType);
        let links = mimeTypes.map((mimeType, index) => `[<a href='${HEXA_BACKUP_BASE_URL}/sha/${file.sha}/content?type=${mimeType}${index == 0 ? `&fileName=${file.fileName}` : ''}' >${EXTENDED ? mimeType : (index == 0 ? 'dl' : (mimeType.indexOf('/') ? mimeType.substr(mimeType.indexOf('/') + 1) : mimeType))}</a>]`).join(' ');
        let htmlPrefix = '';
        let html = '';
        let classes = [];
        let action = 'false';
        if (file.mimeType.startsWith('audio/')) {
            classes.push(`audio-${audioIndex}`);
            action = `listenAudio(${audioIndex})`;
            htmlPrefix = `<a href='#' onclick='event.preventDefault() || listenAudio(${audioIndex})'>🎶 ▶</a> `;
            audioIndex++;
        }
        else if (file.mimeType.startsWith('video/')) {
            classes.push(`video-${videoIndex}`);
            action = `showVideo(${videoIndex})`;
            htmlPrefix = `<a href='#' onclick='event.preventDefault() || showVideo(${videoIndex})'>🎞️ ▶</a> `;
            videoIndex++;
        }
        let likeHtml = `<a class='like' onclick='event.preventDefault() || toggleLikeFile(${index})'>like ♡</a>`;
        if (EXTENDED) {
            let date = `<span class='small'>${displayDate(file.lastWrite)} ${file.sha ? file.sha.substr(0, 7) : '-'}</span>`;
            html = `${date} <a href='#' onclick='event.preventDefault() || ${action}'>${file.fileName}</a> <span class='small'>${file.size} ${links}</span>`;
        }
        else {
            let displayedName = file.fileName.substr(currentPrefix.length);
            if (action != 'false') {
                let ie = displayedName.lastIndexOf('.');
                if (ie)
                    displayedName = displayedName.substr(0, ie);
            }
            html = `<a href='#' onclick='event.preventDefault() || ${action}'>${displayedName}</a> <span class='small'>${likeHtml}</span>`;
            if (displayedSortOrder == 'date') {
                let date = `<span class='small'>${displayDate(file.lastWrite)}</span>`;
                html = date + ' ' + html;
            }
        }
        filesContent += `<div id='file-${index}' class='${classes.join(' ')}'>${htmlPrefix}${html}</div>`;
        if (index % 200 == 199)
            await wait(15);
    }
    if (filesContent.length) {
        el('#files').classList.remove('is-hidden');
        el('#files').innerHTML = `<h2>Files <small>(${filesPool.length})</small></h2><div id="files-container">${filesContent}</div> `;
    }
    else {
        el('#files').classList.add('is-hidden');
    }
    await viewLikesFiles();
    finishLoading();
}
async function loadLikesFiles() {
    let allShas = [...new Set(filesPool.map(f => f.sha))];
    filesShaLikeMetadata = {};
    const BATCH_SIZE = 20;
    let startIndex = 0;
    while (startIndex < allShas.length) {
        let batchSize = Math.min(BATCH_SIZE, allShas.length - startIndex);
        let partResults = await (await fetch(`${HEXA_BACKUP_BASE_URL}/metadata/likes-sha?q=${JSON.stringify({
            shaList: allShas.slice(startIndex, startIndex + batchSize)
        })}`)).json();
        startIndex += batchSize;
        if (!partResults)
            continue;
        Object.getOwnPropertyNames(partResults).forEach(sha => filesShaLikeMetadata[sha] = partResults[sha]);
    }
}
async function viewLikesFiles() {
    for (let i in filesPool) {
        let file = filesPool[i];
        let metadata = filesShaLikeMetadata[file.sha];
        if (metadata && metadata.status)
            el(`#file-${i}`).classList.add('liked');
    }
}
async function viewLikedFiles(likes) {
    if (!likes)
        return;
    filesPool = likes.map(like => {
        return {
            sha: like.sha,
            fileName: like.value.knownAs.fileName,
            mimeType: like.value.knownAs.mimeType,
            size: 0,
        };
    });
    await loadLikesFiles();
    await restartFilePool();
}
async function toggleLikeFile(index) {
    if (index < 0 || index >= filesPool.length)
        return;
    let file = filesPool[index];
    let status = await toggleShaLike(file.sha, file.mimeType, file.fileName);
    if (status)
        el(`#file-${index}`).classList.add('liked');
    else
        el(`#file-${index}`).classList.remove('liked');
}
async function restartImagesPool() {
    if (infiniteScrollerStop) {
        infiniteScrollerStop();
        infiniteScrollerStop = null;
    }
    if (imagesPool.length) {
        el('#images-container').classList.remove('is-hidden');
        el('#images').innerHTML = '';
        infiniteScrollerStop = infiniteScroll(imagesPool, ({ sha, mimeType, fileName }, index) => `<div><img loading="lazy" onclick='goPicture(${index})' src="${HEXA_BACKUP_BASE_URL}/sha/${sha}/plugins/image/thumbnail?type=${mimeType}"/></div>`, el('#images-container'), el('#images'));
    }
    else {
        el('#images-container').classList.add('is-hidden');
        el('#images').innerHTML = '';
        // <a href='/sha/${sha}/content?type=${mimeType}'></a>
    }
}
async function showVideo(index) {
    els(".playing").forEach(e => e.classList.remove("playing"));
    if (index < 0 || index >= videosPool.length)
        return;
    el('#video-player').classList.remove('is-hidden');
    currentVideoIndex = index;
    let { sha, mimeType, fileName } = videosPool[index];
    el('#video-player').setAttribute('src', STREAM_RAW_VIDEO ? `${HEXA_BACKUP_BASE_URL}/sha/${sha}/content?type=${mimeType}` : `${HEXA_BACKUP_BASE_URL}/sha/${sha}/plugins/video/small?type=${mimeType}`);
    el('#video-player').setAttribute('type', mimeType);
    el('#video-player').play();
    el(`.video-${index}`).style.fontWeight = 'bold';
    el(`.video-${index}`).classList.add('playing');
}
async function showNextVideo() {
    showVideo(currentVideoIndex + 1);
}
async function viewLikedVideos(likes) {
    if (!likes)
        likes = [];
    videosPool = likes.map(like => {
        return {
            sha: like.sha,
            fileName: like.value.knownAs.fileName,
            mimeType: like.value.knownAs.mimeType
        };
    });
}
async function listenAudio(index) {
    els(".playing").forEach(e => e.classList.remove("playing"));
    el("#audio-player").classList.remove("is-hidden");
    if (index < 0 || index >= audioPool.length)
        return;
    currentAudioIndex = index;
    let { sha, mimeType, fileName } = audioPool[index];
    el('#audio-player').setAttribute('src', `${HEXA_BACKUP_BASE_URL}/sha/${sha}/content?type=${mimeType}`);
    el('#audio-player').setAttribute('type', mimeType);
    el('#audio-player').play();
    el(`.audio-${index}`).style.fontWeight = 'bold';
    el(`.audio-${index}`).classList.add('playing');
}
async function toggleShaLike(sha, mimeType, fileName) {
    let metadata = filesShaLikeMetadata[sha];
    if (!metadata) {
        metadata = {
            dates: [Date.now()],
            status: false,
            knownAs: { mimeType, fileName, currentClientId, currentDirectoryDescriptorSha }
        };
    }
    metadata.status = !metadata.status;
    if (!metadata.dates)
        metadata.dates = [Date.now()];
    else
        metadata.dates.push(Date.now());
    filesShaLikeMetadata[sha] = metadata;
    // we are optimistic, we do not wait for server's response !
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    fetch(`${HEXA_BACKUP_BASE_URL}/metadata/likes-sha/${sha}`, {
        headers,
        method: 'post',
        body: JSON.stringify(metadata)
    });
    return metadata.status;
}
async function listenNext() {
    listenAudio(currentAudioIndex + 1);
}
async function listenToLiked(likes) {
    if (!likes)
        likes = [];
    audioPool = likes.map(like => {
        return {
            sha: like.sha,
            fileName: like.value.knownAs.fileName,
            mimeType: like.value.knownAs.mimeType
        };
    });
}
function findPrefix(s1, s2) {
    for (let i = 0; i < s1.length && i < s2.length; i++) {
        if (s1.charCodeAt(i) !== s2.charCodeAt(i))
            return i;
    }
    return Math.min(s1.length, s2.length);
}
async function showPicture(index) {
    el('#image-full-aligner').innerHTML = '';
    if (index < 0)
        return;
    let { sha, mimeType, fileName } = imagesPool[index];
    let displayedUrl = displayedStreamRawVideo ? `${HEXA_BACKUP_BASE_URL}/sha/${sha}/content?type=${mimeType}` : `${HEXA_BACKUP_BASE_URL}/sha/${sha}/plugins/image/medium?type=${mimeType}`;
    el('#image-full-aligner').innerHTML += `<a style='width:100%;height:100%;display:flex;align-items:center;justify-content: center;' href='${HEXA_BACKUP_BASE_URL}/sha/${sha}/content?type=${mimeType}'><img loading="lazy" class='image-full' src='${displayedUrl}'/></a>`;
}
async function getClientDefaultDirectoryDescriptorSha(ref) {
    if (!ref)
        return null;
    let clientState = await (await fetch(`${HEXA_BACKUP_BASE_URL}/refs/${ref}`)).json();
    if (!clientState)
        return null;
    let commitSha = clientState.currentCommitSha;
    if (commitSha == null)
        return null;
    let finishLoading = startLoading(`loading commit ${commitSha.substr(0, 7)}...`);
    let commit = await fetchCommit(commitSha);
    finishLoading();
    if (!commit)
        return null;
    return commit.directoryDescriptorSha;
}
async function showRef(ref) {
    el('#refName').innerText = ref || '';
    el('#commitHistory').innerHTML = '';
    if (!ref)
        return null;
    let clientState = await (await fetch(`${HEXA_BACKUP_BASE_URL}/refs/${ref}`)).json();
    if (!clientState)
        return null;
    let commitSha = clientState.currentCommitSha;
    let firstDirectoryDescriptorSha = null;
    let finishLoading = startLoading(`loading commit history...`);
    while (commitSha != null) {
        let commit = await fetchCommit(commitSha);
        if (!commit)
            break;
        let date = new Date(commit.commitDate);
        let directoryDescriptorSha = commit.directoryDescriptorSha;
        if (directoryDescriptorSha) {
            if (!firstDirectoryDescriptorSha)
                firstDirectoryDescriptorSha = directoryDescriptorSha;
            el('#commitHistory').innerHTML += `<div>${commitSha.substr(0, 7)} ${displayDate(date)} - <a href='#' onclick='event.preventDefault() || goDirectory("${directoryDescriptorSha}")'>${directoryDescriptorSha.substr(0, 7)}</a></div>`;
        }
        else {
            el('#commitHistory').innerHTML += `<div>${commitSha.substr(0, 7)} no directory descriptor in commit !</div>`;
        }
        if (!SHOW_FULL_COMMIT_HISTORY)
            break;
        commitSha = commit.parentSha;
    }
    finishLoading();
    return firstDirectoryDescriptorSha;
}
async function fetchCommit(sha) {
    let mimeType = 'text/json';
    let content = await fetch(`${HEXA_BACKUP_BASE_URL}/sha/${sha}/content?type=${mimeType}`);
    return await content.json();
}
async function fetchDirectoryDescriptor(sha) {
    let mimeType = 'text/json';
    let content = await fetch(`${HEXA_BACKUP_BASE_URL}/sha/${sha}/content?type=${mimeType}`);
    return await content.json();
}
function infiniteScroll(db, domCreator, scrollContainer, scrollContent) {
    let nextElementToInsert = 0;
    let poolSize = 5;
    let stopped = false;
    let waitContinueResolver = null;
    async function run() {
        if (!db || !db.length)
            return;
        const shouldAdd = () => scrollContent.lastChild.offsetTop - (scrollContainer.offsetHeight / 1) <= scrollContainer.scrollTop + scrollContainer.offsetHeight;
        const scrollListener = event => {
            if (waitContinueResolver && shouldAdd()) {
                let r = waitContinueResolver;
                waitContinueResolver = null;
                r();
            }
        };
        scrollContainer.addEventListener('scroll', scrollListener);
        stopped = false;
        while (!stopped) {
            if (nextElementToInsert >= db.length)
                break;
            let index = nextElementToInsert++;
            let elem = db[index];
            scrollContent.innerHTML += domCreator(elem, index);
            if (nextElementToInsert % poolSize == 0) {
                await wait(150);
                if (!shouldAdd())
                    await new Promise(resolve => waitContinueResolver = resolve);
            }
        }
        scrollContainer.removeEventListener('scroll', scrollListener);
    }
    function stop() {
        stopped = true;
        if (waitContinueResolver) {
            waitContinueResolver();
            waitContinueResolver = null;
        }
    }
    run();
    return stop;
}
async function submitSearch() {
    el("#menu").classList.add("is-hidden");
    const searchText = el('#search-text').value || '';
    let finishLoading = startLoading(`searching '${searchText}'...`);
    try {
        let coords = {
            barthe: [43.63, 1.44],
            rangueil: [43.577350, 1.452790],
            prairie: [(43.573736 + 43.572459) / 2, (1.456811 + 1.458816) / 2],
            mansac: [45.065374, 1.236009]
        };
        const headers = new Headers();
        headers.set('Content-Type', 'application/json');
        const resp = await fetch(`${HEXA_BACKUP_BASE_URL}/search`, {
            headers,
            method: 'post',
            body: JSON.stringify({
                name: searchText,
                mimeType: el('#search-mimeType').value + '%',
                geoSearch: {
                    latitude: coords.rangueil[0],
                    longitude: coords.rangueil[1],
                    zoom: Math.abs(43.573736 - 43.572459) / 2
                }
            })
        });
        const respJson = await resp.json();
        let { resultDirectories, resultFilesddd } = respJson;
        // TODO manage liked directories
        el('#directories').classList.add('is-hidden');
        el('#video-player').classList.add('is-hidden');
        el('#images-container').classList.add('is-hidden');
        await viewDirectories(resultDirectories.map(i => ({
            name: i.name,
            lastWrite: 0,
            contentSha: i.sha
        })));
        filesPool = resultFilesddd.map(i => ({
            sha: i.sha,
            fileName: i.name,
            mimeType: i.mimeType,
            size: 0
        }));
        imagesPool = filesPool.filter(i => i.mimeType.startsWith('image/'));
        audioPool = filesPool.filter(i => i.mimeType.startsWith('audio/'));
        videosPool = filesPool.filter(i => i.mimeType.startsWith('video/'));
        await loadLikesFiles();
        await restartFilePool();
        await restartImagesPool();
    }
    catch (err) {
        console.error(err);
    }
    finishLoading();
    return false;
}
window.addEventListener('load', async () => {
    let resp = await fetch(`${HEXA_BACKUP_BASE_URL}/refs`);
    let refs = (await resp.json()).filter(e => e.startsWith('CLIENT_')).map(e => e.substr(7));
    el('#refs-list').innerHTML = refs.map(ref => `<div><a href='#' onclick='event.preventDefault() || goRef("${ref}")'>${ref}</a></div>`).join('');
    let user = await fetch(`${PUBLIC_BASE_URL}/well-known/v1/me`);
    el('#userId').innerText = (await user.json()).uuid;
});
el('#fullScreen').addEventListener('click', event => {
    event.preventDefault();
    el('body').webkitRequestFullScreen();
});
el('#extended').addEventListener('change', () => {
    EXTENDED = !!el('#extended').checked;
    localStorage.setItem('EXTENDED', `${EXTENDED}`);
    syncUi();
});
el('#stream-raw-video').addEventListener('change', () => {
    STREAM_RAW_VIDEO = !!el('#stream-raw-video').checked;
    localStorage.setItem('STREAM_RAW_VIDEO', `${STREAM_RAW_VIDEO}`);
    syncUi();
});
el('#show-unliked-items').addEventListener('change', () => {
    SHOW_UNLIKED_ITEMS = !!el('#show-unliked-items').checked;
    localStorage.setItem('SHOW_UNLIKED_ITEMS', `${SHOW_UNLIKED_ITEMS}`);
    syncUi();
});
el('#show-full-commit-history').addEventListener('change', () => {
    SHOW_FULL_COMMIT_HISTORY = !!el('#show-full-commit-history').checked;
    localStorage.setItem('SHOW_FULL_COMMIT_HISTORY', `${SHOW_FULL_COMMIT_HISTORY}`);
    syncUi();
});
el('#display-order').addEventListener('change', () => {
    syncUi();
});
el('#audio-player').addEventListener('ended', () => {
    listenNext();
});
el('#video-player').addEventListener('ended', () => {
    showNextVideo();
});
window.onpopstate = function (event) {
    if (event.state) {
        currentDirectoryDescriptorSha = event.state.currentDirectoryDescriptorSha;
        currentClientId = event.state.currentClientId;
        currentPictureIndex = event.state.currentPictureIndex || 0;
        if (!currentClientId)
            el("#menu").classList.remove("is-hidden");
        syncUi();
    }
    else {
        fromHash();
        syncUi();
    }
};
if (history.state) {
    currentDirectoryDescriptorSha = history.state.currentDirectoryDescriptorSha;
    currentClientId = history.state.currentClientId;
    currentPictureIndex = history.state.currentPictureIndex || 0;
    if (currentClientId)
        el("#menu").classList.add("is-hidden");
    syncUi();
}
else {
    fromHash();
    publishHistoryState();
    syncUi();
}
function fromHash() {
    if (window.location.hash && window.location.hash.startsWith('#') && window.location.hash != '#null' && window.location.hash != '#undefined') {
        currentDirectoryDescriptorSha = window.location.hash.substr(1);
        currentClientId = null;
        currentPictureIndex = -1;
        let dashIndex = currentDirectoryDescriptorSha.indexOf('-');
        if (dashIndex >= 0) {
            currentPictureIndex = parseInt(currentDirectoryDescriptorSha.substr(dashIndex + 1));
            currentDirectoryDescriptorSha = currentDirectoryDescriptorSha.substr(0, dashIndex);
        }
        el("#menu").classList.add("is-hidden");
    }
}
async function viewLikes() {
    el("#menu").classList.add("is-hidden");
    let likes = await (await fetch(`${HEXA_BACKUP_BASE_URL}/metadata/likes-sha`)).json();
    if (!likes)
        likes = {};
    // TODO manage liked directories
    el('#directories').classList.add('is-hidden');
    el('#video-player').classList.add('is-hidden');
    // TODO manage liked images
    el('#images-container').classList.add('is-hidden');
    let likesArray = Object.getOwnPropertyNames(likes).map(sha => ({ sha, value: likes[sha] }));
    if (!SHOW_UNLIKED_ITEMS)
        likesArray = likesArray.filter(like => like.value.status);
    await viewLikedFiles(likesArray);
    await listenToLiked(likesArray.filter(like => like.value.knownAs.mimeType.startsWith('audio/')));
    await viewLikedVideos(likesArray.filter(like => like.value.knownAs.mimeType.startsWith('video/')));
}
async function syncUi() {
    if (currentPictureIndex < 0) {
        el('#image-full-container').classList.add('is-hidden');
        el('#images-container').classList.remove('is-hidden');
        el('#banner').classList.remove('is-hidden');
        el('#main').classList.remove('is-hidden');
    }
    else {
        el('#image-full-container').classList.remove('is-hidden');
        el('#images-container').classList.add('is-hidden');
        el('#banner').classList.add('is-hidden');
        el('#main').classList.add('is-hidden');
    }
    const orderChange = displayedSortOrder != el('#display-order').value;
    displayedSortOrder = el('#display-order').value;
    localStorage.setItem('SORT_ORDER', `${displayedSortOrder}`);
    const extChange = displayedExtended != EXTENDED;
    displayedExtended = EXTENDED;
    const streamRawVideoChange = displayedStreamRawVideo != STREAM_RAW_VIDEO;
    displayedStreamRawVideo = STREAM_RAW_VIDEO;
    const fullHistoryChange = displayedShowFullCommitHistory != SHOW_FULL_COMMIT_HISTORY;
    displayedShowFullCommitHistory = SHOW_FULL_COMMIT_HISTORY;
    const showUnlikedItemsChange = displayedShowUnlikedItems != SHOW_UNLIKED_ITEMS;
    displayedShowUnlikedItems = SHOW_UNLIKED_ITEMS;
    if (showUnlikedItemsChange || streamRawVideoChange || extChange || orderChange || currentDirectoryDescriptorSha != displayedDirectoryDescriptorSha)
        await showDirectory(currentDirectoryDescriptorSha);
    if (showUnlikedItemsChange || extChange || fullHistoryChange || currentClientId != displayedClientId)
        await showRef(currentClientId);
    el('#video-player').classList.add('is-hidden');
    if (!imagesPool.length)
        el('#images-container').classList.add('is-hidden');
    if (currentPictureIndex != displayedPictureIndex)
        await showPicture(currentPictureIndex);
    displayedDirectoryDescriptorSha = currentDirectoryDescriptorSha;
    displayedClientId = currentClientId;
    displayedPictureIndex = currentPictureIndex;
}
//# sourceMappingURL=index.js.map