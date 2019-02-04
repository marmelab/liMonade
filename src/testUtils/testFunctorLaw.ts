import { InferCategory } from '../types';

const identity = <T>(v: T) => v;
const increment = (v: number) => v + 1;
const double = (v: number) => v * 2;

export const testFunctorLaw = <Name>(
    Testee: InferCategory<any, Name>,
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
