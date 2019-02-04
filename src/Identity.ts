import { Category, InferCategory } from './types';

class Identity<Value> implements Category<Value, 'Identity'> {
    public static of<Value>(value: Value): Identity<Value> {
        return new Identity(value);
    }
    public static lift<A, B>(fn: (v: A) => B): (v: A) => Identity<B> {
        return v => new Identity(fn(v));
    }
    public readonly name: 'Identity';
    private readonly value: Value;
    constructor(value: Value) {
        this.value = value;
        this.name = 'Identity';
    }
    public map<A, B>(this: Identity<A>, fn: (v: A) => B): Identity<B> {
        return new Identity(fn(this.value));
    }
    public flatten<A>(this: Identity<Identity<A>>): Identity<A> {
        return new Identity(this.value.value);
    }
    public chain<A>(fn: ((v: Value) => Identity<A>)): Identity<A> {
        return this.map(fn).flatten();
    }
    public ap<A, B>(
        this: Identity<(v: A) => B>,
        other: Identity<A>,
    ): Identity<B> {
        return this.chain(fn => other.map(fn));
    }
    public traverse<A, B, N>(
        this: Identity<A>,
        fn: (v: A) => Category<B, N>,
        _: (v: any) => any,
    ): InferCategory<Identity<B>, N> {
        return (fn(this.value) as InferCategory<B, N>).map(Identity.of);
    }
    public sequence<A, N>(
        this: Identity<Category<A, N>>,
        of: (v: any) => any,
    ): InferCategory<Identity<A>, N> {
        return this.traverse((v: Category<A, N>) => v, of);
    }
}

export type IdentityType<Value> = Identity<Value>;

export default {
    of: Identity.of,
    lift: Identity.lift,
};
