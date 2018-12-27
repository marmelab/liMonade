import { Applicative } from '../types';

interface ApplicativeConstructor<Kind, Name> {
    of<T>(v: T): Applicative<T, Kind, Name>;
}

export const testApplicativeLaw = <Kind, Name>(
    Testee: ApplicativeConstructor<Kind, Name>,
    getValue: (v: any) => any = v => v,
) => {
    describe('Applicative Functor Law', () => {
        const double = (v: number) => v * 2;
        const identity = <T>(v: T): T => v;

        it('Identity', () => {
            expect(getValue(Testee.of(identity).ap(Testee.of(5)))).toEqual(
                getValue(Testee.of(5)),
            );
        });

        it('Homomorphism', () => {
            expect(getValue(Testee.of(double).ap(Testee.of(5)))).toEqual(
                getValue(Testee.of(double(5))),
            );
        });

        it('Interchange', () => {
            expect(getValue(Testee.of(double).ap(Testee.of(5)))).toEqual(
                getValue(Testee.of(5).map(double)),
            );
        });

        it('composition', () => {
            const u = Testee.of(() => 'u');
            const v = Testee.of((value: string) => value + 'v');
            const w = Testee.of('w');
            const compose = (f1: (v: any) => any) => (f2: (v: any) => any) => (
                value: any,
            ) => f1(f2(value));
            expect(getValue(u.ap(v.ap(w)))).toEqual(
                getValue(
                    Testee.of(compose)
                        .ap(u)
                        .ap(v)
                        .ap(w),
                ),
            );
        });
    });
};
