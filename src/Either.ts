export class Right<T> {
    public static of<A>(value: A): Right<A> {
        return new Right(value);
    }
    public readonly value: T;
    constructor(value: T) {
        this.value = value;
    }
    public map<A>(fn: (v: T) => A): Right<A> {
        return new Right(fn(this.value));
    }
    public flatten() {
        return this.value;
    }
    public chain<A>(fn: (v: T) => Right<A>): Right<A>;
    public chain<A>(fn: (v: T) => Left<A>): Left<A>;
    public chain<A>(fn: (v: T) => Right<A> | Left<A>): Right<A> | Left<A> {
        return this.map(fn).flatten();
    }
    public ap<A, B>(this: Right<(v: A) => B>, other: Right<A>): Right<B> {
        return this.map(fn => fn(other.flatten()));
    }
    public catch(): Right<T> {
        return this;
    }
}

export class Left<T> {
    public static of<A>(value: A): Left<A> {
        return new Left(value);
    }
    public readonly value: T;
    constructor(value: T) {
        this.value = value;
    }
    public map({}): Left<T> {
        return this;
    }
    public flatten() {
        return this.value;
    }
    public chain({}): Left<T> {
        return this;
    }
    public ap({}): Left<T> {
        return this;
    }
    public catch(): Right<T> {
        return Right.of(this.value);
    }
}
