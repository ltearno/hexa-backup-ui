import { TemplateElements, createTemplateInstance } from './templates'

export interface AudioPanelElements extends TemplateElements {
    title: HTMLElement
    player: HTMLAudioElement
}

const TID_Title = 'title'
const TID_Player = 'player'

const templateHtml = `
<div class="audio-footer" class="mui-panel is-hidden">
    <h3 x-id="${TID_Title}"></h3>
    <audio x-id="${TID_Player}" class="audio-player" class="mui--pull-right" controls preload="metadata"></audio>
</div>`

export const audioPanel = {
    create: () => createTemplateInstance(templateHtml, [TID_Title, TID_Player]) as AudioPanelElements
}