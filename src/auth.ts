import * as Network from './network'

function wait(duration) {
    return new Promise(resolve => setTimeout(resolve, duration))
}

class Auth {
    async loop() {
        while (true) {
            try {
                let response: { token: string } = await Network.postData(`https://home.lteconsulting.fr/auth`)
                if (response && response.token) {
                    let res: any = await Network.getData(`https://home.lteconsulting.fr/well-known/v1/setCookie`, { 'Authorization': `Bearer ${response.token}` })
                    if (!res || !res.lifetime)
                        console.error(`cannot setCookie`, res)
                }
                else {
                    console.error(`cannot obtain auth token`)
                }
            }
            catch (err) {
                console.error(`cannot refresh auth (${err})`)
            }

            await wait(10000)
        }
    }
}

export function autoRenewAuth() {
    let auth = new Auth()
    auth.loop()
}