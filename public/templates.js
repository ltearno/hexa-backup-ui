"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UiTools = require("./ui-tool");
function templateElement(root, name) {
    let list = UiTools.els(root, `[x-id=${name}]`);
    return list.length ? list.item(0) : null;
}
const TID_SearchForm = 'search-form';
const TID_SearchValue = 'search-value';
const templateHtml = `
<div class='mui-container-fluid'>
    <div class="mui--text-center">
        <h1>Raccoon</h1>
        <form x-id="${TID_SearchForm}" class="mui-form--inline">
            <!--this is a little hack to have things centered-->
            <div class="mui-btn mui-btn--flat" style="visibility: hidden;">🔍</div>
            <div class="mui-textfield">
                <input x-id="${TID_SearchValue}" type="text">
            </div>
            <button role="submit" class="mui-btn mui-btn--flat">🔍</button>
        </form>
        <br /><a href="#">Browse</a> - <a href="#">Settings</a>
    </div>
</div>`;
exports.searchPanel = {
    create: () => {
        return templateHtml;
    },
    createElement: () => {
        let root = UiTools.elFromHtml(exports.searchPanel.create());
        let data = {
            form: templateElement(root, TID_SearchForm),
            value: templateElement(root, TID_SearchValue)
        };
        root['template-points'] = data;
        return root;
    },
    elements: (root) => {
        const data = root['template-points'];
        return data;
    }
};
//# sourceMappingURL=templates.js.map