import * as Network from './network'

function wait(duration) {
    return new Promise(resolve => setTimeout(resolve, duration))
}

let authenticatedUser = null

class Auth {
    private onError() {
        window.location.reload()
    }

    async loop() {
        while (true) {
            try {
                let response: { token: string } = await Network.postData(`https://home.lteconsulting.fr/auth`)
                if (response && response.token) {
                    let res: any = await Network.getData(`https://home.lteconsulting.fr/well-known/v1/setCookie`, { 'Authorization': `Bearer ${response.token}` })
                    if (!res || !res.lifetime) {
                        console.error(`cannot setCookie`, res)
                        this.onError()
                    }

                    authenticatedUser = await Network.getData(`https://home.lteconsulting.fr/well-known/v1/me`)
                }
                else {
                    console.error(`cannot obtain auth token`)
                    this.onError()
                }
            }
            catch (err) {
                console.error(`cannot refresh auth (${err})`)
                this.onError()
            }

            // every 30 minutes
            await wait(1000 * 60 * 30)
        }
    }
}

export function autoRenewAuth() {
    let auth = new Auth()
    auth.loop()
}

export function me(): any {
    return authenticatedUser
}