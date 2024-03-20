import { glob } from 'glob';
import FileAnalyser from './file-analyser.js';
import { deepMerge } from './helper.js';
import path from 'node:path';

export default class RepositoryAnalyser {

    #repository;
    #settings;
    #analysers;

    constructor(repository, settings) {
        this.#repository = repository;
        this.#settings = deepMerge({
            patternPrefix: '**/*', // prefix before extensions for "glob" files search
            extensions: [], // leave empty array for any extension
            excludePattern: /^.*\.min\..*$/i, // exclude file name RegEx pattern
            line: {
                filter: line => line, // we can transform line before counting line lenght
                ignoreLength: -1, // "-1" means don't ignore, line.trim() is hardcoded for this value
                commentBeginSymbols: [], // ignore lines started with symbols
            }
        }, settings);

        this.#setAnalysers();
    }

    #setAnalysers() {
        const files = this.#getFiles();

        this.#analysers = files.map(filePath => {
            return new FileAnalyser(filePath, this.#repository.path, this.#settings.line);
        });
    }

    #getFiles() {
        const pattern = this.#getPattern();
        const files = glob.sync(pattern);

        return this.#exclude(files, this.#settings.excludePattern);
    }

    #getPattern() {
        const exts = this.#settings.extensions.map(extension => {
            return (extension.substring(0, 1) === '.')? extension: `.${extension}`;
        });

        let pattern = this.#settings.patternPrefix;

        if (exts.length === 1) {
            pattern = this.#settings.patternPrefix + exts[0];
        }

        if (exts.length > 1) {
            pattern = `${this.#settings.patternPrefix}{${exts.join(',')}}`;
        }

        pattern = this.#repository.path + path.sep + pattern

        return pattern;
    }

    #exclude(files, pattern) {
        return files.filter(filePath => {
            return !pattern.test(filePath);
        });
    }

    async run() {
        const promises = this.#analysers.map(fileAnalyser => fileAnalyser.run());

        return Promise.all(promises).then(results => {
            return {
                name: this.#repository.name,
                path: this.#repository.path,
                pattern: this.#getPattern(),
                excludePattern: this.#settings.excludePattern.toString(),
                lineFilter: this.#settings.line.filter.toString(),
                minLineLength: this.#settings.line.ignoreLength + 1,
                settings: this.#settings,
                results,
            }
        });
    }
}
