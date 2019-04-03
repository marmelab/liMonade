import * as fc from 'fast-check';
import Compose from '../Compose';
import Either, { Left, Right } from '../Either';
import Identity, { IdentityType } from '../Identity';
import Maybe, { MaybeType } from '../Maybe';
import { InferCategory } from '../types';

interface Pointed<Name> {
    of<A>(v: A): InferCategory<A, Name>;
    lift<A, B>(fn: (v: A) => B): (v: A) => InferCategory<B, Name>;
}

export const testTraversableLaw = <Name>(
    Testee: Pointed<Name>,
    getValue: (v: any) => any = v => v,
) => {
    describe('Traversable Law', () => {
        it('Identity', async () =>
            fc.assert(
                fc.asyncProperty(fc.anything(), async x => {
                    expect(
                        await getValue(
                            Testee.of(x)
                                .map(Identity.of)
                                .sequence(Identity.of),
                        ),
                    ).toEqual(await getValue(Identity.of(Testee.of(x))));
                }),
            ));

        it('Composition', async () => {
            expect(
                await getValue(
                    Identity.of(Either.of(Testee.of(true)))
                        .map(v => Compose(v))
                        .sequence(v => Compose.of(v, Either, Testee)),
                ),
            ).toEqual(
                await getValue(
                    Compose(
                        // @ts-ignore
                        Identity.of(Either.of(Testee.of(true)))
                            .sequence(Either.of)
                            .map(
                                (
                                    v: IdentityType<
                                        Right<InferCategory<any, Name>>
                                    >,
                                ) => v.sequence(Testee.of),
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
            const a = Testee.of(Maybe.of('value')).sequence(
                Maybe.of,
            ) as MaybeType<InferCategory<string, Name>>;
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
