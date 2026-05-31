if (typeof module !== 'undefined')
{
	var { AlignmentApplier } = require('./AlignmentApplier');
}

/**
 * Concrete implementation for applying actions to columns.
 */
class ColumnAlignmentApplier extends AlignmentApplier
{
	delete(index)
	{
		this.sheet.deleteColumn(index + 1);
	}

	insert(index)
	{
		this.sheet.insertColumnBefore(index + 1);
	}

	move(from, to)
	{
		this.sheet.moveColumns(this.sheet.getRange(1, from + 1), to + 1);
	}
}

if (typeof module !== 'undefined')
{
	module.exports = { ColumnAlignmentApplier };
}
