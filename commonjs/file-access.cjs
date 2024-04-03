/*!
  * Line length analyser v1.2.0 (https://github.com/shvabuk/line-length-analyser)
  * Copyright 2024-2024 Ostap Shvab
  * Licensed under MIT (https://github.com/shvabuk/line-length-analyser/blob/master/LICENSE)
  * 
  */
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const fs = require('node:fs');
const path = require('node:path');

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

function remove(filePath, opts = { recursive: true, force: true }) {
    if (fs.existsSync(filePath)) {
        fs.rmSync(filePath, opts);
    }
}

exports.createDir = createDir;
exports.remove = remove;
exports.saveJSON = saveJSON;
