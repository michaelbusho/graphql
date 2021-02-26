const helloWorld = require('../src/hello');

describe('helloWorld', () => {
	it('returns hello world', () => {
		expect(helloWorld()).toBe('hello worlds');
	});
});
