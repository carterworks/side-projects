const expect = require("chai").expect;
const part1 = require("./../solutions/12-digital-plumber/solution").part1;
const part2 = require("./../solutions/12-digital-plumber/solution").part2;
const FINAL_INPUT = require("./../solutions/12-digital-plumber/finalInput").finalInput;

describe("12-digital-plumber", () => {
	describe("Part 1", () => {
		it("on input, it should return 6", done => {
			const input = `0 <-> 2
1 <-> 1
2 <-> 0, 3, 4
3 <-> 2, 4
4 <-> 2, 3, 6
5 <-> 6
6 <-> 4, 5`;
			const result = part1(input);
			const expected = 6;
			expect(result).to.equal(expected);
			done();
		});
		it("on the final input, it should return 288", done => {
			const input = FINAL_INPUT;
			const result = part1(input);
			const expected = 288;
			expect(result).to.equal(expected);
			done();
		});
	});
	describe("Part 2", () => {
		it("on input \'\', it should return 2", done => {
			const input = `0 <-> 2
1 <-> 1
2 <-> 0, 3, 4
3 <-> 2, 4
4 <-> 2, 3, 6
5 <-> 6
6 <-> 4, 5`;
			const result = part2(input);
			const expected = 2;
			expect(result).to.equal(expected);
			done();
		});
		it("on the final input, it should return 211", done => {
			const input = FINAL_INPUT;
			const result = part2(input);
			const expected = 211;
			expect(result).to.equal(expected);
			done();
		});
	});
});
