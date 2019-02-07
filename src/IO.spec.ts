import IO, { IOType } from './IO';
import List from './List';
import { testApplicativeLaw } from './testUtils/testApplicativeLaw';
import { testFunctorLaw } from './testUtils/testFunctorLaw';
import { testMonadLaw } from './testUtils/testMonadLaw';

const getIOValue = <T>(io: IOType<T>) => io.execute();

describe('IO', () => {
    testFunctorLaw(IO, getIOValue);
    testMonadLaw(IO, getIOValue);
    testApplicativeLaw(IO, getIOValue);

    it('map should be lazy', () => {
        const gimmeFive = jest.fn(() => 5) as () => number;
        const double = jest.fn(v => v * 2) as (v: number) => number;
        const io = IO(gimmeFive).map(double);
        expect(gimmeFive).toHaveBeenCalledTimes(0);
        expect(double).toHaveBeenCalledTimes(0);

        expect(io.execute()).toBe(10);
        expect(gimmeFive).toHaveBeenCalledTimes(1);
        expect(double).toHaveBeenCalledTimes(1);
    });

    it('chain should be lazy', () => {
        const gimmeFive = jest.fn(() => 5);
        const double = jest.fn(v => IO.of(v * 2));
        const io = IO(gimmeFive).chain(double);
        expect(gimmeFive).toHaveBeenCalledTimes(0);
        expect(double).toHaveBeenCalledTimes(0);

        expect(io.execute()).toBe(10);

        expect(gimmeFive).toHaveBeenCalledTimes(1);
        expect(double).toHaveBeenCalledTimes(1);
    });

    it('ap should be lazy', () => {
        const gimmeFive = jest.fn(() => 5);
        const double = jest.fn(() => (a: number) => a * 2);
        const io = IO(double).ap(IO(gimmeFive));
        expect(gimmeFive).toHaveBeenCalledTimes(0);
        expect(double).toHaveBeenCalledTimes(0);

        expect(io.execute()).toBe(10);

        expect(gimmeFive).toHaveBeenCalledTimes(1);
        expect(double).toHaveBeenCalledTimes(1);
    });

    it('list should allow to convert a list of io into a single io of a list and execute all sideEffect simultaneously', () => {
        const fn1 = jest.fn(() => 1);
        const fn2 = jest.fn(() => 2);
        const fn3 = jest.fn(() => 3);
        const list = List([IO(fn1), IO(fn2), IO(fn3)]);

        const io = list.sequence(IO.of);

        expect(fn1).toBeCalledTimes(0);
        expect(fn2).toBeCalledTimes(0);
        expect(fn3).toBeCalledTimes(0);

        expect(io.execute()).toEqual(List([1, 2, 3]));

        expect(fn1).toBeCalledTimes(1);
        expect(fn2).toBeCalledTimes(1);
        expect(fn3).toBeCalledTimes(1);
    });
});
