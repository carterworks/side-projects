function part1(input) {
    return input.match(/[A-Za-z]+/g).reduce((result, el, index, array) => array.indexOf(el) === array.lastIndexOf(el) ? el : result);
}
function part2(input) {
    const programs = parseInput(input);
    const root = programs.map[part1(input)];
    const weights = root.children.map(child => child.totalWeight);
    const outlierWeight = weights.reduce((result, current, index, array) => {
        if (array.indexOf(current) === array.lastIndexOf(current)) {
            // if unique
            return current;
        } else {
            return result;
        }
    }, 0);
    const outlierNode = findOutlierNode(root);
    const difference = weights.reduce((accl, current) => {
        if (current !== outlierWeight) {
            return current - outlierWeight;
        } else {
            return accl;
        }
    });
    return outlierNode.weight + difference;
}
function findOutlierNode(root) {
    const outlierIndex = root.children.map(el => el.totalWeight).reduce((result, current, index, array) => {
        if (array.indexOf(current) === array.lastIndexOf(current)) {
            // if unique
            return index;
        } else {
            return result;
        }
    }, null);
    if (outlierIndex === null) {
        return root;
    } else {
        return findOutlierNode(root.children[outlierIndex]);
    }
}
function parseInput(input){ 
    const programStrings = input.split(/\n/);
    let array = programStrings.map(row => {
        const programs = row.match(/[A-Za-z]+/g);
        const name = programs[0];
        programs.shift();
        const weight = parseInt(row.match(/\d+/)[0]);
        let children = [];
        if (programs.length > 0) {
            children = programs;
        }
        return new Program(name, weight, children);
    });
    const map = array.reduce((accumulator, el) => {
        accumulator[el.name] = el;
        return accumulator;
    }, {});

    array = array.map(program => {
        program.children = program.children.map(child => map[child]);
        return program;
    });
    return { array, map };
}
function sumWeight(inputNode) {
    if (inputNode) {
        let weight = inputNode.weight;
        weight += inputNode.children.reduce((accl, child) => {
            accl += sumWeight(child);
            return accl;
        }, 0);
        return weight;
    } else {
        return 0;
    }
}

class Program {
    constructor(name, weight, children) {
        this.name = name;
        this.weight = weight;
        this.children = children;
    }
    get totalWeight() {
        return sumWeight(this);
    }
}
module.exports = {
    part1: part1,
    part2: part2
}