import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getCurrentPlanets } from '../src/index';

describe('getCurrentPlanets', () => {
    let testDate: Date;

    beforeEach(() => {
        testDate = new Date('2024-01-15T12:00:00Z');
    });

    it('should return planetary positions for all major planets', () => {
        const planets = getCurrentPlanets(testDate);
        
        expect(planets).toBeDefined();
        expect(planets.length).toBe(7);
        
        const planetNames = planets.map(p => p.planet);
        expect(planetNames).toContain('Sun');
        expect(planetNames).toContain('Moon');
        expect(planetNames).toContain('Mercury');
        expect(planetNames).toContain('Venus');
        expect(planetNames).toContain('Mars');
        expect(planetNames).toContain('Jupiter');
        expect(planetNames).toContain('Saturn');
    });

    it('should return valid longitude values (0-360 degrees)', () => {
        const planets = getCurrentPlanets(testDate);
        
        planets.forEach(planet => {
            expect(planet.longitude).toBeGreaterThanOrEqual(0);
            expect(planet.longitude).toBeLessThan(360);
        });
    });

    it('should return valid rashi information', () => {
        const planets = getCurrentPlanets(testDate);
        
        planets.forEach(planet => {
            // Rashi number should be 1-12
            expect(planet.rashi.rashi).toBeGreaterThanOrEqual(1);
            expect(planet.rashi.rashi).toBeLessThanOrEqual(12);
            
            // Degree in rashi should be 0-30
            expect(planet.rashi.degree).toBeGreaterThanOrEqual(0);
            expect(planet.rashi.degree).toBeLessThan(30);
            
            // Should have required properties
            expect(planet.rashi.name).toBeDefined();
            expect(planet.rashi.element).toBeDefined();
            expect(planet.rashi.ruler).toBeDefined();
        });
    });

    it('should return valid nakshatra information', () => {
        const planets = getCurrentPlanets(testDate);
        
        planets.forEach(planet => {
            // Nakshatra number should be 1-27
            expect(planet.nakshatra.nakshatra).toBeGreaterThanOrEqual(1);
            expect(planet.nakshatra.nakshatra).toBeLessThanOrEqual(27);
            
            // Pada should be 1-4
            expect(planet.nakshatra.pada).toBeGreaterThanOrEqual(1);
            expect(planet.nakshatra.pada).toBeLessThanOrEqual(4);
            
            // Should have required properties
            expect(planet.nakshatra.name).toBeDefined();
            expect(planet.nakshatra.ruler).toBeDefined();
            expect(planet.nakshatra.deity).toBeDefined();
            expect(planet.nakshatra.symbol).toBeDefined();
        });
    });

    it('should work with different ayanamsa systems', () => {
        const lahiri = getCurrentPlanets(testDate, 1);
        const raman = getCurrentPlanets(testDate, 3);
        
        expect(lahiri).toBeDefined();
        expect(raman).toBeDefined();
        expect(lahiri.length).toBe(raman.length);
        
        // Different ayanamsa should give different longitude values
        const sunLahiri = lahiri.find(p => p.planet === 'Sun');
        const sunRaman = raman.find(p => p.planet === 'Sun');
        
        expect(sunLahiri?.longitude).not.toBe(sunRaman?.longitude);
    });

    it('should handle current date without arguments', () => {
        const planets = getCurrentPlanets();
        
        expect(planets).toBeDefined();
        expect(planets.length).toBe(7);
    });

    it('should return consistent results for same date and ayanamsa', () => {
        const planets1 = getCurrentPlanets(testDate, 1);
        const planets2 = getCurrentPlanets(testDate, 1);
        
        expect(planets1).toEqual(planets2);
    });

    it('should correctly calculate rashi transitions', () => {
        const planets = getCurrentPlanets(testDate);
        
        planets.forEach(planet => {
            // Check that longitude matches calculated rashi position
            const expectedRashiStart = (planet.rashi.rashi - 1) * 30;
            const actualPosition = expectedRashiStart + planet.rashi.degree;
            
            expect(Math.abs(actualPosition - planet.longitude)).toBeLessThan(0.01);
        });
    });

    it('should correctly calculate nakshatra transitions', () => {
        const planets = getCurrentPlanets(testDate);
        
        planets.forEach(planet => {
            // Check that longitude matches calculated nakshatra position
            const nakshatraSize = 360 / 27; // 13.333... degrees per nakshatra
            const expectedNakshatraStart = (planet.nakshatra.nakshatra - 1) * nakshatraSize;
            const actualPosition = expectedNakshatraStart + planet.nakshatra.degree;
            
            expect(Math.abs(actualPosition - planet.longitude)).toBeLessThan(0.01);
        });
    });
});
