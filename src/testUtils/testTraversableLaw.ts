import createCompose from '../Compose';
import Either, { Left, Right } from '../Either';
import Identity, { IdentityType } from '../Identity';
import Maybe, { MaybeType } from '../Maybe';
import { Applicative, Traversable } from '../types';

interface TraversableConstructor<Name> {
    of<T>(v: T): Traversable<T, Name>;
}

export const testTraversableLaw = <Name>(
    Testee: TraversableConstructor<Name>,
    getValue: (v: any) => any = v => v,
) => {
    describe('Traversable Law', () => {
        it('Identity', async () => {
            expect(
                await getValue(
                    Testee.of('value')
                        .map(Identity.of)
                        .sequence(Identity.of),
                ),
            ).toEqual(await getValue(Identity.of(Testee.of('value'))));
        });

        it('Composition', async () => {
            const Compose = createCompose(Either, Testee);
            expect(
                await getValue(
                    Identity.of(Either.of(Testee.of(true)))
                        .map(v => new Compose(v))
                        .sequence(Compose.of),
                ),
            ).toEqual(
                await getValue(
                    new Compose(
                        Identity.of(Either.of(Testee.of(true)))
                            .sequence(Either.of)
                            .map((v: IdentityType<Right<{}>>) =>
                                v.sequence(Testee.of),
                            ),
                    ),
                ),
            );
        });

        it('Naturality', async () => {
            function maybeToEither<T>(
                maybe: Applicative<null, 'Maybe'>,
            ): Left<Error>;
            function maybeToEither<T>(maybe: MaybeType<T>): Right<T>;
            function maybeToEither<T>(
                maybe: MaybeType<T> | MaybeType<null>,
            ): Right<T> | Left<Error> {
                return maybe.isNothing()
                    ? Either.Left(new Error('no value'))
                    : Either.of(maybe.flatten());
            }

            const a = Testee.of(Maybe.of('value')).sequence(
                Maybe.of,
            ) as MaybeType<Traversable<string, Name>>;
            expect(await getValue(maybeToEither(a))).toEqual(
                await getValue(
                    Testee.of(Maybe.of('value'))
                        .map(maybeToEither)
                        .sequence(Either.of),
                ),
            );
        });
    });
};
