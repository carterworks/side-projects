function part1(input) {
    const scanners = input.split(/\n/g).reduce((accl, scanner) => {
        const numbers = scanner.match(/\d+/g).map(Number);
        accl[numbers[0]] = new Scanner(numbers[1], numbers[0], true);
        return accl;
    }, []);
    let severity = 0;
    const moveScanner = scanner => {
        if (scanner) {
            if (scanner.goingDown) {
                scanner.currentStep += 1;
                if (scanner.currentStep === scanner.steps) {
                    scanner.currentStep = scanner.steps - 2;
                    scanner.goingDown = false;
                }
            } else {
                scanner.currentStep -= 1;
                if (scanner.currentStep < 0) {
                    scanner.currentStep = 1;
                    scanner.goingDown = true;
                }
            }
        }
    }
    for (let packetLocation = 0; packetLocation < scanners.length; ++packetLocation) {
        let scanner = scanners[packetLocation];
        if (scanner && scanner.currentStep === 0) {
            // caught!
            severity += (scanner.id * scanner.steps);
        }
        scanners.forEach(moveScanner);
    }
    return severity;
}

function part2(input) {
    let scanners = input.trim().split(/\n/g).reduce((accl, scanner) => {
        const [index, length] = scanner.match(/\d+/g).map(Number);
        accl[index] = length;
        return accl;
    }, []);
    let delay = 0;
    let searching = true;
    while (searching) {
        searching = false;
        for (let i = 0; i < scanners.length; ++i) {
            if (scanners[i]) {
                if (( i + delay ) % ((scanners[i] - 1) * 2) === 0) {
                    // caught!
                    searching = true;
                    ++delay;
                    break;
                }
            }
        }
    }
    return delay;
}
class Scanner {
    constructor(steps, id, goingDown) {
        this.steps = steps;
        this.id = id;
        this.currentStep = 0;
        this.goingDown = goingDown;
    }
}
module.exports = { part1, part2 }
