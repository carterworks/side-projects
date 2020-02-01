const expect = require("chai").expect;
const part1 = require("./../solutions/18-duet/solution").part1;
const part2 = require("./../solutions/18-duet/solution").part2;
const FINAL_INPUT = require("./../solutions/18-duet/finalInput").finalInput;

describe("18-duet", () => {
	describe("Part 1", () => {
		it("on input, it should return 4", done => {
			const input = `set a 1
add a 2
mul a a
mod a 5
snd a
set a 0
rcv a
jgz a -1
set a 1
jgz a -2`;
			const result = part1(input);
			const expected = 4;
			expect(result).to.equal(expected);
			done();
		});
		it("on the final input, it should return 3188", done => {
			const input = FINAL_INPUT;
			const result = part1(input);
			const expected = 3188;
			expect(result).to.equal(expected);
			done();
		});
	});
	describe("Part 2", () => {
		it("on input, it should return 3", done => {
			const input = `snd 1
snd 2
snd p
rcv a
rcv b
rcv c
rcv d`;
			const result = part2(input);
			const expected = 3;
			expect(result).to.equal(expected);
			done();
		});
		it("on the final input, it should return 7112", done => {
			const input = FINAL_INPUT;
			const result = part2(input);
			const expected = 7112;
			expect(result).to.equal(expected);
			done();
		});
	});
});
