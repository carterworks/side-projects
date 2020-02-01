function part1(input) {
    input = input.split(",");
    let x = 0;
    let y = 0;
    let z = 0;
    input.forEach(step => {
        switch(step) {
            case "n":
                y++;
                z--;
            break;
            case "s":
                y--;
                z++;
            break;
            case "ne":
                x++;
                z--;
            break;
            case "sw":
                x--;
                z++;
            break;
            case "nw":
                x--;
                y++;
            break;
            case "se":
                x++;
                y--;
            break;
            default:
            break;
        }
    });

    return (Math.abs(x) + Math.abs(y) + Math.abs(z)) / 2;
}

function part2(input) {
    input = input.split(",");
    let x = 0;
    let y = 0;
    let z = 0;
    const distances = [];
    input.forEach(step => {
        switch(step) {
            case "n":
                y++;
                z--;
            break;
            case "s":
                y--;
                z++;
            break;
            case "ne":
                x++;
                z--;
            break;
            case "sw":
                x--;
                z++;
            break;
            case "nw":
                x--;
                y++;
            break;
            case "se":
                x++;
                y--;
            break;
            default:
            break;
        }
        distances.push((Math.abs(x) + Math.abs(y) + Math.abs(z)) / 2);
    });

    return distances.reduce((a, b) => Math.max(a,b), Number.MIN_SAFE_INTEGER);
}
module.exports = { part1, part2 }
