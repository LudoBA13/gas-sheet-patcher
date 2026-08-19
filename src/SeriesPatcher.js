/**
 * SeriesPatcher Class
 * Generates specific actions to transform one array of unique values into another, phase-by-phase.
 */
class SeriesPatcher
{
	/**
	 * Validates that all elements in the array are unique.
	 * @param {any[]} array The array to check.
	 * @throws {Error} If duplicates are found.
	 * @private
	 */
	static _ensureUnique(array)
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
	 * Identifies elements in source that are not in target.
	 * @param {any[]} source 
	 * @param {any[]} target 
	 * @return {object[]} Deletion actions.
	 */
	static generateDeletions(source, target)
	{
		this._ensureUnique(source);
		this._ensureUnique(target);

		const targetSet = new Set(target);
		const actions = [];
		// Deleting in reverse order to keep indices valid during calculation
		for (let i = source.length - 1; i >= 0; i--)
		{
			if (!targetSet.has(source[i]))
			{
				actions.push({
					type: 'delete',
					index: i,
					value: source[i]
				});
			}
		}
		// Sort by index descending to match desired application order (reverse index order)
		return actions.sort((a, b) => b.index - a.index);
	}

	/**
	 * Identifies elements in target that are not in source.
	 * @param {any[]} source 
	 * @param {any[]} target 
	 * @return {object[]} Insertion actions.
	 */
	static generateInsertions(source, target)
	{
		this._ensureUnique(source);
		this._ensureUnique(target);

		const sourceSet = new Set(source);
		const actions = [];
		for (let i = 0; i < target.length; i++)
		{
			if (!sourceSet.has(target[i]))
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
	 * Calculates move actions once source and target have the same elements.
	 * @param {any[]} source 
	 * @param {any[]} target 
	 * @return {object[]} Move actions.
	 */
	static generateMoves(source, target)
	{
		this._ensureUnique(source);
		this._ensureUnique(target);

		const actions = [];
		const current = [...source];

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
