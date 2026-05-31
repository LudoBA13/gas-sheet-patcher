/**
 * SeriesPatcher Class
 * Generates a sequence of actions to transform one array of unique values into another.
 */
class SeriesPatcher
{
	/**
	 * Static helper to get actions without manual instantiation.
	 * @param {any[]} source The starting array.
	 * @param {any[]} target The target array.
	 * @return {object[]} List of actions.
	 */
	static patch(source, target)
	{
		return (new SeriesPatcher).getActions(source, target);
	}

	/**
	 * Calculates the actions required to transform source into target.
	 * @param {any[]} source The starting array.
	 * @param {any[]} target The target array.
	 * @return {object[]} List of actions.
	 */
	getActions(source, target)
	{
		if (this._isIdentical(source, target))
		{
			return [];
		}

		this._ensureUnique(source);
		this._ensureUnique(target);

		return this._calculateActions(source, target);
	}

	/**
	 * Checks if two arrays are identical in content and order.
	 * @param {any[]} a First array.
	 * @param {any[]} b Second array.
	 * @return {boolean} True if identical.
	 * @private
	 */
	_isIdentical(a, b)
	{
		if (a.length !== b.length)
		{
			return false;
		}

		for (let i = 0; i < a.length; i++)
		{
			if (a[i] !== b[i])
			{
				return false;
			}
		}

		return true;
	}

	/**
	 * Validates that all elements in the array are unique.
	 * @param {any[]} array The array to check.
	 * @throws {Error} If duplicates are found.
	 * @private
	 */
	_ensureUnique(array)
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
	 * Orchestrates the calculation of deletions, insertions, and moves.
	 * @param {any[]} source The starting array.
	 * @param {any[]} target The target array.
	 * @return {object[]} List of actions.
	 * @private
	 */
	_calculateActions(source, target)
	{
		const actions = [];
		const working = [...source];

		this._addDeletions(working, target, actions);
		this._addInsertionsAndMoves(working, target, actions);

		return actions;
	}

	/**
	 * Identifies elements in working that are not in target and adds delete actions.
	 * @param {any[]} working The current state of the array during transformation.
	 * @param {any[]} target The target array.
	 * @param {object[]} actions The list of actions to append to.
	 * @private
	 */
	_addDeletions(working, target, actions)
	{
		const targetSet = new Set(target);

		for (let i = working.length - 1; i >= 0; i--)
		{
			if (targetSet.has(working[i]))
			{
				continue;
			}

			actions.push({
				type: 'delete',
				index: i,
				value: working[i]
			});

			working.splice(i, 1);
		}
	}

	/**
	 * Iterates through target to ensure working matches via insertions or moves.
	 * @param {any[]} working The current state of the array.
	 * @param {any[]} target The target array.
	 * @param {object[]} actions The list of actions to append to.
	 * @private
	 */
	_addInsertionsAndMoves(working, target, actions)
	{
		for (let i = 0; i < target.length; i++)
		{
			const expected = target[i];

			if (working[i] === expected)
			{
				continue;
			}

			this._syncElement(working, target, i, actions);
		}
	}

	/**
	 * Synchronizes a single element at the specified index.
	 * @param {any[]} working The current state of the array.
	 * @param {any[]} target The target array.
	 * @param {number} index The index to synchronize.
	 * @param {object[]} actions The list of actions to append to.
	 * @private
	 */
	_syncElement(working, target, index, actions)
	{
		const expected = target[index];
		const currentIndex = working.indexOf(expected);

		if (currentIndex === -1)
		{
			this._applyInsert(working, index, expected, actions);
			return;
		}

		this._applyMove(working, currentIndex, index, expected, actions);
	}

	/**
	 * Applies an insert action to working and logs it.
	 * @param {any[]} working The current state of the array.
	 * @param {number} index The index to insert at.
	 * @param {any} value The value to insert.
	 * @param {object[]} actions The list of actions to append to.
	 * @private
	 */
	_applyInsert(working, index, value, actions)
	{
		actions.push({
			type: 'insert',
			index: index,
			value: value
		});

		working.splice(index, 0, value);
	}

	/**
	 * Applies a move action to working and logs it.
	 * @param {any[]} working The current state of the array.
	 * @param {number} fromIndex The current index of the element.
	 * @param {number} toIndex The target index for the element.
	 * @param {any} value The value being moved.
	 * @param {object[]} actions The list of actions to append to.
	 * @private
	 */
	_applyMove(working, fromIndex, toIndex, value, actions)
	{
		actions.push({
			type: 'move',
			from: fromIndex,
			to: toIndex,
			value: value
		});

		working.splice(fromIndex, 1);
		working.splice(toIndex, 0, value);
	}
}
