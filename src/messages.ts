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
    popup.messages.innerHTML = messages.map(message => {
        let style = ''
        if (message.feeling > 0)
            style = `background-color: #70ca85; color: white;`
        else if (message.feeling < 0)
            style = `background-color: #F44336; color: white;`

        return `<div class="mui-panel x-message-panel" style="${style}">${message.html}</div>`
    }).join('')
}

export function displayMessage(html: string, feeling: number) {
    messages.push({
        html,
        feeling
    })

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