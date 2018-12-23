export interface Functor<T, Kind, Name = Kind> {
    readonly kind: Kind;
    readonly name: Name;
    map<A>(fn: (value: T) => A): Functor<A, Kind, Name>;
}

export interface Applicative<T, Kind, Name = Kind>
    extends Functor<T, Kind, Name> {
    map<A>(fn: (value: T) => A): Applicative<A, Kind, Name>;
    ap<A, B>(
        this: Applicative<(v: A) => B, Kind, any>,
        v: Applicative<A, Kind, any>,
    ): Applicative<B, Kind, any>;
}

export interface Monad<T, Kind, Name = Kind> extends Functor<T, Kind, Name> {
    map<A>(fn: (value: T) => A): Monad<A, Kind, Name>;
    chain<A>(fn: ((v: T) => Monad<A, Kind, Name>)): Monad<A, Kind, Name>;
}

export interface Traversable<T, Kind, Name = Kind>
    extends Applicative<T, Kind, Name> {
    map<A>(fn: (value: T) => A): Traversable<A, Kind, Name>;
    ap<A, B>(
        this: Traversable<(v: A) => B, Kind, any>,
        v: Traversable<A, Kind, any>,
    ): Traversable<B, Kind, any>;
    traverse<A, N, K = N>(
        {},
        fn: (v: T) => Applicative<A, N, K>,
    ): Applicative<Traversable<A, Kind, Name>, N, K>;
    sequence<A, N, K = N>({}): Applicative<Traversable<A, Kind, Name>, N, K>;
}
