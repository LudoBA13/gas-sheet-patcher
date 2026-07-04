
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
