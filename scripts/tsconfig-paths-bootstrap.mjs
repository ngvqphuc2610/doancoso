import { register } from 'tsconfig-paths';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const tsConfig = require('../tsconfig.json');
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const baseUrl = './'; // Either absolute or relative path. If relative it's resolved to current working directory.
register({
    baseUrl,
    paths: { '@/*': ['src/*'] }
});
