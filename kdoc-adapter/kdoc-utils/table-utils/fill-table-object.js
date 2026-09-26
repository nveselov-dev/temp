const cheerio = require("cheerio");
const isHorizontalLinesOnly = require("./is-only-horisontal");
const {
  isBoldFull,
  isItalicText,
  getTextFormat,
} = require("../text-utils/text-format-utils");

/**
 * Заполняет табличный объект адаптера.
 *
 * Функция принимает коллекцию cheerio-объектов рядов таблицы,
 * объект cheerio для работы с DOM, объект со стилями и табличный объект из адаптера.
 *
 * @param {Iterable<cheerio.Cheerio>} rows коллекция cheerio-объектов рядов таблицы.
 * @param {cheerio.CheerioAPI} $ объект cheerio для работы с DOM.
 * @param {object} stylesData объект со стилями.
 * @param {object} tableObject табличный объект из адаптера.
 * @returns {void}
 */
module.exports = (rows, $, stylesData, tableObject) => {
  rows.each((_rowIndex, rowElement) => {
    $("td p", rowElement).each((_cellIndex, cellElement) => {
      const $cellElement = $(cellElement);

      const styleClass = stylesData[$cellElement.attr("class")];

      const isBold =
        $cellElement.text().trim() &&
        (styleClass["font-weight"] == "bold" ||
          isBoldFull($cellElement.toString(), stylesData));
      const isItalic =
        $cellElement.text().trim() &&
        (styleClass["font-style"] == "italic" ||
          isItalicText($cellElement.toString(), stylesData));
      const format = getTextFormat(styleClass, $cellElement, isBold);

      const $e = cheerio.load($cellElement.html());

      $e('span[style="padding-left:1em;"]').each(function () {
        $(this).replaceWith(" ");
      });

      const cellObject = {
        type: "P",
        source: $cellElement.toString(),
        pid: $cellElement.attr("data-pid"),
        spacesBefore: 0,
        text: $e.text(),
        format: format,
        align: styleClass ? styleClass["text-align"] : undefined,
        isBold: isBold,
        isItalic: isItalic,
      };

      tableObject.cells.push(cellObject);

      if (cellObject.pid) {
        tableObject.lastPid = cellObject.pid;
      }
    });
  });

  tableObject.isDoubleLine = isHorizontalLinesOnly(rows, $, stylesData);

  const firstCellWithPid = tableObject.cells.find((obj) => obj.pid);
  tableObject.firstPid = firstCellWithPid ? firstCellWithPid.pid : null;
};
