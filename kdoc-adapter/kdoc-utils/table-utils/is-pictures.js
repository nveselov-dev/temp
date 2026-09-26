const cheerio = require("cheerio");

module.exports = (rows, $) => {
  let isPictures = true;

  rows.each((_rowIndex, row) => {
    $("td p", row).each((_cellIndex, cellElement) => {
      const $cellElement = $(cellElement);
      const $e = cheerio.load($cellElement.html());

      const text = $e.text().trim();

      if (!text) return;

      if (!text.match(/^<picture[^>]+?><img[^>]+?><\/picture>$/)) {
        isPictures = false;
      }
    });
  });

  return isPictures;
};
