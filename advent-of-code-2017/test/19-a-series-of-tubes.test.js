const expect = require("chai").expect;
const part1 = require("./../solutions/19-a-series-of-tubes/solution").part1;
const part2 = require("./../solutions/19-a-series-of-tubes/solution").part2;
const FINAL_INPUT = require("./../solutions/19-a-series-of-tubes/finalInput")
	.finalInput;

describe("19-a-series-of-tubes", () => {
	describe("Part 1", () => {
		it("on input, it should return 'ABCDEF'", done => {
			const input = `    |          
    |  +--+    
    A  |  C    
F---|----E|--+ 
    |  |  |  D 
    +B-+  +--+`;
			const result = part1(input);
			const expected = "ABCDEF";
			expect(result).to.equal(expected);
			done();
		});
		it("on the final input, it should return UICRNSDOK", done => {
			const input = FINAL_INPUT;
			const result = part1(input);
			const expected = "UICRNSDOK";
			expect(result).to.equal(expected);
			done();
		});
	});
	describe("Part 2", () => {
		it("on input, it should return 38", done => {
			const input = `    |          
    |  +--+    
    A  |  C    
F---|----E|--+ 
    |  |  |  D 
    +B-+  +--+`;
			const result = part2(input);
			const expected = 38;
			expect(result).to.equal(expected);
			done();
		});
		it("on the final input, it should return 16064", done => {
			const input = FINAL_INPUT;
			const result = part2(input);
			const expected = 16064;
			expect(result).to.equal(expected);
			done();
		});
	});
});
