# :bar_chart: [Line length analyser](https://github.com/shvabuk/line-length-analyser)

## About
This is a library for simple code line lenght analysis.
An example of how to use the library you can find in the file [example.js](https://github.com/shvabuk/line-length-analyser/blob/main/example.js).
You can find the results on [the screenshot](https://github.com/shvabuk/line-length-analyser/blob/main/screenshot.png).
![Screenshot](https://github.com/shvabuk/line-length-analyser/blob/main/screenshot.png?raw=true)

## Just run
1. Download library.
2. Edit the repositories.js file.
3. Run the following commands:
```shell
npm install
npm start
```
4. Open the results/index.html file.

## Quick start
This code is enough to run the analyser:
```js
import LineLengthAnalyser from 'line-length-analyser';
import repositories from './repositories.js';

const analyser = new LineLengthAnalyser();
analyser.addRepositories(repositories);

const results = await analyser.run();
```

To save data to a JSON file, you can use the LineLengthAnalyser.prototype.saveJSON(destination: string) method.
```js
analyser.saveJSON('results/data.json');
```

### LineLengthAnalyser interface
```ts
interface LineLengthAnalyser {
  addRepository(Repository): void;
  addRepositories(Repository[]): void;
  run(): Promise<RepositoryResults[]>;
  saveJSON(path: string): string;
}
```
### Related interfaces
```ts
interface Repository {
  name: string,
  source: string,
  decompressExtensions?: string[],
  unitsOfAnalysis: UnitOfAnalysis[],
}

interface UnitOfAnalysis {
  name: string; // name of unit of analysis
  pathes: string[]; // empty array for any path
  extensions: string[]; // empty array for any extension
  excludePattern: RegExp; // RegEx pattern to exclude a file by its name
  patternPrefix?: string; // prefix before extensions to search for files by "glob"
  line?: {
    filter?: Filter; // we can transform the line before calculating its length
    ignoreLength?: number; // "-1" does not ignore, line.trim() is hardcoded to count the length of the line
  };
}

interface RepositoryResults {
  name: string;
  results: UnitResults[];
}

interface UnitResults {
  name: string;
  results: FileResults[];
}

interface FileResults {
  name: string;
  path: string;
  lineCount: number;
  emptyLineCount: number;
  minLineLength: number;
  shortestLineNumber: number;
  maxLineLength: number;
  widestLineNumber: number;
  meanLineLength: number;
  firstQuartileLineLength: number;
  medianLineLength: number;
  thirdQuartileLineLength: number;
  emptyLinesPercent: number;
  lengths: number[];
}
```
