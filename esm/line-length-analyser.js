import RepositoryAnalyser from './repository-analyser.js';
import { deepMerge, saveJSON, render} from './helper.js';

export default class LineLengthAnalyser {

    #settings;
    #analysers = [];
    #results = [];

    constructor(settings = {}) {
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
    }

    addRepository(repository) {
        const repoAnalyser = new RepositoryAnalyser(repository, this.#settings);

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

        return saveJSON(path, JSONData);
    }

    saveTwig(source, destination) {
        return render(source, destination, {
            version: 0 || process.env && process.env.npm_package_version,
            repositories: this.#results,
        });
    }
}
