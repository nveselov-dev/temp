/**
 * @class ParagraphNode
 * @description Модель для представления абзаца (<p>).
 */
class ParagraphNode {
    /**
     * @param {Object} params
     * @param {string} params.source - Исходный HTML.
     * @param {string} params.pid - Уникальный идентификатор.
     * @param {number} [params.spacesBefore] - Отступ слева (только если 5).
     * @param {string} params.text - Очищенный текст.
     * @param {string} params.format - Формат текста.
     * @param {string} [params.align] - Выравнивание.
     * @param {boolean} params.isBold - Жирный ли текст.
     * @param {boolean} params.isItalic - Курсив ли текст.
     * @param {boolean} params.isBoldBegin - Начинается ли с жирного.
     */
    constructor(params) {
        this.type = 'P';
        this.docType = 'kdoc';
        this.source = params.source;
        this.pid = params.pid;
        this.spacesBefore = params.spacesBefore;
        this.text = params.text;
        this.format = params.format || '';
        this.align = params.align;
        this.isBold = params.isBold || false;
        this.isItalic = params.isItalic || false;
        this.isBoldBegin = params.isBoldBegin || false;
    }
}
module.exports = ParagraphNode;