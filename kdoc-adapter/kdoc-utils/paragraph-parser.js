/**
 * @module paragraph-parser
 * @description Парсинг блока <p> в объект ParagraphNode.
 */
const ParagraphNode = require('../models/ParagraphNode');
const { generatePid } = require('../kdoc-utils/pid-generator');
const { cleanText } = require('../kdoc-utils/text-cleaner');
const { parseStyles } = require('../kdoc-utils/get-styles');

/**
 * Парсит HTML абзаца в модель.
 * @param {string} source - Исходный HTML <p>...</p>.
 * @returns {ParagraphNode}
 */
function parseParagraph(source) {
    try {
        const styles = parseStyles(extractAttr(source, 'style'));
        const align = extractAttr(source, 'align') || styles['text-align'];

        const marginLeft = parseFloat(styles['margin-left']) || 0;
        const paddingLeft = parseFloat(styles['padding-left']) || 0;
        const spacesBefore = (marginLeft === 5 || paddingLeft === 5) ? 5 : undefined;

        let format = '';
        if (/<h[1-6]\b/i.test(source)) format = 'headertext';
        else if (styles['font-weight'] === 'bold' || /<b\b|<strong\b/i.test(source)) format = 'formattext';

        const isBold = /<b\b|<strong\b/i.test(source) || styles['font-weight'] === 'bold';
        const isItalic = /<i\b|<em\b/i.test(source) || styles['font-style'] === 'italic';
        const contentMatch = source.match(/<p[^>]*>([\s\S]*)<\/p>/i);
        const innerHtml = contentMatch ? contentMatch[1] : '';
        const isBoldBegin = isBold && /^\s*<(b|strong)\b/i.test(innerHtml.trim());

        return new ParagraphNode({
            source,
            pid: generatePid(),
            spacesBefore,
            text: cleanText(innerHtml),
            format,
            align,
            isBold,
            isItalic,
            isBoldBegin
        });
    } catch (error) {
        console.error('Error parsing paragraph:', error.message);
        return new ParagraphNode({ source, pid: generatePid(), text: 'PARSE_ERROR' });
    }
}

/**
 * Извлекает значение атрибута из открывающего тега.
 * @param {string} html
 * @param {string} attrName
 * @returns {string|undefined}
 */
function extractAttr(html, attrName) {
    const regex = new RegExp(`${attrName}\\s*=\\s*["']([^"']*)["']`, 'i');
    const match = html.match(regex);
    return match ? match[1] : undefined;
}

module.exports = parseParagraph;