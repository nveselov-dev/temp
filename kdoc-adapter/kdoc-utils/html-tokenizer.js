/**
 * @module html-tokenizer
 * @description Токенайзер HTML
 */

/**
 * Извлекает блоки <p> и <table> из HTML.
 * @param {string} html - Исходный HTML.
 * @returns {Array<{type: string, source: string}>} Массив найденных блоков.
 */
function tokenizeHtml(html) {
    const blocks = [];
    let i = 0;
    const len = html.length;

    while (i < len) {
        if (html.startsWith('<table', i) && isTagBoundary(html, i + 6)) {
            const endTag = '</table>';
            const endIdx = html.indexOf(endTag, i);
            if (endIdx !== -1) {
                blocks.push({ type: 'table', source: html.slice(i, endIdx + endTag.length) });
                i = endIdx + endTag.length;
                continue;
            }
        }

        if (html.startsWith('<p', i) && isTagBoundary(html, i + 2)) {
            let endIdx = html.indexOf('</p>', i);
            const nextP = html.indexOf('<p', i + 2);
            const nextTable = html.indexOf('<table', i + 2);

            let nextBlock = len;
            if (nextP !== -1) nextBlock = Math.min(nextBlock, nextP);
            if (nextTable !== -1) nextBlock = Math.min(nextBlock, nextTable);

            if (endIdx !== -1 && endIdx < nextBlock) {
                blocks.push({ type: 'p', source: html.slice(i, endIdx + 4) });
                i = endIdx + 4;
            } else {
                blocks.push({ type: 'p', source: html.slice(i, nextBlock) });
                i = nextBlock;
            }
            continue;
        }
        i++;
    }
    return blocks;
}

/**
 * Проверяет, является ли символ после имени тега границей (пробел, >, \n).
 * @param {string} str
 * @param {number} idx
 * @returns {boolean}
 */
function isTagBoundary(str, idx) {
    if (idx >= str.length) return false;
    const char = str[idx];
    return char === ' ' || char === '>' || char === '\n' || char === '\r' || char === '\t';
}

module.exports = tokenizeHtml;