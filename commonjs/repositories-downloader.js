/*!
  * Line length analyser v1.0.0 (https://github.com/shvabuk/line-length-analyser)
  * Copyright 2024-2024 Ostap Shvab
  * Licensed under MIT (https://github.com/shvabuk/line-length-analyser/blob/master/LICENSE)
  * 
  */
'use strict';

const fs = require('node:fs');
const archiveDownloader = require('./archive-downloader.js');
require('node:path');
require('decompress');
require('follow-redirects');
require('./helper.js');
require('twig');
require('pretty');

var _documentCurrentScript = typeof document !== 'undefined' ? document.currentScript : null;
class RepositoriesDownloader {
    #downloaders = [];
    #arhcivesSourceDir;
    #arhcivesDestinationDir;

    constructor(arhcivesSourceDir = 'archives', arhcivesDestinationDir = 'repositories') {
        this.#arhcivesSourceDir = arhcivesSourceDir;
        this.#arhcivesDestinationDir = arhcivesDestinationDir;
    }

    addArchive(name, source, pathInRepository, extensions = []) {
        const downloader = new archiveDownloader(
            name,
            source,
            pathInRepository,
            extensions,
            this.#arhcivesSourceDir,
            this.#arhcivesDestinationDir
        );

        this.#downloaders.push(downloader);
    }

    addArchivesFromFile(repositoriesFilePath) {
        const arhcivesList = this.#readJSON(repositoriesFilePath);

        arhcivesList.forEach(archive => {
            this.addArchive(archive.name, archive.source, archive.path, archive.extensions);
        });
    }

    #readJSON(filePath) {
        const url = new URL(filePath, (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (_documentCurrentScript && _documentCurrentScript.src || new URL('repositories-downloader.js', document.baseURI).href)));
    
        if (fs.existsSync(url)) {
            const content = fs.readFileSync(url);
            
            return JSON.parse(content);
        }
    }

    async download() {
        const promises = this.#downloaders.map(downloader => downloader.run());

        return Promise.all(promises).then(repositories => {
            return repositories;
        });
    }
}

module.exports = RepositoriesDownloader;
