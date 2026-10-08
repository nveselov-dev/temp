/**
 * @module kdoc-adapter
 * @description Конвертирует HTML в JSON-документ особого вида.
 * Оптимизированная версия без cheerio (O(N) сложность)
 */

const getStyles = require('./kdoc-utils/get-styles'); // Твой существующий модуль
const tokenizeHtml = require('./kdoc-utils/html-tokenizer');
const parseParagraph = require('./kdoc-utils/paragraph-parser');
const parseTable = require('./kdoc-utils/table-parser');

/**
 * Конвертирует html-строку в объект особого вида
 * @param {string} html - Исходная html-строка
 * @returns {Promise<object>} Результат: { objects, styles }
 */
module.exports = async (html) => {
  try {
    // 1. Читаем стили
    const stylesData = getStyles(html);

    // 2. Токенизируем HTML (быстро, без cheerio)
    const blocks = tokenizeHtml(html);
    const objects = [];

    // 3. Последовательно парсим каждый блок
    for (const block of blocks) {
      try {
        if (block.type === 'p') {
          objects.push(parseParagraph(block.source, stylesData));
        } else if (block.type === 'table') {
          // Таблица может разбиться на несколько объектов
          const tableObjects = parseTable(block.source, stylesData);
          objects.push(...tableObjects);
        }
      } catch (err) {
        console.error('[WARN] Ошибка парсинга блока:', err.message);
        // Не падаем, продолжаем обработку
      }
    }

    return { objects, styles: stylesData };
  } catch (error) {
    console.error('[FATAL] Критическая ошибка:', error);
    return { objects: [], styles: {} };
  }
};