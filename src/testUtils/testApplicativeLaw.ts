import { Applicative } from '../types';

interface ApplicativeConstructor<Name> {
    of<T>(v: T): Applicative<T, Name>;
}

export const testApplicativeLaw = <Name>(
    Testee: ApplicativeConstructor<Name>,
    getValue: (v: any) => any = v => v,
) => {
    describe('Applicative Functor Law', () => {
        const double = (v: number) => v * 2;
        const identity = <T>(v: T): T => v;

        it('Identity', async () => {
            expect(
                await getValue(Testee.of(identity).ap(Testee.of(5))),
            ).toEqual(await getValue(Testee.of(5)));
        });

        it('Homomorphism', async () => {
            expect(await getValue(Testee.of(double).ap(Testee.of(5)))).toEqual(
                await getValue(Testee.of(double(5))),
            );
        });

        it('Interchange', async () => {
            expect(await getValue(Testee.of(double).ap(Testee.of(5)))).toEqual(
                await getValue(Testee.of(5).map(double)),
            );
        });

        it('composition', async () => {
            const u = Testee.of(() => 'u');
            const v = Testee.of((value: string) => value + 'v');
            const w = Testee.of('w');
            const compose = (f1: (v: any) => any) => (f2: (v: any) => any) => (
                value: any,
            ) => f1(f2(value));
            expect(await getValue(u.ap(v.ap(w)))).toEqual(
                await getValue(
                    Testee.of(compose)
                        .ap(u)
                        .ap(v)
                        .ap(w),
                ),
            );
        });
    });
};
