import Applicative from './types/Applicative';

class Identity<T> {
    public static of<A>(value: A): Identity<A> {
        return new Identity(value);
    }
    public readonly name: 'Identity';
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
    public traverse<A, B>(
        this: Identity<Applicative<A>>,
        {},
        fn: (v: Applicative<A>) => Applicative<B>,
    ): Applicative<Identity<B>> {
        return fn(this.value).map(Identity.of);
    }
    public sequence<A>(
        this: Identity<Applicative<A>>,
        of: (v: A) => Applicative<A>,
    ): Applicative<Identity<A>> {
        return this.traverse(of, v => v);
    }
}

export default Identity;
