import fs from 'node:fs';
import path from 'node:path';
import followRedirects from 'follow-redirects';
import { remove, createDir } from './helper.js';

export default class ArhchiveDownloader {

    #name;
    #source;
    #extension;
    #path;

    constructor(
        name,
        source,
        archivesDir = 'tmp/archives'
    ) {
        this.#source = source;
        this.#extension = path.extname(this.#source);
        this.#name = name.toLowerCase().trim().replace(/\s/g, '-') + this.#extension;
        this.#path = archivesDir + path.sep + this.#name;
        this.#initDirectory(archivesDir);
    }

    #initDirectory(archivesDir) {
        createDir(archivesDir);
    }

    download() {
        const proto = this.#getProtocol();

        return new Promise((resolve, reject) => {
            remove(this.#path);

            console.log(`${this.#name} download started.`);

            const file = fs.createWriteStream(this.#path);
        
            const request = proto.get(this.#source, response => {
                response.pipe(file);
            });
      
            file.on('finish', () => {
                console.log(`${this.#name} downloaded.`);

                resolve(this.getPath());
            });
        
            request.on('error', err => {
                remove(this.#path);
                reject(err);
            });
        
            file.on('error', err => {
                remove(this.#path);
                reject(err);
            });
        
            request.end();
        });
    }

    #getProtocol() {
        return !this.#source.charAt(4).localeCompare('s') ? followRedirects.https : followRedirects.http;
    }

    getPath() {
        return this.#path;
    }
}
