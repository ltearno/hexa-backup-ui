import * as Rest from './rest'
import { TemplateElements, createTemplateInstance } from './templates'
import * as Snippets from './html-snippets'
import * as Messages from './messages'

const wait = (duration) => new Promise(resolve => setTimeout(resolve, duration))
const rand = max => Math.floor(max * Math.random())

const templateHtml = `
<div class='mui-container'>
    <div class="mui--text-center">
        <h2>Slideshow</h2>
        <div x-id="items" class="mui-panel x-slideshow"></div>
        speed: <input x-id="speed" type="range" min="50" max="3000" value="2000"/>
        nb rows: <input x-id="nbRows" type="number" min="1" max="150" value="1"/>
        nb images: <input x-id="nbImages" type="number" min="1" max="100" value="3"/>
        interval: <input x-id="interval" type="number" min="1" max="365" value="15" value="50"/>
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
        nbRows: HTMLInputElement
    }

    const removeRandomImage = () => {
        let imageElement = pickRandomImage()
        if (imageElement) {
            let parent = imageElement.parentElement
            parent.removeChild(imageElement)
            if (!parent.children.length)
                parent.parentElement.removeChild(parent)
        }

        return imageElement
    }

    const addRandomImage = (nbDesiredRows: number) => {
        let imageElement = document.createElement('img')

        let row = null
        if (els.items.children.length < nbDesiredRows) {
            row = document.createElement('div')
            els.items.appendChild(row)
        }
        else {
            row = els.items.children.item(rand(els.items.children.length))
        }

        row.appendChild(imageElement)

        return imageElement
    }

    const pickRandomImage = () => {
        let possibleElements = []
        for (let row of els.items.children) {
            for (let img of row.children)
                possibleElements.push(img)
        }

        if (!possibleElements.length)
            return null

        return possibleElements[rand(possibleElements.length)]
    }

    const enumImages = (s: Set<HTMLImageElement>) => {
        for (let rowIdx = 0; rowIdx < els.items.children.length; rowIdx++) {
            const row = els.items.children.item(rowIdx)
            for (let i = 0; i < row.children.length; i++) {
                s.add(row.children.item(i) as HTMLImageElement)
            }
        }
    }

    const imagesCount = () => {
        let count = 0
        for (let rowIdx = 0; rowIdx < els.items.children.length; rowIdx++) {
            const row = els.items.children.item(rowIdx)
            count += row.children.length
        }
        return count
    }

    (async () => {
        let possibleImages: Rest.FileDescriptor[] = []

        let lastSearchDate = null
        let lastSearchInterval = null
        let currentOffset = 0
        let finished = false

        let toRemove = new Set<HTMLImageElement>()

        while (true) {
            try {
                const timeFromNowInMs = (parseInt(els.date.value || '0')) * 1000 * 60 * 60 * 24
                const intervalInDays = parseInt(els.interval.value) || 1
                const intervalInMs = intervalInDays * 1000 * 60 * 60 * 24
                const nbWantedImages = parseInt(els.nbImages.value) || 1
                const nbDesiredRows = parseInt(els.nbRows.value) || 1
                let waitDurationInMs = parseInt(els.speed.value) || 2000

                let center = new Date().getTime() + timeFromNowInMs

                let doSearch = false
                if (lastSearchDate != timeFromNowInMs || lastSearchInterval != intervalInMs) {
                    currentOffset = 0
                    doSearch = true

                    // all current images are no more part of the last search
                    toRemove = new Set()
                    enumImages(toRemove)
                }
                else if (!possibleImages || !possibleImages.length) {
                    doSearch = !finished
                }

                if (doSearch) {
                    lastSearchDate = timeFromNowInMs
                    lastSearchInterval = intervalInMs

                    console.log(`do a search on ${center} +/- ${intervalInDays} @ ${currentOffset}`)

                    let searchSpec: any = {
                        mimeType: 'image/%',
                        noDirectory: true,
                        limit: 13,
                        offset: currentOffset,
                        dateMin: center - intervalInMs,
                        dateMax: center + intervalInMs
                    }

                    const results = await Rest.searchEx(searchSpec)
                    possibleImages = results && results.items
                    if (possibleImages.length)
                        currentOffset += possibleImages.length
                    else
                        currentOffset = 0

                    finished = possibleImages.length == 0
                }

                if (possibleImages && possibleImages.length) {
                    els.remark.innerHTML = `${new Date(center).toDateString()} : ${nbWantedImages} images on ${nbDesiredRows} rows +/- ${intervalInDays} days (@${currentOffset})`

                    if (imagesCount() > nbWantedImages) {
                        let imageElement = removeRandomImage()
                        if (imageElement) {
                            if (toRemove.has(imageElement))
                                toRemove.delete(imageElement)
                        }
                    }
                    else {
                        let imageElement: HTMLImageElement = null
                        if (imagesCount() < nbWantedImages) {
                            imageElement = addRandomImage(nbDesiredRows)
                        }
                        else {
                            imageElement = pickRandomImage()
                        }

                        if (toRemove.has(imageElement))
                            toRemove.delete(imageElement)

                        let imageIndex = rand(possibleImages.length)
                        let [usedImage] = possibleImages.splice(imageIndex, 1)
                        if (usedImage)
                            imageElement.src = Rest.getShaImageThumbnailUrl(usedImage.sha, usedImage.mimeType)
                    }
                }
                else {
                    els.remark.innerHTML = `${new Date(center).toDateString()}, no more image, change the cursors`

                    if (toRemove.size) {
                        let imageElements: HTMLImageElement[] = []
                        toRemove.forEach(imageElement => imageElements.push(imageElement))

                        if (imageElements.length) {
                            let imageElement = imageElements[rand(imageElements.length)]
                            imageElement.parentElement.removeChild(imageElement)
                            toRemove.delete(imageElement)
                        }
                    }
                }

                await wait(waitDurationInMs)
            }
            catch (err) {
                Messages.displayMessage(`error in slideshow, waiting 5s`, -1)
                await wait(5000)
            }
        }
    })()

    return els
}

