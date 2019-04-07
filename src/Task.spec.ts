import List from './List';
import Task from './Task';
import { testApplicativeLaw } from './testUtils/testApplicativeLaw';
import { testFunctorLaw } from './testUtils/testFunctorLaw';
import { testMonadLaw } from './testUtils/testMonadLaw';

describe('Task', () => {
    testFunctorLaw(Task);
    testMonadLaw(Task);
    testApplicativeLaw(Task);

    it('should allow to chain async operation lazily', async () => {
        const double = jest.fn((v: number) =>
            Task((resolve: (v: number) => void) => {
                setTimeout(() => resolve(v * 2), 1);
            }),
        );

        const increment = jest.fn((v: number) =>
            Task((resolve: (v: number) => void) => {
                setTimeout(() => resolve(v + 1), 1);
            }),
        );
        const task = Task.of(5)
            .chain(double)
            .chain(increment);

        expect(double).toBeCalledTimes(0);
        expect(increment).toBeCalledTimes(0);

        expect(await task.toPromise()).toBe(11);

        expect(double).toBeCalledTimes(1);
        expect(increment).toBeCalledTimes(1);
    });

    it('should ignore operation after the task has been rejected', async () => {
        const boom = jest.fn(() =>
            Task((_, reject) => {
                setTimeout(() => reject(new Error('Boom')), 1);
            }),
        );

        const double = jest.fn((v: number) =>
            Task((resolve: (v: number) => void) => {
                setTimeout(() => resolve(v * 2), 1);
            }),
        );

        const task = Task.of(5)
            .chain(boom)
            .chain(double);

        expect(boom).toBeCalledTimes(0);
        expect(double).toBeCalledTimes(0);

        expect(await task.toPromise().catch(v => v)).toEqual(new Error('Boom'));

        expect(boom).toBeCalledTimes(1);
        expect(double).toBeCalledTimes(0);
    });

    it('should allow to resume operation with catch', async () => {
        const boom = jest.fn(() =>
            Task((_, reject) => {
                setTimeout(() => reject(new Error('Boom')), 1);
            }),
        );

        const double = jest.fn((v: number) =>
            Task((resolve: (v: number) => void) => {
                setTimeout(() => resolve(v * 2), 1);
            }),
        );

        const task = Task.of(5)
            .chain(boom)
            .catch(() => 1)
            .chain(double);

        expect(boom).toBeCalledTimes(0);
        expect(double).toBeCalledTimes(0);

        expect(await task.toPromise()).toBe(2);

        expect(boom).toBeCalledTimes(1);
        expect(double).toBeCalledTimes(1);
    });

    it('list should allow to convert a list of Task into a single task of a list and execute all computation simultaneously', async () => {
        const fn1 = jest.fn(resolve => setTimeout(() => resolve(1), 1));
        const fn2 = jest.fn(resolve => setTimeout(() => resolve(2), 2));
        const fn3 = jest.fn(resolve => setTimeout(() => resolve(3), 3));
        const list = List([Task(fn1), Task(fn2), Task(fn3)]);

        const io = list.sequence(Task.of);

        expect(fn1).toBeCalledTimes(0);
        expect(fn2).toBeCalledTimes(0);
        expect(fn3).toBeCalledTimes(0);

        expect(await io.toPromise()).toEqual(List([1, 2, 3]));

        expect(fn1).toBeCalledTimes(1);
        expect(fn2).toBeCalledTimes(1);
        expect(fn3).toBeCalledTimes(1);
    });
});
