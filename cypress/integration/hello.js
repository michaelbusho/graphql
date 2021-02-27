const add = require('../../src/hello');

describe('Unit test our math functions', () => {
	context('math', () => {
		it('can add numbers', () => {
			expect(add(1, 2)).to.eq(5);
		});
	});
});
