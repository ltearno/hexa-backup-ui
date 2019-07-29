import * as UiTool from './ui-tool'
import * as Templates from './templates'

const searchPanelElement = Templates.searchPanel.createElement()
const searchPanelElements = Templates.searchPanel.elements(searchPanelElement)
searchPanelElements.form.addEventListener('submit', event => {
    event.preventDefault()
    event.stopPropagation()

    console.log(searchPanelElements.term.value)
    clearContents()
})

let contents: HTMLElement[] = []
function addContent(content: HTMLElement) {
    contents.push(content)
    UiTool.el('content-wrapper').appendChild(content)
}
function clearContents() {
    const contentWrapper = UiTool.el('content-wrapper')
    contents.forEach(element => contentWrapper.removeChild(element))
    contents = []
}

addContent(searchPanelElement)