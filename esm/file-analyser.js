import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { deepMerge, prettifyFloat } from './helper.js';
import math from './math.js';

export default class FileAnalyser {

    #name;
    #path;
    #settings;
    #lineCount = 0;
    #minLineLength = Infinity;
    #shortestLineNumber = 0;
    #maxLineLength = 0;
    #widestLineNumber = 0;
    #totalChars = 0;
    #emptyLineCount = 0;
    #commentLineCount = 0;
    #lengths = [];

    constructor(path, repositoryPath = '', settings = {}) {
        this.#path = path;
        this.#initName(repositoryPath);
        this.#initSettings(settings);
    }

    #initName(repositoryPath) {
        const name = this.#path.slice(repositoryPath.length);

        if (name.substring(0, path.sep.length) === path.sep) {
            this.#name = name.slice(path.sep.length);
        } else {
            this.#name = name;
        }
    }

    #initSettings(settings) {
        this.#settings = deepMerge({
            filter: line => line,
            ignoreLength: -1,
            commentBeginSymbols: [],
        }, settings);
    }

    run() {
        return new Promise((resolve, reject) => {
            const fileStream = fs.createReadStream(this.#path);

            const lineReader = readline.createInterface({
                input: fileStream
            });

            lineReader.on('line', (line) => {
                this.#processLine(line);
            });

            lineReader.on('close', () => resolve(this.#getResults()));
            lineReader.on('error', reject);
        });
    }

    #processLine(ln) {
        this.#lineCount++;

        if (ln.trim().length === 0) this.#emptyLineCount++;

        const line = this.#settings.filter(ln);

        if (line.length <= this.#settings.ignoreLength) return;

        if (this.#isCommentLine(ln)) {
            this.#commentLineCount++;

            return;
        }
        
        const lineSize = line.length;
        this.#lengths.push(lineSize);
        this.#totalChars += lineSize;
        this.#setWidestLine(lineSize);
        this.#setShortestLine(lineSize);
    }

    // TODO: Find better solution
    #isCommentLine(line) {
        const entries = this.#settings.commentBeginSymbols.filter((symb)=>{
            return line.trim().indexOf(symb) === 0;
        });

        return entries.length > 0;
    }

    #setWidestLine(lineSize) {
        if (lineSize > this.#maxLineLength) {
            this.#maxLineLength = lineSize;
            this.#widestLineNumber = this.#lineCount;
        }
    }

    #setShortestLine(lineSize) {
        if (lineSize < this.#minLineLength) {
            this.#minLineLength = lineSize;
            this.#shortestLineNumber = this.#lineCount;
        }
    }

    #getResults() {
        return {
            name: this.#name,
            path: this.#path,
            lineCount: this.#lineCount,
            emptyLineCount: this.#emptyLineCount,
            minLineLength: this.#minLineLength,
            shortestLineNumber: this.#shortestLineNumber,
            maxLineLength: this.#maxLineLength,
            widestLineNumber: this.#widestLineNumber,
            meanLineLength: this.#getMeanLineLength(),
            firstQuartileLineLength: this.#getFirstQuartileLineLength(),
            medianLineLength: this.#getMedianLineLength(),
            thirdQuartileLineLength: this.#getThirdQuartileLineLength(),
            emptyLinesPercent: this.#getEmptyLinesPercent(),
            // __commentLineCountPercent: this.#getCommentLinesPercent(), // value might be inaccurate
            lengths: this.#lengths,
        };
    }

    #getMeanLineLength() {
        return prettifyFloat(math.mean(this.#lengths));
    }

    #getFirstQuartileLineLength() {
        return prettifyFloat(math.quantile(this.#lengths, 0.25));
    }

    #getMedianLineLength() {
        return prettifyFloat(math.quantile(this.#lengths, 0.5));
    }

    #getThirdQuartileLineLength() {
        return prettifyFloat(math.quantile(this.#lengths, 0.75));
    }

    #getEmptyLinesPercent() {
        const ratio = 100 * this.#emptyLineCount / this.#lineCount;

        return prettifyFloat(ratio);
    }

    // This value might be inaccurate
    #getCommentLinesPercent() {
        const ratio = 100 * this.#commentLineCount / this.#lineCount;

        return prettifyFloat(ratio);
    }
}
