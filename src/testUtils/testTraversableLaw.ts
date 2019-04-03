import * as fc from 'fast-check';
import Compose from '../Compose';
import Either, { Left, Right } from '../Either';
import Identity from '../Identity';
import Maybe, { MaybeType } from '../Maybe';
import { InferCategory } from '../types';
import randomApplicative from './randomApplicative';

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

        it.only('Composition', async () => {
            return fc.assert(
                fc.asyncProperty(fc.constant(true), async x => {
                    console.log(Testee);
                    // console.log(Testee.of(x));
                    console.log(
                        Testee.of(x).traverse(
                            (v: any) => Compose.of(v, Either, Identity),
                            (v: any) => Compose.of(v, Either, Identity),
                        ).value,
                    );
                    console.log(
                        JSON.stringify(
                            Testee.of(x).traverse(
                                (v: any) => Compose.of(v, Either, Identity),
                                (v: any) => Compose.of(v, Either, Identity),
                            ),
                        ),
                    );
                    console.log(
                        JSON.stringify(
                            Testee.of(x)
                                .traverse(Either.of, Either.of)
                                .map((v: any) =>
                                    v.traverse(Identity.of, Identity.of),
                                ),
                        ),
                    );
                    expect(
                        await getValue(
                            Testee.of(x).traverse(
                                (v: any) => Compose.of(v, Either, Identity),
                                (v: any) => Compose.of(v, Either, Identity),
                            ),
                        ),
                    ).toEqual(
                        await getValue(
                            Compose(
                                Testee.of(x)
                                    .traverse(Either.of, Either.of)
                                    .map((v: any) =>
                                        v.traverse(Identity.of, Identity.of),
                                    ),
                            ),
                        ),
                    );
                }),
            );
        });

        it.skip('Composition', async () => {
            return fc.assert(
                fc.asyncProperty(
                    fc.integer(),
                    randomApplicative,
                    randomApplicative,
                    async (x, ap1: any, ap2: any) => {
                        const composeOf = (v: any) => Compose.of(v, ap1, ap2);
                        expect(
                            await getValue(Testee.of(x).sequence(composeOf)),
                        ).toEqual(
                            await getValue(
                                Compose(
                                    Testee.of(x)
                                        .sequence(ap1.of)
                                        .map((v: any) => {
                                            return v.sequence(ap2.of);
                                        }),
                                ),
                            ),
                        );
                    },
                ),
            );
        });

        it('Naturality', async () => {
            fc.assert(
                fc.asyncProperty(fc.anything(), async x => {
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
                    const a = Testee.of(Maybe.of(x)).sequence(
                        Maybe.of,
                    ) as MaybeType<InferCategory<string, Name>>;
                    expect(await getValue(maybeToEither(a))).toEqual(
                        await getValue(
                            Testee.of(Maybe.of(x))
                                .map(maybeToEither)
                                .sequence(Either.of),
                        ),
                    );
                }),
            );
        });
    });
};
