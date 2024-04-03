import fs from 'node:fs';
import path from 'node:path';

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
