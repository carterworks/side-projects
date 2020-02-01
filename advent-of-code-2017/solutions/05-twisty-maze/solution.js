function part1(input) {
    input = input.split(/\s+/).map(number => parseInt(number));
    let i = 0;
    let steps = 0;
    while (0 <= i && i < input.length) {
        let jumpTo = input[i] + i;
        input[i] += 1;
        i = jumpTo;
        ++steps;
    }
    return steps;
}
function part2(input) {
    input = input.split(/\s+/).map(number => parseInt(number));
    let i = 0;
    let steps = 0;
    while (0 <= i && i < input.length) {
        let jumpTo = input[i] + i;
        if (jumpTo - i >= 3) {
            input[i] -= 1;
        } else {
            input[i] += 1;
        }
        i = jumpTo;
        ++steps;
    }
    return steps;
}

module.exports = {
    part1: part1,
    part2: part2
}