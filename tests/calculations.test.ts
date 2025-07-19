import { describe, test, expect, beforeAll } from 'vitest';
import { Ephemeris } from '../src/calculations/ephemeris';
import { Planetary } from '../src/calculations/planetary';

describe('Astronomical Calculations', () => {
    let ephemeris: Ephemeris;
    let planetary: Planetary;

    beforeAll(() => {
        ephemeris = new Ephemeris();
        planetary = new Planetary();
    });

    describe('Ephemeris Calculations', () => {
        test('calculatePosition should return correct position for Sun', () => {
            const date = new Date('2023-10-01T12:00:00Z');
            const body = 'Sun';
            const position = ephemeris.calculatePosition(date, body);
            
            expect(position).toHaveProperty('longitude');
            expect(position).toHaveProperty('latitude');
            expect(typeof position.longitude).toBe('number');
            expect(typeof position.latitude).toBe('number');
            expect(position.longitude).toBeGreaterThanOrEqual(0);
            expect(position.longitude).toBeLessThan(360);
        });

        test('calculatePosition should return correct position for Moon', () => {
            const date = new Date('2023-10-01T12:00:00Z');
            const body = 'Moon';
            const position = ephemeris.calculatePosition(date, body);
            
            expect(position).toHaveProperty('longitude');
            expect(position).toHaveProperty('latitude');
            expect(typeof position.longitude).toBe('number');
            expect(typeof position.latitude).toBe('number');
        });

        test('calculatePosition should handle unknown celestial bodies', () => {
            const date = new Date('2023-10-01T12:00:00Z');
            const body = 'UnknownBody';
            const position = ephemeris.calculatePosition(date, body);
            
            expect(position).toHaveProperty('longitude');
            expect(position).toHaveProperty('latitude');
        });
    });

    describe('Planetary Calculations', () => {
        test('calculateOrbit should return correct orbital parameters for Venus', () => {
            const planet = 'Venus';
            const date = new Date('2023-10-01T12:00:00Z');
            const orbit = planetary.calculateOrbit(planet, date);
            
            expect(orbit).toHaveProperty('perihelion');
            expect(orbit).toHaveProperty('aphelion');
            expect(orbit).toHaveProperty('eccentricity');
            expect(typeof orbit.perihelion).toBe('number');
            expect(typeof orbit.aphelion).toBe('number');
            expect(typeof orbit.eccentricity).toBe('number');
            expect(orbit.perihelion).toBeGreaterThan(0);
            expect(orbit.aphelion).toBeGreaterThan(orbit.perihelion);
        });

        test('calculateOrbit should return orbital parameters for Mars', () => {
            const planet = 'Mars';
            const date = new Date('2023-10-01T12:00:00Z');
            const orbit = planetary.calculateOrbit(planet, date);
            
            expect(orbit.perihelion).toBeCloseTo(1.381, 1);
            expect(orbit.aphelion).toBeCloseTo(1.666, 1);
            expect(orbit.eccentricity).toBeCloseTo(0.0935, 2);
        });

        test('getOrbitalPeriod should return correct period for Jupiter', () => {
            const period = planetary.getOrbitalPeriod('Jupiter');
            expect(period).toBeCloseTo(4332.59, 1);
        });

        test('getSemiMajorAxis should return correct semi-major axis for Earth', () => {
            const semiMajorAxis = planetary.getSemiMajorAxis('Earth');
            expect(semiMajorAxis).toBeCloseTo(1.0, 3);
        });
    });
});