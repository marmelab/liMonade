import { Functor } from '../types';

const identity = <T>(v: T) => v;
const increment = (v: number) => v + 1;
const double = (v: number) => v * 2;

interface FunctorConstructor<Kind, Name> {
    of<T>(v: T): Functor<T, Kind, Name>;
}

export const testFunctorLaw = <Kind, Name>(
    Testee: FunctorConstructor<Kind, Name>,
) => {
    describe('Functor Laws', () => {
        it('Composition', () => {
            expect(
                Testee.of(5)
                    .map(double)
                    .map(increment),
            ).toEqual(Testee.of(5).map((v: number) => increment(double(v))));
        });

        it('Identity', () => {
            expect(Testee.of('value').map(identity)).toEqual(
                Testee.of('value'),
            );
        });
    });
};
