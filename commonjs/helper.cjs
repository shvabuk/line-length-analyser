/*!
  * Line length analyser v1.2.0 (https://github.com/shvabuk/line-length-analyser)
  * Copyright 2024-2024 Ostap Shvab
  * Licensed under MIT (https://github.com/shvabuk/line-length-analyser/blob/master/LICENSE)
  * 
  */
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

function isPlainObject(value) {
    return value?.constructor === Object;
}

function deepMerge(target, source) {
    for (const key in source) {
        if (isPlainObject(target[key]) && isPlainObject(source[key])) {
            target[key] = deepMerge(target[key], source[key]);
        } else {
            target[key] = source[key];
        }
    }

    return target;
}

function prettifyFloat(num, fixed = 2) {
    return parseFloat(num.toFixed(fixed));
}

exports.deepMerge = deepMerge;
exports.isPlainObject = isPlainObject;
exports.prettifyFloat = prettifyFloat;
