"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Network = require("./network");
function wait(duration) {
    return new Promise(resolve => setTimeout(resolve, duration));
}
class Auth {
    async loop() {
        while (true) {
            console.log(`trying refresh token`);
            let { token } = await Network.postData(`https://home.lteconsulting.fr/auth`, {});
            console.log(`new token ${token}`);
        }
    }
}
exports.Auth = Auth;
//# sourceMappingURL=auth.js.map