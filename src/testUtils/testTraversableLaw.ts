import createCompose from '../Compose';
import Either, { Left, Right } from '../Either';
import Identity, { IdentityType } from '../Identity';
import Maybe, { MaybeType } from '../Maybe';
import { InferCategory } from '../types';

interface Pointed<Name> {
    of<A>(v: A): InferCategory<A, Name>;
}

export const testTraversableLaw = <
    Name extends 'Identity' | 'Maybe' | 'Either' | 'List'
>(
    Testee: Pointed<Name>,
    getValue: (v: any) => any = v => v,
) => {
    describe('Traversable Law', () => {
        it('Identity', async () => {
            expect(
                await getValue(
                    // @ts-ignore
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
                        // @ts-ignore
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
                maybe: InferCategory<null, 'Maybe'>,
            ): Left<Error>;
            function maybeToEither<T>(maybe: MaybeType<T>): Right<T>;
            function maybeToEither<T>(
                maybe: MaybeType<T> | MaybeType<null>,
            ): Right<T> | Left<Error> {
                return maybe.isNothing()
                    ? Either.Left(new Error('no value'))
                    : Either.of(maybe.flatten());
            }
            // @ts-ignore
            const a = Testee.of(Maybe.of('value')).sequence(
                Maybe.of,
            ) as MaybeType<InferCategory<string, Name>>;
            expect(await getValue(maybeToEither(a))).toEqual(
                await getValue(
                    // @ts-ignore
                    Testee.of(Maybe.of('value'))
                        .map(maybeToEither)
                        .sequence(Either.of),
                ),
            );
        });
    });
};
