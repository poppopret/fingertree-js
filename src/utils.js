export const connect = f => f; // for readability, so that `func(arg)` equals `connect(func)(arg)`

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
