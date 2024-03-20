/*!
  * Line length analyser v1.0.0 (https://github.com/shvabuk/line-length-analyser)
  * Copyright 2024-2024 Ostap Shvab
  * Licensed under MIT (https://github.com/shvabuk/line-length-analyser/blob/master/LICENSE)
  * 
  */
'use strict';

const repositoryAnalyser = require('./repository-analyser.js');
const helper = require('./helper.js');
require('glob');
require('./file-analyser.js');
require('node:fs');
require('node:path');
require('node:readline');
require('./math.js');
require('twig');
require('pretty');

class LineLengthAnalyser {

    #settings;
    #analysers = [];
    #results = [];

    constructor(settings = {}) {
        this.#settings = helper.deepMerge({
            patternPrefix: '**/*', // prefix before extensions for "glob" files search
            extensions: [], // leave empty array for any extension
            excludePattern: /^.*\.min\..*$/i, // exclude file name RegEx pattern
            line: {
                filter: line => line, // we can transform line before counting line lenght
                ignoreLength: -1, // "-1" means don't ignore, line.trim() is hardcoded for this value
                commentBeginSymbols: [], // ignore lines started with symbols
            }
        }, settings);
    }

    addRepository(repository) {
        const repoAnalyser = new repositoryAnalyser(repository, this.#settings);

        this.#analysers.push(repoAnalyser);
    }

    addRepositories(repositories) {
        repositories.forEach(repository => this.addRepository(repository));
    }

    async run() {
        const promises = this.#analysers.map(repoAnalyser => repoAnalyser.run());

        return Promise.all(promises).then(results => {
            this.#results = results.map((result, index) => {
                result.index = index;
                return result;
            });

            return this.#results;
        });

    }

    saveJSON(path) {
        const JSONData = this.#results.map(data => {
            const repository = { ...data};
            delete repository.settings;
        
            return repository;
        });

        return helper.saveJSON(path, JSONData);
    }

    saveTwig(source, destination) {
        return helper.render(source, destination, {
            version: process.env && process.env.npm_package_version,
            repositories: this.#results,
        });
    }
}

module.exports = LineLengthAnalyser;
