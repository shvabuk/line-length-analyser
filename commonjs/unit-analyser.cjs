/*!
  * Line length analyser v1.1.0 (https://github.com/shvabuk/line-length-analyser)
  * Copyright 2024-2024 Ostap Shvab
  * Licensed under MIT (https://github.com/shvabuk/line-length-analyser/blob/master/LICENSE)
  * 
  */
'use strict';

const path = require('node:path');
const glob = require('glob');
const fileAnalyser = require('./file-analyser.cjs');
const helper = require('./helper.cjs');
require('node:fs');
require('node:readline');
require('./math.cjs');
require('twig');
require('pretty');

class UnitAnalyser {

    #name;
    #repositoryPath;
    #pathes;
    #globPattern;
    #excludePattern;
    #lineAnalysisSettings;

    constructor(repositoryPath, settings = {}) {
        const properties = this.#getProperties(settings);
        this.#repositoryPath = repositoryPath;
        this.#name = properties.name;
        this.#pathes = properties.pathes;
        this.#excludePattern = properties.excludePattern;
        this.#lineAnalysisSettings = properties.line;
        this.#initGlobPattern(properties.patternPrefix, properties.extensions);
    }

    #getProperties(settings) {
        return helper.deepMerge({
            name: '',
            pathes: [],
            extensions: [],
            excludePattern: /a^/i,
            patternPrefix: '**/*',
            line: {
                filter: line => line,
                ignoreLength: -1,
                commentBeginSymbols: [], // undocumented feature, will be changed in the future
            }
        }, settings);
    }

    #initGlobPattern(patternPrefix, extensions) {
        const exts = extensions.map(extension => {
            return (extension.substring(0, 1) === '.')? extension: `.${extension}`;
        });

        let pattern = patternPrefix;

        if (exts.length === 1) {
            pattern = patternPrefix + exts[0];
        }

        if (exts.length > 1) {
            pattern = `${patternPrefix}{${exts.join(',')}}`;
        }

        this.#globPattern = this.#repositoryPath + path.sep + pattern;
    }

    async run() {
        const files = this.#getFiles();

        const analysers = files.map(filePath => {
            return new fileAnalyser(filePath, this.#repositoryPath, this.#lineAnalysisSettings);
        });

        const promises = analysers.map(analyser => analyser.run());

        return Promise.all(promises).then(results => {
            return {
                name: this.#name,
                results
            };
        });
    }

    #getFiles() {
        let files = glob.glob.sync(this.#globPattern);
        files = this.#exclude(files);

        return files;
    }

    #exclude(files) {
        return files.filter(filePath => {
            let include = false;

            this.#pathes.forEach(dirPath => {
                if (filePath.indexOf(this.#repositoryPath + path.sep + dirPath) === 0) {
                    include = true;
                }
            });

            return include;
        }).filter(filePath => {
            return !this.#excludePattern.test(filePath);
        });
    }
}

module.exports = UnitAnalyser;
