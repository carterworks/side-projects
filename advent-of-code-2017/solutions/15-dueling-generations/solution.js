function part1(input) {
    const remainder = 2147483647;
    const aItrValue = 16807;
    const bItrValue = 48271;
    function* aGen() {
        let value = input.a;
        while(true) {
            value *= aItrValue;
            value %= remainder;
            if (value % 1 === 0) {
                yield value;
            }
        }
    }
    function* bGen() {
        let value = input.b;
        while(true) {
            value *= bItrValue;
            value %= remainder;
            if (value % 1 === 0) {
                yield value;
            }
        }
    }
    let a = aGen();
    let b = bGen();
    let aValue = input.a;
    let bValue = input.b;
    let matches = 0;
    for (let i = 0; i < 40000000; ++i) {
        aValue = a.next().value;
        bValue = b.next().value;
        matches += (aValue & 0xFFFF) === (bValue & 0xFFFF) ? 1 : 0;
    }
    return matches;
}

function part2(input) {
    input = {a: 591, b: 393};
	const remainder = 2147483647;
    const aItrValue = 16807;
    const bItrValue = 48271;
    function* aGen() {
        let value = input.a;
        while(true) {
            value *= aItrValue;
            value %= remainder;
            if (value % 4 === 0) {
                yield value;
            }
        }
    }
    function* bGen() {
        let value = input.b;
        while(true) {
            value *= bItrValue;
            value %= remainder;
            if (value % 8 === 0) {
                yield value;
            }
        }
    }
    let a = aGen();
    let b = bGen();
    let aValue = input.a;
    let bValue = input.b;
    let matches = 0;
    for (let i = 0; i < 5000000; ++i) {
        aValue = a.next().value;
        bValue = b.next().value;
        matches += (aValue & 0xFFFF) === (bValue & 0xFFFF) ? 1 : 0;
    }
    return matches;
}

module.exports = { part1, part2 }
