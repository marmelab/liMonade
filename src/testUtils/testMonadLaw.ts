import { InferCategory } from '../types';

export const testMonadLaw = <Name>(
    Testee: InferCategory<number, Name>,
    getValue: (v: any) => any = v => v,
) => {
    const increment = (v: number) => v + 1;
    const double = (v: number) => v * 2;
    const doubleList = (v: number) => Testee.of(v).map(double);
    const incrementList = (v: number) => Testee.of(v).map(increment);

    describe('Monad Laws', () => {
        it('.chain should be associative', async () => {
            expect(
                await getValue(
                    Testee.of(5)
                        .chain(doubleList)
                        .chain(incrementList),
                ),
            ).toEqual(
                await getValue(
                    Testee.of(5).chain((v: number) =>
                        doubleList(v).chain(incrementList),
                    ),
                ),
            );
        });

        it('.chain should follow the Right identity law', async () => {
            expect(await getValue(Testee.of(5).chain(Testee.of))).toEqual(
                await getValue(Testee.of(5)),
            );
        });

        it('.chain should follow the Left identity law', async () => {
            expect(await getValue(Testee.of(5).chain(incrementList))).toEqual(
                await getValue(incrementList(5)),
            );
        });
    });
};
