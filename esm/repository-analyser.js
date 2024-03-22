import ArhchiveDownloader from './archive-downloader.js';
import RepositoryDecompresser from './repository-decompresser.js';
import UnitAnalyser from './unit-analyser.js';
import { deepMerge } from './helper.js';

export default class RepositoryAnalyser {

    #name;
    #settings;
    #downloader;
    #decompresser;
    #unitsAnalysers;

    constructor(settings) {
        const rs = this.#initSettings(settings);
        this.#name = settings.name;
        this.#downloader = new ArhchiveDownloader(rs.name, rs.source);
        this.#decompresser = new RepositoryDecompresser(this.#downloader.getPath(), rs.decompressExtensions);
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

        this.#settings = deepMerge({
            decompressExtensions: [],
        }, settings);

        return this.#settings;
    }

    #initUnitsAnalysers(repositoryPath) {
        this.#unitsAnalysers = this.#settings.unitsOfAnalysis.map(unitSettings => {
            return new UnitAnalyser(repositoryPath, unitSettings);
        })
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
