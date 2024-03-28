/*!
  * Line length analyser v1.1.1 (https://github.com/shvabuk/line-length-analyser)
  * Copyright 2024-2024 Ostap Shvab
  * Licensed under MIT (https://github.com/shvabuk/line-length-analyser/blob/master/LICENSE)
  * 
  */
'use strict';

const path = require('node:path');
const decompress = require('decompress');
const helper = require('./helper.cjs');
require('node:fs');
require('twig');
require('pretty');

class RepositoryDecompresser {

    #name;
    #path;
    #archive;
    #allowedExtensions;

    constructor(
        archive,
        allowedExtensions = [],
        repositoriesDir = 'tmp/repositories'
    ) {
        this.#archive = archive;
        this.#name = path.basename(this.#archive, path.extname(this.#archive));
        this.#path = repositoriesDir + path.sep + this.#name;
        this.#initAllowedExtensions(allowedExtensions);
        this.#initDirectory(repositoriesDir);
    }

    #initAllowedExtensions(allowedExtensions) {
        this.#allowedExtensions = allowedExtensions.map(extension => {
            return (extension.substring(0, 1) === '.')? extension: `.${extension}`;
        });
    }

    #initDirectory(repositoriesDir) {
        helper.createDir(repositoriesDir);
    }

    async decompress() {
        const settings = { strip: 1 };

        if (this.#allowedExtensions.length > 0) {
            settings.filter = file => this.#allowedExtensions.includes(path.extname(file.path));
        }
        
        helper.remove(this.#path);

        return decompress(this.#archive, this.#path, settings).then(() => {
            console.log(`Repository ${this.#name} decompressed.`);

            helper.remove(this.#archive);

            return this.#path;
        });
    }

    getPath() {
        return this.#path;
    }
}

module.exports = RepositoryDecompresser;
