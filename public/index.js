const BASE_URL = "/public/";
const HEXA_BACKUP_BASE_URL = window.location.hostname == "home.lteconsulting.fr" ? "https://home.lteconsulting.fr" : "https://192.168.0.2:5005";
const el = document.querySelector.bind(document);
let EXTENDED = localStorage.getItem('EXTENDED') === 'true';
el('#extended').checked = EXTENDED;
let STREAM_RAW_VIDEO = localStorage.getItem('STREAM_RAW_VIDEO') === 'true';
el('#stream-raw-video').checked = STREAM_RAW_VIDEO;
let SHOW_FULL_COMMIT_HISTORY = localStorage.getItem('SHOW_FULL_COMMIT_HISTORY') === 'true';
el('#show-full-commit-history').checked = SHOW_FULL_COMMIT_HISTORY;
let SHOW_UNLIKED_ITEMS = localStorage.getItem('SHOW_UNLIKED_ITEMS') === 'true';
el('#show-unliked-items').checked = SHOW_UNLIKED_ITEMS;
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
const displayDate = date => (typeof date === 'number' ? new Date(date) : date).toLocaleString('fr', DATE_DISPLAY_OPTIONS);
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
    loaders.push(text);
    el('#status').innerHTML = loaders.join('<br>');
    return () => {
        loaders.splice(loaders.indexOf(text), 1);
        el('#status').innerHTML = loaders.join('<br>');
    };
};
async function showDirectory(directoryDescriptorSha) {
    el('#directories').innerHTML = '';
    el('#files').innerHTML = '';
    el('#images').innerHTML = '';
    el('#video-list').innerHTML = '';
    if (!directoryDescriptorSha)
        return;
    let finishLoading = startLoading(`loading directory descriptor ${directoryDescriptorSha.substr(0, 7)}`);
    let directoryDescriptor = await fetchDirectoryDescriptor(directoryDescriptorSha);
    finishLoading();
    if (!directoryDescriptor || !directoryDescriptor.files) {
        el('#directories').innerHTML = `error fetching ${directoryDescriptorSha}`;
        return;
    }
    let files = directoryDescriptor.files;
    finishLoading = startLoading(`listing directories`);
    let directoriesContent = files
        .filter(file => file.isDirectory)
        .sort((a, b) => {
        let sa = a.name.toLocaleLowerCase();
        let sb = b.name.toLocaleLowerCase();
        return sa.localeCompare(sb);
    })
        .map(file => EXTENDED ?
        `<div><span class='small'>${displayDate(file.lastWrite)} ${file.contentSha ? file.contentSha.substr(0, 7) : '-'}</span> <a href='#' onclick='event.preventDefault() || goDirectory("${file.contentSha}")'>${file.name}</a></div>` :
        `<div><a href='${BASE_URL}#${file.contentSha}' onclick='event.preventDefault() || goDirectory("${file.contentSha}")'>${file.name}</a></div>`);
    if (directoriesContent.length) {
        el('#directories').classList.remove('is-hidden');
        el('#directories').innerHTML = `<h2>${directoriesContent.length} Directories</h2><div id='directories-container'>${directoriesContent.join('')}</div>`;
    }
    else {
        el('#directories').classList.add('is-hidden');
    }
    finishLoading();
    let images = [];
    let videos = [];
    let audios = [];
    finishLoading = startLoading(`listing files`);
    filesPool = files
        .filter(file => !file.isDirectory)
        .sort((a, b) => {
        let sa = a.name.toLocaleLowerCase();
        let sb = b.name.toLocaleLowerCase();
        return sa.localeCompare(sb);
    })
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
    finishLoading();
    await wait(1);
    imagesPool = images;
    await restartImagesPool();
    currentVideoIndex = -1;
    videosPool = videos;
    await restartVideosPool();
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
    let audioIndex = 0;
    let videoIndex = 0;
    let filesContent = '';
    let currentPrefix = '';
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
        let html = '';
        let classes = [];
        let likeHtml = `<a class='like' onclick='event.preventDefault() || toggleLikeFile(${index})'>like ♡</a>`;
        if (EXTENDED) {
            let date = `<span class='small'>${displayDate(file.lastWrite)} ${file.sha ? file.sha.substr(0, 7) : '-'}</span>`;
            html = `${date} ${file.fileName} <span class='small'>${file.size} ${links}</span>`;
        }
        else {
            html = `${file.fileName.substr(currentPrefix.length)} <span class='small'>${links} ${likeHtml}</span>`;
        }
        if (file.mimeType.startsWith('audio/')) {
            classes.push(`audio-${audioIndex}`);
            html = `<a href='#' onclick='event.preventDefault() || listenAudio(${audioIndex})'>🎶 ▶</a> ${html}`;
            audioIndex++;
        }
        else if (file.mimeType.startsWith('video/')) {
            classes.push(`video-${audioIndex}`);
            html = `<a href='#' onclick='event.preventDefault() || showVideo(${videoIndex})'>🎞️ ▶</a> ${html}`;
            videoIndex++;
        }
        filesContent += `<div id='file-${index}' class='${classes.join(' ')}'>${html}</div>`;
    }
    if (filesContent.length) {
        el('#files').classList.remove('is-hidden');
        el('#files').innerHTML = `<h2>${filesPool.length} Files</h2><div id="files-container">${filesContent}</div> `;
    }
    else {
        el('#files').classList.add('is-hidden');
    }
    await viewLikesFiles();
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
        el('#images').innerHTML = '';
        infiniteScrollerStop = infiniteScroll(imagesPool, ({ sha, mimeType, fileName }, index) => `<div><img onclick='goPicture(${index})' src="${HEXA_BACKUP_BASE_URL}/sha/${sha}/plugins/image/thumbnail?type=${mimeType}"/></div>`, el('#images-container'), el('#images'));
    }
    else {
        el('#images').innerHTML = '<br/><i class="small">no picture in this folder</i>';
        // <a href='/sha/${sha}/content?type=${mimeType}'></a>
    }
}
async function showVideo(index) {
    if (index < 0 || index >= videosPool.length)
        return;
    currentVideoIndex = index;
    let { sha, mimeType, fileName } = videosPool[index];
    el('#video-player').setAttribute('src', STREAM_RAW_VIDEO ? `${HEXA_BACKUP_BASE_URL}/sha/${sha}/content?type=${mimeType}` : `${HEXA_BACKUP_BASE_URL}/sha/${sha}/plugins/video/small?type=${mimeType}`);
    el('#video-player').setAttribute('type', mimeType);
    el('#video-player').play();
    el(`#video-${index}`).style.fontWeight = 'bold';
    el(`.video-${index}`).style.fontWeight = 'bold';
}
async function showNextVideo() {
    showVideo(currentVideoIndex + 1);
}
async function toggleLikeVideo(index) {
    if (index < 0 || index >= videosPool.length)
        return;
    let { sha, mimeType, fileName } = videosPool[index];
    let status = await toggleShaLike(sha, mimeType, fileName);
    if (status)
        el('#video-list').children.item(index).classList.add('liked');
    else
        el('#video-list').children.item(index).classList.remove('liked');
}
async function restartVideosPool() {
    let html = '';
    for (let i in videosPool) {
        html += `<div><a id='video-${i}' href='#' onclick='event.preventDefault(), showVideo(${i})'>${videosPool[i].fileName}</a> <a class='like' onclick='event.preventDefault() || toggleLikeVideo(${i})'>like ♡</a></div></div>`;
    }
    el('#video-list').innerHTML = html;
    if (videosPool.length)
        el('#videos-container').classList.remove('is-hidden');
    else
        el('#videos-container').classList.add('is-hidden');
    loadLikesVideo();
}
async function loadLikesVideo() {
    let i = 0;
    while (i < videosPool.length) {
        let metadata = filesShaLikeMetadata[videosPool[i].sha]; //await (await fetch(`/metadata/likes-sha/${videosPool[i].sha}`)).json()
        if (metadata && metadata.status)
            el('#video-list').children.item(i).classList.add('liked');
        i++;
    }
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
    restartVideosPool();
}
async function listenAudio(index) {
    if (index < 0 || index >= audioPool.length)
        return;
    currentAudioIndex = index;
    let { sha, mimeType, fileName } = audioPool[index];
    el('#audio-player').setAttribute('src', `${HEXA_BACKUP_BASE_URL}/sha/${sha}/content?type=${mimeType}`);
    el('#audio-player').setAttribute('type', mimeType);
    el('#audio-player').play();
    el(`.audio-${index}`).style.fontWeight = 'bold';
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
    el('#image-full-aligner').innerHTML += `<a style='width:100%;height:100%;display:flex;align-items:center;justify-content: center;' href='${HEXA_BACKUP_BASE_URL}/sha/${sha}/content?type=${mimeType}'><img class='image-full' src='${HEXA_BACKUP_BASE_URL}/sha/${sha}/plugins/image/medium?type=${mimeType}'/></a>`;
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
    let finishLoading = startLoading(`loading commit ${commitSha.substr(0, 7)} for default directory descriptor`);
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
    let finishLoading = startLoading(`loading commit history`);
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
window.addEventListener('load', async () => {
    let resp = await fetch(`${HEXA_BACKUP_BASE_URL}/refs`);
    let refs = (await resp.json()).filter(e => e.startsWith('CLIENT_')).map(e => e.substr(7));
    el('#refs-list').innerHTML = refs.map(ref => `<div><a href='#' onclick='event.preventDefault() || goRef("${ref}")'>${ref}</a></div>`).join('');
});
el('#fullScreen').addEventListener('click', () => {
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
    el("#menu").classList.remove("is-hidden");
    let likes = await (await fetch(`${HEXA_BACKUP_BASE_URL}/metadata/likes-sha`)).json();
    if (!likes)
        likes = {};
    // TODO manage liked directories
    el('#directories').classList.add('is-hidden');
    el('#videos-container').classList.remove('is-hidden');
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
    }
    else {
        el('#image-full-container').classList.remove('is-hidden');
        el('#images-container').classList.add('is-hidden');
    }
    const extChange = displayedExtended != EXTENDED;
    displayedExtended = EXTENDED;
    const streamRawVideoChange = displayedStreamRawVideo != STREAM_RAW_VIDEO;
    displayedStreamRawVideo = STREAM_RAW_VIDEO;
    const fullHistoryChange = displayedShowFullCommitHistory != SHOW_FULL_COMMIT_HISTORY;
    displayedShowFullCommitHistory = SHOW_FULL_COMMIT_HISTORY;
    const showUnlikedItemsChange = displayedShowUnlikedItems != SHOW_UNLIKED_ITEMS;
    displayedShowUnlikedItems = SHOW_UNLIKED_ITEMS;
    if (showUnlikedItemsChange || streamRawVideoChange || extChange || currentDirectoryDescriptorSha != displayedDirectoryDescriptorSha)
        await showDirectory(currentDirectoryDescriptorSha);
    if (showUnlikedItemsChange || extChange || fullHistoryChange || currentClientId != displayedClientId)
        await showRef(currentClientId);
    if (videosPool.length)
        el('#videos-container').classList.remove('is-hidden');
    else
        el('#videos-container').classList.add('is-hidden');
    if (!imagesPool.length)
        el('#images-container').classList.add('is-hidden');
    if (currentPictureIndex != displayedPictureIndex)
        await showPicture(currentPictureIndex);
    displayedDirectoryDescriptorSha = currentDirectoryDescriptorSha;
    displayedClientId = currentClientId;
    displayedPictureIndex = currentPictureIndex;
}
//# sourceMappingURL=index.js.map