
function part1(sequence, lengths) {
    sequence = sequence.split(" ").map(Number);
    lengths = lengths.split(",").map(Number);
    let knot = tieKnot(sequence, lengths);
    return knot[0] * knot[1];
}

function tieKnot(input, lengths, rounds = 1) {
    let result = input.slice();
    let position = 0;
    let skip = 0;
  
    for (let round = 0; round < rounds; round++) {
      for (let i = 0; i < lengths.length; i++) {
        let loopLength = lengths[i];
        let reversedSection = [];
  
        for (let at = position, x = 0; x < loopLength; x++) {
          at = (position + x) % result.length;
          reversedSection.unshift(result[at]);
        }

        for (let at = position, x = 0; x < loopLength; x++) {
          at = (position + x) % result.length;
          result[at] = reversedSection[x];
        }
  
        position = (position + loopLength + skip) % result.length;
        skip++;
      }
    }
  
    return result;
  }

function part2(sequence, lengths) {
  sequence = sequence.split(" ").map(Number);
  let position = 0;
  let skip = 0;
  lengths = lengths.split("").map(c => c.charCodeAt(0)).concat([17, 31, 73, 47, 23]);
  
  let knot = tieKnot(sequence, lengths, 64);
  
  return getHexForArray(getDenseHash(knot));
}
function getDenseHash(sparseHash) {
  let result = [];

  for (let blockNr = 0; blockNr < 16; blockNr++) {
      let block = sparseHash.slice(blockNr * 16, (blockNr + 1) * 16);
      result[blockNr] = block.reduce((a,b) => a ^ b);
  }

  return result;
}

function getHexForArray(denseHash) {
  return denseHash
      .map(digit => ("0" + digit.toString(16)).substr(-2))
      .join("");
}


module.exports = { part1, part2 }
