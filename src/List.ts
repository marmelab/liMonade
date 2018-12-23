import { Applicative, Monad, Traversable } from './types';

const swap = <A, N, K, T>(fn: (v: T) => Applicative<A, N, K>) => (
    traversable: Applicative<List<A>, N, K>,
    applicative: T,
) =>
    fn(applicative)
        .map(v => (w: List<A>) => {
            return w.concat(v);
        })
        .ap(traversable);

class List<T> implements Traversable<T, 'List'>, Monad<T, 'List'> {
    public static of<A>(value: A): List<A> {
        return new List([value]);
    }
    public readonly name: 'List';
    public readonly kind: 'List';
    private readonly values: ReadonlyArray<T>;
    constructor(values: ReadonlyArray<T>) {
        this.values = values;
    }
    public toArray(): ReadonlyArray<T> {
        return this.values;
    }
    public concat(x: T): List<T> {
        return new List(this.values.concat(x));
    }

    public map<A>(fn: (v: T) => A): List<A> {
        return new List(this.values.map(v => fn(v)));
    }

    public flatten<A>(this: List<List<A>>): List<A> {
        const values = (this.values as any) as Array<List<A>>;
        return new List(
            values.reduce(
                (acc: ReadonlyArray<A>, v: List<A>) => [...acc, ...v.toArray()],
                [],
            ),
        );
    }

    public chain<A>(fn: (v: T) => List<A>): List<A> {
        return this.map(fn).flatten();
    }

    public ap<A, B>(this: List<(v: A) => B>, other: List<A>): List<B> {
        return this.chain((fn: ((v: A) => B) & T): List<B> => other.map(fn));
    }

    public traverse<A, N, K>(
        of: (v: List<A>) => Applicative<List<A>, N, K>,
        fn: (v: T) => Applicative<A, N, K>,
    ): Applicative<List<A>, N, K> {
        return this.values.reduce(swap(fn), of(new List([])));
    }

    public sequence<A, N, K>(
        this: List<Applicative<A, N, K>>,
        of: (v: List<A>) => Applicative<List<A>, N, K>,
    ) {
        return this.traverse(of, v => v);
    }
}

export default List;
