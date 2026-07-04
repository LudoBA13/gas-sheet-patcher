
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

module.exports = { RowAlignmentApplier };
