"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UiTools = require("./ui-tool");
function templateElement(root, name) {
    let list = UiTools.els(root, `[x-id=${name}]`);
    return list.length ? list.item(0) : null;
}
const TEMPLATE_HIDDEN_DATA_ATTRIBUTE = 'template-data';
function createElementAndLocateChildren(html, elementXIds) {
    let root = UiTools.elFromHtml(html);
    let data = {
        root
    };
    for (let id of elementXIds) {
        data[id] = templateElement(root, id);
    }
    root[TEMPLATE_HIDDEN_DATA_ATTRIBUTE] = data;
    return root;
}
exports.createElementAndLocateChildren = createElementAndLocateChildren;
function getTemplateInstanceData(root) {
    const data = root[TEMPLATE_HIDDEN_DATA_ATTRIBUTE];
    return data;
}
exports.getTemplateInstanceData = getTemplateInstanceData;
function createTemplateInstance(html, elementXIds) {
    let root = createElementAndLocateChildren(html, elementXIds);
    return getTemplateInstanceData(root);
}
exports.createTemplateInstance = createTemplateInstance;
//# sourceMappingURL=templates.js.map