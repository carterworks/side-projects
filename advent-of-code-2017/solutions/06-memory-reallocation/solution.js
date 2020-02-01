function part1(input, split = true) {
    if (split) {
        input = input.split(/\s+/).map(num => parseInt(num));
    }
    let i = 0;
    const seen = {};
    let goOn = true;
    let redistributions = 0;
    seen[arrToString(input)] = true;
    while (goOn) {
        let indexOfMax = findMaxIndex(input, 0);
        let max = input[indexOfMax];
        input[indexOfMax] = 0;
        let next = indexOfMax + 1;
        while (max > 0) {
            if (next >= input.length) {
                next = 0;
            }
            input[next] += 1;
            ++next;
            --max;
        }
        ++redistributions;
        goOn = seen[arrToString(input)] === undefined;
        if (goOn) {
            seen[arrToString(input)] = true;
        } else {
            break;
        }
    }
    return redistributions;
}
function part2(input) {
    input = input.split(/\s+/).map(num => parseInt(num));
    part1(input, false);
    let i = 0;
    const seen = {};
    let goOn = true;
    let redistributions = 0;
    seen[arrToString(input)] = true;
    while (goOn) {
        let indexOfMax = findMaxIndex(input, 0);
        let max = input[indexOfMax];
        input[indexOfMax] = 0;
        let next = indexOfMax + 1;
        while (max > 0) {
            if (next >= input.length) {
                next = 0;
            }
            input[next] += 1;
            ++next;
            --max;
        }
        ++redistributions;
        goOn = seen[arrToString(input)] === undefined;
        if (goOn) {
            seen[arrToString(input)] = true;
        } else {
            break;
        }
    }
    return redistributions;
}
function arrToString(input) {
    return input.toString();
}
function findMaxIndex(arr, startIndex) {
    let i = startIndex + 1;
    let maxIndex = startIndex;
    while (i !== startIndex) {
        if (arr[maxIndex] < arr[i]) {
            maxIndex = i;
        }
        if (arr[maxIndex] === arr[i]) {
            maxIndex = maxIndex > i ? i : maxIndex;
        }
        ++i;
        if (i >= arr.length) {
            i = 0;
        }
    }
    return maxIndex;
}
module.exports = {
    part1: part1,
    part2: part2,
    findMaxIndex: findMaxIndex
}