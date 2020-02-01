function part1(input, dancers) {
	const moves = input.split(",");
	dancers = dancers.split("");
	moves.forEach(move => {
		let programsToSwitch, indexOfA, indexOfB;
		switch (move[0]) {
			case "s":
				let numberToMove = move.match(/\d+/).map(Number)[0];
				dancers = rotate(dancers, numberToMove);
				break;
			case "x":
				programsToSwitch = move.match(/\d+/g).map(Number);
				indexOfA = programsToSwitch[0];
				indexOfB = programsToSwitch[1];
				swapIndexes(dancers, indexOfA, indexOfB);
				break;
			case "p":
			default:
				programsToSwitch = move.substr(1).match(/[A-Za-z]/g);
				indexOfA = dancers.indexOf(programsToSwitch[0]);
				indexOfB = dancers.indexOf(programsToSwitch[1]);
				swapIndexes(dancers, indexOfA, indexOfB);
				break;
		}
	});
	return dancers.join("");
}
function rotate(array, count) {
	count *= -1;
	count -= array.length * Math.floor(count / array.length);
	array.push.apply(array, array.splice(0, count));
	return array;
}
function swapIndexes(array, a, b) {
	let c = array[a];
	array[a] = array[b];
	array[b] = c;
}
function part2(input, dancers) {
	let results = new Set();
	let sizeBefore;
	for (let i = 0; i < 1000000000; ++i) {
		sizeBefore = results.size;
		dancers = part1(input, dancers);
		results.add(dancers);
		if (sizeBefore === results.size) {
			break;
		}
	}

	return [...results][1000000000 % results.size - 1];
}

module.exports = { part1, part2 };
