const expect = require("chai").expect;
const part1 = require("./../solutions/16-permutation-promenade/solution").part1;
const part2 = require("./../solutions/16-permutation-promenade/solution").part2;
const FINAL_INPUT = require("./../solutions/16-permutation-promenade/finalInput")
	.finalInput;

describe("16-permutation-promenade", () => {
	describe("Part 1", () => {
		it("on input \"s1,x3/4,pe/b\" on 'abcde', it should return 'baedc'", done => {
			const input = "s1,x3/4,pe/b";
			const dancers = "abcde";
			const result = part1(input, dancers);
			const expected = "baedc";
			expect(result).to.equal(expected);
			done();
		});
		it("on the final input, it should return 'eojfmbpkldghncia'", done => {
			const input = FINAL_INPUT;
			const dancers = "abcdefghijklmnop";
			const result = part1(input, dancers);
			const expected = "eojfmbpkldghncia";
			expect(result).to.equal(expected);
			done();
		});
	});
	describe("Part 2", () => {
		it("on the final input, it should return 'eojfmbpkldghncia'", done => {
			const input = FINAL_INPUT;
			const dancers = "abcdefghijklmnop";
			const result = part2(input, dancers);
			const expected = "iecopnahgdflmkjb";
			expect(result).to.equal(expected);
			done();
		});
	});
});
