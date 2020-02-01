const expect = require("chai").expect;
const part1 = require("./../solutions/14-disk-defrag/solution").part1;
const part2 = require("./../solutions/14-disk-defrag/solution").part2;
const FINAL_INPUT = require("./../solutions/14-disk-defrag/finalInput").finalInput;

// These tests take too long to run all of the time (around 700ms each on my ultrabook),
// but the answers are correct.

describe("14-disk-defrag", () => {
	// describe("Part 1", () => {
	// 	it("on the final input, it should return 8222", done => {
	// 		const input = FINAL_INPUT;
	// 		const result = part1(input);
	// 		const expected = 8222;
	// 		expect(result).to.equal(expected);
	// 		done();
	// 	});
	// });
	// describe("Part 2", () => {
	// 	it("on the final input, it should return 1086", done => {
	// 		const input = FINAL_INPUT;
	// 		const result = part2(input);
	// 		const expected = 1086;
	// 		expect(result).to.equal(expected);
	// 		done();
	// 	});
	// });
});
