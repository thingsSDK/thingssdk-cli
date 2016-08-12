'use strict';
const fs = require("fs");

const NO_SUCH_FILE_OR_DIRECTORY_ERROR_CODE = 'ENOENT';

function write(path, contents) {
    fs.writeFileSync(path, contents);
}

function copy(from, to) {
    write(to, fs.readFileSync(from));
}

function isDirectoryEmpty(path) {
    return new Promise((resolve, reject) => {
        fs.readdir(path, (err, files) => {
            /* istanbul ignore if  */
            if (err && err.code !== NO_SUCH_FILE_OR_DIRECTORY_ERROR_CODE) {
                reject(err);
            } else {
                const noFilesPresent = !files || !files.length;
                resolve(noFilesPresent, path);
            }
        });
    });
}

module.exports = {
    write,
    copy,
    isDirectoryEmpty
};