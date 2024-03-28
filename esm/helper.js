// TODO: move to separate modules
// TODO: remove Twig and pretty modules
import fs from 'node:fs';
import path from 'node:path';
import Twig from 'twig';
import pretty from 'pretty';

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

export function saveJSON(filePath, data, force = true, createDirectory = true) {
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

export function createDir(dir, recursive = true) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive });
    } else if (!fs.lstatSync(dir).isDirectory()) {
        throw new Error(`"${dir}" is not a directory.`);
    }
}

export function remove(filePath, opts = { recursive: true, force: true }) {
    if (fs.existsSync(filePath)) {
        fs.rmSync(filePath, opts);
    }
}

export function render(source, destination, data) {
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
