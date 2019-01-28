import { Just, Nothing } from './Maybe';
import { testApplicativeLaw } from './testUtils/testApplicativeLaw';
import { testFunctorLaw } from './testUtils/testFunctorLaw';
import { testMonadLaw } from './testUtils/testMonadLaw';
import { testTraversableLaw } from './testUtils/testTraversableLaw';

describe('Maybe', () => {
    const double = (v: number) => v * 2;
    const doubleJust = (v: number) => Just.of(double(v));
    describe('Just', () => {
        testFunctorLaw(Just);
        testMonadLaw(Just);
        testApplicativeLaw(Just);
        testTraversableLaw(Just);

        it('chaining nothing to a just return nothing', () => {
            const just = Just.of(5);
            expect(just.chain(() => new Nothing())).toEqual(new Nothing());
        });

        it('applying nothing to a just return nothing', () => {
            const just = Just.of(double);
            const nothing = new Nothing();
            expect(just.ap(nothing)).toEqual(new Nothing());
        });
    });

    describe('Nothing', () => {
        testFunctorLaw(Nothing);
        testMonadLaw(Nothing);
        testApplicativeLaw(Nothing);
        testTraversableLaw(Nothing);

        it('chaining just to nothing return nothing', () => {
            const nothing = new Nothing();
            expect(nothing.chain(doubleJust)).toEqual(new Nothing());
        });

        it('applying a just to nothing return nothing', () => {
            const nothing = new Nothing();
            const just = Just.of(5);
            expect(nothing.ap(just)).toEqual(new Nothing());
        });
    });
});
