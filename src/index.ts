import * as UiTool from './ui-tool'
import * as SearchPanel from './search-panel'

const searchPanel = SearchPanel.searchPanel.create()
searchPanel.form.addEventListener('submit', event => {
    UiTool.stopEvent(event)

    console.log(searchPanel.term.value)
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

addContent(searchPanel.root)