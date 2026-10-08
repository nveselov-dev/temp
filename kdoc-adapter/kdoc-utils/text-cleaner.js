/**
 * @module text-cleaner
 * @description Очистка HTML от тегов с сохранением <img>.
 */

/**
 * Удаляет все HTML-теги, кроме <img>.
 * @param {string} html - Исходная строка.
 * @returns {string} Очищенный текст.
 */
function cleanText(html) {
    if (!html) return '';
    return html.replace(/<\/?([a-zA-Z0-9]+)\b[^>]*>/gi, (match, tag) => {
        return tag.toLowerCase() === 'img' ? match : '';
    }).replace(/\s+/g, ' ').trim();
}

module.exports = { cleanText };