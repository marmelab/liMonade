import { Category, InferCategory } from './types';

export interface Pointed<Name> {
    of<T>(v: T): InferCategory<T, Name>;
}

// The functor that compose functors.
// It allows to operate on a value nested in two functors `Functor(Functor(value))`.
// Needed to test Traversable law. You will probably never use it.
class Compose<Value, N1, N2> implements Category<Value, 'Compose'> {
    public static of<Value, N1, N2>(
        value: Value,
        F: Pointed<N1>,
        G: Pointed<N2>,
    ): Compose<Value, N1, N2> {
        return new Compose(F.of(G.of(value)));
    }
    public readonly name = 'Compose';
    private readonly value: InferCategory<InferCategory<Value, N2>, N1>;
    constructor(value: InferCategory<InferCategory<Value, N2>, N1>) {
        this.value = value;
    }
    public map<A, B>(
        this: Compose<A, N1, N2>,
        fn: (v: A) => B,
    ): Compose<B, N1, N2> {
        return new Compose(
            this.value.map((x: InferCategory<A, N2>) => x.map(fn)),
        );
    }
    public ap<A, B>(
        this: Compose<(v: A) => B, N1, N2>,
        other: Compose<A, N1, N2>,
    ): Compose<B, N1, N2> {
        return this.map(fn => other.map(fn).value) as Compose<B, N1, N2>;
    }
}

export type IdentityType<Value, N1, N2> = Compose<Value, N1, N2>;

const ComposeExport = <Value, N1, N2>(
    value: InferCategory<InferCategory<Value, N2>, N1>,
) => new Compose<Value, N1, N2>(value);

ComposeExport.of = Compose.of;

export default ComposeExport;
