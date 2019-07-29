import * as UiTools from './ui-tool'

export interface TemplateManager {
    create(): string
    createElement(): HTMLElement
}

const templateHtml = `
<div class='mui-container-fluid'>
    <div class="mui--text-center">
        <h1>Raccoon</h1>
        <form class="mui-form--inline">
            <!--this is a little hack to have things centered-->
            <div class="mui-btn mui-btn--flat" style="visibility: hidden;">🔍</div>
            <div class="mui-textfield">
                <input type="text">
            </div>
            <button class="mui-btn mui-btn--flat">🔍</button>
        </form>
        <br /><a href="#">Browse</a> - <a href="#">Settings</a>
    </div>
</div>`

export const searchPanel: TemplateManager = {
    create: () => {
        return templateHtml
    },

    createElement: () => {
        return UiTools.elFromHtml(searchPanel.create())
    }
}