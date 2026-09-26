const cheerio = require("cheerio");

const getParagraph = require("../text-utils/get-paragraph");
const fillTableObject = require("./fill-table-object");

const docType = require("../../constants").DOC_TYPE;
const notRowMarker = require("../../constants").NOT_ROW_MARKER;

const formRegExp =
  /\([\s\S]*?(дата|имя|фамилия|отчество|инициалы|подпись|наименование|должность)[\s\S]*?\)/;

/**
 * Заполняет поле "objects" у табличного объекта, если это не таблица, а элементы в рамке.
 *
 * Функция принимает табличный объект из адаптера, HTML-строку с таблицей и объект со стилями,
 * и заполняет поле "objects" у табличного объекта.
 *
 * @param {object} tableObject табличный объект из адаптера.
 * @param {string} tableString HTML-строка с таблицей.
 * @param {object} stylesData объект со стилями.
 * @returns {void} 
 */
module.exports = (tableObject, tableString, stylesData) => {
  // Если в таблице есть ячейка с указанным шаблоном, то это, скорее всего, просто форма
  if (tableObject.cells.find((cell) => cell.text.trim().match(formRegExp))) {
    return;
  }

  tableObject.type = "OBJECTS";
  tableObject.objects = [];

  const columsNumber = tableString.match(
    /<col[^>]*?>([\s\S]*?<\/col>)?/g
  ).length;

  let colNumb = 1;
  let colString = "";

  // обрезаем крайние колонки
  const cutHtml = tableString
    .replace(/<col[^>]*?>([\s\S]*?<\/col>)?/g, (str) => {
      if (colNumb == 1) {
        colNumb++;
        return "";
      }

      if (colNumb == columsNumber) {
        return "";
      }

      colNumb++;
      colString += str;
      return str;
    })
    .replace(/<tr[^>]*?>[\s\S]*?<\/tr>/g, (str) => {
      const cells = str.split(/<td/);

      if (cells.length == 2) {
        return str.replace(/<\/td>[\s\S]*?<\/tr>/, (str) => notRowMarker + str);
      }

      const newRow = `<tr><td${cells
        .slice(2, cells.length - 1)
        .join("<td")}</tr>`;

      return newRow;
    });

  const htmlStrings = [];

  const rows = cutHtml.match(/<tr[^>]*?>[\s\S]*?<\/tr>/g);

  let table = "";

  // формируем массив html-строк, полученных из объектов внутри рамки
  for (let row of rows) {
    const cells = row.match(/<td[^>]*?>[\s\S]*?<\/td>/g);

    if (!table) {
      if (cells.length == 1) {
        const cell = cells[0];

        const className = cell.match(/class="([^"]*)"/)[1];

        const styleClass = stylesData[className];

        const left = /solid/.test(styleClass["border-left"]);
        const right = /solid/.test(styleClass["border-right"]);

        if ((!left && !right) || cell.match(notRowMarker)) {
          cell.match(/<p[^>]*?>[\s\S]*?<\/p>/g).forEach((paragraph) => {
            if (cell.match(notRowMarker)) {
              htmlStrings.push(paragraph.replace(notRowMarker, ""));
            } else {
              htmlStrings.push(paragraph);
            }
          });
          continue;
        }
      }

      const firstCell = cells[0];
      const lastCell = cells[cells.length - 1];

      const firstCellClass = stylesData[firstCell.match(/class="([^"]*)"/)[1]];
      const lastCellClass = stylesData[lastCell.match(/class="([^"]*)"/)[1]];

      const leftFirst = /solid/.test(firstCellClass["border-left"]);
      const rightLast = /solid/.test(lastCellClass["border-right"]);

      if (!leftFirst && !rightLast) {
        htmlStrings.push(row);
        continue;
      }

      table = row;
      continue;
    }

    const firstCell = cells[0];
    const lastCell = cells[cells.length - 1];

    const firstCellClass = stylesData[firstCell.match(/class="([^"]*)"/)[1]];
    const lastCellClass = stylesData[lastCell.match(/class="([^"]*)"/)[1]];

    const leftBorder = /solid/.test(firstCellClass["border-left"]);
    const rightBorder = /solid/.test(lastCellClass["border-right"]);

    if ((leftBorder || rightBorder) && !row.match(notRowMarker)) {
      table += row;
    } else {
      htmlStrings.push(`<table>${colString}${table}</table>`);
      if (row.match(notRowMarker)) {
        htmlStrings.push(row.replace(notRowMarker, ""));
      } else {
        htmlStrings.push(row);
      }

      table = "";
    }
  }

  if (table) htmlStrings.push(`<table>${colString}${table}</table>`);

  // заполняем поле "objects" объектами, полученными из внутренностей рамки
  for (let string of htmlStrings) {
    const $ = cheerio.load(string);

    if (string.match(/^<p/)) {
      const $element = $($("p")[0]);
      const PObject = getParagraph($, $element, stylesData);

      tableObject.objects.push(PObject);
    } else if (string.match(/^<table/)) {
      const TObject = {
        type: "TABLE",
        cells: [],
        firstPid: "",
        lastPid: "",
        docType: docType,
        fromSingleFrame: true,
      };

      const tableElement = $("table")[0];
      const rows = $("tr", tableElement);

      fillTableObject(rows, $, stylesData, TObject);
      setFrameBorders(TObject, tableElement, $, stylesData);

      tableObject.objects.push(TObject);
    }
  }
};

/**
 * Определяет тип границ исходной рамки (необходимо для установки маркеров элементов).
 *
 * Функция принимает табличный объект из адаптера, tabличный объект cheerio, 
 * объект cheerio для работы с DOM и объект со стилями.
 *
 * @param {object} tableObject табличный объект из адаптера.
 * @param {cheerio.Cheerio} tableElement табличный объект cheerio.
 * @param {cheerio.CheerioAPI} $ объект cheerio для работы с DOM.
 * @param {object} stylesData объект со стилями.
 * @returns {void}
 */
function setFrameBorders(tableObject, tableElement, $, stylesData) {
  $("td", tableElement).each((_index, element) => {
    const styleClass = $(element).attr("class");
    if (styleClass) {
      const style = stylesData[styleClass];

      const left = /solid/.test(style["border-left"]);
      const right = /solid/.test(style["border-right"]);
      const top = /solid/.test(style["border-top"]);
      const bottom = /solid/.test(style["border-bottom"]);

      if (left) {
        if (!tableObject.borderColor) {
          tableObject.borderColor = style["border-left"].trim().split(/\s+/)[2];
        }
        if (!tableObject.borderThickness) {
          tableObject.borderThickness = style["border-left"]
            .trim()
            .split(/\s+/)[0];
        }
      }
      if (right) {
        if (!tableObject.borderColor) {
          tableObject.borderColor = style["border-right"]
            .trim()
            .split(/\s+/)[2];
        }
        if (!tableObject.borderThickness) {
          tableObject.borderThickness = style["border-right"]
            .trim()
            .split(/\s+/)[0];
        }
      }
      if (top) {
        if (!tableObject.borderColor) {
          tableObject.borderColor = style["border-top"].trim().split(/\s+/)[2];
        }
        if (!tableObject.borderThickness) {
          tableObject.borderThickness = style["border-top"]
            .trim()
            .split(/\s+/)[0];
        }
      }
      if (bottom) {
        if (!tableObject.borderColor) {
          tableObject.borderColor = style["border-bottom"]
            .trim()
            .split(/\s+/)[2];
        }
        if (!tableObject.borderThickness) {
          tableObject.borderThickness = style["border-bottom"]
            .trim()
            .split(/\s+/)[0];
        }
      }
    }
  });
}
