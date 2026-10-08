/**
 * @class TableNode
 * @description Модель для представления таблицы.
 */
class TableNode {
    constructor(params) {
        this.type = 'TABLE';
        this.docType = 'kdoc';
        this.source = params.source;
        this.cells = params.cells || [];
        this.firstPid = params.firstPid;
        this.lastPid = params.lastPid;
    }
}
module.exports = TableNode;