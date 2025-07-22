/**
 * Main entry point for the Astronomical Calculator package
 * Provides easy-to-use APIs for Panchanga and astronomical calculations
 */

import { Panchanga, PanchangaData } from './panchanga/index';
import { Ephemeris } from './calculations/ephemeris';
import { Planetary } from './calculations/planetary';
import { Location } from './types/astronomical';
import { 
    formatDateInTimezone,
    formatTimeInTimezone,
    formatTimeRangeInTimezone,
    getFormattedDateInfo,
    FormattedDateInfo
} from './utils/index';

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
 * Comprehensive Panchanga output interface following traditional Hindu calendar
 */
export interface PanchangaOutput {
    /** Input date */
    date: Date;
    /** Location information */
    location: {
        latitude: number;
        longitude: number;
        timezone: string;
        name?: string;
        altitude?: number;
    };
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
        isWaxing: boolean;
    };
    /** Lunar mansion */
    nakshatra: {
        name: string;
        number: number;
        pada: number;
        endTime?: Date | null; // When this nakshatra ends
        percentage: number;
    };
    /** Astronomical combination of Sun and Moon */
    yoga: {
        name: string;
        number: number;
        endTime?: Date | null; // When this yoga ends
        percentage: number;
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
    /** Moonrise time */
    moonrise: Date | null;
    /** Moonset time */
    moonset: Date | null;
    /** Madhyahna (midday) time */
    madhyahna: Date | null;
    /** Day duration */
    dinamana: { hours: number; minutes: number; seconds: number };
    /** Night duration */
    ratrimana: { hours: number; minutes: number; seconds: number };
    /** Lunar month information */
    lunarMonth: {
        amanta: string;  // Month ending with new moon
        purnimanta: string;  // Month ending with full moon
    };
    /** Current samvat (era) year */
    samvata: {
        shaka: number;
        vikrama: number;
        gujarati: number;
        name: string;
    };
    /** Sun's zodiac sign */
    sunsign: string;
    /** Moon's zodiac sign */
    moonsign: string;
    /** Sun's nakshatra position */
    suryaNakshatra: {
        nakshatra: number;
        pada: number;
        name: string;
    };
    /** Season information */
    ritu: {
        drik: string;    // Observed season
        vedic: string;   // Traditional Vedic season
    };
    /** Solar movement */
    ayana: {
        drik: string;    // Current ayana (northern/southern)
        vedic: string;   // Traditional ayana
    };
    /** Important time periods (Kalam) */
    kalam: {
        rahu: { start: Date | null; end: Date | null };       // Rahu Kaal
        gulikai: { start: Date | null; end: Date | null };    // Gulikai Kaal
        yamaganda: { start: Date | null; end: Date | null };  // Yamaganda Kaal
    };
    /** Auspicious time periods (Muhurat) */
    muhurat: {
        abhijita: { start: Date | null; end: Date | null };
        amritKalam: { start: Date | null; end: Date | null }[];
        sarvarthaSiddhiYoga: string;
        amritSiddhiYoga: { start: Date | null; end: Date | null };
        vijaya: { start: Date | null; end: Date | null };
        godhuli: { start: Date | null; end: Date | null };
        sayahnaSandhya: { start: Date | null; end: Date | null };
        nishita: { start: Date | null; end: Date | null };
        brahma: { start: Date | null; end: Date | null };
        pratahSandhya: { start: Date | null; end: Date | null };
    };
    /** Planetary positions */
    planetaryPositions: {
        [planet: string]: {
            longitude: number;
            siderealLongitude: number;
            nakshatra: { name: string; number: number; pada: number };
            rashi: { name: string; number: number };
        };
    };
    /** Ayanamsa information */
    ayanamsa: {
        name: string;
        degree: number;
        description: string;
    };
    
    /** Timezone-aware formatting methods */
    formatters: {
        /** Format any date in the location's timezone */
        formatInLocalTimezone: (date: Date | null, pattern?: string) => string;
        /** Format time range in the location's timezone */
        formatTimeRangeInLocalTimezone: (start: Date | null, end: Date | null, pattern?: string) => string;
        /** Get comprehensive date info for any date */
        getDateInfo: (date: Date | null) => FormattedDateInfo | null;
        /** Format sunrise in local timezone */
        getSunriseFormatted: (pattern?: string) => string;
        /** Format sunset in local timezone */
        getSunsetFormatted: (pattern?: string) => string;
        /** Format Rahu Kaal in local timezone */
        getRahuKaalFormatted: (pattern?: string) => string;
    };
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
     * @returns Complete comprehensive Panchanga data
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
        
        // Calculate planetary positions for comprehensive output
        const planetaryPositions: { [planet: string]: any } = {};
        const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
        
        planets.forEach(planet => {
            try {
                const tropical = this.ephemeris.calculatePosition(input.date, planet);
                const sidereal = this.ephemeris.calculateSiderealPosition(input.date, planet);
                const nakshatra = this.ephemeris.calculateNakshatra(sidereal.longitude);
                const rashi = this.planetary.calculateRashi(sidereal.longitude);
                
                planetaryPositions[planet] = {
                    longitude: tropical.longitude,
                    siderealLongitude: sidereal.longitude,
                    nakshatra: nakshatra,
                    rashi: rashi
                };
            } catch (error) {
                console.warn(`Could not calculate position for ${planet}:`, error);
            }
        });

        // Get ayanamsa information (Lahiri by default)
        const ayanamsa = this.ephemeris.getSpecificAyanamsa(input.date, 1);

        // Create timezone-aware formatters
        const timezone = input.location.timezone;
        const formatters = {
            formatInLocalTimezone: (date: Date | null, pattern?: string) => 
                formatDateInTimezone(date, timezone, pattern),
            formatTimeRangeInLocalTimezone: (start: Date | null, end: Date | null, pattern?: string) => 
                formatTimeRangeInTimezone(start, end, timezone, pattern),
            getDateInfo: (date: Date | null) => 
                getFormattedDateInfo(date, timezone),
            getSunriseFormatted: (pattern?: string) => 
                formatTimeInTimezone(panchangaData.sunrise, timezone, pattern || 'HH:mm:ss'),
            getSunsetFormatted: (pattern?: string) => 
                formatTimeInTimezone(panchangaData.sunset, timezone, pattern || 'HH:mm:ss'),
            getRahuKaalFormatted: (pattern?: string) => 
                formatTimeRangeInTimezone(
                    panchangaData.kalam?.rahu?.start || null, 
                    panchangaData.kalam?.rahu?.end || null, 
                    timezone, 
                    pattern || 'HH:mm:ss'
                )
        };

        // Transform to comprehensive output format
        return {
            date: input.date, // Preserve the EXACT input date
            location: {
                latitude: input.location.latitude,
                longitude: input.location.longitude,
                timezone: input.location.timezone,
                name: input.location.name,
                altitude: input.location.altitude || 0
            },
            vara: {
                name: panchangaData.vara.name,
                number: panchangaData.vara.vara
            },
            tithi: {
                name: panchangaData.tithi.name,
                number: panchangaData.tithi.tithi,
                percentage: panchangaData.tithi.percentage,
                paksha: panchangaData.tithi.isWaxing ? 'Shukla' : 'Krishna',
                endTime: panchangaData.tithi.endTime,
                isWaxing: panchangaData.tithi.isWaxing
            },
            nakshatra: {
                name: panchangaData.nakshatra.name,
                number: panchangaData.nakshatra.nakshatra,
                pada: panchangaData.nakshatra.pada,
                endTime: panchangaData.nakshatra.endTime,
                percentage: 0 // Will be calculated by panchanga module if available
            },
            yoga: {
                name: panchangaData.yoga.name,
                number: panchangaData.yoga.yoga,
                endTime: panchangaData.yoga.endTime,
                percentage: 0 // Will be calculated by panchanga module if available
            },
            karana: {
                name: panchangaData.karana.name,
                number: panchangaData.karana.karana,
                endTime: panchangaData.karana.endTime
            },
            moonPhase: panchangaData.moonPhase,
            sunrise: panchangaData.sunrise,
            sunset: panchangaData.sunset,
            moonrise: panchangaData.moonrise || null,
            moonset: panchangaData.moonset || null,
            madhyahna: panchangaData.madhyahna || null,
            dinamana: panchangaData.dinamana || { hours: 12, minutes: 0, seconds: 0 },
            ratrimana: panchangaData.ratrimana || { hours: 12, minutes: 0, seconds: 0 },
            lunarMonth: panchangaData.lunarMonth || {
                amanta: 'Unknown',
                purnimanta: 'Unknown'
            },
            samvata: panchangaData.samvata || {
                shaka: 0,
                vikrama: 0,
                gujarati: 0,
                name: 'Unknown'
            },
            sunsign: panchangaData.sunsign || 'Unknown',
            moonsign: panchangaData.moonsign || 'Unknown',
            suryaNakshatra: panchangaData.suryaNakshatra || {
                nakshatra: 0,
                pada: 0,
                name: 'Unknown'
            },
            ritu: panchangaData.ritu || {
                drik: 'Unknown',
                vedic: 'Unknown'
            },
            ayana: panchangaData.ayana || {
                drik: 'Unknown',
                vedic: 'Unknown'
            },
            kalam: {
                rahu: panchangaData.kalam?.rahu || { start: null, end: null },
                gulikai: panchangaData.kalam?.gulikai || { start: null, end: null },
                yamaganda: panchangaData.kalam?.yamaganda || { start: null, end: null }
            },
            muhurat: panchangaData.muhurat || {
                abhijita: { start: null, end: null },
                amritKalam: [],
                sarvarthaSiddhiYoga: 'Unknown',
                amritSiddhiYoga: { start: null, end: null },
                vijaya: { start: null, end: null },
                godhuli: { start: null, end: null },
                sayahnaSandhya: { start: null, end: null },
                nishita: { start: null, end: null },
                brahma: { start: null, end: null },
                pratahSandhya: { start: null, end: null }
            },
            planetaryPositions: planetaryPositions,
            ayanamsa: {
                name: ayanamsa?.name || 'Lahiri',
                degree: ayanamsa?.degree || 0,
                description: ayanamsa?.description || 'Lahiri (Chitrapaksha) - Official Indian Government'
            },
            formatters: formatters
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
     * Generate a comprehensive formatted text report of Panchanga
     * @param input Date and location information
     * @param useLocalTimezone Whether to display times in local timezone (default: false, uses UTC)
     * @returns Formatted string report with complete Panchanga data
     */
    public generatePanchangaReport(input: PanchangaInput, useLocalTimezone: boolean = false): string {
        const panchanga = this.calculatePanchanga(input);
        const timezone = useLocalTimezone ? panchanga.location.timezone : 'UTC';
        const timezoneLabel = useLocalTimezone ? ` (${timezone})` : ' UTC';
        
        let report = `\n=== COMPREHENSIVE PANCHANGA REPORT ===\n`;
        report += `Date: ${panchanga.date.toDateString()}\n`;
        
        // Location information
        if (panchanga.location.name) {
            report += `Location: ${panchanga.location.name}\n`;
            report += `Coordinates: ${panchanga.location.latitude}°N, ${panchanga.location.longitude}°E\n`;
        } else {
            report += `Location: ${panchanga.location.latitude}°N, ${panchanga.location.longitude}°E\n`;
        }
        
        report += `Timezone: ${panchanga.location.timezone}\n`;
        report += `Ayanamsa: ${panchanga.ayanamsa.name} (${panchanga.ayanamsa.degree.toFixed(4)}°)\n\n`;
        
        // Panchanga elements
        report += `PANCHANGA ELEMENTS:\n`;
        report += `VARA (Weekday): ${panchanga.vara.name}\n`;
        report += `TITHI: ${panchanga.tithi.name} (${panchanga.tithi.percentage.toFixed(1)}% complete)\n`;
        report += `PAKSHA: ${panchanga.tithi.paksha} (${panchanga.tithi.paksha === 'Shukla' ? 'Waxing' : 'Waning'})\n`;
        report += `NAKSHATRA: ${panchanga.nakshatra.name} (${panchanga.nakshatra.number}) - Pada ${panchanga.nakshatra.pada} (${panchanga.nakshatra.percentage.toFixed(1)}% complete)\n`;
        report += `YOGA: ${panchanga.yoga.name} (${panchanga.yoga.number}) - ${panchanga.yoga.percentage.toFixed(1)}% complete\n`;
        report += `KARANA: ${panchanga.karana.name} (${panchanga.karana.number})\n`;
        report += `MOON PHASE: ${panchanga.moonPhase}\n\n`;
        
        // Time information with flexible timezone formatting
        report += `TIME INFORMATION${timezoneLabel}:\n`;
        if (panchanga.sunrise) {
            report += `SUNRISE: ${formatTimeInTimezone(panchanga.sunrise, timezone)}${timezoneLabel}\n`;
        }
        if (panchanga.sunset) {
            report += `SUNSET: ${formatTimeInTimezone(panchanga.sunset, timezone)}${timezoneLabel}\n`;
        }
        if (panchanga.moonrise) {
            report += `MOONRISE: ${formatTimeInTimezone(panchanga.moonrise, timezone)}${timezoneLabel}\n`;
        }
        if (panchanga.moonset) {
            report += `MOONSET: ${formatTimeInTimezone(panchanga.moonset, timezone)}${timezoneLabel}\n`;
        }
        if (panchanga.madhyahna) {
            report += `MADHYAHNA: ${formatTimeInTimezone(panchanga.madhyahna, timezone)}${timezoneLabel}\n`;
        }
        
        report += `DAY DURATION: ${panchanga.dinamana.hours}h ${panchanga.dinamana.minutes}m ${panchanga.dinamana.seconds}s\n`;
        report += `NIGHT DURATION: ${panchanga.ratrimana.hours}h ${panchanga.ratrimana.minutes}m ${panchanga.ratrimana.seconds}s\n\n`;
        
        // Calendar information
        report += `CALENDAR INFORMATION:\n`;
        report += `LUNAR MONTH (Amanta): ${panchanga.lunarMonth.amanta}\n`;
        report += `LUNAR MONTH (Purnimanta): ${panchanga.lunarMonth.purnimanta}\n`;
        report += `SHAKA SAMVAT: ${panchanga.samvata.shaka}\n`;
        report += `VIKRAMA SAMVAT: ${panchanga.samvata.vikrama}\n`;
        report += `SUN SIGN: ${panchanga.sunsign}\n`;
        report += `MOON SIGN: ${panchanga.moonsign}\n`;
        report += `SURYA NAKSHATRA: ${panchanga.suryaNakshatra.name} - Pada ${panchanga.suryaNakshatra.pada}\n`;
        report += `RITU (Season): ${panchanga.ritu.vedic} (Vedic), ${panchanga.ritu.drik} (Observed)\n`;
        report += `AYANA: ${panchanga.ayana.vedic} (Vedic), ${panchanga.ayana.drik} (Observed)\n\n`;
        
        // Kalam periods with flexible timezone formatting
        report += `INAUSPICIOUS PERIODS (KALAM)${timezoneLabel}:\n`;
        if (panchanga.kalam.rahu?.start && panchanga.kalam.rahu?.end) {
            report += `RAHU KAAL: ${formatTimeRangeInTimezone(panchanga.kalam.rahu.start, panchanga.kalam.rahu.end, timezone)}${timezoneLabel}\n`;
        }
        if (panchanga.kalam.gulikai?.start && panchanga.kalam.gulikai?.end) {
            report += `GULIKAI KAAL: ${formatTimeRangeInTimezone(panchanga.kalam.gulikai.start, panchanga.kalam.gulikai.end, timezone)}${timezoneLabel}\n`;
        }
        if (panchanga.kalam.yamaganda?.start && panchanga.kalam.yamaganda?.end) {
            report += `YAMAGANDA KAAL: ${formatTimeRangeInTimezone(panchanga.kalam.yamaganda.start, panchanga.kalam.yamaganda.end, timezone)}${timezoneLabel}\n`;
        }
        
        // Planetary positions
        report += `\nPLANETARY POSITIONS (Sidereal):\n`;
        Object.keys(panchanga.planetaryPositions).forEach(planet => {
            const pos = panchanga.planetaryPositions[planet];
            report += `${planet.toUpperCase()}: ${pos.siderealLongitude.toFixed(2)}° - ${pos.rashi.name} - ${pos.nakshatra.name}\n`;
        });
        
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
 * @param useLocalTimezone Whether to display times in local timezone (default: false, uses UTC)
 * @returns Formatted text report
 */
export function getPanchangaReport(
    date: Date, 
    latitude: number, 
    longitude: number, 
    timezone: string, 
    locationName?: string, 
    useLocalTimezone: boolean = false
): string {
    const calculator = new AstronomicalCalculator();
    
    try {
        // CRITICAL: Pass the exact date without any modifications
        return calculator.generatePanchangaReport({
            date: date, // Use the exact input date
            location: { latitude, longitude, timezone, name: locationName }
        }, useLocalTimezone);
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

/**
 * Convenience function - alias for getPanchanga
 * Calculate comprehensive Panchanga data for a given date, location, and timezone
 * @param date Date for calculation
 * @param location Location object with latitude and longitude, or individual parameters
 * @param timezone Target timezone (defaults to 'UTC')
 * @returns Complete Panchanga output with timezone-aware formatting
 */
export function calculatePanchanga(
    date: Date, 
    location: Location | number, 
    longitudeOrTimezone?: number | string, 
    timezone?: string
): PanchangaOutput {
    if (typeof location === 'number') {
        // Called with individual lat/lng parameters
        const latitude = location;
        const longitude = longitudeOrTimezone as number;
        const tz = timezone || 'UTC';
        return getPanchanga(date, latitude, longitude, tz);
    } else {
        // Called with Location object
        const tz = (longitudeOrTimezone as string) || timezone || 'UTC';
        return getPanchanga(date, location.latitude, location.longitude, tz);
    }
}

// Re-export utility functions for convenience
export {
    formatDateInTimezone,
    formatTimeInTimezone,
    formatTimeRangeInTimezone,
    getFormattedDateInfo,
    FormattedDateInfo
} from './utils/index';
