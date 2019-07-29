(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./ui-tool"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const UiTools = require("./ui-tool");
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
</div>`;
    exports.searchPanel = {
        create: () => {
            return templateHtml;
        },
        createElement: () => {
            return UiTools.elFromHtml(exports.searchPanel.create());
        }
    };
});
//# sourceMappingURL=templates.js.map