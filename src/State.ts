import { Category } from './types';

class State<Value, Status> implements Category<Value, 'State'> {
    public static of<Value, Status>(value: Value): State<Value, Status> {
        return new State((state: Status) => ({ value, state }));
    }
    public static lift<A, B, C>(fn: (v: A) => B): (v: A) => State<B, C> {
        return v => State.of(fn(v));
    }
    public static getState<A>(): State<A, A> {
        return new State(state => ({ value: state, state }));
    }
    public static save<A>(newState: A): State<undefined, A> {
        return new State((_: any) => ({ value: undefined, state: newState }));
    }
    public static update<A>(f: (v: A) => A): State<undefined, A> {
        return State.getState<A>().chain((state: A) => {
            return State.save(f(state));
        });
    }
    public static getStateAndUpdate<A>(f: (v: A) => A): State<A, any> {
        return State.getState().chain((state: A) => State.of(f(state)));
    }
    public readonly name: 'State';
    public readonly runState: (v: Status) => { value: Value; state: Status };
    constructor(runState: (v: Status) => { value: Value; state: Status }) {
        this.runState = runState;
    }
    public map<A, B>(
        this: State<A, Status>,
        fn: (v: A) => B,
    ): State<B, Status> {
        return new State((state: Status) => {
            const prev = this.runState(state);
            return { value: fn(prev.value), state: prev.state };
        });
    }
    public flatten<A>(this: State<State<A, Status>, Status>): State<A, Status> {
        return new State(state => {
            const prev = this.runState(state);
            return prev.value.runState(prev.state);
        });
    }
    public chain<A, B>(
        this: State<A, Status>,
        fn: ((v: A) => State<B, Status>),
    ): State<B, Status> {
        return this.map(fn).flatten();
    }
    public ap<A, B>(
        this: State<(v: A) => B, Status>,
        other: State<A, Status>,
    ): State<B, Status> {
        return this.chain(fn => other.map(fn));
    }
    public evalState(initState: Status): Value {
        const result = this.runState(initState);
        return result.value;
    }

    public execState(initState: Status): Status {
        const result = this.runState(initState);
        return result.state;
    }
}

export type StateType<Value, Status> = State<Value, Status>;

const StateExport = <Value, Status>(
    runState: (v: Status) => { value: Value; state: Status },
) => new State(runState);

StateExport.of = State.of;
StateExport.lift = State.lift;
StateExport.getState = State.getState;
StateExport.save = State.save;
StateExport.update = State.update;
StateExport.getStateAndUpdate = State.getStateAndUpdate;

export default StateExport;
