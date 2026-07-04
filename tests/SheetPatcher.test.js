const { MockSheet, MockSpreadsheet } = require('./MockSheet');
const { AlignmentApplier } = require('../src/AlignmentApplier');
global.AlignmentApplier = AlignmentApplier;
const { SeriesPatcher } = require('../src/SeriesPatcher');
global.SeriesPatcher = SeriesPatcher;
const { RowAlignmentApplier } = require('../src/RowAlignmentApplier');
global.RowAlignmentApplier = RowAlignmentApplier;
const { ColumnAlignmentApplier } = require('../src/ColumnAlignmentApplier');
global.ColumnAlignmentApplier = ColumnAlignmentApplier;
const { SheetPatcher } = require('../src/SheetPatcher');

// Mock global environment for GAS classes
const mockSpreadsheet = new MockSpreadsheet();
global.SpreadsheetApp = { 
	flush: () => {},
	getActiveSpreadsheet: () => mockSpreadsheet 
};

/**
 * SheetPatcher Test Suite
 */
class SheetPatcherTest
{
	run()
	{
		console.log('Running SheetPatcher tests...');

		this.testRowAlignment();
		this.testColumnAlignment();
		this.testFullReplace();
		this.testPatchOrCreate();
		this.testHeaderStyling();

		console.log('All SheetPatcher tests passed!');
	}

	assert(condition, message)
	{
		if (!condition)
		{
			throw new Error('Assertion failed: ' + message);
		}
	}

	assertEqual(a, b, message)
	{
		const strA = JSON.stringify(a);
		const strB = JSON.stringify(b);
		this.assert(strA === strB, `${message} (Expected ${strB}, got ${strA})`);
	}

	testRowAlignment()
	{
		const initialData = [
			['ID', 'Name'],
			['1', 'Alpha'],
			['2', 'Beta'],
			['3', 'Gamma']
		];
		const mockSheet = new MockSheet(initialData);
		const patcher = new SheetPatcher(mockSheet);

		// Target data has row '2' moved to top, '1' deleted, '4' inserted
		const newData = [
			['ID', 'Name'],
			['2', 'Beta'],
			['3', 'Gamma'],
			['4', 'Delta']
		];

		// We only test _alignRows here
		patcher._alignRows(newData);

		const resultRows = mockSheet.data.map(r => r[0]);
		const expectedRows = ['ID', '2', '3', '']; // '4' is inserted as empty row initially
		this.assertEqual(resultRows, expectedRows, 'Row alignment should structurally match IDs');
	}

	testColumnAlignment()
	{
		const initialData = [
			['ID', 'Name', 'Age'],
			['1', 'Alpha', '30']
		];
		const mockSheet = new MockSheet(initialData);
		const patcher = new SheetPatcher(mockSheet);

		// Target has 'Age' moved, 'Name' deleted, 'City' inserted
		const newData = [
			['ID', 'Age', 'City'],
			['1', '30', 'NY']
		];

		patcher._alignColumns(newData[0]);

		const resultCols = mockSheet.data[0];
		const expectedCols = ['ID', 'Age', '']; // 'City' is inserted as empty column
		this.assertEqual(resultCols, expectedCols, 'Column alignment should structurally match headers');
	}

	testFullReplace()
	{
		const initialData = [
			['ID', 'Name'],
			['1', 'Alpha'],
			['2', 'Beta']
		];
		const mockSheet = new MockSheet(initialData);
		
		const newData = [
			['ID', 'Name'],
			['2', 'Beta Updated'],
			['3', 'Gamma']
		];

		SheetPatcher.patch(mockSheet, newData);

		this.assertEqual(mockSheet.data, newData, 'Sheet data should match newData after patch');
	}

	testPatchOrCreate()
	{
		const data = [
			['ID', 'Name'],
			['1', 'Alpha']
		];
		const sheetName = 'NewSheet';
		
		SheetPatcher.patchOrCreate(sheetName, data);
		
		const sheet = mockSpreadsheet.getSheetByName(sheetName);
		this.assert(sheet !== null, 'Sheet should be created');
		this.assertEqual(sheet.data, data, 'Sheet data should match input data');
		this.assertEqual(sheet.getMaxRows(), data.length, 'Max rows should be resized to fit data');
		this.assertEqual(sheet.getMaxColumns(), data[0].length, 'Max columns should be resized to fit data');
	}

	testHeaderStyling()
	{
		const data = [['H1', 'H2']];
		const mockSheet = new MockSheet(data);
		
		SheetPatcher.styleHeaderRow(mockSheet);
		
		this.assert(true, 'styleHeaderRow should execute without errors');
	}
}

if (require.main === module)
{
	(new SheetPatcherTest).run();
}
