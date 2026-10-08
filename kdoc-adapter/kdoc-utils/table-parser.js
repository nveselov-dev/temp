/**
 * @module table-parser
 * @description Парсинг <table>.
 */
const TableNode = require('../models/TableNode');
const RowNode = require('../models/RowNode');
const ParagraphNode = require('../models/ParagraphNode');
const { generatePid } = require('../kdoc-utils/pid-generator');
const { cleanText } = require('../kdoc-utils/text-cleaner');

/**
 * Парсит таблицу, классифицирует её и возвращает массив узлов.
 * @param {string} source - Исходный HTML <table>.
 * @returns {Array<TableNode|RowNode|ParagraphNode>}
 */
function parseTable(source) {
    try {
        const type = classifyTable(source);

        if (type === 'GLOSSARY') {
            return parseGlossary(source);
        }
        if (type === 'LAYOUT') {
            return parseLayoutTable(source);
        }

        return parseStandardTable(source);
    } catch (error) {
        console.error('Error parsing table:', error.message);
        return [new ParagraphNode({ source, pid: generatePid(), text: 'TABLE_PARSE_ERROR' })];
    }
}

/**
 * @param {string} html
 * @returns {'STANDARD'|'FRAME'|'LAYOUT'|'GLOSSARY'}
 */
function classifyTable(html) {
    if (/border\s*=\s*["']?1["']?/i.test(html) || /frame\s*=\s*["']?box["']?/i.test(html)) {
        return 'FRAME';
    }

    if (/border\s*=\s*["']?0["']?/i.test(html) && /cellpadding\s*=\s*["']?0["']?/i.test(html)) {
        return 'LAYOUT';
    }

    const rows = extractRows(html);
    if (rows.length > 0) {
        const firstRowCells = extractCells(rows[0]);
        if (firstRowCells.length === 3) {
            const thirdColText = cleanText(firstRowCells[2]);
            if (/^[a-zA-Z\s\d\.\-]+$/.test(thirdColText) && thirdColText.length > 0) {
                return 'GLOSSARY';
            }
        }
    }

    return 'STANDARD';
}

function parseStandardTable(source) {
    const rows = extractRows(source);
    const cells = [];
    const pids = [];

    for (const row of rows) {
        const tds = extractCells(row);
        for (const td of tds) {
            const pNode = new ParagraphNode({
                source: td,
                pid: generatePid(),
                text: cleanText(td)
            });
            cells.push(pNode);
            pids.push(pNode.pid);
        }
    }

    return [new TableNode({
        source,
        cells,
        firstPid: pids[0] || generatePid(),
        lastPid: pids[pids.length - 1] || generatePid()
    })];
}

function parseLayoutTable(source) {
    const rows = extractRows(source);
    const result = [];

    for (const rowHtml of rows) {
        const tds = extractCells(rowHtml);
        const rowPids = [];
        const rowCells = tds.map(td => {
            const p = new ParagraphNode({ source: td, pid: generatePid(), text: cleanText(td) });
            rowPids.push(p.pid);
            return p;
        });

        result.push(new RowNode({
            source: rowHtml,
            text: rowCells.map(c => c.text).join(' '),
            cells: rowCells,
            firstPid: rowPids[0],
            lastPid: rowPids[rowPids.length - 1]
        }));
    }
    return result;
}

function parseGlossary(source) {
    const rows = extractRows(source);
    const result = [];

    for (const row of rows) {
        const tds = extractCells(row);
        if (tds.length >= 2) {
            const text = `${cleanText(tds[0])} ${cleanText(tds[1])}`.trim();
            result.push(new ParagraphNode({
                source: row,
                pid: generatePid(),
                text
            }));
        }
    }
    return result;
}


function extractRows(tableHtml) {
    const rows = [];
    let i = tableHtml.indexOf('<tr');
    while (i !== -1) {
        const end = tableHtml.indexOf('</tr>', i);
        if (end !== -1) {
            rows.push(tableHtml.slice(i, end + 5));
            i = tableHtml.indexOf('<tr', end + 5);
        } else break;
    }
    return rows;
}

function extractCells(rowHtml) {
    const cells = [];
    let i = 0;
    while (i < rowHtml.length) {
        const tdStart = Math.min(
            rowHtml.indexOf('<td', i) === -1 ? Infinity : rowHtml.indexOf('<td', i),
            rowHtml.indexOf('<th', i) === -1 ? Infinity : rowHtml.indexOf('<th', i)
        );

        if (tdStart === Infinity) break;

        const end = Math.min(
            rowHtml.indexOf('</td>', tdStart) === -1 ? Infinity : rowHtml.indexOf('</td>', tdStart),
            rowHtml.indexOf('</th>', tdStart) === -1 ? Infinity : rowHtml.indexOf('</th>', tdStart)
        );

        if (end !== Infinity) {
            cells.push(rowHtml.slice(tdStart, end + 5));
            i = end + 5;
        } else break;
    }
    return cells;
}

module.exports = parseTable;