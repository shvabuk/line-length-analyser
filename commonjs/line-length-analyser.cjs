/*!
  * Line length analyser v1.2.0 (https://github.com/shvabuk/line-length-analyser)
  * Copyright 2024-2024 Ostap Shvab
  * Licensed under MIT (https://github.com/shvabuk/line-length-analyser/blob/master/LICENSE)
  * 
  */
'use strict';

const repositoryAnalyser = require('./repository-analyser.cjs');
const fileAccess = require('./file-access.cjs');
require('./archive-downloader.cjs');
require('node:fs');
require('node:path');
require('follow-redirects');
require('./repository-decompresser.cjs');
require('decompress');
require('./unit-analyser.cjs');
require('glob');
require('./file-analyser.cjs');
require('node:readline');
require('./helper.cjs');
require('./math.cjs');

class LineLengthAnalyser {

    #analysers = [];
    #results = [];

    addRepository(repository) {
        const repositoryAnalyser$1 = new repositoryAnalyser(repository);

        this.#analysers.push(repositoryAnalyser$1);
    }

    addRepositories(repositories) {
        repositories.forEach(repository => this.addRepository(repository));
    }

    async run() {
        const promises = this.#analysers.map(repoAnalyser => repoAnalyser.run());

        return Promise.all(promises).then(results => {
            this.#results = results;

            return this.#results;
        });

    }

    saveJSON(path) {
        const JSONData = this.#results.map(data => {
            const repository = { ...data};
            delete repository.settings;
        
            return repository;
        });

        return fileAccess.saveJSON(path, JSONData);
    }
}

module.exports = LineLengthAnalyser;
