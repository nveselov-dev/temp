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

    const text = PObject.text
      .trim()
      .replace(/<picture[^>]+?><img[^>]+?><\/picture>/g, "");

    if (
      !text.match(/[a-z]{2,}|[A-Z][a-z]|[A-Z]{2,}/) ||
      !text.match(/^[A-Za-z,.;()"'/\\*[\]{}\-_\d\s]+$/)
    ) {
      tableObject.objects.push(PObject);
    }
  });
};
