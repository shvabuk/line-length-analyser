import path from 'node:path';
import { glob } from 'glob';
import FileAnalyser from './file-analyser.js';
import { deepMerge } from './helper.js';

export default class UnitAnalyser {

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
        return deepMerge({
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

        this.#globPattern = this.#repositoryPath + path.sep + pattern
    }

    async run() {
        const files = this.#getFiles();

        const analysers = files.map(filePath => {
            return new FileAnalyser(filePath, this.#repositoryPath, this.#lineAnalysisSettings);
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
        let files = glob.sync(this.#globPattern);
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
