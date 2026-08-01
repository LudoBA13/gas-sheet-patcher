const { SortedSeriesPatcher } = require('../src/SortedSeriesPatcher');

/**
 * SortedSeriesPatcher Test Suite
 */
class SortedSeriesPatcherTest
{
	run()
	{
		console.log('Running SortedSeriesPatcher tests...');
		this.testIdentical();
		this.testSimple();
		this.testInsertAndDelete();
		this.testComplex();
		console.log('All tests passed!');
	}

	assert(condition, message)
	{
		if (!condition) throw new Error('Assertion failed: ' + message);
	}

	assertEqual(a, b, message)
	{
		const strA = JSON.stringify(a);
		const strB = JSON.stringify(b);
		this.assert(strA === strB, `${message} (Expected ${strB}, got ${strA})`);
	}

	testIdentical()
	{
		const source = [1, 2, 3];
		const target = [1, 2, 3];
		this.assertEqual(SortedSeriesPatcher.patch(source, target), [], 'Identical arrays should produce no actions');
	}

	testSimple()
	{
		const source = [1, 2, 3];
		const target = [1, 3];
		// Expected: delete 2
		const actions = SortedSeriesPatcher.patch(source, target);
		this.assertEqual(actions, [{ type: 'delete', index: 1, value: 2 }], 'Should delete 2');
	}

	testInsertAndDelete()
	{
		const source = [1, 2];
		const target = [2, 3];
		// 1 < 2, delete 1. 2 == 2, match. 3 > 2 (end), insert 3.
		const actions = SortedSeriesPatcher.patch(source, target);
		this.assertEqual(actions, [
			{ type: 'delete', index: 0, value: 1 },
			{ type: 'insert', index: 1, value: 3 }
		], 'Should handle insert and delete');
	}

	testComplex()
	{
		const source = [1, 2, 3, 4];
		const target = [1, 3, 5];
		// 1==1. 2 < 3, delete 2. 3==3. 5 > 3 (end), insert 5.
		const actions = SortedSeriesPatcher.patch(source, target);
		this.assertEqual(actions, [
			{ type: 'delete', index: 1, value: 2 },
			{ type: 'delete', index: 2, value: 4 },
			{ type: 'insert', index: 2, value: 5 }
		], 'Should handle complex');
	}
}

if (typeof module !== 'undefined' && require.main === module)
{
	(new SortedSeriesPatcherTest).run();
}
