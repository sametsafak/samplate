// export let helper = 'Hello I am helper!';

// console.log('Helper worked!');

export const pi = '3.14';
export const sqrt = Math.sqrt;
export function square(x) {
  return x * x;
}
export function diag(x, y) {
  return sqrt(square(x) + square(y));
}
