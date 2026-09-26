/**
 * Проверяет, что таблица является просто элементами в рамке.
 *
 * Функция принимает коллекцию рядов таблицы, объект cheerio для работы с DOM и объект со стилями,
 * и возвращает boolean значение, указывающее на то, что таблица является просто элементами в рамке.
 *
 * @param {Iterable<cheerio.Cheerio>} rows коллекция рядов таблицы.
 * @param {cheerio.CheerioAPI} $ объект cheerio для работы с DOM.
 * @param {object} stylesData объект со стилями.
 * @returns {boolean} Результат проверки: true, если таблица является просто элементами в рамке, иначе false.
 */
module.exports = (rows, $, stylesData) => {
  let isSingleFrame = true;

  const rowCount = rows.length;

  rows.each((rowIndex, rowElement) => {
    const colCount = $(rowElement).find("td").length;

    $("td", rowElement).each((cellIndex, cellElement) => {
      if (!isSingleFrame) return;

      const $cellElement = $(cellElement);
      const styleClass = stylesData[$cellElement.attr("class")];

      const left = /solid/.test(styleClass["border-left"]);
      const right = /solid/.test(styleClass["border-right"]);
      const top = /solid/.test(styleClass["border-top"]);
      const bottom = /solid/.test(styleClass["border-bottom"]);

      const isTopRow = rowIndex == 0;
      const isBottomRow = rowIndex == rowCount - 1;
      const isFirstCol = cellIndex == 0;
      const isLastCol = cellIndex == colCount - 1;

      if (isTopRow) {
        if (isFirstCol) {
          if (left && top && !right && !bottom) {
            return;
          }

          if (isLastCol && left && top && right && !bottom) {
            return;
          }
        }
        if (isLastCol) {
          if (!left && top && right && !bottom) {
            return;
          }
        } else {
          if (top) return;
        }
      } else if (isBottomRow) {
        if (isFirstCol) {
          if (left && !top && !right && bottom) {
            return;
          }

          if (isLastCol && left && !top && right && bottom) {
            return;
          }
        }
        if (isLastCol) {
          if (!left && !top && right && bottom) {
            return;
          }
        } else {
          if (bottom) return;
        }
      } else {
        if (isFirstCol) {
          if (left && !top && !bottom) {
            return;
          }

          if (isLastCol && left && !top && right && !bottom) {
            return;
          }
        } else if (isLastCol) {
          if (!top && right && !bottom) {
            return;
          }
        } else if (!isTopRow && !isBottomRow && !isFirstCol && !isLastCol) {
          return;
        }
      }

      isSingleFrame = false;
    });
  });

  return isSingleFrame;
};
