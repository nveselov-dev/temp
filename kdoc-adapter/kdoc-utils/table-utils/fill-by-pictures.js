const getParagraph = require("../text-utils/get-paragraph");

const cheerio = require("cheerio");

module.exports = (tableObject, tableText, stylesData) => {
  tableObject.type = "OBJECTS";
  tableObject.objects = [];

  const $ = cheerio.load(tableText);

  const paragraphs = $("p");

  paragraphs.each((_index, element) => {
    const $element = $(element);
    const PObject = getParagraph($, $element, stylesData);

    tableObject.objects.push(PObject);
  });
};
