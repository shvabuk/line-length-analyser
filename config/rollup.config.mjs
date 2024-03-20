import path from 'node:path';
import { fileURLToPath } from 'node:url';
import banner from './banner.mjs';
import { glob } from 'glob';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const files = glob.sync(`${path.resolve(__dirname, '../esm')}**/*.js`);

const rollupConfig = {
  input: files,
  output: {
    banner: banner(),
    dir: path.resolve(__dirname, `../commonjs`),
    format: 'cjs',
    generatedCode: 'es2015',
  },
  external: ['glob', 'twig', 'pretty', 'decompress', 'follow-redirects', 'node:fs', 'node:path', 'node:readline'],
}

export default rollupConfig;
