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

		// 1. Calculate Deletions
		const deletions = this._calculateDeletions(working, target);
		actions.push(...deletions);
		deletions.forEach(a => working.splice(a.index, 1));

		// 2. Calculate Insertions
		const insertions = this._calculateInsertions(working, target);
		actions.push(...insertions);
		insertions.forEach(a => working.splice(a.index, 0, a.value));

		// 3. Calculate Moves
		const moves = this._calculateMoves(working, target);
		actions.push(...moves);

		return actions;
	}

	/**
	 * Identifies elements in working that are not in target.
	 * @param {any[]} working The current state of the array.
	 * @param {any[]} target The target array.
	 * @return {object[]} Deletion actions.
	 * @private
	 */
	_calculateDeletions(working, target)
	{
		const targetSet = new Set(target);
		const actions = [];
		// Deleting in reverse order to keep indices valid during calculation
		for (let i = working.length - 1; i >= 0; i--)
		{
			if (!targetSet.has(working[i]))
			{
				actions.push({
					type: 'delete',
					index: i,
					value: working[i]
				});
			}
		}
		// Sort by index descending to match desired application order (reverse index order)
		return actions.sort((a, b) => b.index - a.index);
	}

	/**
	 * Identifies elements in target that are not in working.
	 * @param {any[]} working The current state of the array.
	 * @param {any[]} target The target array.
	 * @return {object[]} Insertion actions.
	 * @private
	 */
	_calculateInsertions(working, target)
	{
		const workingSet = new Set(working);
		const actions = [];
		for (let i = 0; i < target.length; i++)
		{
			if (!workingSet.has(target[i]))
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
	 * Calculates move actions once working and target have the same elements.
	 * @param {any[]} working The current state of the array.
	 * @param {any[]} target The target array.
	 * @return {object[]} Move actions.
	 * @private
	 */
	_calculateMoves(working, target)
	{
		const actions = [];
		const current = [...working];

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
