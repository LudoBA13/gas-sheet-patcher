/**
 * Main integration test function.
 */
function test1SheetPatcher()
{
	runTest(fillSheet, (sheet) =>
	{
		// Add new column at 3rd position
		sheet.insertColumnAfter(2);
		sheet.getRange(1, 3).setValue('new1');
		
		const numRows = sheet.getLastRow();
		const values = [];
		for (let i = 0; i < numRows - 1; i++)
		{
			values.push(['new_val_' + i]);
		}
		sheet.getRange(2, 3, numRows - 1, 1).setValues(values);
	});
}

/**
 * Test case: Move column 3 to offset 5.
 */
function test2MoveColumn()
{
	runTest(fillSheet, (sheet) =>
	{
		// Move column 3 (index 3) to position 5
		// Based on 1-based indexing, this means moving column 3 to column 5
		sheet.moveColumns(sheet.getRange(1, 3, sheet.getLastRow(), 1), 5);
	});
}

/**
 * Test case: Move column 3 to 5, then column 11 to 4.
 */
function test3MoveMultipleColumns()
{
	runTest(fillSheet, (sheet) =>
	{
		// Move column 3 to position 5
		sheet.moveColumns(sheet.getRange(1, 3, sheet.getLastRow(), 1), 5);
		
		// Move column 11 to position 4
		sheet.moveColumns(sheet.getRange(1, 11, sheet.getLastRow(), 1), 4);
	});
}

/**
 * Test case: Move col 11 to 3, swap cols 5 & 6.
 */
function test4MoveAndSwapColumns()
{
	runTest(fillSheet, (sheet) =>
	{
		const numRows = sheet.getLastRow();
		// Move column 11 to position 3
		sheet.moveColumns(sheet.getRange(1, 11, numRows, 1), 3);
		
		// Swap columns 5 and 6
		// Native sheet.moveColumns might behave differently based on the move sequence,
		// but using temporary column insertion is the standard way to swap in Sheets.
		sheet.insertColumnAfter(6); // Insert empty col after 6
		sheet.moveColumns(sheet.getRange(1, 5, numRows, 1), 7); // Move 5 to after 6
		sheet.moveColumns(sheet.getRange(1, 6, numRows, 1), 5); // Move 6 to 5
		sheet.deleteColumn(7); // Delete original col 5 now at 7
	});
}

/**
 * Generic test runner that centralizes setup, patching, and cleanup.
 */
function runTest(fillCallback, transformCallback)
{
	resetSheets();
	
	const ss = SpreadsheetApp.getActiveSpreadsheet();
	
	// Create "Old"
	const oldSheet = fillCallback('Old');
	shrinkSheet(oldSheet);
	
	// Create "New" by duplicating "Old" and applying transformation
	const newSheet = oldSheet.copyTo(ss).setName('New');
	transformCallback(newSheet);
	shrinkSheet(newSheet);
	
	// Setup Patched sheet
	const patchedSheet = ss.insertSheet('Patched');
	oldSheet.getDataRange().copyTo(patchedSheet.getRange(1, 1));
	shrinkSheet(patchedSheet);
	
	// Use SheetPatcher to make Patched match New
	const newData = newSheet.getDataRange().getValues();
	SheetPatcher.patch(patchedSheet, newData);
	
	// Validate and highlight differences
	const success = validateAndHighlight(patchedSheet, newSheet);
	console.log('Test completed. Patch success: ' + success);
}

/**
 * Validates Patched against New and highlights differences in pink.
 */
function validateAndHighlight(patchedSheet, newSheet)
{
	const patchedData = patchedSheet.getDataRange().getValues();
	const newData = newSheet.getDataRange().getValues();
	let allMatch = true;
	
	for (let r = 0; r < newData.length; r++)
	{
		for (let c = 0; c < newData[0].length; c++)
		{
			if (patchedData[r][c] !== newData[r][c])
			{
				patchedSheet.getRange(r + 1, c + 1).setBackground('#FFC0CB');
				allMatch = false;
			}
		}
	}
	return allMatch;
}

/**
 * Test utility functions for SheetPatcher.
 */

/**
 * Resets the test sheets by deleting them.
 */
function resetSheets()
{
	const ss = SpreadsheetApp.getActiveSpreadsheet();
	['Old', 'New', 'Patched'].forEach(name =>
	{
		const sheet = ss.getSheetByName(name);
		if (sheet)
		{
			ss.deleteSheet(sheet);
		}
	});
}

/**
 * Creates a sheet with a 10x12 grid filled with hardcoded values.
 */
function fillSheet(sheetName)
{
	const ss = SpreadsheetApp.getActiveSpreadsheet();
	const sheet = ss.insertSheet(sheetName);
	const numRows = 10;
	const numCols = 12;
	const data = [];
	
	for (let r = 1; r <= numRows; r++)
	{
		const row = [];
		for (let c = 1; c <= numCols; c++)
		{
			row.push('R' + r + 'C' + c);
		}
		data.push(row);
	}
	
	sheet.getRange(1, 1, numRows, numCols).setValues(data);
	return sheet;
}

/**
 * Shrinks a sheet to its actual data size.
 */
function shrinkSheet(sheet)
{
	const lastRow = sheet.getLastRow();
	const lastCol = sheet.getLastColumn();
	const maxRows = sheet.getMaxRows();
	const maxCols = sheet.getMaxColumns();
	
	if (maxRows > lastRow)
	{
		sheet.deleteRows(lastRow + 1, maxRows - lastRow);
	}
	if (maxCols > lastCol)
	{
		sheet.deleteColumns(lastCol + 1, maxCols - lastCol);
	}
}
