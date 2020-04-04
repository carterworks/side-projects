// Each new term in the Fibonacci sequence is generated by adding the previous two terms. By starting with 1 and 2, the first 10 terms will be:
// 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, ...
// By considering the terms in the Fibonacci sequence whose values do not exceed four million, find the sum of the even-valued terms.
/* answer: 4613732*/

let rec evenFibSum = (max_value, prev_num, prev_prev_num, even_sum) => {
  let new_num = prev_num + prev_prev_num;
  if (new_num > max_value) {
    even_sum;
  } else {
    let new_sum =
      switch (new_num) {
      | _ when new_num mod 2 == 0 => even_sum + new_num
      | _ => even_sum
      };
    evenFibSum(max_value, new_num, prev_num, new_sum);
  };
};

// let rec fibSum = (max: int, )

let sum: int = evenFibSum(4000000, 0, 1, 0);

Js.log({j|Problem 002: $sum|j});