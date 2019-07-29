﻿"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const templates_1 = require("./templates");
const TID_SearchForm = 'search-form';
const TID_SearchTerm = 'search-term';
const templateHtml = `
<div class='mui-container-fluid'>
    <div class="mui--text-center">
        <h1>Raccoon</h1>
        <form x-id="${TID_SearchForm}" class="mui-form--inline">
            <!--this is a little hack to have things centered-->
            <div class="mui-btn mui-btn--flat" style="visibility: hidden;">🔍</div>
            <div class="mui-textfield">
                <input x-id="${TID_SearchTerm}" type="text">
            </div>
            <button role="submit" class="mui-btn mui-btn--flat">🔍</button>
        </form>
        <br /><a href="#">Browse</a> - <a href="#">Settings</a>
    </div>
</div>`;
exports.searchPanel = {
    create: () => templates_1.createTemplateInstance(templateHtml, [TID_SearchForm, TID_SearchTerm])
};
//# sourceMappingURL=search-panel.js.map