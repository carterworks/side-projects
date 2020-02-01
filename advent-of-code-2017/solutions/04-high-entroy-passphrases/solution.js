function part1(input) {
    // const phrases = input.split(/\n/);
    let results = [];
    input.forEach(phrase => {
        results.push(testValidPassphrase(phrase));
    });
    return results.reduce((accl, val) => {
        accl += val ? 1 : 0;
        return accl;
    }, 0);

}
function part2(input) {
    let results = [];
    input.forEach(phrase => {
        results.push(testValidPassphrasesWithAnagrams(phrase));
    });
    return results.reduce((accl, val) => {
        accl += val ? 1 : 0;
        return accl;
    }, 0);
}
function testValidPassphrase(input) {
    const words = input.split(/\s+/);
    const occurances = {};
    words.forEach(word => {
        if (!occurances[word]) {
            occurances[word] = 1
        } else {
            occurances[word] += 1;
        }
    });
    let result = true;
    for (let word in occurances) {
        if (occurances.hasOwnProperty(word)) {
            result = result && (occurances[word] === 1);
        }
    }
    return result;
}
function testValidPassphrasesWithAnagrams(input) {
    input = input.split(" ").map(word => word.split("").sort().join("")).join(" ");
    return testValidPassphrase(input);
}
module.exports = {
    part1: part1,
    part2: part2,
    testValidPassphrase: testValidPassphrase,
    testValidPassphrasesWithAnagrams: testValidPassphrasesWithAnagrams
}