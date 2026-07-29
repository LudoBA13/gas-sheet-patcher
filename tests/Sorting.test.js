const { MockSheet } = require('./MockSheet');
const { SheetPatcher } = require('../src/SheetPatcher');
const { AlignmentApplier } = require('../src/AlignmentApplier');
global.AlignmentApplier = AlignmentApplier;
const { SeriesPatcher } = require('../src/SeriesPatcher');
global.SeriesPatcher = SeriesPatcher;
const { RowAlignmentApplier } = require('../src/RowAlignmentApplier');
global.RowAlignmentApplier = RowAlignmentApplier;
const { ColumnAlignmentApplier } = require('../src/ColumnAlignmentApplier');
global.ColumnAlignmentApplier = ColumnAlignmentApplier;

// Mock SpreadsheetApp
global.SpreadsheetApp = {
	flush: () => {}
};

function testSorting() {
	console.log('Running Sorting test...');

	const initialData = [
		['ID', 'Name'],
		['1', 'A'],
		['2', 'B']
	];
	const mockSheet = new MockSheet(initialData);

	// Input unsorted: ID 2 before ID 1
	const newData = [
		['ID', 'Name'],
		['2', 'B'],
		['1', 'A']
	];

	// Expected sorted sheet: ID 1 before ID 2
	const expectedData = [
		['ID', 'Name'],
		['1', 'A'],
		['2', 'B']
	];

	SheetPatcher.patch(mockSheet, newData);

	const result = mockSheet.data;
	
	if (JSON.stringify(result) === JSON.stringify(expectedData)) {
		console.log('Sorting test passed!');
	} else {
		console.error('Sorting test failed!');
		console.error('Expected:', expectedData);
		console.error('Got:', result);
		process.exit(1);
	}
}

testSorting();
