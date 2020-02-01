function part1(input) {
    const stream = input.split("");
    const stack = [];
    let score = 0;
    for (let i = 0; i < stream.length; ++i) {
        const currentChar = stream[i];
        if (currentChar === "!") {
            ++i;
        } else if (currentChar === ">") {
            stack.pop();
        } else if (last(stack) === "<") {
            // do nothing
        } else if (currentChar === "{" || currentChar === "<") {
            stack.push(currentChar);
        } else if (currentChar === "}") {
            stack.pop();
            score += (stack.length + 1);
        } 
    }
    return score;
}
function part2(input) {
    const stream = input.split("");
    const stack = [];
    let score = 0;
    for (let i = 0; i < stream.length; ++i) {
        const currentChar = stream[i];
        if (currentChar === "!") {
            ++i;
        } else if (currentChar === ">") {
            stack.pop();
        } else if (last(stack) === "<") {
            ++score;
        } else if (currentChar === "{" || currentChar === "<") {
            stack.push(currentChar);
        } else if (currentChar === "}") {
            stack.pop();
        } 
    }
    return score;
}
function last(arr) {
    return arr[arr.length - 1];
}
module.exports = { part1, part2 };