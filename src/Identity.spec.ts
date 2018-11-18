import Identity from './Identity';

describe('Identity', () => {
    const increment = (v: number) => v + 1;
    const double = (v: number) => v * 2;
    const identity = (v: any) => v;
    const doubleIdentity = (v: number) => Identity.of(v).map(double);
    const incrementIdentity = (v: number) => Identity.of(v).map(increment);

    it('.map should compose function', () => {
        expect(
            Identity.of(5)
                .map(double)
                .map(increment),
        ).toEqual(Identity.of(5).map(v => increment(double(v))));
    });

    it('.map should do nothing if applying the identity function', () => {
        expect(Identity.of('value').map(identity)).toEqual(
            Identity.of('value'),
        );
    });

    it('.chain should be associative', () => {
        expect(
            Identity.of(5)
                .chain(doubleIdentity)
                .chain(incrementIdentity),
        ).toEqual(
            Identity.of(5).chain(v =>
                doubleIdentity(v).chain(incrementIdentity),
            ),
        );
    });

    it('.chain should follow the Right identity law', () => {
        expect(Identity.of(5).chain(Identity.of)).toEqual(Identity.of(5));
    });

    it('.chain should follow the Left identity law', () => {
        expect(Identity.of(5).chain(incrementIdentity)).toEqual(
            incrementIdentity(5),
        );
    });

    describe('Applicative Functor Law', () => {
        it('Identity', () => {
            expect(Identity.of(identity).ap(Identity.of(5))).toEqual(
                Identity.of(5),
            );
        });

        it('Homomorphism', () => {
            expect(Identity.of(double).ap(Identity.of(5))).toEqual(
                Identity.of(double(5)),
            );
        });

        it('Interchange', () => {
            expect(Identity.of(double).ap(Identity.of(5))).toEqual(
                Identity.of(5).map(double),
            );
        });

        it('composition', () => {
            const u = Identity.of(() => 'u');
            const v = Identity.of((value: string) => value + 'v');
            const w = Identity.of('w');
            const compose = (f1: (v: any) => any) => (f2: (v: any) => any) => (
                value: any,
            ) => f1(f2(value));
            expect(u.ap(v.ap(w))).toEqual(
                Identity.of(compose)
                    .ap(u)
                    .ap(v)
                    .ap(w),
            );
        });
    });
});
