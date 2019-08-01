import * as Rest from './rest'
import { TemplateElements, createTemplateInstance } from './templates'
import * as Snippets from './html-snippets'

export interface DirectoryPanelElements extends TemplateElements {
    title: HTMLElement
    items: HTMLElement
}

const templateHtml = `
<div class='mui-container'>
    <div class="mui--text-center">
        <h2 x-id="title"></h2>
        <div x-id="items" class="mui-panel"></div>
    </div>
</div>`

export const directoryPanel = {
    create: () => createTemplateInstance(templateHtml) as DirectoryPanelElements,

    setLoading: (elements: DirectoryPanelElements, title: string) => {
        elements.title.innerHTML = `Loading '${title}' ...`
        elements.items.innerHTML = ``
    },

    displaySearching: (elements: DirectoryPanelElements, term: string) => {
        elements.title.innerHTML = `<div class="mui--text-dark-hint">Searching '${term}' ...</div>`
        elements.items.innerHTML = ``
    },

    setValues: (elements: DirectoryPanelElements, values: { name: string, items: Rest.FileDescriptor[] }) => {
        elements.title.innerHTML = `${values.name}`

        elements.items.classList.remove('x-image-panel')
        elements.items.classList.add('x-items-panel')

        if (values.items && values.items.length) {
            elements.items.innerHTML = values.items.map(Snippets.itemToHtml).join('')
        }
        else {
            elements.items.innerHTML = `<div class="mui--text-dark-hint">No results</div>`
        }
    },

    setImages: (elements: DirectoryPanelElements, values: { term: string, items: Rest.FileDescriptor[] }) => {
        elements.title.innerHTML = values.term

        elements.items.classList.add('x-image-panel')
        elements.items.classList.remove('x-items-panel')

        let placeholder = null

        elements.items.innerHTML = values.items.map(item => {
            if (item.mimeType.startsWith('image/')) {
                if (!placeholder)
                    placeholder = Rest.getShaImageThumbnailUrl(item.sha, item.mimeType)
                return `<div><img loading="lazy" src="${placeholder}" data-src="${Rest.getShaImageThumbnailUrl(item.sha, item.mimeType)}"/></div>`
            }
            else {
                return `<div>${Snippets.itemToHtml(item)}</div>`
            }
        }).join('')

        let lazyImageObserver = new IntersectionObserver(function (entries, observer) {
            console.log(`here obs`)
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    let lazyImage = entry.target as HTMLImageElement;
                    lazyImage.src = lazyImage.dataset.src
                    lazyImageObserver.unobserve(lazyImage)
                }
            })
        })

        values.items.forEach((item, index) => {
            if (item.mimeType.startsWith('image/')) {
                lazyImageObserver.observe(elements.items.children.item(index))
            }
        })
    },
}