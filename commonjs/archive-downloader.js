/*!
  * Line length analyser v1.0.0 (https://github.com/shvabuk/line-length-analyser)
  * Copyright 2024-2024 Ostap Shvab
  * Licensed under MIT (https://github.com/shvabuk/line-length-analyser/blob/master/LICENSE)
  * 
  */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const decompress = require('decompress');
const followRedirects = require('follow-redirects');
const helper = require('./helper.js');
require('twig');
require('pretty');

class ArhchiveDownloader {

    #archiveDir;
    #destinationDir;
    #allowedextensions;
    #archive;

    constructor(
        name,
        source,
        pathInRepository,
        allowedextensions = [],
        archiveDir = 'archives',
        destinationDir = 'decompressed'
    ) {
        this.#archiveDir = archiveDir;
        this.#destinationDir = destinationDir;
        this.#createDir(this.#archiveDir);
        this.#createDir(this.#destinationDir);
        this.#allowedextensions = allowedextensions.map(extension => {
            return (extension.substring(0, 1) === '.')? extension: `.${extension}`;
        });
        this.#archive = {
            name,
            source,
            path: pathInRepository,
            fileName: name.toLowerCase().trim().replace(/\s/i, '-'),
            extension: path.parse(source).ext,
        };
    }

    async run() {
        return this.#download().then(() => {
            return this.#unzip();
        });
    }

    #createDir(dir) {
        helper.createDir(dir);
    }

    #download() {
        const url = this.#archive.source;
        const filePath = this.#generatePath(this.#archiveDir, this.#archive.fileName, this.#archive.extension);
        const proto = !url.charAt(4).localeCompare('s') ? followRedirects.https : followRedirects.http;
      
        return new Promise((resolve, reject) => {
            this.#remove(filePath);

            console.log(`${this.#archive.fileName} download started.`);

            const file = fs.createWriteStream(filePath);
        
            const request = proto.get(url, response => {
                response.pipe(file);
            });
      
            // The destination stream is ended by the time it's called
            file.on('finish', () => {
                this.#archive.filePath = filePath;

                console.log(`${this.#archive.fileName} downloaded.`);

                resolve();
            });
        
            request.on('error', err => {
                this.#remove(filePath);
                reject(err);
            });
        
            file.on('error', err => {
                this.#remove(filePath);
                reject(err);
            });
        
            request.end();
        });
    }

    #generatePath(dir, fileName, extension = '') {
        return dir + path.sep + fileName + extension ;
    }

    #remove(filePath) {
        if (fs.existsSync(filePath)) {
            fs.rmSync(filePath, { recursive: true, force: true });
        }
    }

    async #unzip() {
        const settings = { strip: 1 };

        if (this.#allowedextensions.length > 0) {
            settings.filter = file => this.#allowedextensions.includes(path.extname(file.path));
        }

        const destination = this.#generatePath(this.#destinationDir, this.#archive.fileName);
        
        this.#remove(destination);

        return decompress(this.#archive.filePath, destination, settings).then(() => {
            console.log(`${this.#archive.fileName} decompressed.`);

            this.#remove(this.#archive.filePath);

            const pathInRepository = (this.#archive.path)? this.#archive.path: '';

            return {
                name: this.#archive.name,
                path: path.join(destination, pathInRepository),
            };
        });
    }
}

module.exports = ArhchiveDownloader;
