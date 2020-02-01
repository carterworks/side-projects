const expect = require("chai").expect;
const part1 = require("./../solutions/11-hex-ed/solution").part1;
const part2 = require("./../solutions/11-hex-ed/solution").part2;
const FINAL_INPUT = require("./../solutions/11-hex-ed/finalInput").finalInput;

describe("11-hex-ed", () => {
	describe("Part 1", () => {
		it("on input \'ne,ne\', it should return 2", done => {
			const input = "ne,ne";
			const expected = 2;
			const result = part1(input);
			expect(result).to.equal(expected);
			done();
		});
		it("on input \'ne,ne,sw,sw\', it should return 0", done => {
			const input = "ne,ne,sw,sw";
			const expected = 0;
			const result = part1(input);
			expect(result).to.equal(expected);
			done();
		});
		it("on input \'ne,ne,s,s\', it should return 2", done => {
			const input = "ne,ne,s,s";
			const expected = 2;
			const result = part1(input);
			expect(result).to.equal(expected);
			done();
		});
		it("on the final input, it should return 761", done => {
			const input = FINAL_INPUT;
			const expected = 761;
			const result = part1(input);
			expect(result).to.equal(expected);
			done();
		});
	});
	describe("Part 2", () => {
		it("on the final input, it should return 1542", done => {
			const input = FINAL_INPUT;
			const expected = 1542;
			const result = part2(input);
			expect(result).to.equal(expected);
			done();
		});
	});
});
