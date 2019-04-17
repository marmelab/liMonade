import { ComposeType } from './Compose';
import { EitherType } from './Either';
import { IdentityType } from './Identity';
import { IOType } from './IO';
import { ListType } from './List';
import { MaybeType } from './Maybe';
import { ReaderType } from './Reader';
import { StateType } from './State';
import { TaskType } from './Task';
import { WriterType } from './Writer';

export type InferCategory<Value, Name> = Name extends 'Either'
    ? EitherType<Value, 'Right' | 'Left'>
    : Name extends 'Identity'
    ? IdentityType<Value>
    : Name extends 'IO'
    ? IOType<Value>
    : Name extends 'List'
    ? ListType<Value>
    : Name extends 'Maybe'
    ? MaybeType<Value>
    : Name extends 'Reader'
    ? ReaderType<Value, any>
    : Name extends 'State'
    ? StateType<Value, any>
    : Name extends 'Task'
    ? TaskType<Value>
    : Name extends 'Writer'
    ? WriterType<Value>
    : Name extends 'Compose'
    ? ComposeType<Value, any, any>
    : any;

export type InferCategoryValue<CategoryClass> = CategoryClass extends Category<
    infer Value,
    any
>
    ? Value
    : any;

export interface Category<Value, Name> {
    readonly name: Name;
    // We need to have Value used in a Category property for typescript inferrence to work properly
    readonly V: Value;
}
