// If we list all the natural numbers below 10 that are multiples of 3 or 5, we get 3, 5, 6 and 9. The sum of these multiples is 23.
// Find the sum of all the multiples of 3 or 5 below 1000.
// answer: 233168

// sum = 0
// for i = 0; i < 1000; i += 1
// if i % 3 === 0 || i % 5 === 0; then sum += i
include Common;
include List;

let isDivisible = (a: int, b: int): bool => a mod b === 0;
let isDivisible3or5 = (a: int): bool =>
  isDivisible(a, 5) || isDivisible(a, 3);

let sum: int =
  Common.range(0, 1000)
  ->List.filter(isDivisible3or5, _)
  ->List.fold_left((a, b) => a + b, 0, _);

Js.log({j|Problem 1: $sum|j});