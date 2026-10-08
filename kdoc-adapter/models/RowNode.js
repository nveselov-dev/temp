/**
 * @class RowNode
 * @description Модель для представления строки таблицы (ROW).
 */
class RowNode {
    constructor(params) {
        this.type = 'ROW';
        this.docType = 'kdoc';
        this.source = params.source;
        this.text = params.text;
        this.cells = params.cells || [];
        this.firstPid = params.firstPid;
        this.lastPid = params.lastPid;
    }
}
module.exports = RowNode;