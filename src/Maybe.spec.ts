import Maybe from './Maybe';

describe('Maybe', () => {
    const increment = (v: number) => v + 1;
    const double = (v: number) => v * 2;
    const identity = (v: any) => v;
    const doubleIdentity = (v: number) => Maybe.of(v).map(double);
    const incrementIdentity = (v: number) => Maybe.of(v).map(increment);

    it('.map should compose function', () => {
        expect(
            Maybe.of(5)
                .map(double)
                .map(increment),
        ).toEqual(Maybe.of(5).map(v => increment(double(v))));
    });

    it('.map should do nothing if applying the identity function', () => {
        expect(Maybe.of('value').map(identity)).toEqual(Maybe.of('value'));
    });

    it('.chain should be associative', () => {
        expect(
            Maybe.of(5)
                .chain(doubleIdentity)
                .chain(incrementIdentity),
        ).toEqual(
            Maybe.of(5).chain(v => doubleIdentity(v).chain(incrementIdentity)),
        );
    });

    it('.chain should follow the Right identity law', () => {
        expect(Maybe.of(5).chain(Maybe.of)).toEqual(Maybe.of(5));
    });

    it('.chain should follow the Left identity law', () => {
        expect(Maybe.of(5).chain(incrementIdentity)).toEqual(
            incrementIdentity(5),
        );
    });

    describe('Applicative Functor Law', () => {
        it('Identity', () => {
            expect(Maybe.of(identity).ap(Maybe.of(5))).toEqual(Maybe.of(5));
        });

        it('Homomorphism', () => {
            expect(Maybe.of(double).ap(Maybe.of(5))).toEqual(
                Maybe.of(double(5)),
            );
        });

        it('Interchange', () => {
            expect(Maybe.of(double).ap(Maybe.of(5))).toEqual(
                Maybe.of(5).map(double),
            );
        });

        it('composition', () => {
            const u = Maybe.of(() => 'u');
            const v = Maybe.of((value: string) => value + 'v');
            const w = Maybe.of('w');
            const compose = (f1: (v: any) => any) => (f2: (v: any) => any) => (
                value: any,
            ) => f1(f2(value));
            expect(u.ap(v.ap(w))).toEqual(
                Maybe.of(compose)
                    .ap(u)
                    .ap(v)
                    .ap(w),
            );
        });
    });
});
