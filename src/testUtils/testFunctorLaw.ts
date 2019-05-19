import * as fc from 'fast-check';

import { Functor } from '../types';
import getComparableValue from './getComparableValue';
import numberOperation from './numberOperation';

const identity = <T>(v: T) => v;

export const testFunctorLaw = (
    Testee: Functor,
    getValue = getComparableValue,
) => {
    describe('Functor Laws', () => {
        it('Composition with number', () =>
            fc.assert(
                fc.asyncProperty(
                    fc.integer(),
                    numberOperation,
                    numberOperation,
                    async (
                        x: number,
                        f1: (v: number) => number,
                        f2: (v: number) => number,
                    ) => {
                        expect(
                            await getValue(
                                Testee.of(x)
                                    .map(f1)
                                    .map(f2),
                            ),
                        ).toEqual(
                            await getValue(
                                Testee.of(x).map((v: number) => f2(f1(v))),
                            ),
                        );
                    },
                ),
            ));

        it('Identity', async () =>
            fc.assert(
                fc.asyncProperty(fc.anything(), async (x: any) => {
                    expect(await getValue(Testee.of(x).map(identity))).toEqual(
                        await getValue(Testee.of(x)),
                    );
                }),
            ));
    });
};
