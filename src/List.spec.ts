import createCompose from './Compose';
import { Left, Right } from './Either';
import Identity from './Identity';
import List from './List';
import { Just } from './Maybe';
import Applicative from './types/Applicative';

describe('List', () => {
    const increment = (v: number) => v + 1;
    const double = (v: number) => v * 2;
    const identity = (v: any) => v;
    const doubleList = (v: number) => List.of(v).map(double);
    const incrementList = (v: number) => List.of(v).map(increment);

    it('.map should compose function', () => {
        expect(
            List.of(5)
                .map(double)
                .map(increment),
        ).toEqual(List.of(5).map(v => increment(double(v))));
    });

    it('.map should do nothing if applying the identity function', () => {
        expect(List.of('value').map(identity)).toEqual(List.of('value'));
    });

    it('.chain should be associative', () => {
        expect(
            List.of(5)
                .chain(doubleList)
                .chain(incrementList),
        ).toEqual(List.of(5).chain(v => doubleList(v).chain(incrementList)));
    });

    it('.chain should follow the Right identity law', () => {
        expect(Identity.of(5).chain(Identity.of)).toEqual(Identity.of(5));
    });

    it('.chain should follow the Left identity law', () => {
        expect(List.of(5).chain(incrementList)).toEqual(incrementList(5));
    });

    describe('Applicative Functor Law', () => {
        it('Identity', () => {
            expect(List.of(identity).ap(List.of(5))).toEqual(List.of(5));
        });

        it('Homomorphism', () => {
            expect(List.of(double).ap(List.of(5))).toEqual(List.of(double(5)));
        });

        it('Interchange', () => {
            expect(List.of(double).ap(List.of(5))).toEqual(
                List.of(5).map(double),
            );
        });

        it('composition', () => {
            const u = List.of(() => 'u');
            const v = List.of((value: string) => value + 'v');
            const w = List.of('w');
            const compose = (f1: (v: any) => any) => (f2: (v: any) => any) => (
                value: any,
            ) => f1(f2(value));
            expect(u.ap(v.ap(w))).toEqual(
                List.of(compose)
                    .ap(u)
                    .ap(v)
                    .ap(w),
            );
        });
    });

    describe('Traversable Law', () => {
        it('Identity', async () => {
            await expect(
                List.of('value')
                    .map(Identity.of)
                    .sequence(Identity.of),
            ).toEqual(Identity.of(List.of('value')));
        });

        it('Composition', async () => {
            const Compose = createCompose(Right, List);
            expect(
                Identity.of(Right.of(List.of(true)))
                    .map(v => new Compose(v))
                    .sequence(Compose.of),
            ).toEqual(
                new Compose(Identity.of(Right.of(List.of(true)))
                    .sequence(Right.of)
                    .map(v =>
                        v.sequence(List.of),
                    ) as Right<List<Identity<boolean>>>),
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

            const a = List.of(Just.of('value')).sequence(Just.of);
            expect(maybeToEither(a)).toEqual(
                List.of(Just.of('value'))
                    .map(maybeToEither)
                    .sequence(Right.of),
            );
        });
    });
});
