/**
 * SeriesPatcher Test Suite
 */
class SeriesPatcherTest
{
	/**
	 * Runs all tests.
	 */
	run()
	{
		console.log('Running sequential SeriesPatcher tests...');
		
		this.testIdentical();
		this.testDeletions();
		this.testInsertions();
		this.testMoves();
		this.testComplexMix();
		this.testDuplicatesThrow();
		
		console.log('All tests passed!');
	}

	assert(condition, message)
	{
		if (!condition)
		{
			throw new Error('Assertion failed: ' + message);
		}
	}

	assertEqual(a, b, message)
	{
		const strA = JSON.stringify(a);
		const strB = JSON.stringify(b);
		this.assert(strA === strB, `${message}\nExpected: ${strB}\nGot:      ${strA}`);
	}

	/**
	 * Sequential application of actions to simulate the new process.
	 */
	applySequential(source, target)
	{
		let working = [...source];

		// 1. Deletions
		const delActions = SeriesPatcher.generateDeletions(working, target);
		for (const a of delActions) working.splice(a.index, 1);

		// 2. Insertions
		const insActions = SeriesPatcher.generateInsertions(working, target);
		for (const a of insActions) working.splice(a.index, 0, a.value);

		// 3. Moves
		const moveActions = SeriesPatcher.generateMoves(working, target);
		for (const a of moveActions) {
			working.splice(a.from, 1);
			working.splice(a.to, 0, a.value);
		}
		
		return working;
	}

	testIdentical()
	{
		const source = [1, 2, 3];
		const target = [1, 2, 3];
		
		this.assertEqual(SeriesPatcher.generateDeletions(source, target), [], 'Identical Deletions');
		this.assertEqual(SeriesPatcher.generateInsertions(source, target), [], 'Identical Insertions');
		this.assertEqual(SeriesPatcher.generateMoves(source, target), [], 'Identical Moves');
	}

	testDeletions()
	{
		const source = ['A', 'B', 'C', 'D'];
		const target = ['A', 'C'];
		const expectedActions = [
			{ type: 'delete', index: 3, value: 'D' },
			{ type: 'delete', index: 1, value: 'B' }
		];
		
		this.assertEqual(SeriesPatcher.generateDeletions(source, target), expectedActions, 'Deletions');
	}

	testInsertions()
	{
		const source = ['A', 'C'];
		const target = ['A', 'B', 'C', 'D'];
		const expectedActions = [
			{ type: 'insert', index: 1, value: 'B' },
			{ type: 'insert', index: 3, value: 'D' }
		];
		
		this.assertEqual(SeriesPatcher.generateInsertions(source, target), expectedActions, 'Insertions');
	}

	testMoves()
	{
		const source = ['A', 'B', 'C'];
		const target = ['C', 'B', 'A'];
		const expectedActions = [
			{ type: 'move', from: 2, to: 0, value: 'C' },
			{ type: 'move', from: 2, to: 1, value: 'B' }
		];
		
		this.assertEqual(SeriesPatcher.generateMoves(source, target), expectedActions, 'Moves');
	}

	testComplexMix()
	{
		const source = ['A', 'B', 'C', 'D'];
		const target = ['D', 'X', 'B', 'A'];
		
		this.assertEqual(this.applySequential(source, target), target, 'Apply sequential complex mix');
	}

	testDuplicatesThrow()
	{
		try
		{
			SeriesPatcher.generateDeletions([1, 1], [2]);
			this.assert(false, 'Should throw error on duplicate source');
		}
		catch (e)
		{
			this.assertEqual(e.message, 'Array values must be unique.', 'Error handling');
		}
	}
}

// Runnable via Node.js for validation
if (typeof module !== 'undefined' && require.main === module)
{
	const fs = require('fs');
	const path = require('path');
	const vm = require('vm');
	vm.runInThisContext(fs.readFileSync(path.join(__dirname, '../src/SeriesPatcher.js'), 'utf8'));
	(new SeriesPatcherTest).run();
}
