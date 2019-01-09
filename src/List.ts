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

class List<Value> implements Traversable<Value, 'List'>, Monad<Value, 'List'> {
    public static of<Value>(value: Value): List<Value> {
        return new List([value]);
    }
    public static lift<A, B>(fn: (v: A) => B): (v: A) => List<B> {
        return v => List.of(fn(v));
    }
    public readonly name: 'List';
    public readonly kind: 'List';
    private readonly values: ReadonlyArray<Value>;
    constructor(values: ReadonlyArray<Value>) {
        this.values = values;
    }
    public toArray(): ReadonlyArray<Value> {
        return this.values;
    }
    public concat(x: Value): List<Value> {
        return new List(this.values.concat(x));
    }

    public map<A, B>(this: List<A>, fn: (v: A) => B): List<B> {
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

    public chain<A, B>(this: List<A>, fn: (v: A) => List<B>): List<B> {
        return this.map(fn).flatten();
    }

    public ap<A, B>(this: List<(v: A) => B>, other: List<A>): List<B> {
        return this.chain(
            (fn: ((v: A) => B) & Value): List<B> => other.map(fn),
        );
    }

    public traverse<A, B, K, N>(
        this: List<A>,
        of: (v: List<A>) => Applicative<List<A>, K, N>,
        fn: (v: A) => Applicative<B, K, N>,
    ): Applicative<List<B>, K, N> {
        return this.values.reduce(swap(fn), of(new List([])));
    }

    public sequence<A, K, N>(this: List<Applicative<A, K, N>>, of: any) {
        return this.traverse(of, (v: Applicative<A, K, N>) => v);
    }
}

export default List;
