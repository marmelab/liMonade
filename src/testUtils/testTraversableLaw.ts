import createCompose from '../Compose';
import { Left, Right } from '../Either';
import Identity from '../Identity';
import { Just } from '../Maybe';
import { Applicative, Traversable } from '../types';

interface TraversableConstructor<Kind> {
    of<T>(v: T): Traversable<T, Kind>;
}

const expectTraversableEquality = <T, Kind, Name>(
    a1: Applicative<T, Kind, Name>,
    a2: Applicative<T, Kind, Name>,
) => {
    expect(a1).toEqual(a2);
};

export const testTraversableLaw = <Kind>(
    Testee: TraversableConstructor<Kind>,
    expectEquality = expectTraversableEquality,
) => {
    describe('Traversable Law', () => {
        it('Identity', () => {
            expectEquality(
                Testee.of('value')
                    .map(Identity.of)
                    .sequence(Identity.of),
                Identity.of(Testee.of('value')),
            );
        });

        it('Composition', async () => {
            const Compose = createCompose(Right, Testee);
            expectEquality(
                Identity.of(Right.of(Testee.of(true)))
                    .map(v => new Compose(v))
                    .sequence(Compose.of),
                new Compose(
                    Identity.of(Right.of(Testee.of(true)))
                        .sequence(Right.of)
                        .map(v => v.sequence(Testee.of)),
                ),
            );
        });

        it('Naturality', () => {
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
            expectEquality(
                maybeToEither(a),
                Testee.of(Just.of('value'))
                    .map(maybeToEither)
                    .sequence(Right.of),
            );
        });
    });
};
