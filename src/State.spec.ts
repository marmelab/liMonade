import List from './List';
import State from './State';
import { testApplicativeLaw } from './testUtils/testApplicativeLaw';
import { testFunctorLaw } from './testUtils/testFunctorLaw';
import { testMonadLaw } from './testUtils/testMonadLaw';

describe('IO', () => {
    testFunctorLaw(State);
    testMonadLaw(State);
    testApplicativeLaw(State);

    it('of should put value in value and state in state', () => {
        const state = State.of('value');
        expect(state.runState('state')).toEqual({
            value: 'value',
            state: 'state',
        });
    });

    it('getState should set the state and value to the given state', () => {
        const state = State.of(5);

        expect(state.chain(State.getState).runState(10)).toEqual({
            state: 10,
            value: 10,
        });
    });

    it('save should save the value in state and clear the value', () => {
        const state = State.of(5);

        expect(state.chain(State.save).runState(10)).toEqual({
            state: 5,
            value: undefined,
        });
    });

    it('update should update the state with the given function', () => {
        expect(State.update((v: number) => v - 1).runState(10)).toEqual({
            state: 9,
            value: undefined,
        });
    });

    it('getStateAndUpdate should save the state, and set the value to the state modified by the given function', () => {
        expect(
            State.getStateAndUpdate((v: number) => v - 1).runState(10),
        ).toEqual({
            state: 10,
            value: 9,
        });
    });

    it('list should allow to convert a list of State into a single State of a list', () => {
        const list = List([1, 2, 3]);

        const state = list.traverse(v => State.of(v * 2), State.of);

        expect(state.runState(10)).toEqual({
            value: List([2, 4, 6]),
            state: 10,
        });
    });
});
