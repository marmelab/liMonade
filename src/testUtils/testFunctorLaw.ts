import * as fc from 'fast-check';
import { InferCategory } from '../types';
import getComparableValue from './getComparableValue';
import numberOperation from './numberOperation';

const identity = <T>(v: T) => v;

export const testFunctorLaw = <Name>(
    Testee: InferCategory<any, Name>,
    getValue = getComparableValue,
) => {
    describe('Functor Laws', () => {
        it('Composition with number', () =>
            fc.assert(
                fc.asyncProperty(
                    fc.integer(),
                    numberOperation,
                    numberOperation,
                    async (x, f1, f2) => {
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
                fc.asyncProperty(fc.anything(), async x => {
                    expect(await getValue(Testee.of(x).map(identity))).toEqual(
                        await getValue(Testee.of(x)),
                    );
                }),
            ));
    });
};
