import List from './List';
import Reader from './Reader';
import { testApplicativeLaw } from './testUtils/testApplicativeLaw';
import { testFunctorLaw } from './testUtils/testFunctorLaw';
import { testMonadLaw } from './testUtils/testMonadLaw';

describe('Reader', () => {
    const double = (v: number) => v * 2;
    const increment = (v: number) => v + 1;

    testFunctorLaw(Reader);
    testMonadLaw(Reader);
    testApplicativeLaw(Reader);

    it('ask should allow to pass the dependencies as value', () => {
        const reader = Reader.ask().map(v => `my dependencies are ${v}`);
        expect(reader.execute('injected')).toEqual(
            'my dependencies are injected',
        );
    });

    it('chain should allow to access the dependencies', () => {
        const reader = Reader.of(5).chain((v: number) =>
            Reader(dependencies => dependencies(v)),
        );
        expect(reader.execute(double)).toEqual(10);
        expect(reader.execute(increment)).toEqual(6);
    });

    it('list should allow to convert a list of reader into a single reader of a list and execute all computation with the same dependencies', () => {
        const fn1 = jest.fn((operation: (v: number) => number) => operation(1));
        const fn2 = jest.fn((operation: (v: number) => number) => operation(2));
        const fn3 = jest.fn((operation: (v: number) => number) => operation(3));
        const list = List([Reader(fn1), Reader(fn2), Reader(fn3)]);

        const reader = list.sequence(Reader.of);

        expect(fn1).toBeCalledTimes(0);
        expect(fn2).toBeCalledTimes(0);
        expect(fn3).toBeCalledTimes(0);

        expect(reader.execute((v: number) => v * 2)).toEqual(List([2, 4, 6]));

        expect(fn1).toBeCalledTimes(1);
        expect(fn2).toBeCalledTimes(1);
        expect(fn3).toBeCalledTimes(1);

        expect(reader.execute((v: number) => v + 1)).toEqual(List([2, 3, 4]));

        expect(fn1).toBeCalledTimes(2);
        expect(fn2).toBeCalledTimes(2);
        expect(fn3).toBeCalledTimes(2);
    });
});
