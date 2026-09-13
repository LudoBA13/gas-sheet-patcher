const { RowAlignmentApplier } = require('../src/RowAlignmentApplier');

class MockSheet {
    constructor() {
        this.actions = [];
    }
    insertRowAfter(row) {
        this.actions.push(`insertRowAfter(${row})`);
    }
    insertRowBefore(row) {
        this.actions.push(`insertRowBefore(${row})`);
    }
}

function testRowInsert() {
    const sheet = new MockSheet();
    const applier = new RowAlignmentApplier(sheet);

    console.log('Testing insert at 0...');
    applier.insert(0);
    if (sheet.actions[0] !== 'insertRowBefore(1)') {
        throw new Error(`Expected insertRowBefore(1), got ${sheet.actions[0]}`);
    }

    console.log('Testing insert at 1...');
    applier.insert(1);
    if (sheet.actions[1] !== 'insertRowAfter(1)') {
        throw new Error(`Expected insertRowAfter(1), got ${sheet.actions[1]}`);
    }

    console.log('Row insert tests passed!');
}

testRowInsert();
