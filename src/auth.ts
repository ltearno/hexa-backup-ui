import * as Network from './network'

function wait(duration) {
    return new Promise(resolve => setTimeout(resolve, duration))
}

export class Auth {
    constructor() {
        this.loop()
    }

    private async loop() {
        while (true) {
            console.log(`trying refresh token`)
            let { token } = await Network.postData(`https://home.lteconsulting.fr/auth`)
            console.log(`new token ${token}`)
            let res = await Network.getData(`https://home.lteconsulting.fr/well-known/v1/setCookie`, { 'Authorization': `Bearer ${token}` })
            console.log(`did the setCookie, res = `, res)

            await wait(10000)
        }
    }
}