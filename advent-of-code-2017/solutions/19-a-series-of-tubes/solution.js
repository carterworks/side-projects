const DIRECTION = {
	DOWN: 0,
	UP: 1,
	LEFT: 2,
	RIGHT: 3,
};
function part1(input) {
	const grid = input.split("\n").map(row => row.split(""));
	const state = {
		column: null,
		continue: true,
		direction: DIRECTION.DOWN,
		symbol: "|",
		row: 0,
		visitedLetters: [],
		steps: 0,
	};
	state.column = grid[state.row].indexOf("|");
	while (state.continue) {
		switch (state.direction) {
			case DIRECTION.DOWN:
				state.row++;
				if (state.row >= grid.length) {
					state.continue = false;
					break;
				}
				state.symbol = grid[state.row][state.column];
				if (/[A-Z]/.test(state.symbol)) {
					state.visitedLetters.push(state.symbol);
				} else if (state.symbol === "+") {
					// test for a new direction
					if (
						grid[state.row][state.column + 1] === "-" ||
						grid[state.row][state.column + 1] === "|" ||
						/[A-Z]/.test(grid[state.row][state.column + 1])
					) {
						state.direction = DIRECTION.RIGHT;
					} else if (
						grid[state.row][state.column - 1] === "-" ||
						grid[state.row][state.column - 1] === "|" ||
						/[A-Z]/.test(grid[state.row][state.column - 1])
					) {
						state.direction = DIRECTION.LEFT;
					} else {
						throw Error(
							`Took ${state.steps} steps and got invalid input at location (${
								state.row
							},${state.column}). Where do I go?`
						);
					}
				} else if (state.symbol === "|" || state.symbol === "-") {
					// do nothing
				} else {
					state.continue = false;
					break;
				}
				state.steps++;
				break;
			case DIRECTION.LEFT:
				state.column--;
				if (state.column < 0) {
					state.continue = false;
					break;
				}
				state.symbol = grid[state.row][state.column];
				if (/[A-Z]/.test(state.symbol)) {
					state.visitedLetters.push(state.symbol);
				} else if (state.symbol === "+") {
					// test for a new direction
					if (
						(state.row - 1 !== 0 &&
							(grid[state.row - 1][state.column] === "|" ||
								grid[state.row - 1][state.column] === "-")) ||
						/[A-Z]/.test(grid[state.row - 1][state.column])
					) {
						state.direction = DIRECTION.UP;
					} else if (
						(state.row + 1 < grid.length &&
							(grid[state.row + 1][state.column] === "|" ||
								grid[state.row + 1][state.column] === "-")) ||
						/[A-Z]/.test(grid[state.row + 1][state.column])
					) {
						state.direction = DIRECTION.DOWN;
					} else {
						throw Error(
							`Took ${state.steps} steps and got invalid input at location (${
								state.row
							},${state.column}). Where do I go?`
						);
					}
				} else if (state.symbol === "|" || state.symbol === "-") {
					// do nothing
				} else {
					state.continue = false;
					break;
				}
				state.steps++;
				break;
			case DIRECTION.UP:
				state.row--;
				if (state.row < 0) {
					state.continue = false;
					break;
				}
				state.symbol = grid[state.row][state.column];
				if (/[A-Z]/.test(state.symbol)) {
					state.visitedLetters.push(state.symbol);
				} else if (state.symbol === "+") {
					// test for a new direction
					if (
						grid[state.row][state.column + 1] === "-" ||
						grid[state.row][state.column + 1] === "|" ||
						/[A-Z]/.test(grid[state.row][state.column + 1])
					) {
						state.direction = DIRECTION.RIGHT;
					} else if (
						grid[state.row][state.column - 1] === "-" ||
						grid[state.row][state.column - 1] === "|" ||
						/[A-Z]/.test(grid[state.row][state.column - 1])
					) {
						state.direction = DIRECTION.LEFT;
					} else {
						throw Error(
							`Took ${state.steps} steps and got invalid input at location (${
								state.row
							},${state.column}). Where do I go?`
						);
					}
				} else if (state.symbol === "|" || state.symbol === "-") {
					// do nothing
				} else {
					state.continue = false;
					break;
				}
				state.steps++;
				break;
			case DIRECTION.RIGHT:
				state.column++;
				if (state.column >= grid[state.row].length) {
					state.continue = false;
					break;
				}
				state.symbol = grid[state.row][state.column];
				if (/[A-Z]/.test(state.symbol)) {
					state.visitedLetters.push(state.symbol);
				} else if (state.symbol === "+") {
					// test for a new direction
					if (
						(state.row - 1 !== 0 &&
							(grid[state.row - 1][state.column] === "|" ||
								grid[state.row - 1][state.column] === "-")) ||
						/[A-Z]/.test(grid[state.row - 1][state.column])
					) {
						state.direction = DIRECTION.UP;
					} else if (
						(state.row + 1 < grid.length &&
							(grid[state.row + 1][state.column] === "|" ||
								grid[state.row + 1][state.column] === "-")) ||
						/[A-Z]/.test(grid[state.row + 1][state.column])
					) {
						state.direction = DIRECTION.DOWN;
					} else {
						throw Error(
							`Took ${state.steps} steps and got invalid input at location (${
								state.row
							},${state.column}). Where do I go?`
						);
					}
				} else if (state.symbol === "|" || state.symbol === "-") {
					// do nothing
				} else {
					state.continue = false;
					break;
				}
				state.steps++;
				break;
			default:
				throw Error(`What the heck is ${state.direction} and why am I here?`);
				break;
		}
	}
	while (state.contiune);
	return state.visitedLetters.join("");
}

function part2(input) {
	const grid = input.split("\n").map(row => row.split(""));
	const state = {
		column: null,
		continue: true,
		direction: DIRECTION.DOWN,
		symbol: "|",
		row: 0,
		visitedLetters: [],
		steps: 0,
	};
	state.column = grid[state.row].indexOf("|");
	while (state.continue) {
		switch (state.direction) {
			case DIRECTION.DOWN:
				state.row++;
				if (state.row >= grid.length) {
					state.continue = false;
					break;
				}
				state.symbol = grid[state.row][state.column];
				if (/[A-Z]/.test(state.symbol)) {
					state.visitedLetters.push(state.symbol);
				} else if (state.symbol === "+") {
					// test for a new direction
					if (
						grid[state.row][state.column + 1] === "-" ||
						grid[state.row][state.column + 1] === "|" ||
						/[A-Z]/.test(grid[state.row][state.column + 1])
					) {
						state.direction = DIRECTION.RIGHT;
					} else if (
						grid[state.row][state.column - 1] === "-" ||
						grid[state.row][state.column - 1] === "|" ||
						/[A-Z]/.test(grid[state.row][state.column - 1])
					) {
						state.direction = DIRECTION.LEFT;
					} else {
						throw Error(
							`Took ${state.steps} steps and got invalid input at location (${
								state.row
							},${state.column}). Where do I go?`
						);
					}
				} else if (state.symbol === "|" || state.symbol === "-") {
					// do nothing
				} else {
					state.continue = false;
					break;
				}
				state.steps++;
				break;
			case DIRECTION.LEFT:
				state.column--;
				if (state.column < 0) {
					state.continue = false;
					break;
				}
				state.symbol = grid[state.row][state.column];
				if (/[A-Z]/.test(state.symbol)) {
					state.visitedLetters.push(state.symbol);
				} else if (state.symbol === "+") {
					// test for a new direction
					if (
						(state.row - 1 !== 0 &&
							(grid[state.row - 1][state.column] === "|" ||
								grid[state.row - 1][state.column] === "-")) ||
						/[A-Z]/.test(grid[state.row - 1][state.column])
					) {
						state.direction = DIRECTION.UP;
					} else if (
						(state.row + 1 < grid.length &&
							(grid[state.row + 1][state.column] === "|" ||
								grid[state.row + 1][state.column] === "-")) ||
						/[A-Z]/.test(grid[state.row + 1][state.column])
					) {
						state.direction = DIRECTION.DOWN;
					} else {
						throw Error(
							`Took ${state.steps} steps and got invalid input at location (${
								state.row
							},${state.column}). Where do I go?`
						);
					}
				} else if (state.symbol === "|" || state.symbol === "-") {
					// do nothing
				} else {
					state.continue = false;
					break;
				}
				state.steps++;
				break;
			case DIRECTION.UP:
				state.row--;
				if (state.row < 0) {
					state.continue = false;
					break;
				}
				state.symbol = grid[state.row][state.column];
				if (/[A-Z]/.test(state.symbol)) {
					state.visitedLetters.push(state.symbol);
				} else if (state.symbol === "+") {
					// test for a new direction
					if (
						grid[state.row][state.column + 1] === "-" ||
						grid[state.row][state.column + 1] === "|" ||
						/[A-Z]/.test(grid[state.row][state.column + 1])
					) {
						state.direction = DIRECTION.RIGHT;
					} else if (
						grid[state.row][state.column - 1] === "-" ||
						grid[state.row][state.column - 1] === "|" ||
						/[A-Z]/.test(grid[state.row][state.column - 1])
					) {
						state.direction = DIRECTION.LEFT;
					} else {
						throw Error(
							`Took ${state.steps} steps and got invalid input at location (${
								state.row
							},${state.column}). Where do I go?`
						);
					}
				} else if (state.symbol === "|" || state.symbol === "-") {
					// do nothing
				} else {
					state.continue = false;
					break;
				}
				state.steps++;
				break;
			case DIRECTION.RIGHT:
				state.column++;
				if (state.column >= grid[state.row].length) {
					state.continue = false;
					break;
				}
				state.symbol = grid[state.row][state.column];
				if (/[A-Z]/.test(state.symbol)) {
					state.visitedLetters.push(state.symbol);
				} else if (state.symbol === "+") {
					// test for a new direction
					if (
						(state.row - 1 !== 0 &&
							(grid[state.row - 1][state.column] === "|" ||
								grid[state.row - 1][state.column] === "-")) ||
						/[A-Z]/.test(grid[state.row - 1][state.column])
					) {
						state.direction = DIRECTION.UP;
					} else if (
						(state.row + 1 < grid.length &&
							(grid[state.row + 1][state.column] === "|" ||
								grid[state.row + 1][state.column] === "-")) ||
						/[A-Z]/.test(grid[state.row + 1][state.column])
					) {
						state.direction = DIRECTION.DOWN;
					} else {
						throw Error(
							`Took ${state.steps} steps and got invalid input at location (${
								state.row
							},${state.column}). Where do I go?`
						);
					}
				} else if (state.symbol === "|" || state.symbol === "-") {
					// do nothing
				} else {
					state.continue = false;
					break;
				}
				state.steps++;
				break;
			default:
				throw Error(`What the heck is ${state.direction} and why am I here?`);
				break;
		}
	}
	while (state.contiune);
	return ++state.steps;
}

module.exports = { part1, part2 };
