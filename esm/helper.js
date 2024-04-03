export function isPlainObject(value) {
    return value?.constructor === Object;
}

export function deepMerge(target, source) {
    for (const key in source) {
        if (isPlainObject(target[key]) && isPlainObject(source[key])) {
            target[key] = deepMerge(target[key], source[key]);
        } else {
            target[key] = source[key];
        }
    }

    return target;
}

export function prettifyFloat(num, fixed = 2) {
    return parseFloat(num.toFixed(fixed));
}
