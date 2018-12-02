import createCompose from './Compose';
import { Left, Right } from './Either';
import Identity from './Identity';
import { Just, Nothing } from './Maybe';
import Applicative from './types/Applicative';

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
    describe('Traversable Law', () => {
        it('Identity', async () => {
            await expect(
                Identity.of('value')
                    .map(Identity.of)
                    .sequence(Identity.of),
            ).toEqual(Identity.of(Identity.of('value')));
        });

        it('Composition', async () => {
            const Compose = createCompose(Right, Identity);
            expect(
                Identity.of(Right.of(Identity.of(true)))
                    .map(Compose.of)
                    .sequence(Compose.of),
            ).toEqual(
                Compose.of(
                    Identity.of(Right.of(Identity.of(true)))
                        .sequence(Right.of)
                        .map(v => v.sequence(Identity.of)),
                ),
            );
        });

        it('Naturality', () => {
            function maybeToEither<T>(maybe: Just<null>): Left<'no value'>;
            function maybeToEither<T>(maybe: Just<T>): Right<T>;
            function maybeToEither<T>(
                maybe: Just<T> | Just<null>,
            ): Right<T> | Left<string> {
                return maybe.isNothing()
                    ? Left.of('no value')
                    : Right.of(maybe.flatten());
            }

            const a = Identity.of(Just.of('value')).sequence(Just.of);
            expect(maybeToEither(a)).toEqual(
                Identity.of(Just.of('value'))
                    .map(maybeToEither)
                    .sequence(Right.of),
            );
        });
    });
});
