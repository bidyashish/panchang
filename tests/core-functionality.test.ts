import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { 
    getPanchanga, 
    getPanchangaReport,
    getCurrentPlanets,
    getAyanamsa,
    getSpecificAyanamsa,
    AstronomicalCalculator 
} from '../dist/index.js';

describe('Panchanga Library - Core Functionality Tests', () => {
    let calculator: AstronomicalCalculator;
    
    // Test configuration - same as our verification scripts
    const testDate = new Date('2025-07-20T12:00:00.000-07:00');
    const location = {
        latitude: 49.8880,
        longitude: -119.4960,
        timezone: 'America/Vancouver'
    };

    beforeAll(() => {
        calculator = new AstronomicalCalculator();
    });

    afterAll(() => {
        calculator.cleanup();
    });

    describe('getPanchanga() - Core Function', () => {
        test('should return all required Panchanga elements', () => {
            const result = getPanchanga(testDate, location.latitude, location.longitude, location.timezone);
            
            // Verify structure
            expect(result).toHaveProperty('vara');
            expect(result).toHaveProperty('tithi');
            expect(result).toHaveProperty('nakshatra');
            expect(result).toHaveProperty('yoga');
            expect(result).toHaveProperty('karana');
            expect(result).toHaveProperty('date');
            
            // Verify Vara
            expect(result.vara).toHaveProperty('name');
            expect(result.vara).toHaveProperty('number');
            expect(result.vara.name).toBe('Sunday');
            expect(result.vara.number).toBe(0);
            
            // Verify Tithi
            expect(result.tithi).toHaveProperty('name');
            expect(result.tithi).toHaveProperty('number');
            expect(result.tithi).toHaveProperty('paksha');
            expect(result.tithi).toHaveProperty('percentage');
            expect(result.tithi.name).toBe('Ekadashi');
            expect(result.tithi.number).toBe(11);
            expect(result.tithi.paksha).toBe('Krishna');
            
            // Verify Nakshatra
            expect(result.nakshatra).toHaveProperty('name');
            expect(result.nakshatra).toHaveProperty('number');
            expect(result.nakshatra).toHaveProperty('pada');
            expect(result.nakshatra.name).toBe('Krittika');
            expect(result.nakshatra.number).toBe(3);
            expect(result.nakshatra.pada).toBe(4);
            
            // Verify Yoga
            expect(result.yoga).toHaveProperty('name');
            expect(result.yoga).toHaveProperty('number');
            expect(result.yoga.name).toBe('Ganda');
            expect(result.yoga.number).toBe(10);
            
            // Verify Karana
            expect(result.karana).toHaveProperty('name');
            expect(result.karana).toHaveProperty('number');
            expect(result.karana.name).toBe('Balava');
            expect(result.karana.number).toBe(51);
        });

        test('should include transition times', () => {
            const result = getPanchanga(testDate, location.latitude, location.longitude, location.timezone);
            
            expect(result.tithi).toHaveProperty('endTime');
            expect(result.nakshatra).toHaveProperty('endTime');
            expect(result.yoga).toHaveProperty('endTime');
            expect(result.karana).toHaveProperty('endTime');
            
            // Verify transition times are Date objects
            expect(result.tithi.endTime).toBeInstanceOf(Date);
            expect(result.nakshatra.endTime).toBeInstanceOf(Date);
            expect(result.yoga.endTime).toBeInstanceOf(Date);
            expect(result.karana.endTime).toBeInstanceOf(Date);
        });

        test('should include additional calculated data', () => {
            const result = getPanchanga(testDate, location.latitude, location.longitude, location.timezone);
            
            expect(result).toHaveProperty('moonPhase');
            expect(result).toHaveProperty('sunrise');
            expect(result).toHaveProperty('sunset');
            expect(result).toHaveProperty('rahuKaal');
            
            expect(result.moonPhase).toBe('Last Quarter');
            expect(result.sunrise).toBeInstanceOf(Date);
            expect(result.sunset).toBeInstanceOf(Date);
        });
    });

    describe('getPanchangaReport() - Formatted Output', () => {
        test('should return formatted text report', () => {
            const report = getPanchangaReport(testDate, location.latitude, location.longitude, location.timezone);
            
            expect(typeof report).toBe('string');
            expect(report).toContain('PANCHANGA REPORT');
            expect(report).toContain('Sunday');
            expect(report).toContain('Ekadashi');
            expect(report).toContain('Krittika');
            expect(report).toContain('Ganda');
            expect(report).toContain('Balava');
        });
    });

    describe('getCurrentPlanets() - Planetary Positions', () => {
        test('should return all major planets', () => {
            const planets = getCurrentPlanets(testDate, 1); // Lahiri ayanamsa
            
            expect(planets).toHaveLength(7);
            
            const planetNames = planets.map(p => p.planet);
            expect(planetNames).toContain('Sun');
            expect(planetNames).toContain('Moon');
            expect(planetNames).toContain('Mercury');
            expect(planetNames).toContain('Venus');
            expect(planetNames).toContain('Mars');
            expect(planetNames).toContain('Jupiter');
            expect(planetNames).toContain('Saturn');
        });

        test('should return valid planetary data', () => {
            const planets = getCurrentPlanets(testDate, 1);
            
            planets.forEach(planet => {
                expect(planet).toHaveProperty('planet');
                expect(planet).toHaveProperty('longitude');
                expect(planet).toHaveProperty('rashi');
                expect(planet).toHaveProperty('nakshatra');
                
                // Validate longitude range
                expect(planet.longitude).toBeGreaterThanOrEqual(0);
                expect(planet.longitude).toBeLessThan(360);
                
                // Validate rashi
                expect(planet.rashi).toHaveProperty('name');
                expect(planet.rashi).toHaveProperty('rashi');
                expect(planet.rashi.rashi).toBeGreaterThanOrEqual(1);
                expect(planet.rashi.rashi).toBeLessThanOrEqual(12);
                
                // Validate nakshatra
                expect(planet.nakshatra).toHaveProperty('name');
                expect(planet.nakshatra).toHaveProperty('nakshatra');
                expect(planet.nakshatra.nakshatra).toBeGreaterThanOrEqual(1);
                expect(planet.nakshatra.nakshatra).toBeLessThanOrEqual(27);
            });
        });
    });

    describe('Ayanamsa Functions', () => {
        test('getSpecificAyanamsa() should return Lahiri ayanamsa', () => {
            const lahiri = getSpecificAyanamsa(1, testDate); // ID 1 = Lahiri
            
            expect(lahiri).toBeDefined();
            expect(lahiri).toHaveProperty('name');
            expect(lahiri).toHaveProperty('id');
            expect(lahiri).toHaveProperty('degree');
            expect(lahiri).toHaveProperty('description');
            
            expect(lahiri!.id).toBe(1);
            expect(lahiri!.name).toContain('Lahiri');
            expect(lahiri!.degree).toBeCloseTo(24.214, 2); // Should be ~24.214°
        });

        test('getAyanamsa() should return all ayanamsa systems', () => {
            const ayanamsas = getAyanamsa(testDate);
            
            expect(Array.isArray(ayanamsas)).toBe(true);
            expect(ayanamsas.length).toBeGreaterThan(30);
            
            // Find Lahiri ayanamsa
            const lahiri = ayanamsas.find(a => a.id === 1);
            expect(lahiri).toBeDefined();
            expect(lahiri!.name).toContain('Lahiri');
        });
    });

    describe('AstronomicalCalculator Class', () => {
        test('should calculate Panchanga using class method', () => {
            const result = calculator.calculatePanchanga({
                date: testDate,
                location: {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    timezone: location.timezone
                }
            });
            
            // Should match function results
            expect(result.vara.name).toBe('Sunday');
            expect(result.tithi.name).toBe('Ekadashi');
            expect(result.nakshatra.name).toBe('Krittika');
            expect(result.yoga.name).toBe('Ganda');
            expect(result.karana.name).toBe('Balava');
        });

        test('should calculate planetary positions using class method', () => {
            const positions = calculator.calculatePlanetaryPositions(testDate, ['Sun', 'Moon']);
            
            expect(positions).toHaveProperty('Sun');
            expect(positions).toHaveProperty('Moon');
            
            expect(positions.Sun).toHaveProperty('longitude');
            expect(positions.Sun).toHaveProperty('siderealLongitude');
            expect(positions.Moon).toHaveProperty('longitude');
            expect(positions.Moon).toHaveProperty('siderealLongitude');
        });

        test('should generate report using class method', () => {
            const report = calculator.generatePanchangaReport({
                date: testDate,
                location: {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    timezone: location.timezone
                }
            });
            
            expect(typeof report).toBe('string');
            expect(report).toContain('PANCHANGA REPORT');
        });
    });

    describe('Data Validation', () => {
        test('should handle invalid dates gracefully', () => {
            // Library should handle invalid dates without throwing
            const result = getPanchanga(new Date('invalid'), location.latitude, location.longitude, location.timezone);
            
            // Should return some result (library handles gracefully)
            expect(result).toBeDefined();
            expect(result).toHaveProperty('vara');
            expect(result).toHaveProperty('tithi');
        });

        test('should handle edge case coordinates', () => {
            // Test with valid but edge case coordinates
            const northPole = getPanchanga(testDate, 90, location.longitude, location.timezone);
            const southPole = getPanchanga(testDate, -90, location.longitude, location.timezone);
            const dateLine = getPanchanga(testDate, location.latitude, 180, location.timezone);
            
            expect(northPole).toBeDefined();
            expect(southPole).toBeDefined();
            expect(dateLine).toBeDefined();
        });

        test('should handle different timezones', () => {
            // Test with various valid timezones
            const utc = getPanchanga(testDate, location.latitude, location.longitude, 'UTC');
            const india = getPanchanga(testDate, location.latitude, location.longitude, 'Asia/Kolkata');
            const tokyo = getPanchanga(testDate, location.latitude, location.longitude, 'Asia/Tokyo');
            
            expect(utc).toBeDefined();
            expect(india).toBeDefined();
            expect(tokyo).toBeDefined();
            
            // Results should be defined for all timezones
            expect(utc.vara).toHaveProperty('name');
            expect(india.vara).toHaveProperty('name');
            expect(tokyo.vara).toHaveProperty('name');
        });
    });
});
