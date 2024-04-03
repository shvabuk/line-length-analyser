import Pages from 'pages';
import LineLengthAnalyser from './esm/line-length-analyser.js';
import repositories from './repositories.js';

const analyser = new LineLengthAnalyser();
analyser.addRepositories(repositories);

const results = await analyser.run();
const JSONPath = analyser.saveJSON('results/data.json');
console.log(`File: "${JSONPath}" created.`);

const pages = new Pages();
const HTMLPath = 'results/index.html';
pages.renderPage('twig/index.twig', HTMLPath, {
    repositories: results,
    version: 0 || process.env && process.env.npm_package_version,
});
console.log(`File: "${HTMLPath}" created.`);
