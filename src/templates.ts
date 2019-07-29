import * as UiTools from './ui-tool'

function templateElement<T extends HTMLElement>(root: HTMLElement, name: string): T {
    let list = UiTools.els(root, `[x-id=${name}]`)
    return list.length ? list.item(0) as T : null
}

const TID_SearchForm = 'search-form'
const TID_SearchTerm = 'search-term'

const templateHtml = `
<div class='mui-container-fluid'>
    <div class="mui--text-center">
        <h1>Raccoon</h1>
        <form x-id="${TID_SearchForm}" class="mui-form--inline">
            <!--this is a little hack to have things centered-->
            <div class="mui-btn mui-btn--flat" style="visibility: hidden;">🔍</div>
            <div class="mui-textfield">
                <input x-id="${TID_SearchTerm}" type="text">
            </div>
            <button role="submit" class="mui-btn mui-btn--flat">🔍</button>
        </form>
        <br /><a href="#">Browse</a> - <a href="#">Settings</a>
    </div>
</div>`

export interface SearchPanelElements {
    form: HTMLFormElement
    term: HTMLInputElement
}

export const searchPanel = {
    create: () => {
        return templateHtml
    },

    createElement: () => {
        let root = UiTools.elFromHtml(searchPanel.create())

        let data: SearchPanelElements = {
            form: templateElement(root, TID_SearchForm),
            term: templateElement(root, TID_SearchTerm)
        }

        root['template-points'] = data

        return root
    },

    elements: (root: HTMLElement) => {
        const data = root['template-points']
        return data as SearchPanelElements
    }
}