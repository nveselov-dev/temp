/**
 * @module pid-generator
 * @description Генератор уникальных идентификаторов (pid).
 */
let counter = 0;

function generatePid() {
    return `pid_${++counter}`;
}

function resetPidCounter() {
    counter = 0;
}

module.exports = { generatePid, resetPidCounter };