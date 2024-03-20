import fs from 'node:fs';
import ArhchiveDownloader from './archive-downloader.js';

export default class RepositoriesDownloader {
    #downloaders = [];
    #arhcivesSourceDir;
    #arhcivesDestinationDir;

    constructor(arhcivesSourceDir = 'archives', arhcivesDestinationDir = 'repositories') {
        this.#arhcivesSourceDir = arhcivesSourceDir;
        this.#arhcivesDestinationDir = arhcivesDestinationDir;
    }

    addArchive(name, source, pathInRepository, extensions = []) {
        const downloader = new ArhchiveDownloader(
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
        const url = new URL(filePath, import.meta.url);
    
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
