import * as UiTool from './ui-tool'
import * as SearchPanel from './search-panel'
import * as Rest from './rest'

const searchPanel = SearchPanel.searchPanel.create()
searchPanel.form.addEventListener('submit', async event => {
    UiTool.stopEvent(event)

    let res = await Rest.search(searchPanel.term.value, 'audio/%')

    clearContents()

    addContent(UiTool.elFromHtml(`<div>${res.files.map(f => `<div>${f.name}</div>`).join('')}</div>`))
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