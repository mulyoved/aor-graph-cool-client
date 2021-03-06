import expect, { createSpy } from 'expect';
import { END } from 'redux-saga';

import queryObserver from './queryObserver';

describe('realtime', () => {
    describe('queryObserver', () => {
        const emitter = createSpy();

        it('calls emitter with END when calling complete', () => {
            queryObserver(emitter).complete();

            expect(emitter).toHaveBeenCalledWith(END);
        });

        it('calls emitter with END when calling error', () => {
            queryObserver(emitter).error();

            expect(emitter).toHaveBeenCalledWith(END);
        });

        it('calls emitter with apolloQueryResult when calling next', () => {
            const expected = 'apollo query result';
            queryObserver(emitter).next(expected);

            expect(emitter).toHaveBeenCalledWith(expected);
        });
    });
});
