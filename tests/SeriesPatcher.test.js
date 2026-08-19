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
		console.log('Running expanded SeriesPatcher tests with action inspection...');
		
		this.testIdentical();
		this.testPureDeletions();
		this.testPureInsertions();
		this.testReorderOnly();
		this.testInsertAndDelete();
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

	applyActions(source, actions)
	{
		const working = [...source];
		const deletions = actions.filter(a => a.type === 'delete').sort((a, b) => b.index - a.index);
		const insertions = actions.filter(a => a.type === 'insert').sort((a, b) => a.index - b.index);
		const moves = actions.filter(a => a.type === 'move');

		for (const action of deletions) working.splice(action.index, 1);
		for (const action of insertions) working.splice(action.index, 0, action.value);
		for (const action of moves) {
			working.splice(action.from, 1);
			working.splice(action.to, 0, action.value);
		}
		
		return working;
	}

	testIdentical()
	{
		const source = [1, 2, 3];
		const target = [1, 2, 3];
		const actions = SeriesPatcher.patch(source, target);
		
		this.assertEqual(actions, [], 'Identical arrays should produce no actions');
	}

	testPureDeletions()
	{
		const source = ['A', 'B', 'C', 'D'];
		const target = ['A', 'C'];
		const expectedActions = [
			{ type: 'delete', index: 3, value: 'D' },
			{ type: 'delete', index: 1, value: 'B' }
		];
		const actions = SeriesPatcher.patch(source, target);
		
		this.assertEqual(actions, expectedActions, 'Pure deletions');
		this.assertEqual(this.applyActions(source, actions), target, 'Apply pure deletions');
	}

	testPureInsertions()
	{
		const source = ['A', 'C'];
		const target = ['A', 'B', 'C', 'D'];
		const expectedActions = [
			{ type: 'insert', index: 1, value: 'B' },
			{ type: 'insert', index: 3, value: 'D' }
		];
		const actions = SeriesPatcher.patch(source, target);
		
		this.assertEqual(actions, expectedActions, 'Pure insertions');
		this.assertEqual(this.applyActions(source, actions), target, 'Apply pure insertions');
	}

	testReorderOnly()
	{
		const source = ['A', 'B', 'C'];
		const target = ['C', 'B', 'A'];
		const expectedActions = [
			{ type: 'move', from: 2, to: 0, value: 'C' },
			{ type: 'move', from: 2, to: 1, value: 'B' }
		];
		const actions = SeriesPatcher.patch(source, target);
		
		this.assertEqual(actions, expectedActions, 'Reorder only');
		this.assertEqual(this.applyActions(source, actions), target, 'Apply reorder');
	}

	testInsertAndDelete()
	{
		const source = ['A', 'B'];
		const target = ['B', 'C'];
		const expectedActions = [
			{ type: 'delete', index: 0, value: 'A' },
			{ type: 'insert', index: 1, value: 'C' }
		];
		const actions = SeriesPatcher.patch(source, target);
		
		this.assertEqual(actions, expectedActions, 'Simple mix');
		this.assertEqual(this.applyActions(source, actions), target, 'Apply simple mix');
	}

	testComplexMix()
	{
		const source = ['A', 'B', 'C', 'D'];
		const target = ['D', 'X', 'B', 'A'];
		const actions = SeriesPatcher.patch(source, target);
		
		const expectedActions = [{"type":"delete","index":2,"value":"C"},{"type":"insert","index":1,"value":"X"},{"type":"move","from":3,"to":0,"value":"D"},{"type":"move","from":2,"to":1,"value":"X"},{"type":"move","from":3,"to":2,"value":"B"}];
		
		this.assertEqual(actions, expectedActions, 'Complex mix actions');
		this.assertEqual(this.applyActions(source, actions), target, 'Apply complex mix');
	}

	testDuplicatesThrow()
	{
		try
		{
			SeriesPatcher.patch([1, 1], [2]);
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
