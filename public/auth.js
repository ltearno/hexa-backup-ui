"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Network = require("./network");
const authenticationServer = `https://home.lteconsulting.fr`;
const publicUiServerUrl = `https://${window.location.host}`;
function wait(duration) {
    return new Promise(resolve => setTimeout(resolve, duration));
}
let authenticatedUser = null;
class Auth {
    onError() {
    }
    async loop() {
        while (true) {
            try {
                let response = await Network.postData(`${authenticationServer}/auth`);
                if (response && response.token) {
                    let res = await Network.getData(`${publicUiServerUrl}/well-known/v1/setCookie`, { 'Authorization': `Bearer ${response.token}` });
                    if (!res || !res.lifetime) {
                        console.error(`cannot setCookie`, res);
                        this.onError();
                    }
                    authenticatedUser = await Network.getData(`${publicUiServerUrl}/well-known/v1/me`);
                }
                else {
                    console.error(`cannot obtain auth token`);
                    this.onError();
                }
            }
            catch (err) {
                console.error(`cannot refresh auth (${err})`);
                this.onError();
            }
            // every 30 minutes
            await wait(1000 * 60 * 30);
        }
    }
}
function autoRenewAuth() {
    let auth = new Auth();
    auth.loop();
}
exports.autoRenewAuth = autoRenewAuth;
async function me() {
    if (!authenticatedUser)
        authenticatedUser = await Network.getData(`${publicUiServerUrl}/well-known/v1/me`);
    return authenticatedUser;
}
exports.me = me;
//# sourceMappingURL=auth.js.map