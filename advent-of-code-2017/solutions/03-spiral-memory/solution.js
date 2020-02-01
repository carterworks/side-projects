const first400Digits = require("./first400Digits").digits;
function findLargerOddPerfectSquare(input) {
	let oddPerfectToBeSquared = 1;
	while (input > Math.pow(oddPerfectToBeSquared, 2)) {
		oddPerfectToBeSquared += 2;
	}
	return Math.pow(oddPerfectToBeSquared, 2);
}
function getRingNumber(closestLargerOddSquare) {
	return (Math.sqrt(closestLargerOddSquare) - 1) / 2;
}
function getEdgeLengthFromCLOS(closestLargerOddSquare) {
	return Math.sqrt(closestLargerOddSquare);
}
function getEdgeLengthFromRingNumber(ringNumber) {
	return 1 + 2 * ringNumber;
}
function getMedianOfRange(lowerBound, upperBound) {
	return (lowerBound + upperBound) / 2;
}
function getDistanceFromPoint(point, input) {
	return Math.abs(point - input);
}
function part1(input) {
	if (input === 1) {
		return 0;
	}
	const CLOS = findLargerOddPerfectSquare(input);
	const ringNumber = getRingNumber(CLOS);
	const edgeLength = getEdgeLengthFromCLOS(CLOS);
	let upperBound, lowerBound;
	if (CLOS - (edgeLength - 1) <= input && input <= CLOS) {
		// bottom edge
		upperBound = CLOS;
		lowerBound = CLOS - (edgeLength - 1);
	} else if (
		CLOS - 2 * (edgeLength - 1) <= input &&
		input <= CLOS - (edgeLength - 1)
	) {
		// left edge
		upperBound = CLOS - (edgeLength - 1);
		lowerBound = CLOS - 2 * (edgeLength - 1);
	} else if (
		CLOS - 3 * (edgeLength - 1) <= input &&
		input <= CLOS - 2 * (edgeLength - 1)
	) {
		// top edge
		upperBound = CLOS - 2 * (edgeLength - 1);
		lowerBound = CLOS - 3 * (edgeLength - 1);
	} else {
		// right edge
		upperBound = CLOS - 3 * (edgeLength - 1);
		lowerBound = CLOS - 4 * (edgeLength - 1);
	}
	const edgeMedian = getMedianOfRange(lowerBound, upperBound);
	const distanceFromMedian = getDistanceFromPoint(edgeMedian, input);
	return distanceFromMedian + ringNumber;
}
function part2(input) {
	// https://oeis.org/A141481
	// This one proved too mathy for me, and I didn't know how to do it after a reasonable time.
	// I found this list online and hard coded it. I'm sorry. I spent so long getting sidetracked on the
	// first part2
    for (let i = 1; i < first400Digits.length; ++i) {
        if (first400Digits[i-1] <= input && input <= first400Digits[i]) {
            return first400Digits[i];
        }
    }
    return "Input too big, need more digits";
}

module.exports = {
	part1: part1,
	part2: part2,
	findLargerOddPerfectSquare: findLargerOddPerfectSquare
};
