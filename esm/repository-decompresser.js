import path from 'node:path';
import decompress from 'decompress';
import { remove, createDir } from './helper.js';

export default class RepositoryDecompresser {

    #name;
    #path;
    #archive;
    #allowedExtensions;

    constructor(
        archive,
        allowedExtensions = [],
        repositoriesDir = 'tmp/repositories'
    ) {
        this.#archive = archive;
        this.#name = path.basename(this.#archive, path.extname(this.#archive));
        this.#path = repositoriesDir + path.sep + this.#name;
        this.#initAllowedExtensions(allowedExtensions);
        this.#initDirectory(repositoriesDir);
    }

    #initAllowedExtensions(allowedExtensions) {
        this.#allowedExtensions = allowedExtensions.map(extension => {
            return (extension.substring(0, 1) === '.')? extension: `.${extension}`;
        });
    }

    #initDirectory(repositoriesDir) {
        createDir(repositoriesDir);
    }

    async decompress() {
        const settings = { strip: 1 };

        if (this.#allowedExtensions.length > 0) {
            settings.filter = file => this.#allowedExtensions.includes(path.extname(file.path));
        }
        
        remove(this.#path);

        return decompress(this.#archive, this.#path, settings).then(() => {
            console.log(`Repository ${this.#name} decompressed.`);

            remove(this.#archive);

            return this.#path;
        });
    }

    getPath() {
        return this.#path;
    }
}
