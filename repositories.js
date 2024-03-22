export default [
    {
        name: 'Satellite tracker',
        source: 'https://github.com/shvabuk/satellite-tracker/archive/master.zip',
        decompressExtensions: ['.js', '.cjs', '.mjs'],
        unitsOfAnalysis: [
            {
                name: 'JS',
                pathes: ['esm'],
                extensions: ['.js', '.cjs', '.mjs'],
                excludePattern: /^.*(\.min\.|gulpfile\.js).*$/i,
                line: {
                    filter: line => line.trim(),
                    ignoreLength: 3,
                    commentBeginSymbols: ['//'], // undocumented feature, will be changed in the future
                }
            },
        ],
    },
    {
        name: 'Line length analyser',
        source: 'https://github.com/shvabuk/line-length-analyser/archive/master.zip',
        decompressExtensions: ['.js', '.cjs', '.mjs'],
        unitsOfAnalysis: [
            {
                name: 'JS',
                pathes: ['esm'],
                extensions: ['.js', '.cjs', '.mjs'],
                excludePattern: /^.*(\.min\.|gulpfile\.js).*$/i,
                line: {
                    filter: line => line.trim(),
                    ignoreLength: 3,
                    commentBeginSymbols: ['//'], // undocumented feature, will be changed in the future
                }
            },
        ],
    },
    {
        name: 'Github pages',
        source: 'https://github.com/shvabuk/shvabuk.github.io/archive/master.zip',
        decompressExtensions: ['.js', '.cjs', '.mjs', 'scss'],
        unitsOfAnalysis: [
            {
                name: 'JS',
                pathes: ['js'],
                extensions: ['.js', '.cjs', '.mjs'],
                excludePattern: /^.*(\.min\.|gulpfile\.js).*$/i,
                line: {
                    filter: line => line.trim(),
                    ignoreLength: 3,
                    commentBeginSymbols: ['//'], // undocumented feature, will be changed in the future
                }
            },
            {
                name: 'SCSS',
                pathes: ['scss'],
                extensions: ['.scss'],
                excludePattern: /a^/i, // this shouldn't match anything
                line: {
                    filter: line => line.trim(),
                    ignoreLength: 1,
                    commentBeginSymbols: ['//'], // undocumented feature, will be changed in the future
                }
            },
        ],
    }
]
