import { Category, InferCategory } from './types';

const swap = <A, N, T>(fn: (v: T) => Category<A, N>) => (
    traversable: Category<List<A>, N>,
    applicative: T,
) =>
    (fn(applicative) as InferCategory<A, N>)
        .map((v: A) => (w: List<A>) => {
            return w.concat(v);
        })
        .ap(traversable);

export class List<Value> implements Category<Value, 'List'> {
    public static of<Value>(value: Value): List<Value> {
        return new List([value]);
    }
    public static lift<A, B>(fn: (v: A) => B): (v: A) => List<B> {
        return v => List.of(fn(v));
    }
    public static fromArray<Value>(value: Value[]): List<Value> {
        return new List(value);
    }
    public readonly name: 'List';
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

    public traverse<A, B, N>(
        this: List<A>,
        fn: (v: A) => Category<B, N>,
        of: (v: List<A>) => Category<List<A>, N>,
    ): InferCategory<List<B>, N> {
        return this.values.reduce(swap(fn), of(new List([])));
    }

    public sequence<A, N>(
        this: List<Category<A, N>>,
        of: any,
    ): InferCategory<List<A>, N> {
        return this.traverse((v: any) => v, of);
    }
}

export type ListType<Value> = List<Value>;

export type IdentityType<Value> = List<Value>;

const ListExport = <Value>(value: Value[]) => new List(value);
ListExport.of = List.of;
ListExport.lift = List.lift;
ListExport.fromArray = List.fromArray;

export default ListExport;
