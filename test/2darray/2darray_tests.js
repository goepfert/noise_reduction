let array = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];

let b = array.slice(0, 2);
console.log(b);

let c = array.slice(0, 2).map((row) => row.slice());

console.log(c);

array[0][0] = 111;

let array2 = [1, 2, 3, 4];

let d = array2.slice(0, 2);
console.log(d);

array2[0] = 111;
