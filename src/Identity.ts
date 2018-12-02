import { Applicative, Monad, Traversable, Functor } from './types/Applicative';

class Identity<T> implements Traversable<T, 'Identity'>, Monad<T, 'Identity'> {
    public static of<A>(value: A): Identity<A> {
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
    public traverse<N, M, A, B>(
        this: Identity<Applicative<N, A>>,
        {},
        fn: (v: Applicative<N, A>) => Applicative<M, B>,
    ) {
        return fn(this.value).map(Identity.of);
    }
    public sequence<N, A>(this: Identity<Applicative<N, A>>, {}) {
        return this.traverse(
            Identity.of,
            (v: Applicative<N, A>): Applicative<N, A> => v,
        );
    }
}

export default Identity;
