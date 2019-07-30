"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UiTools = require("./ui-tool");
const elementsData = new WeakMap();
function templateElement(root, name) {
    let list = UiTools.els(root, `[x-id=${name}]`);
    return list.length ? list.item(0) : null;
}
function createElementAndLocateChildren(html) {
    let root = UiTools.elFromHtml(html);
    let data = {
        root
    };
    UiTools.els(root, `[x-id]`).forEach(e => data[e.getAttribute('x-id')] = e);
    elementsData.set(root, data);
    return root;
}
exports.createElementAndLocateChildren = createElementAndLocateChildren;
function getTemplateInstanceData(root) {
    const data = elementsData.get(root);
    return data;
}
exports.getTemplateInstanceData = getTemplateInstanceData;
function createTemplateInstance(html) {
    let root = createElementAndLocateChildren(html);
    return getTemplateInstanceData(root);
}
exports.createTemplateInstance = createTemplateInstance;
const EMPTY_LOCATION = { element: null, childIndex: -1 };
function templateGetEventLocation(elements, event) {
    let els = new Set(Object.values(elements));
    let c = event.target;
    let p = null;
    do {
        if (els.has(c)) {
            return {
                element: c,
                childIndex: p && Array.prototype.indexOf.call(c.children, p)
            };
        }
        if (c == elements.root)
            return EMPTY_LOCATION;
        p = c;
        c = c.parentElement;
    } while (c);
    return EMPTY_LOCATION;
}
exports.templateGetEventLocation = templateGetEventLocation;
//# sourceMappingURL=templates.js.map