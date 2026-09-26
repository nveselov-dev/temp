/**
 * Проверяет, есть ли у таблицы хоть какие-нибудь границы.
 *
 * Функция принимает cheerio-объект таблицы и объекты для работы с DOM и стилями,
 * и возвращает boolean значение, указывающее на наличие границ у таблицы.
 *
 * @param {cheerio.Cheerio} table cheerio-объект таблицы.
 * @param {cheerio.CheerioAPI} $ cheerio-объект для работы с DOM.
 * @param {object} stylesData объект со стилями.
 * @returns {boolean} Результат проверки: true, если границы есть, иначе false.
 */
module.exports = (table, $, stylesData) => {
  let hasBorders = false;
  
  $("td", table).each((_index, element) => {
    const styleClass = $(element).attr("class");
    if (styleClass) {
      const style = stylesData[styleClass];
      if (
        /solid/.test(style["border-left"]) ||
        /solid/.test(style["border-right"]) ||
        /solid/.test(style["border-top"]) ||
        /solid/.test(style["border-bottom"])
      ) {
        hasBorders = true;
      }
    }
  });

  return hasBorders;
};
