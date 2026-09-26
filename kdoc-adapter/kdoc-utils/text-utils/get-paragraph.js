const cheerio = require("cheerio");
const {
  isBoldFull,
  isBoldStart,
  isItalicText,
  getTextFormat,
} = require("./text-format-utils");

const docType = require("../../constants").DOC_TYPE;

/**
 * Создаёт объект-параграф.
 *
 * Функция принимает объект Cheerio для работы с элементами DOM, элемент Cheerio и объект со стилями,
 * и возвращает созданный объект-параграф.
 *
 * @param {cheerio.CheerioAPI} $ объект Cheerio для работы с элементами DOM.
 * @param {cheerio.Cheerio} $element элемент Cheerio.
 * @param {object} stylesData объект со стилями.
 * @returns {object} Созданный объект-параграф.
 */
module.exports = ($, $element, stylesData) => {
  const $e = cheerio.load($element.html());

  $e('span[style="padding-left:1em;"]').each(function () {
    $(this).replaceWith(" ");
  });

  const spanElement = $('span[style="padding-left:5em;"]', $element);

  const styleAttributeValue = spanElement.attr("style");
  const paddingValue = styleAttributeValue
    ? styleAttributeValue.match(/padding-left:(\d+)em;/)
    : null;
  const spacesBefore = paddingValue ? parseInt(paddingValue[1]) : 0;

  const styleClass = stylesData[$element.attr("class")];
  const isBold =
    $e.text().trim() &&
    (styleClass["font-weight"] == "bold" ||
      isBoldFull($element.toString(), stylesData));
  const isItalic =
    $e.text().trim() &&
    (styleClass["font-style"] == "italic" ||
      isItalicText($element.toString(), stylesData));
  const format = getTextFormat(styleClass, $element, isBold);

  const PObject = {
    type: "P",
    source: $element.toString(),
    pid: $element.attr("data-pid"),
    spacesBefore: spacesBefore,
    text: $e.text(),
    format: format,
    align: styleClass ? styleClass["text-align"] : undefined,
    isBold: isBold,
    isItalic: isItalic,
    isBoldBegin: isBoldStart($element.toString(), stylesData),
    docType: docType,
  };

  const pictureRegExp =
    /<picture\s+class="[^>]+"><img\s+src="data:image\/png;base64,[^>]+"\s+style="[^>]+"><\/picture>/;

  if (pictureRegExp.test(PObject.source.trim())) {
    PObject.text = PObject.source
      .replace(/<span style="padding-left:1em;">/g, (str) => ` ${str}`)
      .replace(/<(?!\/?(picture|img)\b)[^>]*>/g, "")
      .replace(/&nbsp;/g, " ");
  }

  return PObject;
};
