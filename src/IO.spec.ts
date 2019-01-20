import IO, { IOType } from './IO';
import List, { ListType } from './List';
import { testApplicativeLaw } from './testUtils/testApplicativeLaw';
import { testFunctorLaw } from './testUtils/testFunctorLaw';
import { testMonadLaw } from './testUtils/testMonadLaw';

const getIOValue = <T>(io: IOType<T>) => io.sideEffect();

describe('IO', () => {
    testFunctorLaw(IO, getIOValue);
    testMonadLaw(IO, getIOValue);
    testApplicativeLaw(IO, getIOValue);

    it('map should be lazy', () => {
        const gimmeFive = jest.fn(() => 5);
        const double = jest.fn(v => v * 2);
        const io = IO.fromSideEffect(gimmeFive).map(double);
        expect(gimmeFive).toHaveBeenCalledTimes(0);
        expect(double).toHaveBeenCalledTimes(0);

        expect(io.sideEffect()).toBe(10);
        expect(gimmeFive).toHaveBeenCalledTimes(1);
        expect(double).toHaveBeenCalledTimes(1);
    });

    it('chain should be lazy', () => {
        const gimmeFive = jest.fn(() => 5);
        const double = jest.fn(v => IO.of(v * 2));
        const io = IO.fromSideEffect(gimmeFive).chain(double);
        expect(gimmeFive).toHaveBeenCalledTimes(0);
        expect(double).toHaveBeenCalledTimes(0);

        expect(io.sideEffect()).toBe(10);

        expect(gimmeFive).toHaveBeenCalledTimes(1);
        expect(double).toHaveBeenCalledTimes(1);
    });

    it('ap should be lazy', () => {
        const gimmeFive = jest.fn(() => 5);
        const double = jest.fn(() => (a: number) => a * 2);
        const io = IO.fromSideEffect(double).ap(IO.fromSideEffect(gimmeFive));
        expect(gimmeFive).toHaveBeenCalledTimes(0);
        expect(double).toHaveBeenCalledTimes(0);

        expect(io.sideEffect()).toBe(10);

        expect(gimmeFive).toHaveBeenCalledTimes(1);
        expect(double).toHaveBeenCalledTimes(1);
    });

    it('list should allow to convert a list of io into a single io of a list and execute all sideEffect simultaneously', () => {
        const fn1 = jest.fn(() => 1);
        const fn2 = jest.fn(() => 2);
        const fn3 = jest.fn(() => 3);
        const list = List.fromArray([
            IO.fromSideEffect(fn1),
            IO.fromSideEffect(fn2),
            IO.fromSideEffect(fn3),
        ]);

        const io = list.sequence(IO.of) as IOType<ListType<number>>;

        expect(fn1).toBeCalledTimes(0);
        expect(fn2).toBeCalledTimes(0);
        expect(fn3).toBeCalledTimes(0);

        expect(io.sideEffect()).toEqual(List.fromArray([1, 2, 3]));

        expect(fn1).toBeCalledTimes(1);
        expect(fn2).toBeCalledTimes(1);
        expect(fn3).toBeCalledTimes(1);
    });
});
