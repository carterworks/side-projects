const compareRegex = /(<=)|(>=)|(!=)|(==)|(>)|(<)/;
const registersRegex = /([A-Za-z]+ )(?=(dec|inc|((<=)|(>=)|(!=)|(==)|(>)|(<))))/g;
function part1(input) {
  const instructions = input.split(/\n/);
  let registers = getRegisters(input);
  instructions.forEach(instruction => {
    registers = computeInstruction(instruction, registers);
  });
  const values = Object.keys(registers).map(key => registers[key]);
  return Math.max.apply(Math, values);
}
function part2(input) {
  const instructions = input.split(/\n/);
  let registers = getRegisters(input);
  let max = Number.MIN_SAFE_INTEGER;
  instructions.forEach(instruction => {
    registers = computeInstruction(instruction, registers);
    let currentMax = Math.max.apply(Math, Object.keys(registers).map(key => registers[key]));
    if (currentMax > max) {
      max = currentMax;
    }
  });
  return max;
}
function computeInstruction(instruction, registers) {
  const affectedRegisters = instruction.match(registersRegex);
  const numbers = instruction.match(/-?\d+/g);
  const compare = instruction.match(compareRegex)[0].trim();
  const increase = /inc/.test(instruction);
  const change = parseInt(numbers[0].trim());
  const compareAgainst = parseInt(numbers[1].trim());
  switch (compare) {
    case "<=":
      if (registers[affectedRegisters[1].trim()] <= compareAgainst) {
        if (increase) {
          registers[affectedRegisters[0].trim()] += change;
        } else {
          registers[affectedRegisters[0].trim()] -= change;
        }
      }
      break;
    case ">=":
      if (registers[affectedRegisters[1].trim()] >= compareAgainst) {
        if (increase) {
          registers[affectedRegisters[0].trim()] += change;
        } else {
          registers[affectedRegisters[0].trim()] -= change;
        }
      }
      break;
    case "!=":
      if (registers[affectedRegisters[1].trim()] != compareAgainst) {
        if (increase) {
          registers[affectedRegisters[0].trim()] += change;
        } else {
          registers[affectedRegisters[0].trim()] -= change;
        }
      }
      break;
    case "==":
      if (registers[affectedRegisters[1].trim()] == compareAgainst) {
        if (increase) {
          registers[affectedRegisters[0].trim()] += change;
        } else {
          registers[affectedRegisters[0].trim()] -= change;
        }
      }
      break;
    case ">":
      if (registers[affectedRegisters[1].trim()] > compareAgainst) {
        if (increase) {
          registers[affectedRegisters[0].trim()] += change;
        } else {
          registers[affectedRegisters[0].trim()] -= change;
        }
      }
      break;
    case "<":
      if (registers[affectedRegisters[1].trim()] < compareAgainst) {
        if (increase) {
          registers[affectedRegisters[0].trim()] += change;
        } else {
          registers[affectedRegisters[0].trim()] -= change;
        }
      }
      break;
    default:
      break;
  }
  return registers;
}
function getRegisters(allInstructions) {
  return allInstructions
    .match(registersRegex)
    .reduce((registers, currentValue) => {
      registers[currentValue.trim()] = 0;
      return registers;
    }, {});
}
module.exports = { part1, part2, computeInstruction };
