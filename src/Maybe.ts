import { Applicative, Monad } from './types/Applicative';

type nothing = undefined | null;

export class Just<T>
    implements Applicative<T, 'Maybe', 'Just'>, Monad<T, 'Maybe', 'Just'> {
    public static of<A>(value: A): Just<A> {
        return new Just(value);
    }
    public readonly value: T;
    public readonly kind: 'Maybe';
    public readonly name: 'Just';
    constructor(value: T) {
        this.value = value;
    }
    public isNothing(): this is Just<T & nothing> {
        return this.value === null || typeof this.value === 'undefined';
    }
    public isJust(): this is Applicative<NonNullable<T>, 'Maybe', 'Just'> {
        return this.value !== null && typeof this.value !== 'undefined';
    }
    public map<A>(this: Just<T>, fn: (v: T) => A): Just<A>;
    public map<A>(
        this: Just<T & null | T & undefined>,
        fn: (v: T) => A,
    ): Nothing;
    public map<A>(
        this: Just<T> | Just<T & null | T & undefined>,
        fn: (v: T) => A,
    ): Just<A> | Nothing {
        return this.isNothing() ? new Nothing() : new Just(fn(this.value));
    }
    public flatten(): T {
        return this.value;
    }
    public chain<A>(this: Just<NonNullable<T>>, fn: (v: T) => Just<A>): Just<A>;
    public chain<A>(this: Just<NonNullable<T>>, fn: (v: T) => Nothing): Nothing;
    public chain<A>(
        this: Just<T & nothing>,
        fn: (v: T) => Nothing | Just<NonNullable<A>>,
    ): Nothing;
    public chain<A>(fn: (v: T) => Just<A> | Nothing): Just<A> | Nothing {
        return this.isNothing() ? new Nothing() : this.map(fn).flatten();
    }
    public ap<A, B>(this: Just<(v: A) => B & T>, other: Just<A>): Just<B>;
    public ap<A, B>(this: Just<(v: A) => B & T>, other: Nothing): Nothing;
    public ap<A, B>(this: Just<nothing & T>, other: Just<A> | Nothing): Nothing;
    public ap<A, B>(
        this: Just<(v: A) => B & T> | Just<nothing & T>,
        other: Just<A> | Nothing,
    ): Just<B> | Nothing {
        return this.isNothing() || other.isNothing()
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

export class Nothing
    implements
        Applicative<never, 'Maybe', 'Nothing'>,
        Monad<never, 'Maybe', 'Nothing'> {
    public static of(_?: any) {
        return new Nothing();
    }
    public readonly value: never;
    public readonly kind: 'Maybe';
    public readonly name: 'Nothing';
    public isNothing(): this is Nothing {
        return true;
    }
    public isJust(): this is Just<NonNullable<any>> {
        return false;
    }
    public map({}): Nothing {
        return this;
    }
    public flatten(): Nothing {
        return this;
    }
    public chain({}): Nothing {
        return this;
    }
    public ap({}): Nothing {
        return this;
    }
}
