import { Applicative, Monad, Traversable } from './types';

class Identity<T> implements Traversable<T, 'Identity'>, Monad<T, 'Identity'> {
    public static of<X>(value: X): Identity<X> {
        return new Identity(value);
    }
    public readonly name: 'Identity';
    public readonly kind: 'Identity';
    public readonly value: T;
    constructor(value: T) {
        this.value = value;
        this.name = 'Identity';
    }
    public map<A>(fn: (v: T) => A): Identity<A> {
        return Identity.of(fn(this.value));
    }
    public flatten(): T {
        return this.value;
    }
    public chain<A>(fn: ((v: T) => Identity<A>)): Identity<A> {
        return this.map(fn).flatten();
    }
    public ap<A, B>(
        this: Identity<(v: A) => B>,
        other: Identity<A>,
    ): Identity<B> {
        return this.chain(fn => other.map(fn));
    }
    public traverse<A, N, K>(
        {},
        fn: (v: T) => Applicative<A, N, K>,
    ): Applicative<Identity<A>, N, K> {
        return fn(this.value).map<Identity<A>>(Identity.of);
    }
    public sequence<A, N, K>(this: Identity<Applicative<A, N, K>>, of: {}) {
        return this.traverse(of, v => v);
    }
}

export default Identity;
