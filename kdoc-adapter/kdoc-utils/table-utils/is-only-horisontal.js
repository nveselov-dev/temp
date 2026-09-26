/**
 * Проверяет, что таблица имеет только нижнюю и верхнюю границу.
 *
 * Функция принимает коллекцию рядов таблицы, объект cheerio для работы с DOM и объект со стилями,
 * и возвращает boolean значение, указывающее на то, что таблица имеет только нижнюю и верхнюю границу.
 *
 * @param {Iterable<cheerio.Cheerio>} rows коллекция рядов таблицы.
 * @param {cheerio.CheerioAPI} $ объект cheerio для работы с DOM.
 * @param {object} stylesData объект со стилями.
 * @returns {boolean} Результат проверки: true, если таблица имеет только нижнюю и верхнюю границу, иначе false.
 */
module.exports = (rows, $, stylesData) => {
  let isHorizontalLinesOnly = true;
  rows.each((rowIndex, rowElement) => {
    $("td", rowElement).each((_cellIndex, cellElement) => {
      if (!isHorizontalLinesOnly) return;

      const $cellElement = $(cellElement);
      const styleClass = stylesData[$cellElement.attr("class")];

      const top = /solid/.test(styleClass["border-top"]);
      const bottom = /solid/.test(styleClass["border-bottom"]);
      const left = /solid/.test(styleClass["border-left"]);
      const right = /solid/.test(styleClass["border-right"]);

      if (rowIndex == 0) {
        // Верхний ряд: только верхняя граница, нет боковых границ
        if (top && !bottom && !left && !right) return;
      } else if (rowIndex == rows.length - 1) {
        // Нижний ряд: только нижняя граница, нет боковых границ
        if (!top && bottom && !left && !right) return;
      } else {
        // Средние ряды: ни верхней, ни нижней границы, нет боковых границ
        if (!top && !bottom && !left && !right) return;
      }

      isHorizontalLinesOnly = false;
    });
  });
  return isHorizontalLinesOnly;
};
