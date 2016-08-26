'use strict';

let BoardModule = require('../lib/Board');

let INPUT        = BoardModule.INPUT,
    OUTPUT       = BoardModule.OUTPUT,
    HIGH         = BoardModule.HIGH,
    LOW          = BoardModule.LOW,
    DEFAULT      = BoardModule.DEFAULT,
    EXTERNAL     = BoardModule.EXTERNAL,
    INTERNAL     = BoardModule.INTERNAL,
    Board        = BoardModule.Board;

describe('Board.pinMode(pin: number, mode: string)', () => {
    let b = new Board('123.456.1.789');

    it('The "pin" param must be a number', () => {
        let pinError = 'The param "pin" must be a number';

        expect(() => { b.pinMode() }).toThrowError(pinError);
        expect(() => { b.pinMode(null, INPUT) }).toThrowError(pinError);
        expect(() => { b.pinMode('text', INPUT) }).toThrowError(pinError);
        expect(() => { b.pinMode(/text/, INPUT) }).toThrowError(pinError);
        expect(() => { b.pinMode(true, INPUT) }).toThrowError(pinError);
        expect(() => { b.pinMode(13, INPUT) }).not.toThrow();
    });

    it('The "mode" param must be INPUT or OUTPUT', () => {
        let modeError = /^Invalid value of param "mode": .+/;

        expect(() => { b.pinMode(13) }).toThrowError(modeError);
        expect(() => { b.pinMode(13, null) }).toThrowError(modeError);
        expect(() => { b.pinMode(13, 'test') }).toThrowError(modeError);
        expect(() => { b.pinMode(13, /text/) }).toThrowError(modeError);
        expect(() => { b.pinMode(13, true) }).toThrowError(modeError);
        expect(() => { b.pinMode(13, 1) }).toThrowError(modeError);
        expect(() => { b.pinMode(13, INPUT) }).not.toThrow();
        expect(() => { b.pinMode(13, OUTPUT) }).not.toThrow();
    });
});

describe('Board.digitalRead(pin: number)', () => {
    let b = new Board('123.456.1.789');

    it('The "pin" param must be a number', () => {
        let pinError = 'The param "pin" must be a number';

        expect(() => { b.digitalRead('text') }).toThrowError(pinError);
        expect(() => { b.digitalRead(/text/) }).toThrowError(pinError);
        expect(() => { b.digitalRead(true) }).toThrowError(pinError);
        expect(() => { b.digitalRead(13) }).not.toThrow();
    });

    it('The promise callback success', (done) => {
        b.pinMode(13, INPUT);

        b.digitalRead(13)
            .then((level) => {
                expect(level).toBe(LOW);
                done();
            });
    });
});
