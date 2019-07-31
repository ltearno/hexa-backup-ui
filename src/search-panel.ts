import { TemplateElements, createTemplateInstance } from './templates'

export interface SearchPanelElements extends TemplateElements {
    title: HTMLElement
    subTitle: HTMLElement
    form: HTMLFormElement
    term: HTMLInputElement
}

const templateHtml = `
<div class='mui-container-fluid'>
    <div class="mui--text-center">
        <h1 x-id="title" class="animated--quick">Raccoon</h1>
        <h4 x-id="subTitle"></h4>
        <form x-id="form" class="mui-form--inline">
            <!--this is a little hack to have things centered-->
            <div class="mui-btn mui-btn--flat" style="visibility: hidden;">🔍</div>
            <div class="mui-textfield">
                <input x-id="term" type="text" style="text-align: center;" autofocus>
            </div>
            <button role="submit" class="mui-btn mui-btn--flat">🔍</button>
        </form>
        <br />
    </div>
</div>`

export const searchPanel = {
    create: () => createTemplateInstance(templateHtml) as SearchPanelElements,

    displayTitle: (template: SearchPanelElements, displayed: boolean) => {
        if (displayed) {
            template.title.classList.remove('hexa--reduced')
            template.subTitle.style.display = undefined
        }
        else {
            template.title.classList.add('hexa--reduced')
            template.subTitle.style.display = 'none'
        }
    }
}