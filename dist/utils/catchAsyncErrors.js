"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (fn) => {
    return (req, res, next) => {
        try {
            fn(req, res);
        }
        catch (ex) {
            console.log(ex);
            next();
        }
    };
};
