/**
 * SortedSeriesPatcher Class
 * Optimized for sorted arrays, providing linear-time patching.
 */
class SortedSeriesPatcher
{
	/**
	 * @param {any[]} source The starting sorted array.
	 * @param {any[]} target The target sorted array.
	 * @return {object[]} List of actions.
	 */
	static patch(source, target)
	{
		const actions = [];
		const working = [...source];
		let s = 0;
		let t = 0;

		while (t < target.length)
		{
			if (s < working.length && working[s] === target[t])
			{
				s++;
				t++;
			}
			else if (s < working.length && working[s] < target[t])
			{
				// working[s] is not in target, delete it
				actions.push({
					type: 'delete',
					index: s,
					value: working[s]
				});
				working.splice(s, 1);
			}
			else
			{
				// target[t] is missing in working, insert it
				actions.push({
					type: 'insert',
					index: t,
					value: target[t]
				});
				working.splice(t, 0, target[t]);
				s++;
				t++;
			}
		}

		// Delete remaining elements in working
		while (s < working.length)
		{
			actions.push({
				type: 'delete',
				index: s,
				value: working[s]
			});
			working.splice(s, 1);
		}

		return actions;
	}
}

if (typeof module !== 'undefined' && module.exports)
{
	module.exports = { SortedSeriesPatcher };
}
