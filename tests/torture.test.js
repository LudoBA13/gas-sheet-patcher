const { SeriesPatcher } = require('../src/SeriesPatcher');
const fs = require('fs');
const { DeleteAction } = require('../src/DeleteAction');
const { InsertAction } = require('../src/InsertAction');
const { MoveAction } = require('../src/MoveAction');

/**
 * Torture test for SeriesPatcher.
 */
class TortureTest
{
	constructor(numIterations = 10)
	{
		this.numIterations = numIterations;
	}

	run()
	{
		console.log(`Running ${this.numIterations} iterations of torture test...`);
		for (let i = 0; i < this.numIterations; i++)
		{
			this.runIteration(i);
		}
		console.log('All torture tests passed!');
	}

	runIteration(iteration)
	{
		const size = 10;
		const source = this.generateRandomArray(size);
		const modified = this.modifyArray([...source]);
		
		const working = [...source];
		const actions = SeriesPatcher.patch(source, modified);

		// Apply actions to working
		for (const action of actions)
		{
			if (action instanceof DeleteAction)
			{
				working.splice(action.index, 1);
			}
			else if (action instanceof InsertAction)
			{
				working.splice(action.index, 0, action.value);
			}
			else if (action instanceof MoveAction)
			{
				const value = working[action.fromIndex];
				working.splice(action.fromIndex, 1);
				working.splice(action.toIndex, 0, value);
			}
		}

		if (JSON.stringify(working) !== JSON.stringify(modified))
		{
			this.dumpFailure(iteration, source, modified, working, actions);
			throw new Error(`Torture test iteration ${iteration} failed.`);
		}
	}

	generateRandomArray(size)
	{
		return Array.from({ length: size }, (_, i) => `item_${i}`);
	}

	modifyArray(arr)
	{
		// Delete
		for (let i = 0; i < 2; i++)
		{
			const idx = Math.floor(Math.random() * arr.length);
			arr.splice(idx, 1);
		}
		// Move
		for (let i = 0; i < 2; i++)
		{
			const from = Math.floor(Math.random() * arr.length);
			const to = Math.floor(Math.random() * arr.length);
			const val = arr.splice(from, 1)[0];
			arr.splice(to, 0, val);
		}
		// Insert
		for (let i = 0; i < 2; i++)
		{
			const idx = Math.floor(Math.random() * (arr.length + 1));
			arr.splice(idx, 0, `new_${Math.random()}`);
		}
		return arr;
	}

	dumpFailure(iteration, source, modified, result, actions)
	{
		const filename = `failure_${iteration}.json`;
		const data = { iteration, source, modified, result, actions };
		fs.writeFileSync(filename, JSON.stringify(data, null, 2));
		console.error(`Test failed. Data dumped to ${filename}`);
	}
}

(new TortureTest(50)).run();
