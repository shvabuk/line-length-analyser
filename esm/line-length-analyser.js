import RepositoryAnalyser from './repository-analyser.js';
import { saveJSON, render} from './helper.js';

export default class LineLengthAnalyser {

    #analysers = [];
    #results = [];

    addRepository(repository) {
        const repositoryAnalyser = new RepositoryAnalyser(repository);

        this.#analysers.push(repositoryAnalyser);
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

        return saveJSON(path, JSONData);
    }

    saveTwig(source, destination) {
        return render(source, destination, {
            version: 0 || process.env && process.env.npm_package_version,
            repositories: this.#results,
        });
    }
}
