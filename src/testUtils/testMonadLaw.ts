import * as fc from 'fast-check';
import { InferCategory } from '../types';
import numberOperation from './numberOperation';

export const testMonadLaw = <Name>(
    Testee: InferCategory<number, Name>,
    getValue: (v: any) => any = v => v,
) => {
    describe('Monad Laws', () => {
        it('.chain should be associative', async () =>
            fc.assert(
                fc.asyncProperty(
                    fc.integer(),
                    fc.integer(),
                    fc.integer(),
                    numberOperation,
                    numberOperation,
                    async (x, y, z, fn1, fn2) => {
                        const liftedFn1 = Testee.lift(fn1(y));
                        const liftedFn2 = Testee.lift(fn2(z));
                        expect(
                            await getValue(
                                Testee.of(x)
                                    .chain(liftedFn1)
                                    .chain(liftedFn2),
                            ),
                        ).toEqual(
                            await getValue(
                                Testee.of(x).chain((v: number) =>
                                    liftedFn1(v).chain(liftedFn2),
                                ),
                            ),
                        );
                    },
                ),
            ));

        it('.chain should follow the Right identity law', async () =>
            fc.assert(
                fc.asyncProperty(fc.anything(), async x => {
                    expect(
                        await getValue(Testee.of(x).chain(Testee.of)),
                    ).toEqual(await getValue(Testee.of(x)));
                }),
            ));

        it('.chain should follow the Left identity law', async () =>
            fc.assert(
                fc.asyncProperty(
                    fc.integer(),
                    fc.integer(),
                    numberOperation,
                    async (x, y, fn) => {
                        const liftedFn = Testee.lift(fn(y));
                        expect(
                            await getValue(Testee.of(x).chain(liftedFn)),
                        ).toEqual(await getValue(liftedFn(x)));
                    },
                ),
            ));
    });
};
