function stringToTable(str) {
    return str.split("\n").map(row => row.split(/\s+/).map(num => parseInt(num)));
}
function findMinAndMax(array) {
    let result = {
        min: Number.MAX_SAFE_INTEGER,
        max: Number.MIN_SAFE_INTEGER
    };
    array.forEach(i => {
        if (i < result.min) {
            result.min = i;
        }
        if (i > result.max) {
            result.max = i;
        }
    });

    return result;
}
function findEvenDivisors(array) {
    let result = {
        a: null,
        b: null
    }
    for(let i = 0; i < array.length && result.a === null; ++i) {
        const currentA = array[i];
        for(let j = 0; j < array.length && result.b === null; ++j) {
            const currentB = array[j];
            if (i !== j) {
                if ((currentA % currentB) === 0) {
                    result.a = currentA;
                    result.b = currentB;
                }
            }
        }
    }
    return result;
}

function part1(tableStr) {
    const table = stringToTable(tableStr);
    return table.reduce((acc, row) => {
        const minMax = findMinAndMax(row);
        return acc + (minMax.max - minMax.min);
    }, 0);
}

function part2(tableStr) {
    const table = stringToTable(tableStr);
    return table.reduce((acc, row) => {
        const divisors = findEvenDivisors(row);
        return acc + (divisors.a / divisors.b);
    }, 0);
    return 0;
}

module.exports = {
    findMinAndMax: findMinAndMax,
    findEvenDivisors: findEvenDivisors,
    part1: part1,
    part2: part2
}