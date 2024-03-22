import LineLengthAnalyser from './esm/line-length-analyser.js';
import repositories from './repositories.js';

const analyser = new LineLengthAnalyser();
analyser.addRepositories(repositories);

const results = await analyser.run();
const JSONPath = analyser.saveJSON('results/data.json');
console.log(`File: "${JSONPath}" created.`);
const HTMLPath = analyser.saveTwig('twig/index.twig', 'results/index.html');
console.log(`File: "${HTMLPath}" created.`);
