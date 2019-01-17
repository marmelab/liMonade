import createCompose from '../Compose';
import Either, { Left, Right } from '../Either';
import Identity from '../Identity';
import Maybe from '../Maybe';
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
                            .map((v: Identity<Right<{}>>) =>
                                v.sequence(Testee.of),
                            ),
                    ),
                ),
            );
        });

        it('Naturality', async () => {
            function maybeToEither<T>(
                maybe: Applicative<null, 'Maybe'>,
            ): Left<'no value'>;
            function maybeToEither<T>(maybe: Applicative<T, 'Maybe'>): Right<T>;
            function maybeToEither<T>(
                maybe: Maybe<T> | Maybe<null>,
            ): Right<T> | Left<string> {
                return maybe.isNothing()
                    ? Either.ofError('no value')
                    : Either.of(maybe.flatten());
            }

            const a = Testee.of(Maybe.of('value')).sequence(Maybe.of) as Maybe<
                Traversable<string, Name>
            >;
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
