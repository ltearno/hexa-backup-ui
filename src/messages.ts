import { createTemplateInstance } from './templates'

let messages = []

const popupTemplate = `
    <div x-id="messages">
    </div>`

let popup: {
    root: HTMLElement
    messages: HTMLElement
} = createTemplateInstance(popupTemplate)

function refresh() {
    popup.messages.innerHTML = messages.map(html => `<div class="mui-panel x-message-panel">${html}</div>`).join('')
}

export function displayMessage(html: string) {
    messages.push(html)

    refresh()

    if (!popup.root.isConnected)
        document.body.appendChild(popup.root)

    setTimeout(() => {
        messages.shift()
        refresh()

        if (!messages.length)
            document.body.removeChild(popup.root)
    }, 4000)
}