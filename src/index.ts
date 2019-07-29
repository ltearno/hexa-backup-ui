import * as UiTool from './ui-tool'
import * as Templates from './templates'

console.log(`hello you`)

const searchPanelElement = Templates.searchPanel.createElement()
const searchPanelElements = Templates.searchPanel.elements(searchPanelElement)
searchPanelElements.form.addEventListener('submit', event => {
    event.preventDefault()
    event.stopPropagation()

    console.log(searchPanelElements.value.value)
})
UiTool.el('content-wrapper').appendChild(searchPanelElement)