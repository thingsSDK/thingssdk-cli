'use strict';
const path = require("path");
const fs = require("fs");
const mkdirp = require("mkdirp");

const {createDevicesJSON} = require('./devices');
const {write, copy, isDirectoryEmpty} = require('./core/file');
const colors = require('./core/colors-theme');
const {shouldOverwrite} = require('./core/cli-helpers');


/**
 * @const
 * @type {object}
 * @description
 * A list of possible runtimes that can be listed in the package.json file for
 * the IoT project. Currently not configurable, defaults to esprurino 1.89
 */
const RUNTIMES = {
    espruino: "1.89"
};


/**
 * @name checkForTilde
 *
 * @description
 * Helper function to check the destination path and display any needed warnings
 *
 * @param {String} destinationPath
 * @throws {Error} Bad Path
 */
function checkForTilde(destinationPath) {
    /**
     If the first part of the path contains a ~,
     we'll assume the user intends for their project to install
     relative to their home directory on a Unix machine and throw an error.
   */
    if (destinationPath.split('/')[0].includes('~')) {
        console.log(colors.error(`
  Uh-oh, check your desired project path!
  It looks like you made a reference to your home directory: ~/
  Due to cross platform compatibility with non-Unix systems, that causes some problems.
  Try again using absolute paths like /Users/<your username>/path/to/project
`));
        throw new Error(`Bad path, we're sorry...`);
    }

    /**
      If any other part of the path contains a ~,
      we'll just give them a helpful warning.
    */
    if (destinationPath.includes('~')) {
        console.log(colors.warn(`
  Be careful, it looks like your project path contains a "~".
  If you remove this directory, be very careful about running "rm -rf \\~"
  You could accidentally destroy your home directory!
  `));
    }
}

/**
 * @name createApplication
 * @requires isDirectoryEmpty
 * @requires shouldOverwrite
 * @requires createFiles
 * @requires projectCreated
 *
 * @description
 * Checks if the desired project folder is empty, then creates the project files
 * if it is, then displays basic instructions after project has been successfully
 * created.
 *
 * @param {Object} options The four configuration options passed to the yargs
 *    command line.
 *
 * ```js  options = {
 *          port,
 *          baud_rate,
 *          path,
 *          runtime
 *        }
 * ```
 */
function createApplication(options) {
    const {path: destinationPath, runtime} = options;
    return isDirectoryEmpty(destinationPath)
        .then(isEmpty => {
            if (isEmpty) {
                return true;
            } else {
                return shouldOverwrite(destinationPath);
            }
        })
        .then(proceed => {
            if (proceed) {
                return createFiles(options).then(() => {
                    projectCreated(destinationPath);
                });
            }
        });
}

/**
 * @name projectCreated
 *
 * @description
 * Helper function to display instructions after project is successfully created
 *
 * @param {String} destinationPath
 */
function projectCreated(destinationPath) {
    const successMessage = `To install the project dependencies:
    cd ${destinationPath} && npm install
To upload to your device:
    Development:
        npm run dev
    Production:
        npm run deploy`;

    console.log(colors.help(successMessage));
}

/**
 * @name makeDirectory
 *
 * @description
 * Helper function to promisify mkdir
 *
 * @param {String} directory The name of the desired new directory
 */
function makeDirectory(directory) {
    return new Promise((resolve, reject) => {
        mkdirp(directory, err => {
            if (err) reject(err);
            else resolve();
        });
    });
}

/**
 * @name createFiles
 * @requires checkForTilde
 * @requires makeDirectory
 * @requires createPackageJSON
 * @requires createDevicesJSON
 *
 * @description
 * Selects the correct template files for the IoT project, creates the new project
 * folder, and copies the template files into the new project folder. Configures
 * and writes the package.json and devices.json files. Currently runtime for all
 * projects created is fixed at esprurino 1.89.
 *
 * @param {Object} options The four configuration options passed to the yargs
 *    command line.
 *
 * ```js  options = {
 *          port,
 *          baud_rate,
 *          path,
 *          runtime
 *        }
 * ```
 */
function createFiles(options) {
    const {port, baud_rate, path: destinationPath, runtime} = options;
    const app_name = path.basename(path.resolve(destinationPath));
    const templatesPath = path.join(__dirname, "..", "templates");
    const scriptPath = path.join(templatesPath, runtime, "scripts");

    checkForTilde(destinationPath);

    return makeDirectory(path.join(destinationPath, 'scripts'))
        .then(() => makeDirectory(path.join(destinationPath, 'build')))
        .then(() => {
        /* Copy templates */
        fs.readdir(scriptPath, (err, files) => {
            if (err) throw err;
            files.forEach(file => copy(path.join(scriptPath, file), path.join(destinationPath, "scripts", file)));
        });

        /* Create package.json for project */
        const pkg = createPackageJSON(app_name, runtime);
        write(path.join(destinationPath, "package.json"), JSON.stringify(pkg, null, 2));
        copy(path.join(templatesPath, 'main.js'), path.join(destinationPath, 'main.js'));
        copy(path.join(templatesPath, 'dot-gitignore'), path.join(destinationPath, '.gitignore'));
        copy(path.join(templatesPath, 'dot-gitattributes'), path.join(destinationPath, '.gitattributes'));

        /* Create devices.json and finish */
        const deviceJSONOptions = { port, baud_rate, runtime, destinationPath };
        return createDevicesJSON(deviceJSONOptions);
    });
}

/**
 * @name createPackageJSON
 *
 * @description
 * Returns the package.json object for the IoT project
 *
 * @param {String} app_name The name for the IoT project
 * @param {String} runtime Key string asociated with the required runtime env
 *    desired from the RUNTIMES object.
 *
 * @returns {Object} The package.json object for the new project
 */
function createPackageJSON(app_name, runtime) {
    const pkg = {
        name: app_name,
        version: '0.0.0',
        private: true,
        main: 'main.js',
        scripts: {
            dev: "node ./scripts/upload development && npm run repl",
            deploy: "node ./scripts/upload production",
            repl: "node ./scripts/repl"
        },
        devDependencies: {
            "thingssdk-deployer": "~1.0.0",
            "thingssdk-espruino-strategy": "~1.0.1"
        },
        engines: {

        }
    };

    pkg.engines[runtime] = RUNTIMES[runtime];

    return pkg;
}

module.exports = {
    createApplication
};
