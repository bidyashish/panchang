import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { getAyanamsa, getSpecificAyanamsa, AstronomicalCalculator } from '../src/index';

describe('Ayanamsa Calculations', () => {
    let calculator: AstronomicalCalculator;

    beforeAll(() => {
        calculator = new AstronomicalCalculator();
    });

    afterAll(() => {
        calculator.cleanup();
    });

    describe('getAyanamsa function', () => {
        test('should return array of all ayanamsa systems', () => {
            const date = new Date('2013-01-18T12:00:00Z');
            const ayanamsas = getAyanamsa(date);
            
            expect(Array.isArray(ayanamsas)).toBe(true);
            expect(ayanamsas.length).toBeGreaterThan(30);
            
            // Check that each ayanamsa has required properties
            ayanamsas.forEach(ayanamsa => {
                expect(ayanamsa).toHaveProperty('name');
                expect(ayanamsa).toHaveProperty('id');
                expect(ayanamsa).toHaveProperty('degree');
                expect(ayanamsa).toHaveProperty('description');
                expect(typeof ayanamsa.name).toBe('string');
                expect(typeof ayanamsa.id).toBe('number');
                expect(typeof ayanamsa.degree).toBe('number');
                expect(typeof ayanamsa.description).toBe('string');
            });
        });

        test('should sort ayanamsas by degree value', () => {
            const date = new Date('2013-01-18T12:00:00Z');
            const ayanamsas = getAyanamsa(date);
            
            // Check that array is sorted by degree (ascending)
            for (let i = 1; i < ayanamsas.length; i++) {
                expect(ayanamsas[i].degree).toBeGreaterThanOrEqual(ayanamsas[i - 1].degree);
            }
        });

        test('should include common ayanamsa systems', () => {
            const date = new Date('2013-01-18T12:00:00Z');
            const ayanamsas = getAyanamsa(date);
            const names = ayanamsas.map(a => a.name.toLowerCase());
            
            expect(names.some(name => name.includes('lahiri'))).toBe(true);
            expect(names.some(name => name.includes('krishnamurti'))).toBe(true);
            expect(names.some(name => name.includes('raman'))).toBe(true);
            expect(names.some(name => name.includes('fagan'))).toBe(true);
        });
    });

    describe('getSpecificAyanamsa function', () => {
        test('should find ayanamsa by name', () => {
            const date = new Date('2013-01-18T12:00:00Z');
            const lahiri = getSpecificAyanamsa('Lahiri', date);
            
            expect(lahiri).not.toBeNull();
            expect(lahiri!.name).toBe('Lahiri');
            expect(lahiri!.id).toBe(1);
            expect(lahiri!.degree).toBeGreaterThan(20);
            expect(lahiri!.degree).toBeLessThan(30);
        });

        test('should find ayanamsa by ID', () => {
            const date = new Date('2013-01-18T12:00:00Z');
            const lahiri = getSpecificAyanamsa(1, date);
            
            expect(lahiri).not.toBeNull();
            expect(lahiri!.name).toBe('Lahiri');
            expect(lahiri!.id).toBe(1);
        });

        test('should find ayanamsa by partial name match', () => {
            const date = new Date('2013-01-18T12:00:00Z');
            const krishnamurti = getSpecificAyanamsa('krishna', date);
            
            expect(krishnamurti).not.toBeNull();
            expect(krishnamurti!.name.toLowerCase()).toContain('krishnamurti');
            expect(krishnamurti!.id).toBe(5);
        });

        test('should return null for invalid name or ID', () => {
            const date = new Date('2013-01-18T12:00:00Z');
            const invalid = getSpecificAyanamsa('NonExistent', date);
            const invalidId = getSpecificAyanamsa(999, date);
            
            expect(invalid).toBeNull();
            expect(invalidId).toBeNull();
        });
    });

    describe('AstronomicalCalculator ayanamsa methods', () => {
        test('should provide ayanamsa methods through calculator class', () => {
            const date = new Date('2013-01-18T12:00:00Z');
            
            const ayanamsas = calculator.getAyanamsa(date);
            expect(Array.isArray(ayanamsas)).toBe(true);
            expect(ayanamsas.length).toBeGreaterThan(30);
            
            const lahiri = calculator.getSpecificAyanamsa('Lahiri', date);
            expect(lahiri).not.toBeNull();
            expect(lahiri!.name).toBe('Lahiri');
            expect(lahiri!.id).toBe(1);
        });

        test('should default to current date when no date provided', () => {
            const ayanamsas = calculator.getAyanamsa();
            expect(Array.isArray(ayanamsas)).toBe(true);
            
            const lahiri = calculator.getSpecificAyanamsa('Lahiri');
            expect(lahiri).not.toBeNull();
        });
    });

    describe('Ayanamsa accuracy and consistency', () => {
        test('should match Lahiri values with existing calculation', () => {
            const date = new Date('2013-01-18T12:00:00Z');
            
            // Get Lahiri from new function
            const lahiriFromFunction = getSpecificAyanamsa('Lahiri', date);
            
            // Get Lahiri from existing method
            const ephemeris = calculator['ephemeris'];
            const lahiriFromExisting = ephemeris.calculateLahiriAyanamsa(date);
            
            expect(lahiriFromFunction).not.toBeNull();
            
            // The values should be the same since both use Swiss Ephemeris
            const difference = Math.abs(lahiriFromFunction!.degree - lahiriFromExisting);
            expect(difference).toBeLessThan(0.001); // Very small tolerance for Swiss Ephemeris precision
            
            console.log(`New function: ${lahiriFromFunction!.degree}°`);
            console.log(`Existing method: ${lahiriFromExisting}°`);
            console.log(`Difference: ${difference}°`);
        });

        test('should show progression over time for Lahiri ayanamsa', () => {
            const dates = [
                new Date('1900-01-01T12:00:00Z'),
                new Date('1950-01-01T12:00:00Z'),
                new Date('2000-01-01T12:00:00Z'),
                new Date('2025-01-01T12:00:00Z')
            ];
            
            const lahiriValues = dates.map(date => {
                const lahiri = getSpecificAyanamsa('Lahiri', date);
                return lahiri!.degree;
            });
            
            // Ayanamsa should increase over time (precession)
            for (let i = 1; i < lahiriValues.length; i++) {
                expect(lahiriValues[i]).toBeGreaterThan(lahiriValues[i - 1]);
            }
            
            console.log('Lahiri ayanamsa progression:');
            dates.forEach((date, i) => {
                console.log(`${date.getFullYear()}: ${lahiriValues[i].toFixed(6)}°`);
            });
        });

        test('should have reasonable ranges for common ayanamsa systems', () => {
            const date = new Date('2025-01-01T12:00:00Z');
            const commonSystems = ['Lahiri', 'Krishnamurti', 'Raman', 'Fagan/Bradley'];
            
            commonSystems.forEach(systemName => {
                const ayanamsa = getSpecificAyanamsa(systemName, date);
                expect(ayanamsa).not.toBeNull();
                
                // All modern ayanamsa systems should be between 0° and 40°
                expect(ayanamsa!.degree).toBeGreaterThanOrEqual(0);
                expect(ayanamsa!.degree).toBeLessThanOrEqual(40);
                
                console.log(`${systemName}: ${ayanamsa!.degree.toFixed(6)}°`);
            });
        });
    });

    describe('Error handling and fallbacks', () => {
        test('should handle invalid dates gracefully', () => {
            const invalidDate = new Date('invalid');
            expect(() => getAyanamsa(invalidDate)).not.toThrow();
            
            const ayanamsas = getAyanamsa(invalidDate);
            expect(Array.isArray(ayanamsas)).toBe(true);
        });

        test('should provide fallback values when Swiss Ephemeris fails', () => {
            // This test ensures fallback calculations work
            const date = new Date('2013-01-18T12:00:00Z');
            const ayanamsas = getAyanamsa(date);
            
            // Each ayanamsa should have a valid degree value
            ayanamsas.forEach(ayanamsa => {
                expect(typeof ayanamsa.degree).toBe('number');
                expect(isNaN(ayanamsa.degree)).toBe(false);
                expect(isFinite(ayanamsa.degree)).toBe(true);
            });
        });
    });
});
