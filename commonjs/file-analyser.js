/*!
  * Line length analyser v1.0.0 (https://github.com/shvabuk/line-length-analyser)
  * Copyright 2024-2024 Ostap Shvab
  * Licensed under MIT (https://github.com/shvabuk/line-length-analyser/blob/master/LICENSE)
  * 
  */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline');
const helper = require('./helper.js');
const math = require('./math.js');
require('twig');
require('pretty');

class FileAnalyser {

    #settings;
    #name;
    #path;
    #lineCount = 0;
    #minLineLength = Infinity;
    #shortestLineNumber = 0;
    #maxLineLength = 0;
    #widestLineNumber = 0;
    #totalChars = 0;
    #emptyLineCount = 0;
    #commentLineCount = 0;
    #lengths = [];

    constructor(path, nameExcludePrefix = '', settings = {}) {
        this.#path = path;
        this.#generateName(nameExcludePrefix);
        this.#settings = helper.deepMerge({
            filter: line => line,
            ignoreLength: -1,
            commentBeginSymbols: [],
        }, settings);
    }

    #generateName(nameExcludePrefix) {
        const name = this.#path.slice(nameExcludePrefix.length);

        if (name.substring(0, path.sep.length) === path.sep) {
            this.#name = name.slice(path.sep.length);
        } else {
            this.#name = name;
        }
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
        return helper.prettifyFloat(math.mean(this.#lengths));
    }

    #getFirstQuartileLineLength() {
        return helper.prettifyFloat(math.quantile(this.#lengths, 0.25));
    }

    #getMedianLineLength() {
        return helper.prettifyFloat(math.quantile(this.#lengths, 0.5));
    }

    #getThirdQuartileLineLength() {
        return helper.prettifyFloat(math.quantile(this.#lengths, 0.75));
    }

    #getEmptyLinesPercent() {
        const ratio = 100 * this.#emptyLineCount / this.#lineCount;

        return helper.prettifyFloat(ratio);
    }

    // This value might be inaccurate
    #getCommentLinesPercent() {
        const ratio = 100 * this.#commentLineCount / this.#lineCount;

        return helper.prettifyFloat(ratio);
    }
}

module.exports = FileAnalyser;
