# :bar_chart: [Line length analyser](https://github.com/shvabuk/line-length-analyser)

## About
This is a library for simple code line lenght analysis.
An example of how to use the library you can find in the file [example.js](https://github.com/shvabuk/line-length-analyser/blob/main/example.js).
You can find the results on [the screenshot](https://github.com/shvabuk/line-length-analyser/blob/main/screenshot.png).
![Screenshot](https://github.com/shvabuk/line-length-analyser/blob/main/screenshot.png?raw=true)

## Just run
1. Download library.
2. Edit the repositories.json file.
3. Run the following commands:
```shell
npm install
npm start
```
4. Open the results/index.html file.

## Quick start
This code is enough to run the analyser:
```js
const analyser = new LineLengthAnalyser();
analyser.addRepository({name: 'Line length analyser', path: 'src'});
const results = await analyser.run();
```

To save data to a JSON file, you can use the LineLengthAnalyser.prototype.saveJSON(destination: string) method.
```js
analyser.saveJSON('results/data.json');
```

To save data to an HTML file using the Twig template, you can use the LineLengthAnalyser.prototype.saveTwig(source: string, destination: string) method.
```js
analyser.saveTwig('twig/index.twig', 'results/index.html');
```

To download a repository from an archive, you can use RepositoriesDownloader.
```js
const downloader = new RepositoriesDownloader();

downloader.addArchive('Line length analyser', 'https://github.com/shvabuk/line-length-analyser/archive/refs/heads/main.zip', 'src', [.js]);

// to get data from a file
downloader.addArchivesFromFile(path.resolve(__dirname, 'repositories.json'));

const downloadedRepositories = await downloader.download();
const analyser = new LineLengthAnalyser();
analyser.addRepositories(downloadedRepositories);
const results = await analyser.run();
```

### LineLengthAnalyser settings
The only argument for creating an instance of LineLengthAnalyser might be the settings object.
```ts
interface Filter {
    (line:string): string
}

interface Settings {
  patternPrefix?: string;
  extensions?: string[];
  excludePattern?: RegExp;
  line?: {
    filter?: Filter;
    ignoreLength?: number;
  }
}
```
```js
const defultSettings = {
    patternPrefix: '**/*', // prefix before extensions to search for files by "glob"
    extensions: [], // empty array for any extension
    excludePattern: /^.*\.min\..*$/i, // RegEx pattern to exclude a file by its name
    line: {
        filter: line => line, // we can transform the line before calculating its length
        ignoreLength: -1, // "-1" does not ignore, line.trim() is hardcoded to count the length of the line
    }
};
const analyser = new LineLengthAnalyser(settings);
```

The argument to the LineLengthAnalyser.prototype.addRepository(repository: Repository) method is an object with the name and path properties.
```ts
interface Repository {
  name: string;
  path: string;
}
```
```js
// Example
{
    name: 'Line length analyser', // an arbitrary name for the repository
    path: 'src' // the directory relative to the executable file in which contain the files to be analysed
}
```

The argument to the LineLengthAnalyser.prototype.addRepositories(repositories: Repository[]) method is an array of the objects described above.

LineLengthAnalyser.prototype.run(): Promise<RepositoryResults[]> returns a promise that returns the results of analysing repositories files.
```ts
interface FileResults {
    name: string;
    path: string;
    lineCount: number;
    emptyLineCount: number;
    minLineLength: number;
    shortestLineNumber: number;
    maxLineLength: number;
    widestLineNumber: number;
    lengths: number[];
    meanLineLength: number;
    firstQuartileLineLength: number;
    medianLineLength: number;
    thirdQuartileLineLength: number;
    emptyLinesPercent: number;
}

interface RepositoryResults {
    name: string;
    path: string;
    pattern: string;
    excludePattern: string;
    lineFilter: string;
    minLineLength: number;
    settings: Settings;
    results: FileResults[];
}
```

### RepositoriesDownloader settings
The first argument is the path to the folder with the archives that will be downloaded.

The second argument is the path to the folder with the selected files extensions of the unzipped repository.
```js
const downloader = new RepositoriesDownloader('archives', 'repositories');
```
