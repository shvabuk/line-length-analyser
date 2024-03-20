/*!
  * Line length analyser v1.0.0 (https://github.com/shvabuk/line-length-analyser)
  * Copyright 2024-2024 Ostap Shvab
  * Licensed under MIT (https://github.com/shvabuk/line-length-analyser/blob/master/LICENSE)
  * 
  */
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const fs = require('node:fs');
const path = require('node:path');
const Twig = require('twig');
const pretty = require('pretty');

// TODO: move to separate modules

function isObject(value) {
    return typeof value === 'object' &&
        !Array.isArray(value) &&
        value !== null &&
        !(value instanceof RegExp);
}

function deepMerge(target, source) {
    for (const key in source) {
        if (isObject(target[key]) && isObject(source[key])) {
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

function saveJSON(filePath, data, force = true, createDirectory = true) {
    if (fs.existsSync(filePath)) {
        if (force) {
            fs.unlinkSync(filePath);
        } else {
            throw new Error(`File: "${filePath}" already exist.`);
        }
    }

    if (createDirectory) {
        createDir(path.dirname(filePath));
    }

    fs.writeFileSync(filePath, JSON.stringify(data), { flag: 'wx' });
    
    return filePath;
}

function createDir(dir, recursive = true) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive });
    } else if (!fs.lstatSync(dir).isDirectory()) {
        throw new Error(`"${dir}" is not a directory.`);
    }
}

function render(source, destination, data) {
    if (!fs.existsSync(source)) {
        throw new Error(`File: "${source} not found."`);
    }

    Twig.renderFile(source, data, (err, html) => {
        if (err) throw err;

        const dirname = path.dirname(destination);
        fs.mkdir(dirname, { recursive: true }, (err) => {
            if (err) throw err;
        });

        fs.writeFileSync(destination, pretty(html));
    });

    return destination;
}

exports.createDir = createDir;
exports.deepMerge = deepMerge;
exports.prettifyFloat = prettifyFloat;
exports.render = render;
exports.saveJSON = saveJSON;
