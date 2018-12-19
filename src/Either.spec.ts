import createCompose from './Compose';
import { Left, Right } from './Either';
import Identity from './Identity';
import { Just } from './Maybe';
import Applicative from './types/Applicative';

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

        describe('Traversable Law', () => {
            it('Identity', async () => {
                await expect(
                    Right.of('value')
                        .map(Identity.of)
                        .sequence(Identity.of),
                ).toEqual(Identity.of(Right.of('value')));
            });

            it('Composition', async () => {
                const Compose = createCompose(Right, Right);
                expect(
                    Identity.of(Right.of(Right.of(true)))
                        .map(v => new Compose(v))
                        .sequence(Compose.of),
                ).toEqual(
                    new Compose(Identity.of(Right.of(Right.of(true)))
                        .sequence(Right.of)
                        .map(v =>
                            v.sequence(Right.of),
                        ) as Right<Right<Identity<boolean>>>),
                );
            });

            it('Naturality', () => {
                function maybeToEither<T>(
                    maybe: Applicative<null, 'Maybe', 'Just' | 'Left'>,
                ): Left<'no value'>;
                function maybeToEither<T>(
                    maybe: Applicative<T, 'Maybe', 'Just'>,
                ): Right<T>;
                function maybeToEither<T>(
                    maybe: Just<T> | Just<null>,
                ): Right<T> | Left<string> {
                    return maybe.isNothing()
                        ? Left.of('no value')
                        : Right.of(maybe.flatten());
                }

                const a = Right.of(Just.of('value')).sequence(Just.of);
                expect(maybeToEither(a)).toEqual(
                    Right.of(Just.of('value'))
                        .map(maybeToEither)
                        .sequence(Right.of),
                );
            });
        });
    });

    describe('Left', () => {
        const increment = (v: number) => v + 1;
        const double = (v: number) => v * 2;
        const identity = (v: any) => v;
        const doubleLeft = (v: number): Left<number> => Left.of(v).map(double);
        const incrementLeft = (v: number) => Left.of(v).map(increment);

        it('.map should compose function', () => {
            expect(
                Left.of(5)
                    .map(double)
                    .map(increment),
            ).toEqual(Left.of(5).map((v: number) => increment(double(v))));
        });

        it('.map should do Left if applying the identity function', () => {
            expect(Right.of('value').map(identity)).toEqual(Right.of('value'));
        });

        it('.chain should be associative', () => {
            expect(
                Left.of(5)
                    .chain(doubleLeft)
                    .chain(incrementLeft),
            ).toEqual(
                Left.of(5).chain((v: number) =>
                    doubleLeft(v).chain(incrementLeft),
                ),
            );
        });

        it('.chain should follow the Right identity law', () => {
            expect(Left.of(5).chain(Left.of)).toEqual(Left.of(5));
        });

        it('.chain should follow the Left identity law', () => {
            expect(Right.of(5).chain(incrementLeft)).toEqual(incrementLeft(5));
        });

        describe('Non Applicative Functor Law', () => {
            it('Non Identity', () => {
                expect(Left.of(identity).ap(Left.of(5))).toEqual(
                    Left.of(identity),
                );
            });

            it('Non Homomorphism', () => {
                expect(Left.of(double).ap(Left.of(5))).toEqual(Left.of(double));
            });

            it('Non Interchange', () => {
                expect(Left.of(double).ap(Left.of(5))).toEqual(Left.of(double));
            });

            it('Non Composition', () => {
                const u = Left.of(() => 'u');
                const v = Left.of((value: string) => value + 'v');
                const w = Left.of('w');
                expect(u.ap(v.ap(w))).toEqual(u);
            });
        });

        describe('Traversable Law', () => {
            it('Identity', async () => {
                await expect(
                    Left.of('value')
                        .map(Identity.of)
                        .sequence(Identity.of),
                ).toEqual(Identity.of(Left.of('value')));
            });

            it('Composition', async () => {
                const Compose = createCompose(Right, Left);
                expect(
                    Identity.of(Right.of(Left.of(true)))
                        .map(v => new Compose(v))
                        .sequence(Compose.of),
                ).toEqual(
                    new Compose(Identity.of(Right.of(Left.of(true)))
                        .sequence(Right.of)
                        .map(v =>
                            v.sequence(Left.of),
                        ) as Right<Left<Identity<boolean>>>),
                );
            });

            it('Naturality', () => {
                function maybeToEither<T>(
                    maybe: Applicative<null, 'Maybe', 'Just' | 'Left'>,
                ): Left<'no value'>;
                function maybeToEither<T>(
                    maybe: Applicative<T, 'Maybe', 'Just'>,
                ): Right<T>;
                function maybeToEither<T>(
                    maybe: Just<T> | Just<null>,
                ): Right<T> | Left<string> {
                    return maybe.isNothing()
                        ? Left.of('no value')
                        : Right.of(maybe.flatten());
                }

                const a = Right.of(Just.of('value')).sequence(Just.of);
                expect(maybeToEither(a)).toEqual(
                    Right.of(Just.of('value'))
                        .map(maybeToEither)
                        .sequence(Right.of),
                );
            });
        });
    });
});
