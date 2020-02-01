const expect = require("chai").expect;
const part1 = require("./../solutions/06-memory-reallocation/solution")
  .part1;
const part2 = require("./../solutions/06-memory-reallocation/solution")
  .part2;
const findMaxIndex = require("./../solutions/06-memory-reallocation/solution")
  .findMaxIndex;
const FINAL_INPUT = "0	5	10	0	11	14	13	4	11	8	8	7	1	4	12	11";

describe("06 Memory Reallocation", function() {
    describe("part 1", function() {
        it("input '0 2 7 0' should reallocate 5 times", function(done) {
            const input = "0 2 7 0";
            const expected = 5;
            expect(part1(input)).to.equal(expected);
            done();
        });
        it("on the final input, should reallocate 7864 times", function(done) {
            const input = FINAL_INPUT;
            const expected = 7864;
            expect(part1(input)).to.equal(expected);
            done();
        });
    });
    describe("part 2", function() {
        it("input '0 2 7 0' should cycle 4 times", function(done) {
            const input = "0 2 7 0";
            const expected = 4;
            expect(part2(input)).to.equal(expected);
            done()
        });
        it("on the final input, should cycle 1695 times", function(done) {
            const input = FINAL_INPUT;
            const expected = 1695;
            expect(part2(input)).to.equal(expected);
            done();
        });
    });
    describe("find the index of the maximum", function() {
        it("on input [0, 2, 4] and starting at 1, should return 2", function(done) {
            const input = [0, 2, 4];
            const start = 1;
            const expected = 2;
            expect(findMaxIndex(input, start)).to.equal(expected);
            done();
        });
        it("on input [1, 3, 3] and starting at 2, should return 1", function(done) {
            const input = [1, 3, 3];
            const start = 2;
            const expected = 1;
            expect(findMaxIndex(input, start)).to.equal(expected);
            done();
        });
    });
});