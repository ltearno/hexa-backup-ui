import * as Network from './network'

function wait(duration) {
    return new Promise(resolve => setTimeout(resolve, duration))
}

export class Auth {
    private async loop() {
        while (true) {
            console.log(`trying refresh token`)
            let { token } = await Network.postData(`https://home.lteconsulting.fr/auth`, {})
            console.log(`new token ${token}`)
        }
    }
}