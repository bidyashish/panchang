/**
 * Main entry point for the Astronomical Calculator package
 * Provides easy-to-use APIs for Panchanga and astronomical calculations
 */

import { Panchanga, PanchangaData } from './panchanga/index';
import { Ephemeris } from './calculations/ephemeris';
import { Planetary } from './calculations/planetary';
import { Location } from './types/astronomical';

// Re-export types for consumers
export * from './types/astronomical';
export * from './panchanga/index';
export * from './calculations/ephemeris';
export * from './calculations/planetary';

/**
 * Input interface for Panchanga calculation
 */
export interface PanchangaInput {
    /** The date for which to calculate Panchanga */
    date: Date;
    /** Location coordinates */
    location: {
        /** Latitude in degrees (positive for North, negative for South) */
        latitude: number;
        /** Longitude in degrees (positive for East, negative for West) */
        longitude: number;
        /** Timezone identifier (e.g., 'Asia/Kolkata', 'America/New_York') */
        timezone: string;
        /** Optional location name for display in reports */
        name?: string;
        /** Altitude in meters (optional, defaults to 0) */
        altitude?: number;
    };
}

/**
 * Simplified output interface for Panchanga
 */
export interface PanchangaOutput {
    /** Input date */
    date: Date;
    /** Day of the week */
    vara: {
        name: string;
        number: number;
    };
    /** Lunar day */
    tithi: {
        name: string;
        number: number;
        percentage: number;
        paksha: 'Shukla' | 'Krishna'; // Waxing or Waning
        endTime?: Date | null; // When this tithi ends
    };
    /** Lunar mansion */
    nakshatra: {
        name: string;
        number: number;
        pada: number;
        endTime?: Date | null; // When this nakshatra ends
    };
    /** Astronomical combination of Sun and Moon */
    yoga: {
        name: string;
        number: number;
        endTime?: Date | null; // When this yoga ends
    };
    /** Half of a tithi */
    karana: {
        name: string;
        number: number;
        endTime?: Date | null; // When this karana ends
    };
    /** Moon phase description */
    moonPhase: string;
    /** Sunrise time */
    sunrise: Date | null;
    /** Sunset time */
    sunset: Date | null;
    /** Rahu Kaal (inauspicious time) */
    rahuKaal: {
        start: Date | null;
        end: Date | null;
    } | null;
}

/**
 * Main class for astronomical calculations
 */
export class AstronomicalCalculator {
    private panchanga: Panchanga;
    private ephemeris: Ephemeris;
    private planetary: Planetary;

    constructor() {
        this.panchanga = new Panchanga();
        this.ephemeris = new Ephemeris();
        this.planetary = new Planetary();
    }

    /**
     * Calculate complete Panchanga for a given date and location
     * @param input Date and location information
     * @returns Complete Panchanga data
     */
    public calculatePanchanga(input: PanchangaInput): PanchangaOutput {
        const location: Location = {
            latitude: input.location.latitude,
            longitude: input.location.longitude,
            timezone: input.location.timezone,
            altitude: input.location.altitude || 0
        };

        // CRITICAL: Pass the exact input date without any modifications
        // This ensures the date represents the precise moment for calculation
        const panchangaData = this.panchanga.calculatePanchanga(input.date, location, true);
        
        // Calculate Rahu Kaal using the exact same date
        const rahuKaal = this.panchanga.calculateRahuKaal(input.date, location);

        // Transform to simplified output format
        return {
            date: input.date, // Preserve the EXACT input date
            vara: {
                name: panchangaData.vara.name,
                number: panchangaData.vara.vara
            },
            tithi: {
                name: panchangaData.tithi.name,
                number: panchangaData.tithi.tithi,
                percentage: panchangaData.tithi.percentage,
                paksha: panchangaData.tithi.isWaxing ? 'Shukla' : 'Krishna',
                endTime: panchangaData.tithi.endTime
            },
            nakshatra: {
                name: panchangaData.nakshatra.name,
                number: panchangaData.nakshatra.nakshatra,
                pada: panchangaData.nakshatra.pada,
                endTime: panchangaData.nakshatra.endTime
            },
            yoga: {
                name: panchangaData.yoga.name,
                number: panchangaData.yoga.yoga,
                endTime: panchangaData.yoga.endTime
            },
            karana: {
                name: panchangaData.karana.name,
                number: panchangaData.karana.karana,
                endTime: panchangaData.karana.endTime
            },
            moonPhase: panchangaData.moonPhase,
            sunrise: panchangaData.sunrise,
            sunset: panchangaData.sunset,
            rahuKaal: rahuKaal
        };
    }    /**
     * Calculate planetary positions for a given date
     * @param date Date for calculation
     * @param bodies Array of celestial body names (e.g., ['Sun', 'Moon', 'Mars'])
     * @returns Object with celestial body positions
     */
    public calculatePlanetaryPositions(date: Date, bodies: string[] = ['Sun', 'Moon', 'Mars', 'Venus', 'Jupiter', 'Saturn']) {
        const positions: { [body: string]: { longitude: number; latitude: number; siderealLongitude: number } } = {};

        bodies.forEach(body => {
            try {
                const tropical = this.ephemeris.calculatePosition(date, body);
                const sidereal = this.ephemeris.calculateSiderealPosition(date, body);
                
                positions[body] = {
                    longitude: tropical.longitude,
                    latitude: tropical.latitude,
                    siderealLongitude: sidereal.longitude
                };
            } catch (error) {
                console.warn(`Could not calculate position for ${body}:`, error);
            }
        });

        return positions;
    }

    /**
     * Generate a formatted text report of Panchanga
     * @param input Date and location information
     * @returns Formatted string report
     */
    public generatePanchangaReport(input: PanchangaInput): string {
        const panchanga = this.calculatePanchanga(input);
        
        let report = `\n=== PANCHANGA REPORT ===\n`;
        report += `Date: ${panchanga.date.toDateString()}\n`;
        
        // Include location name if provided
        if (input.location.name) {
            report += `Location: ${input.location.name}\n`;
            report += `Coordinates: ${input.location.latitude}°N, ${input.location.longitude}°E\n`;
        } else {
            report += `Location: ${input.location.latitude}°N, ${input.location.longitude}°E\n`;
        }
        
        report += `Timezone: ${input.location.timezone}\n\n`;
        
        report += `VARA (Weekday): ${panchanga.vara.name}\n`;
        report += `TITHI: ${panchanga.tithi.name} (${panchanga.tithi.percentage.toFixed(1)}% complete)\n`;
        report += `PAKSHA: ${panchanga.tithi.paksha} (${panchanga.tithi.paksha === 'Shukla' ? 'Waxing' : 'Waning'})\n`;
        report += `NAKSHATRA: ${panchanga.nakshatra.name} (${panchanga.nakshatra.number}) - Pada ${panchanga.nakshatra.pada}\n`;
        report += `YOGA: ${panchanga.yoga.name} (${panchanga.yoga.number})\n`;
        report += `KARANA: ${panchanga.karana.name} (${panchanga.karana.number})\n`;
        report += `MOON PHASE: ${panchanga.moonPhase}\n\n`;
        
        if (panchanga.sunrise) {
            report += `SUNRISE: ${panchanga.sunrise.toLocaleTimeString()}\n`;
        }
        if (panchanga.sunset) {
            report += `SUNSET: ${panchanga.sunset.toLocaleTimeString()}\n`;
        }
        
        if (panchanga.rahuKaal?.start && panchanga.rahuKaal?.end) {
            report += `RAHU KAAL: ${panchanga.rahuKaal.start.toLocaleTimeString()} - ${panchanga.rahuKaal.end.toLocaleTimeString()}\n`;
        }
        
        return report;
    }

    /**
     * Clean up resources
     */
    public cleanup(): void {
        this.ephemeris.cleanup();
        this.panchanga.cleanup();
    }

    /**
     * Get all available ayanamsa systems with their degrees for a given date
     * @param date Date for ayanamsa calculation
     * @returns Array of ayanamsa information
     */
    public getAyanamsa(date: Date = new Date()) {
        return this.ephemeris.getAyanamsa(date);
    }

    /**
     * Get a specific ayanamsa value by name or ID
     * @param ayanamsaId Ayanamsa ID (number) or name (string)
     * @param date Date for calculation
     * @returns Ayanamsa information or null if not found
     */
    public getSpecificAyanamsa(ayanamsaId: number | string, date: Date = new Date()) {
        return this.ephemeris.getSpecificAyanamsa(date, ayanamsaId);
    }
}

// Convenience functions for quick use
/**
 * Quick function to calculate Panchanga
 * @param date Date for calculation - must be the EXACT date/time for calculation
 * @param latitude Latitude in degrees
 * @param longitude Longitude in degrees  
 * @param timezone Timezone identifier
 * @returns Panchanga data
 */
export function getPanchanga(date: Date, latitude: number, longitude: number, timezone: string): PanchangaOutput {
    const calculator = new AstronomicalCalculator();
    
    try {
        // CRITICAL: Pass the exact date without any modifications
        return calculator.calculatePanchanga({
            date: date, // Use the exact input date
            location: { latitude, longitude, timezone }
        });
    } finally {
        calculator.cleanup();
    }
}

/**
 * Quick function to get a formatted Panchanga report
 * @param date Date for calculation - must be the EXACT date/time for calculation
 * @param latitude Latitude in degrees
 * @param longitude Longitude in degrees
 * @param timezone Timezone identifier
 * @param locationName Optional location name for display
 * @returns Formatted text report
 */
export function getPanchangaReport(date: Date, latitude: number, longitude: number, timezone: string, locationName?: string): string {
    const calculator = new AstronomicalCalculator();
    
    try {
        // CRITICAL: Pass the exact date without any modifications
        return calculator.generatePanchangaReport({
            date: date, // Use the exact input date
            location: { latitude, longitude, timezone, name: locationName }
        });
    } finally {
        calculator.cleanup();
    }
}

/**
 * Quick function to get all ayanamsa systems with their degrees for a given date
 * @param date Date for ayanamsa calculation (defaults to current date)
 * @returns Array of ayanamsa information including name, ID, degree, and description
 */
export function getAyanamsa(date: Date = new Date()) {
    const ephemeris = new Ephemeris();
    
    try {
        return ephemeris.getAyanamsa(date);
    } finally {
        ephemeris.cleanup();
    }
}

/**
 * Quick function to get a specific ayanamsa value by name or ID
 * @param ayanamsaId Ayanamsa ID (number) or name (string)
 * @param date Date for calculation (defaults to current date)
 * @returns Ayanamsa information or null if not found
 */
export function getSpecificAyanamsa(ayanamsaId: number | string, date: Date = new Date()) {
    const ephemeris = new Ephemeris();
    
    try {
        return ephemeris.getSpecificAyanamsa(date, ayanamsaId);
    } finally {
        ephemeris.cleanup();
    }
}

/**
 * Get current planetary positions with Nakshatra and Rashi information
 * @param date Date for calculation (defaults to current date)
 * @param ayanamsaId Ayanamsa system to use (defaults to 1 - Lahiri)
 * @returns Array of planetary positions with astrological information
 */
export function getCurrentPlanets(date: Date = new Date(), ayanamsaId: number = 1) {
    const ephemeris = new Ephemeris();
    
    try {
        return ephemeris.getCurrentPlanets(date, ayanamsaId);
    } finally {
        ephemeris.cleanup();
    }
}

// Default export
export default AstronomicalCalculator;
