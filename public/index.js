(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./ui-tool", "./templates"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const UiTool = require("./ui-tool");
    const Templates = require("./templates");
    console.log(`hello you`);
    UiTool.el('content-wrapper').appendChild(Templates.searchPanel.createElement());
});
//# sourceMappingURL=index.js.map