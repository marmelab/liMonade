const isNothing = (value: any): value is null =>
    value === null || typeof value === 'undefined';

class Maybe<T> {
    public static some<T>(value: T) {
        if (!value) {
            throw Error('Provided value must not be empty');
        }
        return new Maybe(value);
    }
    public static of<T>(value: T) {
        return Maybe.some(value);
    }

    public static none<T>() {
        return new Maybe<T>(null);
    }

    public static fromValue<T>(value: T) {
        return value ? Maybe.some(value) : Maybe.none<T>();
    }
    private constructor(private value: T | null) {}

    public getOrElse(defaultValue: T) {
        return this.value === null ? defaultValue : this.value;
    }
    public map<A>(f: (wrapped: T) => A): Maybe<A> {
        if (isNothing(this.value)) {
            return Maybe.none<A>();
        }
        return Maybe.some(f(this.value));
    }
    public chain<A>(f: (wrapped: T) => Maybe<A>): Maybe<A> {
        if (isNothing(this.value)) {
            return Maybe.none<A>();
        }
        return f(this.value);
    }
    public ap<A, B>(this: Maybe<(v: A) => B>, other: Maybe<A>): Maybe<B> {
        if (isNothing(this.value)) {
            return Maybe.none<B>();
        }
        return this.chain(fn => other.map(fn));
    }
}

export default Maybe;
