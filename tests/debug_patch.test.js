const { MockSheet, MockSpreadsheet } = require('./MockSheet');
const { AlignmentApplier } = require('../src/AlignmentApplier');
const { RowAlignmentApplier } = require('../src/RowAlignmentApplier');
const { SheetPatcher } = require('../src/SheetPatcher');
const { SortedSeriesPatcher } = require('../src/SortedSeriesPatcher');

// Mock global environment for GAS classes
global.AlignmentApplier = AlignmentApplier;
global.RowAlignmentApplier = RowAlignmentApplier;
global.SortedSeriesPatcher = SortedSeriesPatcher;
global.SpreadsheetApp = {
    flush: () => {},
    getActiveSpreadsheet: () => new MockSpreadsheet()
};

// Initial: 3 rows (header + 2 rows)
const initialData = [
    ['ID', 'Name'],
    ['1', 'A'],
    ['2', 'B']
];

// Target: 5 rows (header + 4 rows)
const newData = [
    ['ID', 'Name'],
    ['1', 'A'],
    ['2', 'B'],
    ['3', 'C'],
    ['4', 'D']
];

const mockSheet = new MockSheet(initialData);

try {
    console.log("Running patch test...");
    SheetPatcher.patch(mockSheet, newData);
    console.log("Patch completed successfully!");
} catch (e) {
    console.error("Patch failed:", e);
}
