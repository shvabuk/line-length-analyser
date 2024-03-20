import path from 'node:path';
import RepositoriesDownloader from './esm/repositories-downloader.js';
import LineLengthAnalyser from './esm/line-length-analyser.js';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const downloader = new RepositoriesDownloader();

downloader.addArchivesFromFile(path.resolve(__dirname, 'repositories.json'));
const downloadedRepositories = await downloader.download();

const settings = {
    extensions: ['.js'],
    excludePattern: /^.*(\.min\.|gulpfile\.js).*$/i,
    line: {
        filter: line => line.trim(),
        ignoreLength: 3,
        commentBeginSymbols: ['//'], // undocumented feature, will be changed in the future
    }
};
const analyser = new LineLengthAnalyser(settings);

analyser.addRepositories(downloadedRepositories);
analyser.addRepository({name: 'Line length analyser', path: 'esm'});

const results = await analyser.run();
const JSONPath = analyser.saveJSON('results/data.json');
console.log(`File: "${JSONPath}" created.`);
const HTMLPath = analyser.saveTwig('twig/index.twig', 'results/index.html');
console.log(`File: "${HTMLPath}" created.`);
