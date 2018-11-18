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
    public traverse<A>(
        {},
        fn: (v: T) => Applicative<A>,
    ): Applicative<Identity<A>> {
        return fn(this.value).map(Identity.of);
    }
    public sequence(
        this: Identity<Applicative<T>>,
        {},
    ): Applicative<Identity<T>> {
        return this.value.map(Identity.of);
    }
}

export default Identity;
