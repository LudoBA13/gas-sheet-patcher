const assert = require('assert');

class MockSheet {
    constructor(numRows) {
        this.numRows = numRows;
    }
    insertRowBefore(index) {
        if (index > this.numRows + 1) {
            throw new Error(`Exception: The coordinates of the range are outside the dimensions of the sheet.`);
        }
        if (index === this.numRows + 1) {
            // This is the problematic case if it behaves like append
            console.log(`Attempting to insert before ${index}. This might fail if it's the end.`);
            // In reality, this probably doesn't insert anything or fails in GAS
        }
        this.numRows++;
    }
    getLastRow() {
        return this.numRows;
    }
}

const sheet = new MockSheet(5);
console.log('Last row:', sheet.getLastRow());

try {
    // Trying to insert before row 6 (which is lastRow + 1)
    sheet.insertRowBefore(6);
    console.log('Inserted row. New last row:', sheet.getLastRow());
} catch (e) {
    console.log('Error:', e.message);
}
