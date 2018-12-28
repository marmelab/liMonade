import { Applicative, Monad } from './types';

class State<T, S> implements Applicative<T, 'State'>, Monad<T, 'State'> {
    public static of<X, Y>(value: X): State<X, Y> {
        return new State((state: Y) => ({ value, state }));
    }

    public static getState<A>(): State<A, A> {
        return new State(state => ({ value: state, state }));
    }
    public static save<A>(newState: A): State<undefined, A> {
        return new State(({}) => ({ value: undefined, state: newState }));
    }
    public static update<A>(f: (v: A) => A): State<undefined, A> {
        return State.getState<A>().chain((state: A) => {
            return State.save(f(state));
        });
    }
    public static getStateAndUpdate<A>(f: (v: A) => A): State<A, {}> {
        return State.getState().chain((state: A) => State.of(f(state)));
    }
    public readonly name: 'State';
    public readonly kind: 'State';
    public readonly runState: (v: S) => { value: T; state: S };
    constructor(runState: (v: S) => { value: T; state: S }) {
        this.runState = runState;
    }
    public map<A>(fn: (v: T) => A): State<A, S> {
        return new State((state: S) => {
            const prev = this.runState(state);
            return { value: fn(prev.value), state: prev.state };
        });
    }
    public flatten<A>(this: State<State<A, S>, S>): State<A, S> {
        return new State(state => {
            const prev = this.runState(state);
            return prev.value.runState(prev.state);
        });
    }
    public chain<A>(fn: ((v: T) => State<A, S>)): State<A, S> {
        // const t = this.map(fn);
        return this.map(fn).flatten();
    }
    public ap<A, B>(
        this: State<(v: A) => B, S>,
        other: State<A, S>,
    ): State<B, S> {
        return this.chain(fn => other.map(fn));
    }
    public evalState(initState: S): T {
        const result = this.runState(initState);
        return result.value;
    }

    public execState(initState: S): S {
        const result = this.runState(initState);
        return result.state;
    }
}

export default State;
