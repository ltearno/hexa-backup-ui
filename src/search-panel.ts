import { TemplateElements, createTemplateInstance } from './templates'

export interface SearchPanelElements extends TemplateElements {
    title: HTMLElement
    form: HTMLFormElement
    term: HTMLInputElement
}

const TID_Title = 'title'
const TID_SearchForm = 'form'
const TID_SearchTerm = 'term'

const templateHtml = `
<div class='mui-container-fluid'>
    <div class="mui--text-center">
        <h1 x-id="${TID_Title}" class="animated--quick">Raccoon</h1>
        <form x-id="${TID_SearchForm}" class="mui-form--inline">
            <!--this is a little hack to have things centered-->
            <div class="mui-btn mui-btn--flat" style="visibility: hidden;">🔍</div>
            <div class="mui-textfield mui-textfield--float-label>
                <input x-id="${TID_SearchTerm}" type="text" style="text-align: center;" autofocus>
                <label>Search an audio title</label>
            </div>
            <button role="submit" class="mui-btn mui-btn--flat">🔍</button>
        </form>
        <br />
    </div>
</div>`

export const searchPanel = {
    create: () => createTemplateInstance(templateHtml) as SearchPanelElements,

    displayTitle: (template: SearchPanelElements, displayed: boolean) => {
        if (displayed)
            template.title.classList.remove('hexa--reduced')
        else
            template.title.classList.add('hexa--reduced')
    }
}