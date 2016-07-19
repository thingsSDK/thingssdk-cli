import babel from 'rollup-plugin-babel';

export default {
  entry: 'examples/main.js',
  format: 'iife',
  plugins: [ babel() ],
  dest: 'bundle.js'
};