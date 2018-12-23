import { Left, Right } from './Either';
import { testApplicativeLaw } from './testUtils/testApplicativeLaw';
import { testFunctorLaw } from './testUtils/testFunctorLaw';
import { testMonadLaw } from './testUtils/testMonadLaw';
import { testTraversableLaw } from './testUtils/testTraversableLaw';

describe('Either', () => {
    describe('Right', () => {
        testFunctorLaw(Right);
        testMonadLaw(Right);
        testApplicativeLaw(Right);
        testTraversableLaw(Right);
    });

    describe('Left', () => {
        testFunctorLaw(Left);
        testMonadLaw(Left);

        describe('Non Applicative Functor Law: Left never change its value', () => {
            const double = (v: number) => v * 2;
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
    });
});
