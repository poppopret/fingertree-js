export const assert = {
    ok(value, message = '') {
        if (!value) {
            throw new Error(message);
        }
    },
    all(values = [], message = '') {
        values.forEach(v => this.ok(v, message));
    }
};

/**
 * Monkey patching class method
 *
 * @param {Object} thisArg
 * @param {String} name, method name
 * @param {Function} func, patched function
 */
export const patch = (thisArg, methodName, func) => {
    let method = thisArg[methodName];
    thisArg[methodName] = (...args) => {
        func(...args);
        return method.apply(thisArg, args);
    };
};
