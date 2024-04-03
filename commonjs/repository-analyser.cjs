/*!
  * Line length analyser v1.2.0 (https://github.com/shvabuk/line-length-analyser)
  * Copyright 2024-2024 Ostap Shvab
  * Licensed under MIT (https://github.com/shvabuk/line-length-analyser/blob/master/LICENSE)
  * 
  */
'use strict';

const archiveDownloader = require('./archive-downloader.cjs');
const repositoryDecompresser = require('./repository-decompresser.cjs');
const unitAnalyser = require('./unit-analyser.cjs');
const helper = require('./helper.cjs');
require('node:fs');
require('node:path');
require('follow-redirects');
require('./file-access.cjs');
require('decompress');
require('glob');
require('./file-analyser.cjs');
require('node:readline');
require('./math.cjs');

class RepositoryAnalyser {

    #name;
    #settings;
    #downloader;
    #decompresser;
    #unitsAnalysers;

    constructor(settings) {
        const rs = this.#initSettings(settings);
        this.#name = settings.name;
        this.#downloader = new archiveDownloader(rs.name, rs.source);
        this.#decompresser = new repositoryDecompresser(this.#downloader.getPath(), rs.decompressExtensions);
        this.#initUnitsAnalysers(this.#decompresser.getPath());
    }

    #initSettings(settings) {
        if (!settings.name) {
            throw new Error(`No repository name.`);
        }

        if (!settings.source) {
            throw new Error(`No repository source.`);
        }

        if (!Array.isArray(settings.unitsOfAnalysis) || settings.unitsOfAnalysis.length === 0) {
            throw new Error(`No units of analysis.`);
        }

        this.#settings = helper.deepMerge({
            decompressExtensions: [],
        }, settings);

        return this.#settings;
    }

    #initUnitsAnalysers(repositoryPath) {
        this.#unitsAnalysers = this.#settings.unitsOfAnalysis.map(unitSettings => {
            return new unitAnalyser(repositoryPath, unitSettings);
        });
    }

    async run() {
        await this.#downloader.download();
        await this.#decompresser.decompress();

        const promises = this.#unitsAnalysers.map(analyser => analyser.run());

        return Promise.all(promises).then(results => {
            return {
                name: this.#name,
                results,
            }
        });
    }
}

module.exports = RepositoryAnalyser;
