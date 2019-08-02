import * as Rest from './rest'
import { TemplateElements, createTemplateInstance } from './templates'
import * as Snippets from './html-snippets'

const wait = (duration) => new Promise(resolve => setTimeout(resolve, duration))

const templateHtml = `
<div class='mui-container'>
    <div class="mui--text-center">
        <h2>Slideshow</h2>
        <div x-id="items" class="mui-panel x-slideshow"></div>
        speed: <input x-id="speed" type="range" min="100" max="3000" value="200"/>
        nb images: <input x-id="nbImages" type="range" min="1" max="50" value="12"/>
        interval: <input x-id="interval" type="range" min="0" max="100" value="50"/>
        date: <input x-id="date" type="date"/>
        <div x-id="remark"></div>
    </div>
</div>`

export function create() {
    let els = createTemplateInstance(templateHtml) as {
        root: HTMLElement
        items: HTMLElement
        interval: HTMLInputElement
        date: HTMLInputElement
        remark: HTMLElement
        speed: HTMLInputElement
        nbImages: HTMLInputElement
    }

    (async () => {
        let possibleImages: Rest.FileDescriptor[] = []

        let lastSearchDate = null
        let lastSearchInterval = null

        while (true) {
            let searchSpec: any = {
                name: "%",
                mimeType: 'image/%',
                noDirectory: true,
                limit: 100
            }

            let searchDate = els.date.value
            let interval = (parseInt(els.interval.value || '0')) * 1000 * 60 * 60 * 24
            if (lastSearchDate != searchDate || lastSearchInterval != interval) {
                lastSearchDate = searchDate
                lastSearchInterval = interval

                searchSpec.dateMin = new Date(searchDate).getTime() - interval
                searchSpec.dateMax = new Date(searchDate).getTime() + interval

                const results = await Rest.searchEx(searchSpec)
                possibleImages = results && results.items
            }

            if (possibleImages) {
                els.remark.innerHTML = `${possibleImages.length} possible images`

                let imageElement: HTMLImageElement = null
                if (els.items.children.length < parseInt(els.nbImages.value)) {
                    imageElement = document.createElement('img')
                    els.items.appendChild(imageElement)
                }
                else if (els.items.children.length > parseInt(els.nbImages.value)) {
                    imageElement = els.items.children.item(Math.floor(Math.random() * els.items.children.length)) as HTMLImageElement
                    imageElement.parentElement.removeChild(imageElement)
                }
                else {
                    imageElement = els.items.children.item(Math.floor(Math.random() * els.items.children.length)) as HTMLImageElement
                }

                let item = possibleImages[Math.floor(Math.random() * possibleImages.length)]
                if(item)
                imageElement.src = Rest.getShaImageThumbnailUrl(item.sha, item.mimeType)
            }
            else {
                els.remark.innerHTML = `no possible image !`
            }

            await wait(els.speed.value)
        }
    })()

    return els
}

