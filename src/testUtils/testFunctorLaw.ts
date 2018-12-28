import { Functor } from '../types';

const identity = <T>(v: T) => v;
const increment = (v: number) => v + 1;
const double = (v: number) => v * 2;

interface FunctorConstructor<Kind, Name> {
    of<T>(v: T): Functor<T, Kind, Name>;
}

export const testFunctorLaw = <Kind, Name>(
    Testee: FunctorConstructor<Kind, Name>,
    getValue: (v: any) => any = v => v,
) => {
    describe('Functor Laws', () => {
        it('Composition', async () => {
            expect(
                await getValue(
                    Testee.of(5)
                        .map(double)
                        .map(increment),
                ),
            ).toEqual(
                await getValue(
                    Testee.of(5).map((v: number) => increment(double(v))),
                ),
            );
        });

        it('Identity', async () => {
            expect(await getValue(Testee.of('value').map(identity))).toEqual(
                await getValue(Testee.of('value')),
            );
        });
    });
};
