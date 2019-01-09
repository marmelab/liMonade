export interface Functor<Value, Kind, Name = Kind> {
    readonly kind: Kind;
    readonly name: Name;
    map<A, B>(
        this: Functor<A, Kind, Name>,
        fn: (value: A) => B,
    ): Functor<B, Kind, Name>;
}

export interface Applicative<Value, Kind, Name = Kind>
    extends Functor<Value, Kind, Name> {
    map<A, B>(
        this: Applicative<A, Kind, Name>,
        fn: (value: A) => B,
    ): Applicative<B, Kind, Name>;
    ap<A, B>(
        this: Applicative<(v: A) => B, Kind, Name>,
        v: Applicative<A, Kind, Name>,
    ): Applicative<B, Kind, Name>;
}

export interface Monad<Value, Kind, Name = Kind>
    extends Functor<Value, Kind, Name> {
    map<A, B>(
        this: Monad<A, Kind, Name>,
        fn: (value: A) => B,
    ): Monad<B, Kind, Name>;
    chain<A>(fn: ((v: Value) => Monad<A, Kind, Name>)): Monad<A, Kind, Name>;
}

export interface Traversable<Value, Kind, Name = Kind>
    extends Applicative<Value, Kind, Name> {
    map<A, B>(
        this: Traversable<A, Kind, Name>,
        fn: (value: A) => B,
    ): Traversable<B, Kind, Name>;
    ap<A, B>(
        this: Traversable<(v: A) => B, Kind, Name>,
        v: Traversable<A, Kind, Name>,
    ): Traversable<B, Kind, Name>;
    traverse<A, K, N = K>(
        {},
        fn: (v: Value) => Applicative<A, K, N>,
    ): Applicative<Traversable<A, Kind, Name>, K, N>;
    sequence<A, K, N = K>({}): Applicative<Traversable<A, Kind, Name>, K, N>;
}
