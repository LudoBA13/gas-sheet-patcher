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
		console.log('Running SeriesPatcher tests...');
		
		this.testIdentical();
		this.testReorder();
		this.testInsertAndDelete();
		this.testComplex();
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
		
		for (const action of actions)
		{
			if (action.type === 'delete')
			{
				working.splice(action.index, 1);
			}
			else if (action.type === 'insert')
			{
				working.splice(action.index, 0, action.value);
			}
			else if (action.type === 'move')
			{
				working.splice(action.from, 1);
				working.splice(action.to, 0, action.value);
			}
		}
		
		return working;
	}

	/**
	 * Test: Identical arrays should return no actions.
	 */
	testIdentical()
	{
		const source = [1, 2, 3];
		const target = [1, 2, 3];
		const actions = SeriesPatcher.patch(source, target);
		
		this.assertEqual(actions, [], 'Identical arrays should produce no actions');
	}

	/**
	 * Test: Reordering elements.
	 */
	testReorder()
	{
		const source = ['A', 'B', 'C'];
		const target = ['C', 'B', 'A'];
		const actions = SeriesPatcher.patch(source, target);
		const result = this.applyActions(source, actions);
		
		this.assertEqual(result, target, 'Should correctly reorder elements');
	}

	/**
	 * Test: Insertion and Deletion.
	 */
	testInsertAndDelete()
	{
		const source = ['A', 'B'];
		const target = ['B', 'C'];
		const actions = SeriesPatcher.patch(source, target);
		const result = this.applyActions(source, actions);
		
		this.assertEqual(result, target, 'Should correctly handle insertion and deletion');
	}

	/**
	 * Test: Complex transformation.
	 */
	testComplex()
	{
		const source = ['A', 'B', 'C', 'D'];
		const target = ['D', 'X', 'B', 'A'];
		const actions = SeriesPatcher.patch(source, target);
		const result = this.applyActions(source, actions);
		
		this.assertEqual(result, target, 'Should correctly handle complex transformations');
	}

	/**
	 * Test: Validation of unique values.
	 */
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

		try
		{
			SeriesPatcher.patch([1], [2, 2]);
			this.assert(false, 'Should throw error on duplicate target');
		}
		catch (e)
		{
			this.assertEqual(e.message, 'Array values must be unique.', 'Correct error message for target duplicates');
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
