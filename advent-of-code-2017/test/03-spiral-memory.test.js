const expect = require("chai").expect;
const part1 = require("./../solutions/03-spiral-memory/solution").part1;
const part2 = require("./../solutions/03-spiral-memory/solution").part2;
const findLargerOddPerfectSquare = require("./../solutions/03-spiral-memory/solution").findLargerOddPerfectSquare;
const FINAL_INPUT = 265149;

describe("03 spiral memory", function() {
    describe("find the odd perfect square that is just larger than the input", function() {
        it("on input 11, should be 9", function(done) {
            const input = 11;
            const expected = 25;
            expect(findLargerOddPerfectSquare(input)).to.equal(expected);
            done();
        });
        it("on input 265149, it should return 263169", function(done) {
            const input = FINAL_INPUT;
            const expected = 265225;
            expect(findLargerOddPerfectSquare(input)).to.equal(expected);
            done();
        });
    });
    describe("part 1", function() {
        it("on input 1, should be 0", function(done) {
            const input = 1;
            const expected = 0;
            expect(part1(input)).to.equal(expected);
            done();
        });
        it("on input 12 should be 3", function(done) {
            const input = 12;
            const expected = 3;
            expect(part1(input)).to.equal(expected);
            done();
        });
        it("on input 23 should be 2", function(done) {
            const input = 23;
            const expected = 2;
            expect(part1(input)).to.equal(expected);
            done();
        });
        it("on input 1024 should be 31", function(done) {
            const input = 1024;
            const expected = 31;
            expect(part1(input)).to.equal(expected);
            done();
        });
        it(`on input ${FINAL_INPUT} should be 438`, function(done) {
            const input = FINAL_INPUT;
            const expected = 438;
            expect(part1(input)).to.equal(expected);
            done();
        });
    });
    describe("part 2", function() {
        it("on input 9, should be 10", function(done) {
            const input = 9;
            const expected = 10;
            expect(part2(input)).to.equal(expected);
            done();
        });
        it("on input 800, should be 806", function(done) {
            const input = 800;
            const expected = 806;
            expect(part2(input)).to.equal(expected);
            done();
        }); 
        it(`on input ${FINAL_INPUT}, should be 266330`, function(done) {
            const input = FINAL_INPUT;
            const expected = 266330;
            expect(part2(input)).to.equal(expected);
            done();
        }); 
    });
});