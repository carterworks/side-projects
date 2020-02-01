function part1(input) {
    let connectedToZero = new Set();
    const nodes = input.split("\n").map(pipe => {
        const programs = pipe.match(/\d+/g).map(Number);
        const id = programs[0];
        programs.shift();
        return {id: id, children: programs, visited: false};
    });
    const addChildrenToSet = nodeIndex => {
        let oldSize = connectedToZero.size;
        connectedToZero.add(nodeIndex);
        let newSize = connectedToZero.size;
        if (oldSize < newSize) {
            nodes[nodeIndex].children.forEach(addChildrenToSet);
        }
    };
    nodes[0].children.forEach(addChildrenToSet);
    return connectedToZero.size;
}

function part2(input) {
    let visited = new Set();
    let groups = 0;
    const nodes = input.split("\n").map(pipe => {
        const programs = pipe.match(/\d+/g).map(Number);
        const id = programs[0];
        programs.shift();
        return {id: id, children: programs};
    });
    const mark = nodeIndex => {
        let oldSize = visited.size;
        visited.add(nodeIndex);
        let newSize = visited.size;
        if (oldSize < newSize) {
            nodes[nodeIndex].visited = true;
            nodes[nodeIndex].children.forEach(mark);
        }
    };
    nodes.forEach(node => {
        if (!node.visited) {
            ++groups;
            node.children.forEach(mark);
        }
    });
    return groups;
}
class Node {
    constructor(id, children) {
        this.id = id;
        this.children = children;
    }
}
module.exports = { part1, part2 }
