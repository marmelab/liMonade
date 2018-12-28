import createCompose from '../Compose';
import { Left, Right } from '../Either';
import Identity from '../Identity';
import { Just } from '../Maybe';
import { Applicative, Traversable } from '../types';

interface TraversableConstructor<Kind> {
    of<T>(v: T): Traversable<T, Kind>;
}

export const testTraversableLaw = <Kind>(
    Testee: TraversableConstructor<Kind>,
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
            const Compose = createCompose(Right, Testee);
            expect(
                await getValue(
                    Identity.of(Right.of(Testee.of(true)))
                        .map(v => new Compose(v))
                        .sequence(Compose.of),
                ),
            ).toEqual(
                await getValue(
                    new Compose(
                        Identity.of(Right.of(Testee.of(true)))
                            .sequence(Right.of)
                            .map(v => v.sequence(Testee.of)),
                    ),
                ),
            );
        });

        it('Naturality', async () => {
            function maybeToEither<T>(
                maybe: Applicative<null, 'Maybe', 'Just' | 'Nothing'>,
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

            const a = Testee.of(Just.of('value')).sequence(Just.of) as Just<
                Traversable<string, Kind, Kind>
            >;
            expect(await getValue(maybeToEither(a))).toEqual(
                await getValue(
                    Testee.of(Just.of('value'))
                        .map(maybeToEither)
                        .sequence(Right.of),
                ),
            );
        });
    });
};
