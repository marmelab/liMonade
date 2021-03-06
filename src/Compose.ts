import { Category, InferCategory } from './types';

export interface Pointed<Name> {
    of<T>(v: T): InferCategory<T, Name>;
}

// The functor that compose functors.
// It allows to operate on a value nested in two functors `Functor(Functor(value))`.
// Needed to test Traversable law. You will probably never use it.
class Compose<Value, OuterName, InnerName>
    implements Category<Value, 'Compose'> {
    public static of<Value, OuterName, InnerName>(
        value: Value,
        F: Pointed<OuterName>,
        G: Pointed<InnerName>,
    ): Compose<Value, OuterName, InnerName> {
        return new Compose(F.of(G.of(value)));
    }
    public static lift<A, B, OuterName, InnerName>(
        fn: (v: A) => B,
        F: Pointed<OuterName>,
        G: Pointed<InnerName>,
    ): (v: A) => Compose<B, OuterName, InnerName> {
        return v => Compose.of(fn(v), F, G);
    }
    public readonly name = 'Compose';
    public readonly V: Value; // Tag to allow typecript to properly infer Value type
    private readonly value: InferCategory<
        InferCategory<Value, InnerName>,
        OuterName
    >;
    constructor(
        value: InferCategory<InferCategory<Value, InnerName>, OuterName>,
    ) {
        this.value = value;
    }
    public map<A, B>(
        this: Compose<A, OuterName, InnerName>,
        fn: (v: A) => B,
    ): Compose<B, OuterName, InnerName> {
        return new Compose(
            (this.value as any).map((x: any) => {
                return x.map(fn);
            }),
        );
    }
    public ap<A, B>(
        this: Compose<(v: A) => B, OuterName, InnerName>,
        other: Compose<A, OuterName, InnerName>,
    ): Compose<B, OuterName, InnerName> {
        return new Compose(
            (other.value as any)
                .map((u: any) => (y: any) => y.ap(u))
                .ap(this.value),
        ) as Compose<B, OuterName, InnerName>;
    }
}

export type ComposeType<Value, OuterName, InnerName> = Compose<
    Value,
    OuterName,
    InnerName
>;

export default <Value, OuterName, InnerName>(
    F: Pointed<OuterName>,
    G: Pointed<InnerName>,
) => {
    const ComposeExport = (
        value: InferCategory<InferCategory<Value, InnerName>, OuterName>,
    ) => new Compose<Value, OuterName, InnerName>(value);

    ComposeExport.of = (v: Value) => Compose.of(v, F, G);
    ComposeExport.lift = <A, B>(fn: (v: A) => B) => Compose.lift(fn, F, G);

    return ComposeExport;
};
