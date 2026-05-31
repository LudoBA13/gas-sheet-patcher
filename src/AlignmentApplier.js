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
	 * Applies a sequence of actions from SeriesPatcher.
	 * @param {object[]} actions List of actions.
	 * @return {void}
	 */
	apply(actions)
	{
		for (const action of actions)
		{
			switch (action.type)
			{
				case 'delete':
					this.delete(action.index);
					break;
				case 'insert':
					this.insert(action.index);
					break;
				case 'move':
					this.move(action.from, action.to);
					break;
			}
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

if (typeof module !== 'undefined')
{
	module.exports = { AlignmentApplier };
}
