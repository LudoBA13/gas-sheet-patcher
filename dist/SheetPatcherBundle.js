// Auto-generated file. Do not edit directly.

/**
 * Abstract Base Class for applying structural alignment actions to a Sheet.
 */
class AlignmentApplier
{
	/**
	 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet The sheet to apply actions to.
	 */
	constructor(sheet)
	{
		if (this.constructor === AlignmentApplier)
		{
			throw new TypeError('Abstract class "AlignmentApplier" cannot be instantiated directly.');
		}
		this.sheet = sheet;
	}

	/**
	 * Apply deletion actions.
	 * @param {object[]} actions List of delete actions.
	 */
	applyDeletions(actions)
	{
		for (const action of actions)
		{
			this.delete(action.index);
		}
	}

	/**
	 * Apply insertion actions.
	 * @param {object[]} actions List of insert actions.
	 */
	applyInsertions(actions)
	{
		for (const action of actions)
		{
			this.insert(action.index);
		}
	}

	/**
	 * Apply move actions.
	 * @param {object[]} actions List of move actions.
	 */
	applyMoves(actions)
	{
		for (const action of actions)
		{
			this.move(action.from, action.to);
		}
	}

	/**
	 * @param {number} index 0-based index to delete.
	 * @abstract
	 */
	delete(index)
	{
		throw new Error('Method "delete" must be implemented.');
	}

	/**
	 * @param {number} index 0-based index to insert at.
	 * @abstract
	 */
	insert(index)
	{
		throw new Error('Method "insert" must be implemented.');
	}

	/**
	 * @param {number} from 0-based source index.
	 * @param {number} to 0-based target index.
	 * @abstract
	 */
	move(from, to)
	{
		throw new Error('Method "move" must be implemented.');
	}
}

if (typeof module !== 'undefined' && module.exports)
{
	module.exports = { AlignmentApplier };
}


/**
 * SeriesPatcher Class
 * Generates specific actions to transform one array of unique values into another, phase-by-phase.
 */
class SeriesPatcher
{
	/**
	 * Validates that all elements in the array are unique.
	 * @param {any[]} array The array to check.
	 * @throws {Error} If duplicates are found.
	 * @private
	 */
	static _ensureUnique(array)
	{
		const seen = new Set;

		for (const item of array)
		{
			if (seen.has(item))
			{
				throw new Error('Array values must be unique.');
			}

			seen.add(item);
		}
	}

	/**
	 * Identifies elements in source that are not in target.
	 * @param {any[]} source 
	 * @param {any[]} target 
	 * @return {object[]} Deletion actions.
	 */
	static generateDeletions(source, target)
	{
		this._ensureUnique(source);
		this._ensureUnique(target);

		const targetSet = new Set(target);
		const actions = [];
		// Deleting in reverse order to keep indices valid during calculation
		for (let i = source.length - 1; i >= 0; i--)
		{
			if (!targetSet.has(source[i]))
			{
				actions.push({
					type: 'delete',
					index: i,
					value: source[i]
				});
			}
		}
		// Sort by index descending to match desired application order (reverse index order)
		return actions.sort((a, b) => b.index - a.index);
	}

	/**
	 * Identifies elements in target that are not in source.
	 * @param {any[]} source 
	 * @param {any[]} target 
	 * @return {object[]} Insertion actions.
	 */
	static generateInsertions(source, target)
	{
		this._ensureUnique(source);
		this._ensureUnique(target);

		const sourceSet = new Set(source);
		const actions = [];
		for (let i = 0; i < target.length; i++)
		{
			if (!sourceSet.has(target[i]))
			{
				actions.push({
					type: 'insert',
					index: i,
					value: target[i]
				});
			}
		}
		// Insertions in forward order
		return actions.sort((a, b) => a.index - b.index);
	}

	/**
	 * Calculates move actions once source and target have the same elements.
	 * @param {any[]} source 
	 * @param {any[]} target 
	 * @return {object[]} Move actions.
	 */
	static generateMoves(source, target)
	{
		this._ensureUnique(source);
		this._ensureUnique(target);

		const actions = [];
		const current = [...source];

		for (let i = 0; i < target.length; i++)
		{
			const expected = target[i];
			if (current[i] === expected)
			{
				continue;
			}

			const currentIndex = current.indexOf(expected);
			// Apply move
			actions.push({
				type: 'move',
				from: currentIndex,
				to: i,
				value: expected
			});

			current.splice(currentIndex, 1);
			current.splice(i, 0, expected);
		}
		return actions;
	}
}

if (typeof module !== 'undefined' && module.exports)
{
	module.exports = { SeriesPatcher };
}


/**
 * SortedSeriesPatcher Class
 * Optimized for sorted arrays, providing linear-time patching.
 */
class SortedSeriesPatcher
{
	/**
	 * @param {any[]} source The starting sorted array.
	 * @param {any[]} target The target sorted array.
	 * @return {object[]} List of actions.
	 */
	static patch(source, target)
	{
		const actions = [];
		const working = [...source];
		let s = 0;
		let t = 0;

		while (t < target.length)
		{
			if (s < working.length && working[s] === target[t])
			{
				s++;
				t++;
			}
			else if (s < working.length && working[s] < target[t])
			{
				// working[s] is not in target, delete it
				actions.push({
					type: 'delete',
					index: s,
					value: working[s]
				});
				working.splice(s, 1);
			}
			else
			{
				// target[t] is missing in working, insert it
				actions.push({
					type: 'insert',
					index: t,
					value: target[t]
				});
				working.splice(t, 0, target[t]);
				s++;
				t++;
			}
		}

		// Delete remaining elements in working
		while (s < working.length)
		{
			actions.push({
				type: 'delete',
				index: s,
				value: working[s]
			});
			working.splice(s, 1);
		}

		return actions;
	}
}

if (typeof module !== 'undefined' && module.exports)
{
	module.exports = { SortedSeriesPatcher };
}




/**
 * Concrete implementation for applying actions to rows.
 */
class RowAlignmentApplier extends AlignmentApplier
{
	delete(index)
	{
		this.sheet.deleteRow(index + 1);
	}

	insert(index)
	{
		this.sheet.insertRowBefore(index + 1);
	}

	move(from, to)
	{
		this.sheet.moveRows(this.sheet.getRange(from + 1, 1), to + 1);
	}
}

if (typeof module !== 'undefined' && module.exports)
{
	module.exports = { RowAlignmentApplier };
}




/**
 * Concrete implementation for applying actions to columns.
 */
class ColumnAlignmentApplier extends AlignmentApplier
{
	delete(index)
	{
		console.log('ColumnAlignmentApplier: delete at ' + index);
		this.sheet.deleteColumn(index + 1);
	}

	insert(index)
	{
		console.log('ColumnAlignmentApplier: insert at ' + index);
		this.sheet.insertColumnBefore(index + 1);
	}

	move(from, to)
	{
		console.log('ColumnAlignmentApplier: move from ' + from + ' to ' + to);
		this.sheet.moveColumns(this.sheet.getRange(1, from + 1), to + 1);
	}
}

if (typeof module !== 'undefined' && module.exports)
{
	module.exports = { ColumnAlignmentApplier };
}


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
		const lastRow = this.sheet.getLastRow();
		const lastCol = this.sheet.getLastColumn();
		
		this.headers = (lastRow > 0 && lastCol > 0) 
			? this.sheet.getRange(1, 1, 1, lastCol).getValues()[0] 
			: [];
		this.ids = (lastRow > 1 && lastCol > 0) 
			? this.sheet.getRange(2, 1, lastRow - 1, 1).getValues().map(row => row[0]) 
			: [];
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
	 * Patches a sheet if it exists, otherwise creates it.
	 * @param {string} sheetName The name of the sheet to patch or create.
	 * @param {any[][]} data The 2D array of data.
	 * @return {void}
	 */
	static patchOrCreate(sheetName, data)
	{
		const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
		let sheet = spreadsheet.getSheetByName(sheetName);
		if (sheet)
		{
			SheetPatcher.patch(sheet, data);
		}
		else
		{
			sheet = spreadsheet.insertSheet(sheetName);
			// Resize to exactly fit data
			if (sheet.getMaxRows() > data.length)
			{
				sheet.deleteRows(data.length + 1, sheet.getMaxRows() - data.length);
			}
			if (sheet.getMaxColumns() > data[0].length)
			{
				sheet.deleteColumns(data[0].length + 1, sheet.getMaxColumns() - data[0].length);
			}
			sheet.getRange(1, 1, data.length, data[0].length).setValues(data);
			SheetPatcher.styleHeaderRow(sheet);
		}
	}

	/**
	 * Styles the first row of a sheet as a header.
	 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet The sheet to style.
	 * @return {void}
	 */
	static styleHeaderRow(sheet)
	{
		const lastColumn = sheet.getLastColumn();
		if (lastColumn === 0)
		{
			return;
		}
		const range = sheet.getRange(1, 1, 1, lastColumn);
		range.setHorizontalAlignment('center');
		range.setVerticalAlignment('middle');
		range.setWrap(true);
		range.setFontWeight('bold');
		range.setFontColor('#ffffff');
		range.setBackground('#4A86E8');
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

		// Sort newData by ID (first column), keeping the header row at the top.
		const sortedData = [newData[0], ...newData.slice(1).sort((a, b) =>
		{
			if (a[0] < b[0])
			{
				return -1;
			}
			if (a[0] > b[0])
			{
				return 1;
			}
			return 0;
		})];
		newData = sortedData;

		// Remove filter if it exists to prevent interference with structural changes
		const filter = this.sheet.getFilter();
		if (filter)
		{
			filter.remove();
		}

		// 1. Structural Alignment
		this._alignRows(newData);
		const colActions = this._alignColumns(newData[0]);

		// Ensure structural changes are committed before reading current state
		SpreadsheetApp.flush();

		const numRows = newData.length;
		const numCols = newData[0].length;

		// 2. Recovery & Patching
		if (colActions.some(action => action.type === 'insert'))
		{
			this._recoverEmptyColumns(newData, numRows, numCols);
		}

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
		const getSource = () => this.sheet.getRange(1, 1, this.sheet.getLastRow(), 1).getValues().map(r => r[0]);
		const target = newData.map(r => r[0]);
		const applier = new RowAlignmentApplier(this.sheet);
		
		// 1. Deletions
		applier.applyDeletions(SortedSeriesPatcher.generateDeletions(getSource(), target));
		
		// 2. Insertions
		applier.applyInsertions(SortedSeriesPatcher.generateInsertions(getSource(), target));
		
		// 3. Moves
		applier.applyMoves(SortedSeriesPatcher.generateMoves(getSource(), target));
	}

	/**
	 * Adjusts columns based on the first row of newData.
	 * @param {any[]} newHeaderRow The first row of newData containing headers.
	 * @return {void}
	 * @private
	 */
	_alignColumns(newHeaderRow)
	{
		const getSource = () => this.sheet.getRange(1, 1, 1, this.sheet.getLastColumn()).getValues()[0];
		const applier = new ColumnAlignmentApplier(this.sheet);
		
		// 1. Deletions
		applier.applyDeletions(SeriesPatcher.generateDeletions(getSource(), newHeaderRow));
		
		// 2. Insertions
		applier.applyInsertions(SeriesPatcher.generateInsertions(getSource(), newHeaderRow));
		
		// 3. Moves
		const moves = SeriesPatcher.generateMoves(getSource(), newHeaderRow);
		applier.applyMoves(moves);
		
		return moves; // Return moves to be compatible with replace()
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

if (typeof module !== 'undefined' && module.exports)
{
	module.exports = { SheetPatcher };
}


