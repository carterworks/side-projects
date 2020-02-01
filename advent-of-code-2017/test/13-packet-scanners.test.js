const expect = require("chai").expect;
const part1 = require("./../solutions/13-packet-scanners/solution").part1;
const part2 = require("./../solutions/13-packet-scanners/solution").part2;
const FINAL_INPUT = require("./../solutions/13-packet-scanners/finalInput").finalInput;

describe("13-packet-scanners", () => {
	describe("Part 1", () => {
		it("on input, it should return 24", done => {
			const input = `0: 3
1: 2
4: 4
6: 4`;
			const result = part1(input);
			const expected = 24;
			expect(result).to.equal(expected);
			done();
		});
		it("on the final input, it should return 1876", done => {
			const input = FINAL_INPUT;
			const result = part1(input);
			const expected = 1876;
			expect(result).to.equal(expected);
			done();
		});
	});
	describe("Part 2", () => {
		it("on input, it should return 10", done => {
			const input = `0: 3
1: 2
4: 4
6: 4`;
			const result = part2(input);
			const expected = 10;
			expect(result).to.equal(expected);
			done();
		});
		it("on the final input, it should return 3964778", done => {
			const input = FINAL_INPUT;
			const result = part2(input);
			const expected = 3964778;
			expect(result).to.equal(expected);
			done();
		});
	});
});
