import { Monad } from '../types/Applicative';

interface MonadConstructor<Kind, Name> {
    of<T>(v: T): Monad<T, Kind, Name>;
}

export const testMonadLaw = <Kind, Name>(
    Testee: MonadConstructor<Kind, Name>,
) => {
    const increment = (v: number) => v + 1;
    const double = (v: number) => v * 2;
    const doubleList = (v: number) => Testee.of(v).map(double);
    const incrementList = (v: number) => Testee.of(v).map(increment);

    describe('Monad Laws', () => {
        it('.chain should be associative', () => {
            expect(
                Testee.of(5)
                    .chain(doubleList)
                    .chain(incrementList),
            ).toEqual(
                Testee.of(5).chain(v => doubleList(v).chain(incrementList)),
            );
        });

        it('.chain should follow the Right identity law', () => {
            expect(Testee.of(5).chain(Testee.of)).toEqual(Testee.of(5));
        });

        it('.chain should follow the Left identity law', () => {
            expect(Testee.of(5).chain(incrementList)).toEqual(incrementList(5));
        });
    });
};
