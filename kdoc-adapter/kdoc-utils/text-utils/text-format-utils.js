const cheerio = require("cheerio");

/**
 * Определяет формат текста данного элемента.
 *
 * Функция принимает стиль класса, элемент Cheerio и булево значение, указывающее на жирность текста,
 * и возвращает строку, указывающую на формат текста.
 *
 * @param {string} styleClass объект со стилем элемента.
 * @param {cheerio.Cheerio} $element элемент Cheerio.
 * @param {boolean} isBold указывает на жирность текста.
 * @returns {string} Один из форматов: 'formattext', 'headertext', 'unformattext' или пустую строку (в случае картинки).
 */
function getTextFormat(styleClass, $element, isBold) {
  let format;

  if (!styleClass) return "unformattext";

  if (
    $element.text().trim() &&
    !$element.text().trim().match(/\.$/) &&
    (isBold ||
      (styleClass["font-size"] &&
        styleClass["font-size"].replace(/pt/, "") >= 16))
  ) {
    format = "headertext";
  } else if (
    $element
      .text()
      .trim()
      .match(/<img src=[^>]>/)
  ) {
    format = "";
  } else {
    format = "formattext";
  }

  return format;
}
exports.getTextFormat = getTextFormat;

/**
 * Проверяет, начинается ли HTML-строка с жирного текста.
 *
 * Функция принимает HTML-строку и объект со стилями,
 * и возвращает булево значение, указывающее, начинается ли HTML-строка с жирного текста.
 *
 * @param {string} htmlString HTML-строка для проверки.
 * @param {object} stylesData объект со стилями.
 * @returns {boolean} Результат проверки: true, если HTML-строка начинается с жирного текста, иначе false.
 */
function isBoldStart(htmlString, stylesData) {
  const $ = cheerio.load(htmlString);
  const paragraph = $("p")[0];
  const fullText = $(paragraph).text().trim();

  // Проходимся по всем ключам объекта styleClass
  for (const classKey in stylesData) {
    if (stylesData.hasOwnProperty(classKey)) {
      // Находим все элементы <span> с текущим классом
      const spans = $(`span.${classKey}`);

      let boldText = ""; // Строка для сбора жирного текста

      // Проверяем каждый <span> с текущим классом
      for (let span of spans) {
        const textInside = $(span).text().trim();

        if (textInside !== "" && !boldText) {
          boldText = textInside;
          break;
        }
      }

      if (
        boldText &&
        stylesData[classKey]["font-weight"] === "bold" &&
        fullText.startsWith(boldText)
      ) {
        return true;
      }
    }
  }

  // Если не найдено соответствий, возвращаем false
  return false;
}
exports.isBoldStart = isBoldStart;

/**
 * Проверяет, является ли HTML-строка жирным текстом.
 *
 * Функция принимает HTML-строку и объект со стилями,
 * и возвращает булево значение, указывающее, является ли HTML-строка жирным текстом.
 *
 * @param {string} htmlString HTML-строка для проверки.
 * @param {object} stylesData объект со стилями.
 * @returns {boolean} Результат проверки: true, если HTML-строка является жирным текстом, иначе false.
 */
function isBoldFull(htmlString, stylesData) {
  const spanMatches = htmlString.match(/<\/span>/g);
  const numOfSpans = spanMatches ? spanMatches.length : 0;

  let clearString = htmlString;
  let oldString = htmlString;

  for (let i = 0; i < numOfSpans; i++) {
    clearString = clearString.replace(/<span[^>]*?><\/span>/g, "");
    if (clearString == oldString) break;
    oldString = clearString;
  }

  const pictureRegExp =
    /<picture\s+class="[^>]+"><img\s+src="data:image\/png;base64,[^>]+"\s+style="[^>]+"><\/picture>/g;

  clearString = clearString
    .replace(/<a href=[^>]+>[\s\S]*?<\/a>/g, "")
    .replace(pictureRegExp, "");

  const $ = cheerio.load(clearString);
  const paragraph = $("p")[0];
  const fullText = $(paragraph).text().trim();

  if (!fullText.replace(/\s+/g, "")) return false;

  let boldText = ""; // Строка для сбора жирного текста

  // Проходимся по всем ключам объекта styleClass
  for (const classKey in stylesData) {
    if (stylesData.hasOwnProperty(classKey)) {
      // Находим все элементы <span> с текущим классом
      const spans = $(`span.${classKey}`);

      // Проверяем каждый <span> с текущим классом
      spans.each((_index, element) => {
        const textInside = $(element).text().trim();

        // Если текст не пустой, увеличиваем счетчик непустых элементов и добавляем его к общему жирному тексту
        if (
          textInside !== "" &&
          stylesData[classKey]["font-weight"] === "bold"
        ) {
          boldText += textInside;
        }
      });

      const boldCoef =
        boldText.trim().replace(/\s+/g, "").length /
        fullText.replace(/\s+/g, "").length;

      if (boldCoef > 0.95) {
        return true;
      }
    }
  }

  const boldCoef =
    boldText.trim().replace(/\s+/g, "").length /
    fullText.replace(/\s+/g, "").length;

  if (boldCoef > 0.85) {
    return true;
  }

  return false;
}
exports.isBoldFull = isBoldFull;

/**
 * Проверяет, является ли HTML-строка курсивным текстом.
 *
 * Функция принимает HTML-строку и объект со стилями,
 * и возвращает булево значение, указывающее, является ли HTML-строка курсивным текстом.
 *
 * @param {string} htmlString HTML-строка для проверки.
 * @param {object} stylesData объект со стилями.
 * @returns {boolean} Результат проверки: true, если HTML-строка является курсивным текстом, иначе false.
 */
function isItalicText(htmlString, stylesData) {
  const spanMatches = htmlString.match(/<\/span>/g);
  const numOfSpans = spanMatches ? spanMatches.length : 0;

  let clearString = htmlString;
  let oldString = htmlString;

  for (let i = 0; i < numOfSpans; i++) {
    clearString = clearString.replace(/<span[^>]*?><\/span>/g, "");
    if (clearString == oldString) break;
    oldString = clearString;
  }

  const pictureRegExp =
    /<picture\s+class="[^>]+"><img\s+src="data:image\/png;base64,[^>]+"\s+style="[^>]+"><\/picture>/g;

  clearString = clearString
    .replace(/<a href=[^>]+>[\s\S]*?<\/a>/g, "")
    .replace(pictureRegExp, "");

  const $ = cheerio.load(clearString);
  const paragraph = $("p")[0];
  const fullText = $(paragraph).text().trim();

  if (!fullText.replace(/\s+/g, "")) return false;

  let italicText = ""; // Строка для сбора курсивного текста

  // Проходимся по всем ключам объекта styleClass
  for (const classKey in stylesData) {
    if (stylesData.hasOwnProperty(classKey)) {
      // Находим все элементы <span> с текущим классом
      const spans = $(`span.${classKey}`);

      // Проверяем каждый <span> с текущим классом
      spans.each((_index, element) => {
        const textInside = $(element).text().trim();

        // Если текст не пустой, увеличиваем счетчик непустых элементов и добавляем его к общему курсивному тексту
        if (
          textInside !== "" &&
          stylesData[classKey]["font-style"] === "italic"
        ) {
          italicText += textInside;
        }
      });
    }
  }

  const italicCoef =
    italicText.trim().replace(/\s+/g, "").length /
    fullText.replace(/\s+/g, "").length;

  if (italicCoef > 0.9) {
    return true;
  }

  return false;
}
exports.isItalicText = isItalicText;
