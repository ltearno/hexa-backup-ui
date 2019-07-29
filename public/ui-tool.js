(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function el(id) {
        return document.getElementById(id);
    }
    exports.el = el;
    function els(element, selector) {
        return element.querySelectorAll(selector);
    }
    exports.els = els;
    function elFromHtml(html) {
        const parent = document.createElement('div');
        parent.innerHTML = html;
        return parent.children.item(0);
    }
    exports.elFromHtml = elFromHtml;
});
//# sourceMappingURL=ui-tool.js.map