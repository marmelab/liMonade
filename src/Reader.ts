import { Applicative, Monad } from './types';

class Reader<Value, Dependencies>
    implements Applicative<Value, 'Reader'>, Monad<Value, 'Reader'> {
    public static of<Value>(value: Value): Reader<Value, any> {
        return new Reader(() => value);
    }
    public static ask<A>(): Reader<A, A> {
        return new Reader(v => v);
    }
    public static lift<A, B>(fn: (v: A) => B): (v: A) => Reader<B, any> {
        return v => Reader.of(fn(v));
    }
    public readonly name: 'Reader';
    public readonly computation: (v: Dependencies) => Value;
    constructor(computation: (v: Dependencies) => Value) {
        this.computation = computation;
    }
    public map<A, B>(
        this: Reader<A, Dependencies>,
        fn: (v: A) => B,
    ): Reader<B, Dependencies> {
        return new Reader((dependencies: Dependencies) =>
            fn(this.computation(dependencies)),
        );
    }
    public flatten<A>(
        this: Reader<Reader<A, Dependencies>, Dependencies>,
    ): Reader<A, Dependencies> {
        return new Reader(dependencies =>
            this.computation(dependencies).computation(dependencies),
        );
    }
    public chain<A, B>(
        this: Reader<A, Dependencies>,
        fn: ((v: A) => Reader<B, Dependencies>),
    ): Reader<B, Dependencies> {
        return this.map(fn).flatten();
    }
    public ap<A, B>(
        this: Reader<(v: A) => B, Dependencies>,
        other: Reader<A, Dependencies>,
    ): Reader<B, Dependencies> {
        return this.chain(fn => other.map(fn));
    }
}

export type ReaderType<Value, Dependencies> = Reader<Value, Dependencies>;

const ReaderExport = <Value, Dependencies>(
    computation: (v: Dependencies) => Value,
) => new Reader(computation);

ReaderExport.of = Reader.of;
ReaderExport.ask = Reader.ask;
ReaderExport.lift = Reader.lift;

export default ReaderExport;
