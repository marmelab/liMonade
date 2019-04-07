import { InferCategory } from '../types';

const getComparableValue = async <A>(
    m: InferCategory<A, any> | A,
    result = [] as any[],
): Promise<any> => {
    if (!m) {
        return [...result, m];
    }

    switch (m.name) {
        case 'IO': {
            return getComparableValue(m.execute(), [...result, 'IO']);
        }
        case 'List': {
            return Promise.all(
                m.values.map((v: any) =>
                    getComparableValue(v, [...result, 'List']),
                ),
            );
        }
        case 'Reader': {
            return getComparableValue(m.computation('entry'), [
                ...result,
                'Reader',
            ]);
        }

        case 'State': {
            return getComparableValue(m.evalState('state'), [
                ...result,
                'State',
            ]);
        }

        case 'Task': {
            return getComparableValue(await m.toPromise(), [...result, 'Task']);
        }

        case 'Compose':
        case 'Either':
        case 'Identity':
        case 'Maybe':
        case 'Writer': {
            return getComparableValue(m.value, [...result, m.name]);
        }
        default:
            return [...result, m];
    }
};

export default getComparableValue;
