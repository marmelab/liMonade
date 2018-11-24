export class Just<T> {
    public static of<A>(value: A): Just<A> {
        return new Just(value);
    }
    public readonly value: T;
    constructor(value: T) {
        this.value = value;
    }
    public isNothing(): this is Just<null | undefined> {
        return this.value === null || typeof this.value === 'undefined';
    }
    public isJust(): this is Just<{}> {
        return this.value !== null && typeof this.value !== 'undefined';
    }
    public map<A>(this: Just<T>, fn: (v: T) => A): Just<A>;
    public map<A>(this: Just<null | undefined>, fn: (v: T) => A): Nothing;
    public map<A>(
        this: Just<T> | Just<null | undefined>,
        fn: (v: T) => A,
    ): Just<A> | Nothing {
        return this.isNothing() ? new Nothing() : new Just(fn(this.value));
    }
    public flatten(): T {
        return this.value;
    }
    public chain<A>(this: Just<T>, fn: (v: T) => Just<A>): Just<A>;
    public chain<A>(this: Just<T>, fn: (v: T) => Nothing): Nothing;
    public chain<A>(
        this: Just<null | undefined>,
        fn: (v: T) => Nothing | Just<A>,
    ): Nothing;
    public chain<A>(
        this: Just<T> | Just<null | undefined>,
        fn: (v: T) => Just<A> | Nothing,
    ): Just<A> | Nothing {
        return this.isNothing() ? new Nothing() : this.map(fn).flatten();
    }
    public ap<A, B>(this: Just<(v: A) => B>, other: Just<A>): Just<B>;
    public ap<A, B>(
        this: Just<(v: A) => B> | Just<null | undefined>,
        other: Nothing,
    ): Nothing;
    public ap<A, B>(this: Just<null | undefined>, other: Just<A>): Nothing;
    public ap<A, B>(
        this: Just<(v: A) => B> | Just<null | undefined>,
        other: Just<A> | Nothing,
    ): Just<B> | Nothing {
        return this.isNothing() || !other.isJust()
            ? new Nothing()
            : this.map(fn => fn(other.flatten()));
    }
    public getOrElse<A>(this: Just<T>, value: A): T;
    public getOrElse<A>(this: Just<null | undefined>, value: A): A;
    public getOrElse<A>(
        this: Just<T> | Just<null | undefined>,
        value: A,
    ): A | T {
        return this.isNothing() ? value : this.value;
    }
}

export class Nothing {
    public static of(_?: any): Nothing {
        return new Nothing();
    }
    public isNothing(): this is Just<null | undefined> {
        return true;
    }
    public isJust(): this is Just<{}> {
        return false;
    }
    public map({}): Nothing {
        return this;
    }
    public flatten() {
        return this;
    }
    public chain({}): Nothing {
        return this;
    }
    public ap({}): Nothing {
        return this;
    }
}
