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
	 * Strict order: delete (reverse index), insert (forward index), move (target order).
	 * @param {object[]} actions List of actions.
	 * @return {void}
	 */
	apply(actions)
	{
		const deletions = actions.filter(a => a.type === 'delete');
		const insertions = actions.filter(a => a.type === 'insert');
		const moves = actions.filter(a => a.type === 'move');

		// 1. Delete: reverse index order
		for (const action of deletions.sort((a, b) => b.index - a.index))
		{
			this.delete(action.index);
		}

		// 2. Insert: forward index order
		for (const action of insertions.sort((a, b) => a.index - b.index))
		{
			this.insert(action.index);
		}

		// 3. Move: target order
		for (const action of moves)
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
