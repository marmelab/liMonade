import { Applicative, Monad, Traversable } from './types';

class Identity<Value>
    implements Traversable<Value, 'Identity'>, Monad<Value, 'Identity'> {
    public static of<X>(value: X): Identity<X> {
        return new Identity(value);
    }
    public static lift<A, B>(fn: (v: A) => B): (v: A) => Identity<B> {
        return v => new Identity(fn(v));
    }
    public readonly name: 'Identity';
    public readonly kind: 'Identity';
    private readonly value: Value;
    constructor(value: Value) {
        this.value = value;
        this.name = 'Identity';
    }
    public map<A, B>(this: Identity<A>, fn: (v: A) => B) {
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
    public traverse<A, K, N>(
        {},
        fn: (v: Value) => Applicative<A, K, N>,
    ): Applicative<Identity<A>, K, N> {
        return fn(this.value).map(Identity.of);
    }
    public sequence<A, K, N>(this: Identity<Applicative<A, K, N>>, of: {}) {
        return this.traverse(of, v => v);
    }
}

export default Identity;
