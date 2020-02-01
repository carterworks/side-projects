function part1(input) {
	let registers = {};
	let lastPlayed;
	const instructions = input
		.trim()
		.split("\n")
		.map(instruction => instruction.split(/\s+/g));
	for (let i = 0; i < instructions.length; ++i) {
		let instruction = instructions[i];
		switch (instruction[0]) {
			case "snd":
				lastPlayed = Number(registers[instruction[1]]);
				break;
			case "set":
				if (!isNaN(instruction[2])) {
					registers[instruction[1]] = Number(instruction[2]);
				} else {
					registers[instruction[1]] = registers[instruction[2]];
				}
				break;
			case "add":
				if (!registers[instruction[1]]) {
					registers[instruction[1]] = 0;
				}
				registers[instruction[1]] += Number(instruction[2]);
				break;
			case "mul":
				if (!registers[instruction[1]]) {
					registers[instruction[1]] = 0;
				}
				if (!isNaN(instruction[2])) {
					registers[instruction[1]] *= Number(instruction[2]);
				} else {
					registers[instruction[1]] *= Number(registers[instruction[2]]);
				}
				break;
			case "mod":
				if (!registers[instruction[1]]) {
					registers[instruction[1]] = 0;
				}
				if (!isNaN(instruction[2])) {
					registers[instruction[1]] %= Number(instruction[2]);
				} else {
					registers[instruction[1]] %= Number(registers[instruction[2]]);
				}
				break;
			case "rcv":
				if (registers[instruction[1]]) {
					return lastPlayed;
				}
				break;
			case "jgz":
				if (registers[instruction[1]]) {
					if (Number(instruction[2]) === 2) {
					}
					i += Number(instruction[2]) - 1;
				}
				break;
		}
	}
	return lastPlayed;
}

function part2(input) {
	var instr = input.split("\n").map(l => l.split(" ").map(r => r.trim()));

	var registersP0 = { p: 0 };
	var registersP1 = { p: 1 };

	var totalSendsP1 = 0;

	var rcvQueueP0 = [];
	var rcvQueueP1 = [];

	var pc0 = 0;
	var pc1 = 0;

	function step(pc, registers, rcvQueue, sendQueue) {
		function get(x) {
			var y = Number(x);

			return isNaN(y) ? registers[x] || 0 : y;
		}

		var pieces = instr[pc];

		var sentValue = false;
		var waiting = false;

		switch (pieces[0]) {
			case "set":
				registers[pieces[1]] = get(pieces[2]);
				break;
			case "add":
				registers[pieces[1]] += get(pieces[2]);
				break;
			case "mul":
				registers[pieces[1]] *= get(pieces[2]);
				break;
			case "mod":
				registers[pieces[1]] %= get(pieces[2]);
				break;
			case "snd":
				sendQueue.push(get(pieces[1]));
				sentValue = true;
				break;
			case "rcv":
				if (rcvQueue.length != 0) {
					registers[pieces[1]] = rcvQueue[0];
					rcvQueue.splice(0, 1);
				} else {
					pc--;
					waiting = true;
				}
				break;
			case "jgz":
				if (get(pieces[1]) > 0) {
					pc += get(pieces[2]) - 1;
				}
				break;
			default:
				console.log("Invalid instruction: " + pieces[0]);
				break;
		}

		return { pc: pc + 1, sentValue: sentValue, waiting: waiting };
	}

	while (true) {
		var state0 =
			pc0 < instr.length
				? step(pc0, registersP0, rcvQueueP0, rcvQueueP1)
				: { waiting: true };
		var state1 =
			pc1 < instr.length
				? step(pc1, registersP1, rcvQueueP1, rcvQueueP0)
				: { waiting: true };

		pc0 = state0.pc;
		pc1 = state1.pc;

		if (state1.sentValue) {
			totalSendsP1++;
		}

		if (state0.waiting && state1.waiting) {
			break;
		}
	}

	return totalSendsP1;
}

module.exports = { part1, part2 };
