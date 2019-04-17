import * as fc from 'fast-check';

import Either from '../Either';
import Identity from '../Identity';
import IO from '../IO';
import List from '../List';
import Maybe from '../Maybe';
import Reader from '../Reader';
import State from '../State';
import Task from '../Task';
import Writer from '../Writer';

// @todo add IO, Reader, State and Task once I can test their value
export default fc.oneof(
    fc.constant(Either),
    // @ts-ignore
    fc.constant(Identity),
    fc.constant(IO),
    fc.constant(List),
    fc.constant(Maybe),
    fc.constant(Reader),
    fc.constant(State),
    fc.constant(Task),
    fc.constant(Writer),
);
