import * as fc from 'fast-check';
import getCompose from '../Compose';
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

        it('Composition', async () => {
            return fc.assert(
                fc.asyncProperty(
                    fc.constant(true),
                    randomApplicative,
                    randomApplicative,
                    async (x, ap1: Pointed<any>, ap2: Pointed<any>) => {
                        const Compose = getCompose(ap1, ap2);
                        expect(
                            await getValue(
                                Testee.of(x).traverse(
                                    (v: any) => Compose.of(v),
                                    (v: any) => Compose.of(v),
                                ),
                            ),
                        ).toEqual(
                            await getValue(
                                Compose(
                                    Testee.of(x)
                                        .traverse(ap1.of, ap1.of)
                                        .map((v: any) =>
                                            v.traverse(ap2.of, ap2.of),
                                        ),
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
