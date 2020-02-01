const expect = require("chai").expect;
const part1 = require("./../solutions/10-knot-hash/solution").part1;
const part2 = require("./../solutions/10-knot-hash/solution").part2;
const FINAL_INPUT = require("./../solutions/10-knot-hash/finalInput").finalInput;
const FINAL_SEQUENCE = [...Array(256).keys()];

describe("10-knot-hash", () => {
	describe("Part 1", () => {
		it("on input lengths with seqeunce \'0 1 2 3 4\', it should return 12", done => {
			const lengths = "3,4,1,5";
			const sequence = "0 1 2 3 4";
			const result = part1(sequence, lengths);
			const expected = 12;
			expect(result).to.equal(expected);
			done();
		});
		it("on the final input, it should return 38628", done => {
			const lengths = FINAL_INPUT;
			const seqeunce = FINAL_SEQUENCE.join(" ");
			const result = part1(seqeunce, lengths);
			const expected = 38628;
			expect(result).to.equal(expected);
			done();
		});
	});
	describe("Part 2", () => {
		it("on the final input, it should return 'e1462100a34221a7f0906da15c1c979a'", done => {
			const lengths = FINAL_INPUT;
			const seqeunce = FINAL_SEQUENCE.join(" ");
			const result = part2(seqeunce, lengths);
			const expected = 'e1462100a34221a7f0906da15c1c979a';
			expect(result).to.equal(expected);
			done();
		});
	});
});
