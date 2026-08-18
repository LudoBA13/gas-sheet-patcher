const { AlignmentApplier } = require('../src/AlignmentApplier');
const { RowAlignmentApplier } = require('../src/RowAlignmentApplier');

// Mock Sheet
class MockSheet {
    constructor(numRows) {
        this.rows = Array.from({length: numRows}, (_, i) => i);
    }
    deleteRow(row) {
        console.log(`Deleting row ${row}`);
        if (row < 1 || row > this.rows.length) {
            throw new Error("Ces lignes sont hors limites");
        }
        this.rows.splice(row - 1, 1);
    }
    insertRowBefore(row) {}
    moveRows(range, dest) {}
    getRange(row, col, numRows, numCols) { return { row, col, numRows, numCols }; }
}

const sheet = new MockSheet(5);
const applier = new RowAlignmentApplier(sheet);

const actions = [
    {type: 'delete', index: 1},
    {type: 'delete', index: 2}
];

try {
    applier.apply(actions);
} catch (e) {
    console.error(e.message);
}
