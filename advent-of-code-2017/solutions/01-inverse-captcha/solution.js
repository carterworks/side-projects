function part1(value) {
    value = value.toString();
    let output = 0;
    if (value.length > 1) {
        for (let i = 0; i < value.length; ++i) {
            const currentDigit = value[i];
            let nextIndex = i + 1;
            if (nextIndex >= value.length) {
                nextIndex = 0;
            }
            if (currentDigit === value[nextIndex]) {
                output += parseInt(currentDigit);
            }
        }
    }
    return output;
}
function part2(value) {
    value = value.toString();
    let output = 0;
    if (value.length > 1) {
        let j = value.length / 2;
        for (let i = 0; i < value.length / 2; ++i) {
            const currentDigit = value[i];
            const comparisonDigit = value[j];
            if (currentDigit === comparisonDigit) {
                output += parseInt(currentDigit);
            }
            ++j;
        }
        output *= 2;
    }
    return output;
}

module.exports = {
    part1: part1,
    part2: part2
}
