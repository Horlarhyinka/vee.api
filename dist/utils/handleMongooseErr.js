"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (ex) => {
    var _a;
    console.log(ex.code);
    if (ex.code == 11000)
        return "resource already existed";
    if ((_a = ex._message) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes("validation failed")) {
        return Object.keys(ex.errors).map((k) => {
            return ex.errors[k].properties.message;
        }).join("\n");
    }
    return false;
};
