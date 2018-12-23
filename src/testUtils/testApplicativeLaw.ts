import { Applicative } from '../types/Applicative';

interface ApplicativeConstructor<Kind, Name> {
    of<T>(v: T): Applicative<T, Kind, Name>;
}

export const testApplicativeLaw = <Kind, Name>(
    Testee: ApplicativeConstructor<Kind, Name>,
) => {
    describe('Applicative Functor Law', () => {
        const double = (v: number) => v * 2;
        const identity = <T>(v: T): T => v;

        it('Identity', () => {
            expect(Testee.of(identity).ap(Testee.of(5))).toEqual(Testee.of(5));
        });

        it('Homomorphism', () => {
            expect(Testee.of(double).ap(Testee.of(5))).toEqual(
                Testee.of(double(5)),
            );
        });

        it('Interchange', () => {
            expect(Testee.of(double).ap(Testee.of(5))).toEqual(
                Testee.of(5).map(double),
            );
        });

        it('composition', () => {
            const u = Testee.of(() => 'u');
            const v = Testee.of((value: string) => value + 'v');
            const w = Testee.of('w');
            const compose = (f1: (v: any) => any) => (f2: (v: any) => any) => (
                value: any,
            ) => f1(f2(value));
            expect(u.ap(v.ap(w))).toEqual(
                Testee.of(compose)
                    .ap(u)
                    .ap(v)
                    .ap(w),
            );
        });
    });
};
