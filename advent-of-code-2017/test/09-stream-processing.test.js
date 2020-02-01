const expect = require("chai").expect;
const part1 = require("./../solutions/09-stream-processing/solution").part1;
const part2 = require("./../solutions/09-stream-processing/solution").part2;
const FINAL_INPUT = require("./../solutions/09-stream-processing/finalInput").finalInput;

describe("09-stream-processing", function() {
    describe("part 1", function() {
        it("on input '{{<ab>},{<ab>},{<ab>},{<ab>}}' should return 9", function(done) {
            const input = "{{<ab>},{<ab>},{<ab>},{<ab>}}";
            const expected = 9;
            expect(part1(input)).to.equal(expected);
            done();
        });
        it("on input '{{<ab>},{<ab>},{<ab>},{<ab>}}' should return 9", function(done) {
            const input = "{{<ab>},{<ab>},{<ab>},{<ab>}}";
            const expected = 9;
            expect(part1(input)).to.equal(expected);
            done();
        });
        it("on input '{{{},{},{{}}}}' should return 16", function(done) {
            const input = "{{{},{},{{}}}}";
            const expected = 16;
            expect(part1(input)).to.equal(expected);
            done();
        });
        it("on the final input, should return 11089", function(done) {
            const input = FINAL_INPUT;
            const expected = 11089;
            expect(part1(input)).to.equal(expected);
            done();
        });
    });
    describe("part 2", function() {
        it("on input '<>' should return 0", function(done) {
            const input = "<>";
            const expected = 0;
            expect(part2(input)).to.equal(expected);
            done();
        });
        it(`on input '<{o"i!a,<{i<a>' should return 10`, function(done) {
            const input = `<{o"i!a,<{i<a>`;
            const expected = 10;
            expect(part2(input)).to.equal(expected);
            done();
        });
        it("on the final input, should return 5288", function(done) {
            const input = FINAL_INPUT;
            const expected = 5288;
            expect(part2(input)).to.equal(expected);
            done();
        });
    });
});