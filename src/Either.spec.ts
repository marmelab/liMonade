import { Left, Right } from './Either';
import { testApplicativeLaw } from './testUtils/testApplicativeLaw';
import { testFunctorLaw } from './testUtils/testFunctorLaw';
import { testMonadLaw } from './testUtils/testMonadLaw';
import { testTraversableLaw } from './testUtils/testTraversableLaw';

describe('Either', () => {
    const double = (v: number) => v * 2;

    describe('Right', () => {
        testFunctorLaw(Right);
        testMonadLaw(Right);
        testApplicativeLaw(Right);
        testTraversableLaw(Right);

        it('chaining a Left to a Right return a Left', () => {
            function fn(v: string): Left<string>;
            function fn(v: number): Right<number>;
            function fn(v: string | number) {
                return typeof v === 'number'
                    ? Right.of(v * 2)
                    : Left.of('Not a number');
            }
            expect(Right.of('a string').chain(fn)).toEqual(
                Left.of('Not a number'),
            );
        });

        it('applying a left to a right return a left', () => {
            const right = Right.of(double);
            const left = Left.of('something bad happened');
            expect(right.ap(left)).toEqual(Left.of('something bad happened'));
        });

        it('.catch should do nothing', () => {
            expect(Right.of(5).catch(double)).toEqual(Right.of(5));
        });
    });

    describe('Left', () => {
        testFunctorLaw(Left);
        testMonadLaw(Left);

        describe('Non Applicative Functor Law: Left never change its value', () => {
            const identity = (v: any) => v;
            it('Non Identity', () => {
                expect(Left.of(identity).ap(Left.of(5))).toEqual(
                    Left.of(identity),
                );
            });

            it('Non Homomorphism', () => {
                expect(Left.of(double).ap(Left.of(5))).toEqual(Left.of(double));
            });

            it('Non Interchange', () => {
                expect(Left.of(double).ap(Left.of(5))).toEqual(Left.of(double));
            });

            it('Non Composition', () => {
                const u = Left.of(() => 'u');
                const v = Left.of((value: string) => value + 'v');
                const w = Left.of('w');
                expect(u.ap(v.ap(w))).toEqual(u);
            });
        });
        testTraversableLaw(Left);

        it('chaining a Right to a Left return a Left', () => {
            const fn = (v: number) => Right.of(v * 2);
            expect(Left.of('uh oh').chain(fn)).toEqual(Left.of('uh oh'));
        });

        it('applying a right to a left return a left', () => {
            const left = Left.of('something bad happened');
            const right = Right.of(5);
            expect(left.ap(right)).toEqual(Left.of('something bad happened'));
        });

        it('.catch should convert left to right applying the function to the value', () => {
            expect(Left.of('not a number').catch(v => v.length)).toEqual(
                Right.of(12),
            );
        });
    });
});
