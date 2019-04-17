import { Category, InferCategory } from './types';

export type nothing = undefined | null;

export class Maybe<Value> implements Category<Value, 'Maybe'> {
    public static of<Value>(value: Value): Maybe<Value> {
        return new Maybe(value);
    }
    public static lift<A, B>(
        fn: (v: A) => B,
    ): (v: A) => Maybe<B> | Maybe<never> {
        return v => new Maybe(fn(v));
    }
    public readonly name = 'Maybe';
    public readonly V: Value; // Tag to allow typecript to properly infer Value type
    public readonly value: Value;
    constructor(value: Value) {
        this.value = value;
    }
    public isNothing(): this is Maybe<nothing> {
        return this.value === null || typeof this.value === 'undefined';
    }
    public map<A, B>(this: Maybe<A>, fn: (v: A) => B): Maybe<B>;
    public map<A, B>(this: Maybe<nothing>, fn: (v: A) => B): Maybe<nothing>;
    public map<A, B>(
        this: Maybe<A>,
        fn: ((v: A) => B),
    ): Maybe<B> | Maybe<nothing> {
        return this.isNothing() ? this : new Maybe(fn(this.value));
    }
    public flatten(): Value {
        return this.value;
    }
    public chain<A, B>(this: Maybe<A>, fn: (v: A) => Maybe<B>): Maybe<B>;
    public chain<A, B>(
        this: Maybe<nothing>,
        fn: (v: A) => Maybe<B>,
    ): Maybe<nothing>;
    public chain<A, B>(
        this: Maybe<A | nothing>,
        fn: (v: A) => Maybe<B>,
    ): Maybe<B | nothing> {
        return this.isNothing() ? this : this.map(fn).flatten();
    }
    public ap<A, B>(this: Maybe<(v: A) => B>, other: Maybe<A>): Maybe<B>;
    public ap<A, B>(
        this: Maybe<nothing>,
        other: Maybe<A> | Maybe<nothing>,
    ): Maybe<nothing>;
    public ap<A, B>(
        this: Maybe<(v: A) => B> | Maybe<nothing>,
        other: Maybe<nothing>,
    ): Maybe<nothing>;
    public ap<A, B>(
        this: Maybe<(v: A) => B> | Maybe<nothing>,
        other: Maybe<A> | Maybe<nothing>,
    ): Maybe<B> | Maybe<nothing> {
        if (this.isNothing()) {
            return this;
        }

        if (other.isNothing()) {
            return other;
        }
        return this.map(fn => fn(other.flatten()));
    }
    public getOrElse<A>(_: A): Value {
        return this.value;
    }
    public traverse<A, B, Name>(
        this: Maybe<A>,
        fn: (v: A) => Category<B, Name>,
        of: (v: Maybe<nothing>) => Category<Maybe<nothing>, Name>,
    ): InferCategory<Maybe<B>, Name>;
    public traverse<A, B, Name>(
        this: Maybe<nothing>,
        fn: (v: A) => Category<B, Name>,
        of: (v: Maybe<nothing>) => Category<Maybe<nothing>, Name>,
    ): InferCategory<Maybe<nothing>, Name>;
    public traverse<A, B, Name>(
        this: Maybe<A> | Maybe<nothing>,
        fn: (v: A) => Category<B, Name>,
        of: (v: Maybe<nothing>) => Category<Maybe<nothing>, Name>,
    ): InferCategory<Maybe<B>, Name> | InferCategory<Maybe<nothing>, Name> {
        return this.isNothing()
            ? of(this)
            : (fn(this.value) as InferCategory<A, Name>).map(Maybe.of);
    }
    public sequence<A, Name>(
        this: Maybe<Category<A, Name>>,
        of: (v: any) => any,
    ): InferCategory<Maybe<A>, Name>;
    public sequence<A, Name>(
        this: Maybe<nothing>,
        of: (v: any) => Category<any, Name>,
    ): InferCategory<Maybe<nothing>, Name>;
    public sequence<A, Name>(
        this: Maybe<Category<A, Name>> | Maybe<nothing>,
        of: (v: any) => Category<Maybe<any>, Name>,
    ): InferCategory<Maybe<A>, Name> | InferCategory<Maybe<nothing>, Name> {
        return this.isNothing()
            ? of(this)
            : (this.value as InferCategory<A, Name>).map(Maybe.of);
    }
}

export type MaybeType<Value> = Maybe<Value>;

const MaybeExport = <Value>(value: Value) => new Maybe(value);
MaybeExport.of = Maybe.of;
MaybeExport.lift = Maybe.lift;

export default MaybeExport;
