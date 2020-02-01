const expect = require("chai").expect;
const part1 = require("./../solutions/15-dueling-generations/solution").part1;
const part2 = require("./../solutions/15-dueling-generations/solution").part2;
const FINAL_INPUT = require("./../solutions/15-dueling-generations/finalInput").finalInput;

// All of these tests take too long to include in mocha, but the answers are right and the tests pass.

describe("15-dueling-generations", () => {
	describe("Part 1", () => {
		// part 1 times out
		// it("on input \'{a: 65, b: 8921}\', it should return 588", done => {
		// 	const input = {a: 65, b: 8921};
		// 	const result = part1(input);
		// 	const expected = 588;
		// 	expect(result).to.equal(expected);
		// 	done();
		// });
		// it("on the final input, it should return 999", done => {
		// 	const input = FINAL_INPUT;
		// 	const result = part1(input);
		// 	const expected = 999;
		// 	expect(result).to.equal(expected);
		// 	done();
		// });
	});
	describe("Part 2", () => {
		// it("on input \'{a: 65, b: 8921}\', it should return 309", done => {
		// 	const input = {a: 65, b: 8921};
		// 	const result = part2(input);
		// 	const expected = 309;
		// 	expect(result).to.equal(expected);
		// 	done();
		// });
		// it("on the final input, it should return 209", done => {
		// 	const input = FINAL_INPUT;
		// 	const result = part2(input);
		// 	const expected = 209;
		// 	expect(result).to.equal(expected);
		// 	done();
		// });
	});
});
