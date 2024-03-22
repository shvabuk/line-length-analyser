/*!
  * Line length analyser v1.1.0 (https://github.com/shvabuk/line-length-analyser)
  * Copyright 2024-2024 Ostap Shvab
  * Licensed under MIT (https://github.com/shvabuk/line-length-analyser/blob/master/LICENSE)
  * 
  */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const followRedirects = require('follow-redirects');
const helper = require('./helper.cjs');
require('twig');
require('pretty');

class ArhchiveDownloader {

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
        helper.createDir(archivesDir);
    }

    download() {
        const proto = this.#getProtocol();

        return new Promise((resolve, reject) => {
            helper.remove(this.#path);

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
                helper.remove(this.#path);
                reject(err);
            });
        
            file.on('error', err => {
                helper.remove(this.#path);
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

module.exports = ArhchiveDownloader;
