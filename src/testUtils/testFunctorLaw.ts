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
                    fc.integer(),
                    fc.integer(),
                    numberOperation,
                    numberOperation,
                    async (x, y, z, f1, f2) => {
                        expect(
                            await getValue(
                                Testee.of(x)
                                    .map(f1(y))
                                    .map(f2(z)),
                            ),
                        ).toEqual(
                            await getValue(
                                Testee.of(x).map((v: number) =>
                                    f2(z)(f1(y)(v)),
                                ),
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
