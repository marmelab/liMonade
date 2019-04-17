import * as fc from 'fast-check';
import { InferCategory } from '../types';
import getComparableValue from './getComparableValue';
import numberOperation from './numberOperation';

export const testMonadLaw = <Name>(
    Testee: InferCategory<number, Name>,
    getValue = getComparableValue,
) => {
    describe('Monad Laws', () => {
        it('.chain should be associative', async () =>
            fc.assert(
                fc.asyncProperty(
                    fc.integer(),
                    numberOperation,
                    numberOperation,
                    async (
                        x: any,
                        fn1: (v: number) => number,
                        fn2: (v: number) => number,
                    ) => {
                        const liftedFn1 = Testee.lift(fn1);
                        const liftedFn2 = Testee.lift(fn2);
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
                fc.asyncProperty(fc.anything(), async (x: any) => {
                    expect(
                        await getValue(Testee.of(x).chain(Testee.of)),
                    ).toEqual(await getValue(Testee.of(x)));
                }),
            ));

        it('.chain should follow the Left identity law', async () =>
            fc.assert(
                fc.asyncProperty(
                    fc.integer(),
                    numberOperation,
                    async (x: any, fn: (v: number) => number) => {
                        const liftedFn = Testee.lift(fn);
                        expect(
                            await getValue(Testee.of(x).chain(liftedFn)),
                        ).toEqual(await getValue(liftedFn(x)));
                    },
                ),
            ));
    });
};
