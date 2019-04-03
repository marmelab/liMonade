import * as fc from 'fast-check';

const incrementBy = (a: number) => (b: number) => a + b;
const multiplyBy = (a: number) => (b: number) => a * b;
const divideBy = (a: number) => (b: number) => a / b;
const substractBy = (a: number) => (b: number) => a - b;

export default fc.oneof(
    fc.constant(incrementBy),
    fc.constant(multiplyBy),
    fc.constant(divideBy),
    fc.constant(substractBy),
);
