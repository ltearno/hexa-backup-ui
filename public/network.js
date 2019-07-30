"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function afterFetch(response) {
    if (!response || !response.ok) {
        console.error(`bad response : ${JSON.stringify(response)}`);
        return null;
    }
    let receivedContentType = response.headers.get('Content-Type');
    console.log(`received contenttype ${receivedContentType}`);
    if (receivedContentType == 'application/json')
        return await response.json();
    else
        return await response.text();
}
/*
export function getData(url: string, responseContentType = 'application/json') {
    return fetch(
        url, {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            redirect: 'follow',
            referrer: 'no-referrer'
        })
        .then(afterFetch(responseContentType))
}
*/
async function postData(url, data, contentType = 'application/json') {
    let response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        redirect: 'follow',
        referrer: 'no-referrer',
        headers: { "Content-Type": contentType },
        body: contentType == 'application/json' ? JSON.stringify(data) : data
    });
    console.log(`response`, response);
    const result = await afterFetch(response);
    console.log(`result`, result);
    return result;
}
exports.postData = postData;
/*
export function putData(url: string, data: any = {}, contentType = 'application/json', responseContentType = 'application/json') {
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
        .then(afterFetch(responseContentType))
}

export function deleteData(url: string, data: any = {}, contentType = 'application/json', responseContentType = 'application/json') {
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
        .then(afterFetch(responseContentType))
}*/ 
//# sourceMappingURL=network.js.map