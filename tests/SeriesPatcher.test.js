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
		console.log('Running expanded SeriesPatcher tests...');
		
		// Basic cases
		this.testIdentical();
		
		// Pure operations
		this.testPureDeletions();
		this.testPureInsertions();
		
		// Mixed operations
		this.testInsertAndDelete();
		this.testReorderOnly();
		this.testComplexMix();
		
		// Edge cases
		this.testDuplicatesThrow();
		
		console.log('All tests passed!');
	}

	/**
	 * Basic assertion helper.
	 */
	assert(condition, message)
	{
		if (!condition)
		{
			throw new Error('Assertion failed: ' + message);
		}
	}

	/**
	 * Equality assertion helper for arrays/objects.
	 */
	assertEqual(a, b, message)
	{
		const strA = JSON.stringify(a);
		const strB = JSON.stringify(b);
		
		this.assert(strA === strB, `${message} (Expected ${strB}, got ${strA})`);
	}

	/**
	 * Applies actions to a source array to verify the transformation.
	 */
	applyActions(source, actions)
	{
		const working = [...source];
		
		// Recreate the strict application order to verify the generated actions
		const deletions = actions.filter(a => a.type === 'delete').sort((a, b) => b.index - a.index);
		const insertions = actions.filter(a => a.type === 'insert').sort((a, b) => a.index - b.index);
		const moves = actions.filter(a => a.type === 'move');

		// 1. Delete: reverse index order
		for (const action of deletions)
		{
			working.splice(action.index, 1);
		}

		// 2. Insert: forward index order
		for (const action of insertions)
		{
			working.splice(action.index, 0, action.value);
		}

		// 3. Move: target order
		for (const action of moves)
		{
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
		const actions = SeriesPatcher.patch(source, target);
		const result = this.applyActions(source, actions);
		
		this.assertEqual(result, target, 'Should correctly handle pure deletions');
	}

	testPureInsertions()
	{
		const source = ['A', 'C'];
		const target = ['A', 'B', 'C', 'D'];
		const actions = SeriesPatcher.patch(source, target);
		const result = this.applyActions(source, actions);
		
		this.assertEqual(result, target, 'Should correctly handle pure insertions');
	}

	testReorderOnly()
	{
		const source = ['A', 'B', 'C'];
		const target = ['C', 'B', 'A'];
		const actions = SeriesPatcher.patch(source, target);
		const result = this.applyActions(source, actions);
		
		this.assertEqual(result, target, 'Should correctly reorder elements');
	}

	testInsertAndDelete()
	{
		const source = ['A', 'B'];
		const target = ['B', 'C'];
		const actions = SeriesPatcher.patch(source, target);
		const result = this.applyActions(source, actions);
		
		this.assertEqual(result, target, 'Should correctly handle simple mix of insertion and deletion');
	}

	testComplexMix()
	{
		const source = ['A', 'B', 'C', 'D'];
		const target = ['D', 'X', 'B', 'A'];
		const actions = SeriesPatcher.patch(source, target);
		const result = this.applyActions(source, actions);
		
		this.assertEqual(result, target, 'Should correctly handle complex mix of insert, delete, and move');
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
			this.assertEqual(e.message, 'Array values must be unique.', 'Correct error message for source duplicates');
		}
	}
}

// Runnable via Node.js for validation
if (typeof module !== 'undefined' && require.main === module)
{
	const fs = require('fs');
	const path = require('path');
	const vm = require('vm');
	
	const codePath = path.join(__dirname, '../src/SeriesPatcher.js');
	const code = fs.readFileSync(codePath, 'utf8');
	
	// Run the code in the current context
	vm.runInThisContext(code);
	
	(new SeriesPatcherTest).run();
}
