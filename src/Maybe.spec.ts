import Maybe from './Maybe';
import { testApplicativeLaw } from './testUtils/testApplicativeLaw';
import { testFunctorLaw } from './testUtils/testFunctorLaw';
import { testMonadLaw } from './testUtils/testMonadLaw';
import { testTraversableLaw } from './testUtils/testTraversableLaw';

describe('Maybe', () => {
    const double = (v: number) => v * 2;
    const doubleMaybe = (v: number) => Maybe.of(double(v));
    describe('Maybe', () => {
        testFunctorLaw(Maybe);
        testMonadLaw(Maybe);
        testApplicativeLaw(Maybe);
        testTraversableLaw(Maybe);

        it('chaining nothing to a just return nothing', () => {
            const just = Maybe.of(5);
            expect(just.chain(() => Maybe.of(null))).toEqual(Maybe.of(null));
        });

        it('applying nothing to a just return nothing', () => {
            const just = Maybe.of(double);
            const nothing = Maybe.of(null);
            expect(just.ap(nothing)).toEqual(Maybe.of(null));
        });

        it('chaining just to nothing return nothing', () => {
            const nothing = Maybe.of(null);
            expect(nothing.chain(doubleMaybe)).toEqual(nothing);
        });

        it('applying a just to nothing return nothing', () => {
            const nothing = Maybe.of(null);
            const just = Maybe.of(5);
            expect(nothing.ap(just)).toEqual(nothing);
        });
    });
});
