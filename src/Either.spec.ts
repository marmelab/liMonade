import Either, { Left, Right } from './Either';
import { testApplicativeLaw } from './testUtils/testApplicativeLaw';
import { testFunctorLaw } from './testUtils/testFunctorLaw';
import { testMonadLaw } from './testUtils/testMonadLaw';
import { testTraversableLaw } from './testUtils/testTraversableLaw';

describe('Either', () => {
    const double = (v: number) => v * 2;

    testFunctorLaw(Either);
    testMonadLaw(Either);
    testApplicativeLaw(Either);
    testTraversableLaw(Either);

    it('chaining a Left to a Right return a Left', () => {
        function fn(v: string): Left<Error>;
        function fn(v: number): Right<number>;
        function fn(v: string | number) {
            return typeof v === 'number'
                ? Either.Right(v * 2)
                : Either.Left(new Error('Not a number'));
        }
        expect(Either.Right('a string').chain(fn)).toEqual(
            Either.Left(new Error('Not a number')),
        );
    });

    describe('Right', () => {
        it('applying a left to a right return a left', () => {
            const right = Either.Right(double);
            const left = Either.Left(new Error('something bad happened'));
            expect(right.ap(left)).toEqual(
                Either.Left(new Error('something bad happened')),
            );
        });

        it('.catch should do nothing', () => {
            expect(Either.Right(5).catch(e => e.message)).toEqual(
                Either.Right(5),
            );
        });
    });

    describe('Left', () => {
        it('chaining a Right to a Left return a Left', () => {
            const fn = (v: number) => Either.of(v * 2);
            expect(Either.Left(new Error('uh oh')).chain(fn)).toEqual(
                Either.Left(new Error('uh oh')),
            );
        });

        it('applying a right to a left return a left', () => {
            const left = Either.Left(new Error('something bad happened'));
            const right = Either.Right(5);
            expect(left.ap(right)).toEqual(
                Either.Left(new Error('something bad happened')),
            );
        });

        it('.catch should convert left to right applying the function to the value', () => {
            expect(
                Either.Left(new Error('not a number')).catch(v => v.message),
            ).toEqual(Either.Right('not a number'));
        });
    });
});
