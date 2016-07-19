'use strict';

const rollup = require('rollup').rollup;
const babel = require('rollup-plugin-babel');

rollup({
    entry: 'examples/main.js',
    plugins: [
        babel({
            presets: ['es2015-rollup']
        })
    ]
}).then(bundle => {
    let result = bundle.generate({
        format: 'cjs'
    });
    console.log('Got back');
    console.log(result.code);
}).catch(err => console.error(err));