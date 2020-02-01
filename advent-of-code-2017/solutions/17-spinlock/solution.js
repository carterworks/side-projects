const RUN_TIMES = 2017;
function part1(input) {
	const MOVE = Number(input);
	let result = [0];
	let currentPosition = 0;
	for (let i = 1; i <= RUN_TIMES; ++i) {
		currentPosition += MOVE;
		if (currentPosition >= result.length) {
			currentPosition %= result.length;
		}
		result.splice(++currentPosition, 0, i);
	}
	return result[currentPosition + 1];
}

function part2(input) {
	const MOVE = Number(input);
	let currentPosition = 0;
	let afterZeroValue = null;
	for (let i = 1; i <= 50000000; ++i) {
		currentPosition += MOVE;
		currentPosition %= i;
		if (currentPosition === 0) {
			afterZeroValue = i;
		}
		++currentPosition;
	}
	return afterZeroValue;
}

module.exports = { part1, part2 };
