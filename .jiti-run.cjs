const path = require('path');
const { createJiti } = require('jiti');
const root = __dirname;
const jiti = createJiti(path.join(root, 'noop.js'), { alias: { '@': path.join(root, 'src') }, interopDefault: true });
jiti(path.resolve(process.argv[2]));
