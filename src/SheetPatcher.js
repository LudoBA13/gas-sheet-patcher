/**
 * SheetPatcher Class
 * Handles structural alignment, column recovery, and granular minimal-diff updates.
 *
 * Requirements:
 * - The sheet MUST have headers in the first row.
 * - The first column MUST be used for identification of the row.
 * - IDs SHOULD be unique.
 */
class SheetPatcher
{
	/**
	 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet The sheet to patch.
	 */
	constructor(sheet)
	{
		this.sheet = sheet;
		this.headers = this.sheet.getRange(1, 1, 1, this.sheet.getLastColumn()).getValues()[0];
		this.ids = this.sheet.getRange(2, 1, this.sheet.getLastRow() - 1, 1).getValues().map(row => row[0]);
	}

	/**
	 * Instantiates SheetPatcher and replaces content with newData.
	 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet The sheet to patch.
	 * @param {any[][]} newData The 2D array of data to apply to the sheet.
	 * @return {void}
	 */
	static patch(sheet, newData)
	{
		new SheetPatcher(sheet).replace(newData);
	}

	/**
	 * Aligns sheet structure and replaces content with newData.
	 * @param {any[][]} newData The 2D array of data to apply to the sheet.
	 * @return {void}
	 */
	replace(newData)
	{
		if (!newData || newData.length === 0 || !newData[0])
		{
			throw new Error("Invalid Input: newData array is null, empty, or malformed.");
		}

		// 1. Structural Alignment
		this._alignRows(newData);
		this._alignColumns(newData[0]);

		// Ensure structural changes are committed before reading current state
		SpreadsheetApp.flush();

		const numRows = newData.length;
		const numCols = newData[0].length;

		// 2. Recovery & Patching
		this._recoverEmptyColumns(newData, numRows, numCols);

		const range = this.sheet.getRange(1, 1, numRows, numCols);
		const existingData = range.getValues();

		for (let r = 0; r < numRows; r++)
		{
			this._patchRow(r + 1, newData[r], existingData[r]);
		}

		// 3. Final Verification
		if (this.matches(newData))
		{
			return;
		}

		console.warn("Partial patch failed validation. Performing full overwrite.");
		range.setValues(newData);
		if (this.matches(newData))
		{
			return;
		}

		throw new Error("Critical: Sheet content does not match input even after full overwrite.");
	}

	/**
	 * Patches only the cells within a row that have changed.
	 * @param {number} rowNumber The 1-based index of the row to patch.
	 * @param {any[]} newDataRow The new data for the row.
	 * @param {any[]} existingDataRow The current data in the sheet for the row.
	 * @return {void}
	 * @private
	 */
	_patchRow(rowNumber, newDataRow, existingDataRow)
	{
		// Fast check if the row is identical
		if (this._rangesMatch(newDataRow, existingDataRow))
		{
			return;
		}

		let startCol = -1;

		for (let c = 0; c < newDataRow.length; c++)
		{
			const changed = this._compare(newDataRow[c], existingDataRow[c]);

			if (startCol === -1)
			{
				if (!changed)
				{
					continue;
				}
				startCol = c;
			}

			if (!changed || c === newDataRow.length - 1)
			{
				const endCol = changed ? c : c - 1;
				const width = endCol - startCol + 1;
				const patchValues = [newDataRow.slice(startCol, endCol + 1)];

				this.sheet.getRange(rowNumber, startCol + 1, 1, width).setValues(patchValues);
				startCol = -1;
			}
		}
	}

	/**
	 * Detects columns effectively empty in the sheet but populated in newData.
	 * @param {any[][]} newData The 2D array of new data.
	 * @param {number} numRows Total number of rows in newData.
	 * @param {number} numCols Total number of columns in newData.
	 * @return {void}
	 * @private
	 */
	_recoverEmptyColumns(newData, numRows, numCols)
	{
		for (let c = 0; c < numCols; c++)
		{
			const sheetHeader = this.sheet.getRange(1, c + 1).getValue();
			const newHeader = newData[0][c];

			if (sheetHeader !== "" || newHeader === "")
			{
				continue;
			}

			const columnRange = this.sheet.getRange(1, c + 1, numRows, 1);
			const isSheetColumnEmpty = columnRange.getValues().every(row => row[0] === "");

			if (!isSheetColumnEmpty)
			{
				continue;
			}

			columnRange.setValues(newData.map(row => [row[c]]));
		}
	}

	/**
	 * Adjusts rows based on the first column of newData.
	 * @param {any[][]} newData The 2D array of new data.
	 * @return {void}
	 * @private
	 */
	_alignRows(newData)
	{
		const existingRows = this.sheet.getRange(1, 1, this.sheet.getLastRow(), 1).getValues().map(r => r[0]);
		const newRows = newData.map(r => r[0]);
		
		const actions = SeriesPatcher.patch(existingRows, newRows);
		new RowAlignmentApplier(this.sheet).apply(actions);
	}

	/**
	 * Adjusts columns based on the first row of newData.
	 * @param {any[]} newHeaderRow The first row of newData containing headers.
	 * @return {void}
	 * @private
	 */
	_alignColumns(newHeaderRow)
	{
		const existingCols = this.sheet.getRange(1, 1, 1, this.sheet.getLastColumn()).getValues()[0];
		
		const actions = SeriesPatcher.patch(existingCols, newHeaderRow);
		new ColumnAlignmentApplier(this.sheet).apply(actions);
	}

	/**
	 * Checks if the entire sheet matches the provided 2D array.
	 * @param {any[][]} data The 2D array to compare against the sheet content.
	 * @return {boolean} True if the sheet matches the data, false otherwise.
	 */
	matches(data)
	{
		const numRows = data.length;
		const numCols = data[0].length;
		if (this.sheet.getLastRow() !== numRows || this.sheet.getLastColumn() !== numCols)
		{
			return false;
		}

		const currentData = this.sheet.getRange(1, 1, numRows, numCols).getValues();

		for (let r = 0; r < numRows; r++)
		{
			const match = this._rangesMatch(data[r], currentData[r]);
			if (!match)
			{
				return false;
			}
		}
		return true;
	}

	/**
	 * Compares two ranges for equality using JSON.stringify.
	 * @param {any[]} range1 The first range to compare.
	 * @param {any[]} range2 The second range to compare.
	 * @return {boolean} True if the ranges are equal, false otherwise.
	 * @private
	 */
	_rangesMatch(range1, range2)
	{
		return JSON.stringify(range1) === JSON.stringify(range2);
	}

	/**
	 * Internal comparison logic.
	 * @param {any} val1 The first value to compare.
	 * @param {any} val2 The second value to compare.
	 * @return {boolean} True if values differ, false if they are equal.
	 * @private
	 */
	_compare(val1, val2)
	{
		if (val1 instanceof Date && val2 instanceof Date)
		{
			return val1.getTime() !== val2.getTime();
		}
		return val1 !== val2;
	}
}

if (typeof module !== 'undefined')
{
	module.exports = { SheetPatcher };
}