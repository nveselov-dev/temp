const cheerio = require("cheerio");

module.exports = (rows, $) => {
  let isTermins = false;

  rows.each((_rowIndex, row) => {
    let firstCellMatch = false;
    let lastCellMatch = false;
    let isFirstCell = false;
    let rowLength = $(row).find("td").length;

    $("td", row).each((cellIndex, cellElement) => {
      const $cellElement = $(cellElement);
      const $e = cheerio.load($cellElement.html());

      $e('span[style="padding-left:1em;"]').each(function () {
        $(this).replaceWith(" ");
      });

      const text = $e.text().trim();

      if (text) isFirstCell = true;

      // console.log(rowLength - 1, cellIndex);
      if (
        isFirstCell &&
        text.match(/^\d+(\.\d+)*\s+[А-ЯЁа-яё\s]+?[:;][А-ЯЁа-яё\s]+?/)
      ) {
        firstCellMatch = true;
        // console.log("BEGIN: " + text);
      }
      if (
        cellIndex == rowLength - 1 &&
        text.match(/[a-z]{2,}|[A-Z][a-z]|[A-Z]{2,}/) &&
        text.match(/^[A-Za-z,.;()"'/\\*[\]{}\-_\d\s]+$/)
      ) {
        lastCellMatch = true;
        // console.log("END: " + text);
      }
    });

    if (lastCellMatch && firstCellMatch) isTermins = true;
  });

  return isTermins;
};
