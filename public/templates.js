"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UiTools = require("./ui-tool");
const elementsData = new WeakMap();
function templateElement(root, name) {
    let list = UiTools.els(root, `[x-id=${name}]`);
    return list.length ? list.item(0) : null;
}
function createElementAndLocateChildren(html, elementXIds) {
    let root = UiTools.elFromHtml(html);
    let data = {
        root
    };
    for (let id of elementXIds) {
        data[id] = templateElement(root, id);
    }
    elementsData.set(root, data);
    return root;
}
exports.createElementAndLocateChildren = createElementAndLocateChildren;
function getTemplateInstanceData(root) {
    const data = elementsData.get(root);
    return data;
}
exports.getTemplateInstanceData = getTemplateInstanceData;
function createTemplateInstance(html, elementXIds) {
    let root = createElementAndLocateChildren(html, elementXIds);
    return getTemplateInstanceData(root);
}
exports.createTemplateInstance = createTemplateInstance;
//# sourceMappingURL=templates.js.map