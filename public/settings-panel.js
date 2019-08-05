"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UiTool = require("./ui-tool");
const templates_1 = require("./templates");
const Rest = require("./rest");
const Messages = require("./messages");
const Auth = require("./auth");
const template = `
<div class='mui-container-fluid'>
    <div class="mui--text-center">
        <h1>Settings</h1>
        <h2>Youtube Download</h2>
        <div class="mui-panel">
            <form x-id="youtubedlForm" class="mui-form">
                <div class="mui-textfield">
                    <input x-id="youtubedlUrl" type="text">
                </div>
                <button role="submit" class="mui-btn mui-btn--flat">Download</button>
            </form>
            <a x-id="youtubeDlPlaylistLink" href='#'>Go to Youtube downloaded list</a>
        </div>

        <h2>Running Jobs</h2>
        <div class="mui-panel">
            <pre x-id="runningJobs"></pre>
            <button x-id="refreshJobs" class="mui-btn mui-btn--flat">Refresh</button>
        </div>
    </div>    
</div>`;
async function refreshJobs(els) {
    let res = await Rest.getJobs();
    let jobs = [];
    if (res.running)
        jobs.push(res.running);
    if (res.waiting)
        jobs = jobs.concat(res.waiting);
    els.runningJobs.innerHTML = `
        <table class="mui-table">
            <thead>
                <tr>
                <th>State</th>
                <th>Type</th>
                <th>Name</th>
                </tr>
            </thead>
            <tbody>
                ${jobs.map((job, index) => `<tr><td>${index == 0 ? 'Running' : 'Waiting'}</td><td>${job.clientName}</td><td>${job.name}</td></tr>`).join('')}
            </tbody>
        </table>`;
}
function create() {
    let els = templates_1.createTemplateInstance(template);
    els.youtubedlForm.addEventListener('submit', async (event) => {
        UiTool.stopEvent(event);
        await Rest.enqueueYoutubeDownload(els.youtubedlUrl.value);
        els.youtubedlUrl.value = '';
        Messages.displayMessage(`Downloading from youtube`, 1);
        refreshJobs(els);
    });
    Auth.me().then(user => {
        els.youtubeDlPlaylistLink.href = `#/refs/PLUGIN-YOUTUBEDOWNLOAD-${user.uuid.toUpperCase()}`;
    });
    els.refreshJobs.addEventListener('click', event => {
        UiTool.stopEvent(event);
        refreshJobs(els);
    });
    refreshJobs(els);
    return els;
}
exports.create = create;
//# sourceMappingURL=settings-panel.js.map