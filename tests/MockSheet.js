/**
 * Test double for Google Apps Script Sheet.
 */
class MockSheet
{
	constructor(initialData = [[]])
	{
		this.data = JSON.parse(JSON.stringify(initialData));
	}

	getLastRow()
	{
		return this.data.length;
	}

	getLastColumn()
	{
		return this.data.length > 0 ? this.data[0].length : 0;
	}

	getRange(row, col, numRows, numCols)
	{
		return new MockRange(this, row, col, numRows, numCols);
	}

	insertRowBefore(row)
	{
		const newRow = new Array(this.getLastColumn()).fill('');
		this.data.splice(row - 1, 0, newRow);
	}

	deleteRow(row)
	{
		this.data.splice(row - 1, 1);
	}

	deleteRows(row, numRows)
	{
		this.data.splice(row - 1, numRows);
	}

	insertColumnBefore(col)
	{
		for (const row of this.data)
		{
			row.splice(col - 1, 0, '');
		}
	}

	deleteColumn(col)
	{
		for (const row of this.data)
		{
			row.splice(col - 1, 1);
		}
	}

	deleteColumns(col, numCols)
	{
		for (const row of this.data)
		{
			row.splice(col - 1, numCols);
		}
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

module.exports = { MockSheet };
