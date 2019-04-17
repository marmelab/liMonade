import { Category, InferCategory } from './types';

const swap = <A, Name, Value>(fn: (v: Value) => Category<A, Name>) => (
    traversable: Category<List<A>, Name>,
    value: Value,
) => {
    return (fn(value) as any)
        .map((v: A) => (w: List<A>) => {
            return w.concat(v);
        })
        .ap(traversable);
};

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
    public readonly name = 'List';
    public readonly V: Value; // Tag to allow typecript to properly infer Value type
    public readonly Value: Value;
    private readonly values: ReadonlyArray<Value>;
    constructor(values: ReadonlyArray<Value>) {
        this.values = values;
    }
    public toArray(): ReadonlyArray<Value> {
        return this.values;
    }
    public concat(x: Value): List<Value> {
        return new List([...this.values, x]);
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

    public traverse<A, B, Name>(
        this: List<A>,
        fn: (v: A) => Category<B, Name>,
        of: (v: List<A>) => Category<List<A>, Name>,
    ): InferCategory<List<B>, Name> {
        return this.values.reduce(swap(fn), of(new List([])));
    }

    public sequence<A, Name>(
        this: List<Category<A, Name>>,
        of: any,
    ): InferCategory<List<A>, Name> {
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
