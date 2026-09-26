const fillTableObject = require("./table-utils/fill-table-object");
const hasBorders = require("./table-utils/has-borders");
const isDoubleFrame = require("./table-utils/is-double-frame");
const isSingleFrame = require("./table-utils/is-single-frame");
const isTermins = require("./table-utils/is-termins");
const isPictures = require("./table-utils/is-pictures");
const fillByRows = require("./table-utils/fill-by-rows");
const fillByObjects = require("./table-utils/fill-by-objects");
const fillTermins = require("./table-utils/fill-termins");
const fillByPictures = require("./table-utils/fill-by-pictures");

const docType = require("../constants").DOC_TYPE;

/**
 * Функция для создания объектов-таблиц.
 *
 * Функция принимает коллекцию объектов-таблиц, полученную из Cheerio, объект Cheerio для работы с элементами DOM
 * и объект со стилями, полученный после обработки входного kdoc.
 *
 * @param {Iterable<cheerio.Cheerio>} tables коллекция объектов-таблиц, полученная из Cheerio.
 * @param {cheerio.CheerioAPI} $ объект Cheerio для работы с элементами DOM.
 * @param {object} stylesData объект со стилями, полученный после обработки входного kdoc.
 * @returns {void}
 */
module.exports = (tables, $, stylesData) => {
  const tablesArray = [];

  tables.each((_tableIndex, tableElement) => {
    const tableObject = {
      type: "TABLE",
      cells: [],
      firstPid: "",
      lastPid: "",
      docType: docType,
    };

    const tableText = $(tableElement).html();
    const rows = $("tr", tableElement);
    // проверяем наличие более чем одной ячейки
    if (rows.length > 1) {
      const doubleFrame = isDoubleFrame(rows, $, stylesData);
      const singleFrame = isSingleFrame(rows, $, stylesData);
      const isRealTable = hasBorders(tableElement, $, stylesData);
      const isTeminsSection = isTermins(rows, $);
      const isPicturesTable = isPictures(rows, $);

      if (!doubleFrame) {
        fillTableObject(rows, $, stylesData, tableObject);
        tablesArray.push(tableObject);
      }

      if (!isRealTable && !isPicturesTable) {
        fillByRows(tableObject, rows, $, stylesData);
      }

      if (!isRealTable && isPicturesTable) {
        fillByPictures(tableObject, tableText, stylesData);
      }

      if (singleFrame) {
        fillByObjects(tableObject, tableText, stylesData);
      }

      if (isTeminsSection) {
        fillTermins(tableObject, tableText, stylesData);
      }
    }
    // ВОЗМОЖНО: написать вариант когда в единственной строке таблицы больше одной непустой ячейки!!!!!!!!!!
    else if (!hasBorders(tableElement, $, stylesData) && !isPictures(rows, $)) {
      fillTableObject(rows, $, stylesData, tableObject);
      fillByRows(tableObject, rows, $, stylesData);
      tablesArray.push(tableObject);
    }
  });

  return tablesArray;
};
