const { MockSheet } = require('./MockSheet');
const { SeriesPatcher } = require('../src/SeriesPatcher');
const { RowAlignmentApplier, ColumnAlignmentApplier } = require('../src/AlignmentPlanner');
const { SheetPatcher } = require('../src/SheetPatcher');

// Mock global environment for GAS classes
global.SeriesPatcher = SeriesPatcher;
global.RowAlignmentApplier = RowAlignmentApplier;
global.ColumnAlignmentApplier = ColumnAlignmentApplier;
global.SpreadsheetApp = { flush: () => {} };

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
}

if (require.main === module)
{
	(new SheetPatcherTest).run();
}
