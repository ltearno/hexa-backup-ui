async function afterFetch(response: Response) {
    if (!response || !response.ok) {
        console.error(`bad response : ${JSON.stringify(response)}`)
        return null
    }
    let receivedContentType = response.headers.get('Content-Type') || 'application/json'
    let sci = receivedContentType.indexOf(';')
    if (sci >= 0)
        receivedContentType = receivedContentType.substr(0, sci)
    console.log(`received contenttype ${receivedContentType}`)

    if (receivedContentType == 'application/json')
        return await response.json()
    else
        return await response.text()
}

export function getData<T>(url: string, headers: { [key: string]: string } = null): Promise<T> {
    return fetch(
        url, {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            redirect: 'follow',
            referrer: 'no-referrer',
            headers
        })
        .then(afterFetch)
}

export function postData<T>(url: string, data: any = {}, contentType = 'application/json'): Promise<T> {
    return fetch(
        url, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            redirect: 'follow',
            referrer: 'no-referrer',
            headers: { "Content-Type": contentType },
            body: contentType == 'application/json' ? JSON.stringify(data) : data
        })
        .then(afterFetch)
}

export function putData<T>(url: string, data: any = {}, contentType = 'application/json'): Promise<T> {
    return fetch(
        url, {
            method: 'PUT',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            redirect: 'follow',
            referrer: 'no-referrer',
            headers: { "Content-Type": contentType },
            body: contentType == 'application/json' ? JSON.stringify(data) : data
        })
        .then(afterFetch)
}

export function deleteData<T>(url: string, data: any = {}, contentType = 'application/json'): Promise<T> {
    return fetch(
        url, {
            method: 'DELETE',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            redirect: 'follow',
            referrer: 'no-referrer',
            headers: { "Content-Type": contentType },
            body: contentType == 'application/json' ? JSON.stringify(data) : data
        })
        .then(afterFetch)
}