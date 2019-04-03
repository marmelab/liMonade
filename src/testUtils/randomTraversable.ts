import * as fc from 'fast-check';

// import Either from '../Either';
// import Identity from '../Identity';
import List from '../List';
// import Maybe from '../Maybe';

export default fc.oneof(
    // fc.constant(Either),
    // @ts-ignore
    // fc.constant(Identity),
    fc.constant(List),
    // fc.constant(Maybe),
);
