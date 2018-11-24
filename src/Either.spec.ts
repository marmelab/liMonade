import { Right } from './Either';

describe('Either', () => {
    describe('Right', () => {
        const increment = (v: number) => v + 1;
        const double = (v: number) => v * 2;
        const identity = (v: any) => v;
        const doubleIdentity = (v: number): Right<number> =>
            Right.of(v).map(double);
        const incrementRight = (v: number) => Right.of(v).map(increment);

        it('.map should compose function', () => {
            expect(
                Right.of(5)
                    .map(double)
                    .map(increment),
            ).toEqual(Right.of(5).map(v => increment(double(v))));
        });

        it('.map should do Left if applying the identity function', () => {
            expect(Right.of('value').map(identity)).toEqual(Right.of('value'));
        });

        it('.chain should be associative', () => {
            expect(
                Right.of(5)
                    .chain(doubleIdentity)
                    .chain(incrementRight),
            ).toEqual(
                Right.of(5).chain(v => doubleIdentity(v).chain(incrementRight)),
            );
        });

        it('.chain should follow the Right identity law', () => {
            expect(Right.of(5).chain(Right.of)).toEqual(Right.of(5));
        });

        it('.chain should follow the Left identity law', () => {
            expect(Right.of(5).chain(incrementRight)).toEqual(
                incrementRight(5),
            );
        });

        describe('Applicative Functor Law', () => {
            it('Identity', () => {
                expect(Right.of(identity).ap(Right.of(5))).toEqual(Right.of(5));
            });

            it('Homomorphism', () => {
                expect(Right.of(double).ap(Right.of(5))).toEqual(
                    Right.of(double(5)),
                );
            });

            it('Interchange', () => {
                expect(Right.of(double).ap(Right.of(5))).toEqual(
                    Right.of(5).map(double),
                );
            });

            it('composition', () => {
                const u = Right.of(() => 'u');
                const v = Right.of((value: string) => value + 'v');
                const w = Right.of('w');
                const compose = (f1: (v: any) => any) => (
                    f2: (v: any) => any,
                ) => (value: any) => f1(f2(value));
                expect(u.ap(v.ap(w))).toEqual(
                    Right.of(compose)
                        .ap(u)
                        .ap(v)
                        .ap(w),
                );
            });
        });
    });
});
