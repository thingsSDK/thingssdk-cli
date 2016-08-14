'use strict';
const colors = require('../core/colors-theme');

/**
 * CLI based functions only
 */

const readLine = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
});


function askQuestion(question) {
    return new Promise((resolve, reject) => {
        readLine.question(question, answer => {
            readLine.close();
            resolve(answer);
        });
    });
}

function clearLine() {
    const CLEAR_LINE = new Buffer('1b5b304b', 'hex').toString();
    const MOVE_LEFT = new Buffer('1b5b3130303044', 'hex').toString();
    process.stdout.write(MOVE_LEFT + CLEAR_LINE);
    process.stdout.write("");
}

function printLoading(message, loadingChar, count) {
    let i = 0;
    let interval = setInterval(() => {
        if (i === 0) {
            process.stdout.write(message);
        }
        process.stdout.write(loadingChar);
        if (i > count) {
            clearLine();
            process.stdout.write(message);
            i = 0;
        }
        i++;
    }, 400);
    return () => {
        clearInterval(interval);
        clearLine();
    };
}

function cleanAnswer(answer) {
    return answer.toLowerCase().trim().charAt(0);
}

function shouldOverwrite(destinationPath) {
    const question = `Files already exist at ${destinationPath}.\nWould you like to overwrite the existing files?\nType y or n: `;

    return askQuestion(question)
        .then(cleanAnswer)
        .then(answer => {
            if (answer === 'y') {
                console.log(colors.info("You answered yes. Overwriting existing project files."));
                return true;
            }
            else if (answer === 'n') {
                console.log(colors.warn("No project files were changed. Aborting new project creation."));
                return false;
            }
            else {
                throw "I don't understand your input. No project files were changed. Aborting new project creation.";
            }
        });
}

function onError(err) {
    console.error(colors.error(err));
    process.exit(1);
}

module.exports = {
    shouldOverwrite,
    printLoading,
    onError
};