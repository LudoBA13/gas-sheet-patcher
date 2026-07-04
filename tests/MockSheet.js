/**
 * Test double for Google Apps Script Sheet.
 */
class MockSheet
{
	constructor(initialData = null, maxRows = 100, maxCols = 20)
	{
		if (initialData)
		{
			this.data = JSON.parse(JSON.stringify(initialData));
			this.maxRows = initialData.length;
			this.maxCols = initialData[0].length;
		}
		else
		{
			this.data = Array.from({ length: maxRows }, () => Array(maxCols).fill(''));
			this.maxRows = maxRows;
			this.maxCols = maxCols;
		}
	}

	getLastRow()
	{
		return this.data.length;
	}

	getLastColumn()
	{
		return this.data.length > 0 ? this.data[0].length : 0;
	}

	getMaxRows()
	{
		return this.maxRows;
	}

	getMaxColumns()
	{
		return this.maxCols;
	}

	getRange(row, col, numRows = 1, numCols = 1)
	{
		return new MockRange(this, row, col, numRows, numCols);
	}

	insertRowBefore(row)
	{
		const newRow = new Array(this.getLastColumn()).fill('');
		this.data.splice(row - 1, 0, newRow);
		this.maxRows++;
	}

	deleteRow(row)
	{
		this.data.splice(row - 1, 1);
		this.maxRows--;
	}

	deleteRows(row, numRows)
	{
		this.data.splice(row - 1, numRows);
		this.maxRows -= numRows;
	}

	insertColumnBefore(col)
	{
		for (const row of this.data)
		{
			row.splice(col - 1, 0, '');
		}
		this.maxCols++;
	}

	deleteColumn(col)
	{
		for (const row of this.data)
		{
			row.splice(col - 1, 1);
		}
		this.maxCols--;
	}

	deleteColumns(col, numCols)
	{
		for (const row of this.data)
		{
			row.splice(col - 1, numCols);
		}
		this.maxCols -= numCols;
	}

	moveRows(rowSpec, destinationIndex)
	{
		const startRow = rowSpec.row;
		const numRows = rowSpec.numRows;
		const rowsToMove = this.data.splice(startRow - 1, numRows);
		this.data.splice(destinationIndex - 1, 0, ...rowsToMove);
	}

	moveColumns(columnSpec, destinationIndex)
	{
		const startCol = columnSpec.col;
		const numCols = columnSpec.numCols;
		for (const row of this.data)
		{
			const colsToMove = row.splice(startCol - 1, numCols);
			row.splice(destinationIndex - 1, 0, ...colsToMove);
		}
	}
}

/**
 * Test double for Google Apps Script Spreadsheet.
 */
class MockSpreadsheet
{
	constructor()
	{
		this.sheets = {};
	}

	getSheetByName(name)
	{
		return this.sheets[name] || null;
	}

	insertSheet(name)
	{
		const sheet = new MockSheet();
		this.sheets[name] = sheet;
		return sheet;
	}
}

/**
 * Test double for Google Apps Script Range.
 */
class MockRange
{
	constructor(sheet, row, col, numRows, numCols)
	{
		this.sheet = sheet;
		this.row = row;
		this.col = col;
		this.numRows = numRows;
		this.numCols = numCols;
	}

	setHorizontalAlignment(alignment) { return this; }
	setVerticalAlignment(alignment) { return this; }
	setWrap(wrap) { return this; }
	setFontWeight(weight) { return this; }
	setFontColor(color) { return this; }
	setBackground(color) { return this; }

	getValues()
	{
		return this.sheet.data.slice(this.row - 1, this.row - 1 + this.numRows)
			.map(row => row.slice(this.col - 1, this.col - 1 + this.numCols));
	}

	getValue()
	{
		return this.getValues()[0][0];
	}

	setValues(values)
	{
		for (let r = 0; r < this.numRows; r++)
		{
			for (let c = 0; c < this.numCols; c++)
			{
				this.sheet.data[this.row - 1 + r][this.col - 1 + c] = values[r][c];
			}
		}
	}
}

module.exports = { MockSheet, MockSpreadsheet };
