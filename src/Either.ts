import { Applicative, Monad, Traversable } from './types';

export type Left<Value> = Either<Value, 'Left'>;
export type Right<Value> = Either<Value, 'Right'>;

class Either<Value, Type extends 'Left' | 'Right'>
    implements Traversable<Value, 'Either'>, Monad<Value, 'Either'> {
    public static of<Value>(value: Value): Right<Value>;
    public static of<Value>(value: Value & Error): Left<Error>;
    public static of<Value>(
        value: Value | Value & Error,
    ): Right<Value> | Left<Error> {
        return value instanceof Error
            ? Either.Left(value)
            : Either.Right(value);
    }
    public static lift<A, B>(
        fn: (v: A) => B,
    ): (v: A) => Right<B> | Left<Error> {
        return v => {
            try {
                return Either.of(fn(v));
            } catch (error) {
                return Either.Left(error);
            }
        };
    }
    public static Right<Value>(value: Value): Right<Value> {
        return new Either(value);
    }
    public static Left(error: Error): Left<Error> {
        return new Either(error, 'Left');
    }
    public readonly value: Value;
    public readonly name: 'Either';
    private readonly type: Type;
    constructor(value: Value, type: Type = 'Right' as Type) {
        this.value = value;
        this.type = type;
    }
    public isLeft(): this is Left<Error> {
        return this.type === 'Left';
    }
    public isRight(): this is Right<Value> {
        return this.type === 'Right';
    }
    public catch<A, B>(this: Right<A>, fn: (v: Error) => B): Right<A>;
    public catch<A, B>(this: Left<Error>, fn: (v: Error) => B): Right<B>;
    public catch<A, B>(
        this: Right<A> | Left<Error>,
        fn: (v: Error) => B,
    ): Right<A> | Right<B> {
        return this.isLeft() ? Either.of(fn(this.value)) : this;
    }
    public map<A, B>(this: Right<A>, fn: (v: A) => B): Right<B>;
    public map<A, B>(this: Left<Error>, fn: (v: A) => B): Left<Error>;
    public map<A, B>(
        this: Right<A> | Left<Error>,
        fn: (v: A) => B,
    ): Right<B> | Left<Error> {
        try {
            return this.isLeft() ? this : Either.of(fn(this.value));
        } catch (error) {
            return Either.Left(error);
        }
    }
    public flatten(this: Right<Value>): Value;
    public flatten(this: Left<Error>): Left<Error>;
    public flatten(this: Right<Value> | Left<Error>): Value | Left<Error> {
        return this.isLeft() ? this : this.value;
    }
    public chain<A, B>(this: Right<A>, fn: (v: A) => Right<B>): Right<B>;
    public chain<A, B>(this: Right<A>, fn: (v: A) => Left<Error>): Left<Error>;
    public chain<A, B>(
        this: Left<Error>,
        fn: (v: A) => Left<Error> | Right<B>,
    ): Left<Error>;
    public chain<A, B>(
        this: Right<A> | Left<Error>,
        fn: (v: A) => Right<B> | Left<Error>,
    ): Right<B> | Left<Error> {
        return this.isLeft() ? this : this.map(fn).flatten();
    }
    public ap<A, B>(this: Left<A>, other: Right<B> | Left<Error>): Left<Error>;
    public ap<A, B>(this: Right<(v: A) => B>, other: Right<A>): Right<B>;
    public ap<A, B>(this: Right<(v: A) => B>, other: Left<Error>): Left<Error>;
    public ap<A, B>(
        this: Right<(v: A) => B> | Left<Error>,
        other: Right<A> | Left<Error>,
    ): Right<B> | Left<Error> {
        if (this.isLeft()) {
            return this;
        }
        return other.isLeft() ? other : other.map(this.value);
    }
    public traverse<A, B, N>(
        this: Right<A>,
        fn: (v: A) => Applicative<B, N>,
        of: (v: Left<Error>) => Applicative<Left<Error>, N>,
    ): Applicative<Right<A>, N>;
    public traverse<A, B, N>(
        this: Left<A>,
        fn: (v: A) => Applicative<B, N>,
        of: (v: Left<A>) => Applicative<Left<Error>, N>,
    ): Applicative<Left<A>, N>;
    public traverse<A, B, N>(
        this: Right<A> | Left<Error>,
        fn: (v: A) => Applicative<B, N>,
        of: (v: Left<Error>) => Applicative<Left<Error>, N>,
    ): Applicative<Right<A>, N> {
        return this.isLeft() ? of(this) : fn(this.value).map(Either.of);
    }
    public sequence<A, N>(
        this: Right<Applicative<A, N>>,
        of: (v: any) => any,
    ): Applicative<Right<A>, N>;
    public sequence<A, N>(
        this: Left<Error>,
        of: (v: any) => any,
    ): Applicative<Left<Error>, N>;
    public sequence<A, N>(
        this: Right<Applicative<A, N>> | Left<Error>,
        of: (v: any) => any,
    ): Applicative<Right<A>, N> | Applicative<Left<Error>, N> {
        return this.isLeft() ? of(this) : this.value.map(Either.of);
    }
}

export type EitherType<Value, Type extends 'Left' | 'Right'> = Either<
    Value,
    Type
>;

export default {
    of: Either.of,
    lift: Either.lift,
    Left: Either.Left,
    Right: Either.Right,
};
