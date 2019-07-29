import { TemplateElements, createTemplateInstance } from './templates'

export interface SearchPanelElements extends TemplateElements {
    form: HTMLFormElement
    term: HTMLInputElement
}

const TID_SearchForm = 'form'
const TID_SearchTerm = 'term'

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

export const searchPanel = {
    create: () => createTemplateInstance(templateHtml, [TID_SearchForm, TID_SearchTerm]) as SearchPanelElements
}