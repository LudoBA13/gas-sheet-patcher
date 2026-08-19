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
