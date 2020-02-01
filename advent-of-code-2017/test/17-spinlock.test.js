const expect = require("chai").expect;
const part1 = require("./../solutions/17-spinlock/solution").part1;
const part2 = require("./../solutions/17-spinlock/solution").part2;
const FINAL_INPUT = require("./../solutions/17-spinlock/finalInput").finalInput;

describe("17-spinlock", () => {
	describe("Part 1", () => {
		it("on input 3, it should return 638", done => {
			const input = "3";
			const result = part1(input);
			const expected = 638;
			expect(result).to.equal(expected);
			done();
		});
		it("on the final input, it should return 2000", done => {
			const input = FINAL_INPUT;
			const result = part1(input);
			const expected = 2000;
			expect(result).to.equal(expected);
			done();
		});
	});
	describe("Part 2", () => {
		it("on the final input, it should return 10242889", done => {
			const input = FINAL_INPUT;
			const result = part2(input);
			const expected = 10242889;
			expect(result).to.equal(expected);
			done();
		});
	});
});
