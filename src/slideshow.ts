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
        nb images: <input x-id="nbImages" type="range" min="1" max="100" value="12"/>
        interval: <input x-id="interval" type="range" min="1" max="365" value="1" value="50"/>
        <input x-id="date" type="range" min="-${365 * 20}" max="0" value="0" style="width:100%;"/>
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
        let currentOffset = 0

        while (true) {
            let searchDate = (parseInt(els.date.value || '0')) * 1000 * 60 * 60 * 24
            let interval = (parseInt(els.interval.value || '0')) * 1000 * 60 * 60 * 24

            let center = new Date().getTime() + searchDate

            if (lastSearchDate != searchDate || lastSearchInterval != interval)
                currentOffset = 0

            if (lastSearchDate != searchDate || lastSearchInterval != interval || !possibleImages || !possibleImages.length) {
                lastSearchDate = searchDate
                lastSearchInterval = interval

                console.log(`do a search on ${center} +/- ${parseInt(els.interval.value)} @ ${currentOffset}`)

                let searchSpec: any = {
                    mimeType: 'image/%',
                    noDirectory: true,
                    limit: parseInt(els.nbImages.value),
                    offset: currentOffset,
                    dateMin: center - interval,
                    dateMax: center + interval
                }

                const results = await Rest.searchEx(searchSpec)
                possibleImages = results && results.items
                if (possibleImages.length)
                    currentOffset += possibleImages.length
                else
                    currentOffset = 0
            }

            if (possibleImages) {
                els.remark.innerHTML = `+/- ${parseInt(els.date.value) || 0} days around date ${new Date(center)} (@${currentOffset}), ${possibleImages.length} possible images`

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

                let imageIndex = Math.floor(Math.random() * possibleImages.length)
                let [usedImage] = possibleImages.splice(imageIndex, 1)
                if (usedImage)
                    imageElement.src = Rest.getShaImageThumbnailUrl(usedImage.sha, usedImage.mimeType)
            }
            else {
                els.remark.innerHTML = `no possible image !`
            }

            await wait(els.speed.value)
        }
    })()

    return els
}

