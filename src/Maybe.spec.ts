import { Just, Nothing } from './Maybe';

describe('Maybe', () => {
    describe('Just', () => {
        const increment = (v: number) => v + 1;
        const double = (v: number) => v * 2;
        const identity = (v: any) => v;
        const doubleIdentity = (v: number): Just<number> =>
            Just.of(v).map(double);
        const incrementIdentity = (v: number) => Just.of(v).map(increment);

        it('.map should compose function', () => {
            expect(
                Just.of(5)
                    .map(double)
                    .map(increment),
            ).toEqual(Just.of(5).map(v => increment(double(v))));
        });

        it('.map should do nothing if applying the identity function', () => {
            expect(Just.of('value').map(identity)).toEqual(Just.of('value'));
        });

        it('.chain should be associative', () => {
            expect(
                Just.of(5)
                    .chain(doubleIdentity)
                    .chain(incrementIdentity),
            ).toEqual(
                Just.of(5).chain(v =>
                    doubleIdentity(v).chain(incrementIdentity),
                ),
            );
        });

        it('.chain should follow the Right identity law', () => {
            expect(Just.of(5).chain(Just.of)).toEqual(Just.of(5));
        });

        it('.chain should follow the Left identity law', () => {
            expect(Just.of(5).chain(incrementIdentity)).toEqual(
                incrementIdentity(5),
            );
        });

        describe('Applicative Functor Law', () => {
            it('Identity', () => {
                expect(Just.of(identity).ap(Just.of(5))).toEqual(Just.of(5));
            });

            it('Homomorphism', () => {
                expect(Just.of(double).ap(Just.of(5))).toEqual(
                    Just.of(double(5)),
                );
            });

            it('Interchange', () => {
                expect(Just.of(double).ap(Just.of(5))).toEqual(
                    Just.of(5).map(double),
                );
            });

            it('composition', () => {
                const u = Just.of(() => 'u');
                const v = Just.of((value: string) => value + 'v');
                const w = Just.of('w');
                const compose = (f1: (v: any) => any) => (
                    f2: (v: any) => any,
                ) => (value: any) => f1(f2(value));
                expect(u.ap(v.ap(w))).toEqual(
                    Just.of(compose)
                        .ap(u)
                        .ap(v)
                        .ap(w),
                );
            });
        });
    });

    describe('Nothing', () => {
        const increment = (v: number) => v + 1;
        const double = (v: number) => v * 2;
        const identity = (v: any) => v;
        const doubleIdentity = (v: number): Just<number> =>
            Just.of(v).map(double);
        const incrementNothing = (v: number) => Nothing.of(v).map(increment);

        it('.map should compose function', () => {
            expect(
                Nothing.of()
                    .map(double)
                    .map(increment),
            ).toEqual(Nothing.of().map(v => increment(double(v))));
        });

        it('.map should do nothing if applying the identity function', () => {
            expect(Nothing.of().map(identity)).toEqual(Nothing.of());
        });

        it('.chain should be associative', () => {
            expect(
                Nothing.of()
                    .chain(doubleIdentity)
                    .chain(incrementNothing),
            ).toEqual(
                Nothing.of().chain(v =>
                    doubleIdentity(v).chain(incrementNothing),
                ),
            );
        });

        it('.chain should follow the Right identity law', () => {
            expect(Nothing.of().chain(Nothing.of)).toEqual(Nothing.of());
        });

        it('.chain should follow the Left identity law', () => {
            expect(Nothing.of().chain(incrementNothing)).toEqual(
                incrementNothing(5),
            );
        });

        describe('Applicative Functor Law', () => {
            it('Identity', () => {
                expect(Nothing.of(identity).ap(Nothing.of(5))).toEqual(
                    Nothing.of(),
                );
            });

            it('Homomorphism', () => {
                expect(Nothing.of(double).ap(Nothing.of(5))).toEqual(
                    Nothing.of(double(5)),
                );
            });

            it('Interchange', () => {
                expect(Nothing.of(double).ap(Nothing.of(5))).toEqual(
                    Nothing.of(5).map(double),
                );
            });

            it('composition', () => {
                const u = Nothing.of(() => 'u');
                const v = Nothing.of((value: string) => value + 'v');
                const w = Nothing.of('w');
                const compose = (f1: (v: any) => any) => (
                    f2: (v: any) => any,
                ) => (value: any) => f1(f2(value));
                expect(u.ap(v.ap(w))).toEqual(
                    Nothing.of(compose)
                        .ap(u)
                        .ap(v)
                        .ap(w),
                );
            });
        });
    });
});
