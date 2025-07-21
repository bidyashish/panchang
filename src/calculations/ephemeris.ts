import * as swisseph from 'swisseph';
import { Position, EclipticCoordinates, Location } from '../types/astronomical';
import { normalizeAngle } from '../utils/index';
import { PlanetaryPosition, Planetary } from './planetary';
import * as path from 'path';
import * as fs from 'fs';

export interface AyanamsaInfo {
    name: string;
    id: number;
    degree: number;
    description: string;
}

export interface CelestialPosition extends Position {
    distance: number;
    longitudeSpeed: number;
    latitudeSpeed: number;
    distanceSpeed: number;
}

export class Ephemeris {
    private readonly planetMap: { [key: string]: number } = {
        'Sun': 0,      // SE_SUN
        'Moon': 1,     // SE_MOON
        'Mercury': 2,  // SE_MERCURY
        'Venus': 3,    // SE_VENUS
        'Mars': 4,     // SE_MARS
        'Jupiter': 5,  // SE_JUPITER
        'Saturn': 6,   // SE_SATURN
        'Uranus': 7,   // SE_URANUS
        'Neptune': 8,  // SE_NEPTUNE
        'Pluto': 9,    // SE_PLUTO
        'Rahu': 11,    // SE_MEAN_NODE (North Node)
        'Ketu': -1     // Special handling for South Node (180° from Rahu)
    };

    private ephemerisPath: string = '';

    constructor(ephemerisPath?: string) {
        // Try to find ephe directory relative to the project root
        if (!ephemerisPath) {
            // First try: relative to the source file
            const sourceDir = __dirname;
            const projectRoot = path.resolve(sourceDir, '../../');
            const projectEphe = path.join(projectRoot, 'ephe');
            
            // Second try: relative to current working directory
            const cwdEphe = path.join(process.cwd(), 'ephe');
            
            // Third try: check if it's in the dist folder structure
            const distEphe = path.join(path.dirname(require.main?.filename || ''), 'ephe');
            
            // Check which path exists and has files
            if (this.pathHasEphemerisFiles(projectEphe)) {
                ephemerisPath = projectEphe;
            } else if (this.pathHasEphemerisFiles(cwdEphe)) {
                ephemerisPath = cwdEphe;
            } else if (this.pathHasEphemerisFiles(distEphe)) {
                ephemerisPath = distEphe;
            } else {
                // Fallback to the original system path
                ephemerisPath = '/usr/share/libswe/ephe';
            }
        }
        
        this.ephemerisPath = ephemerisPath;
        this.initializeSwissEph();
    }

    private pathHasEphemerisFiles(ephePath: string): boolean {
        try {
            if (!fs.existsSync(ephePath)) {
                return false;
            }
            
            // Check if the directory contains Swiss Ephemeris files (*.se1)
            const files = fs.readdirSync(ephePath);
            return files.some((file: string) => file.endsWith('.se1'));
        } catch (error) {
            return false;
        }
    }

    private initializeSwissEph(): void {
        try {
            swisseph.swe_set_ephe_path(this.ephemerisPath);
            console.log(`Swiss Ephemeris initialized with path: ${this.ephemerisPath}`);
        } catch (error) {
            console.warn('Could not set ephemeris path, using default built-in data');
        }
    }

    calculatePosition(date: Date, body: string): Position {
        const jd = this.dateToJulian(date);
        const planetId = this.getPlanetId(body);
        
        try {
            let result: any;
            
            if (body === 'Ketu') {
                // Ketu is 180° opposite to Rahu
                result = swisseph.swe_calc_ut(jd, 11, 0); // Calculate Rahu first
                const ketuLongitude = normalizeAngle((result.longitude || result[0] || 0) + 180);
                return {
                    longitude: ketuLongitude,
                    latitude: -(result.latitude || result[1] || 0) // Opposite latitude
                };
            } else {
                result = swisseph.swe_calc_ut(jd, planetId, 0);
            }
            
            return {
                longitude: normalizeAngle(result.longitude || result[0] || 0),
                latitude: result.latitude || result[1] || 0
            };
        } catch (error) {
            console.warn(`Swiss Ephemeris calculation failed for ${body}, using fallback`);
            return this.getFallbackPosition(body, date);
        }
    }

    calculateSiderealPosition(date: Date, body: string, ayanamsa?: number): Position {
        const currentAyanamsa = ayanamsa || this.calculateLahiriAyanamsa(date);
        const tropicalPosition = this.calculatePosition(date, body);
        
        return {
            longitude: normalizeAngle(tropicalPosition.longitude - currentAyanamsa),
            latitude: tropicalPosition.latitude
        };
    }

    calculateLahiriAyanamsa(date: Date): number {
        try {
            const jd = this.dateToJulian(date);
            // Set Lahiri ayanamsa (SE_SIDM_LAHIRI = 1)
            swisseph.swe_set_sid_mode(1, 0, 0);
            const ayanamsa = swisseph.swe_get_ayanamsa_ut(jd);
            return ayanamsa || this.getFallbackLahiriAyanamsa(date);
        } catch (error) {
            return this.getFallbackLahiriAyanamsa(date);
        }
    }

    private getFallbackLahiriAyanamsa(date: Date): number {
        // Enhanced Lahiri ayanamsa calculation matching DrikPanchang precision
        // Based on official Lahiri formula with corrections used by Indian Government
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hour = date.getHours() + date.getMinutes()/60 + date.getSeconds()/3600;
        
        // Convert to precise decimal year including time of day
        const decimalYear = year + (month - 1) / 12 + (day - 1 + hour/24) / 365.25;
        
        // High-precision Lahiri ayanamsa formula
        // Reference: Lahiri Committee Report and modern astronomical corrections
        const t = (decimalYear - 1900.0) / 100.0; // Centuries from 1900.0
        
        // Official Lahiri formula with higher precision coefficients
        // These values are tuned to match DrikPanchang calculations
        const ayanamsa = 22.46000 + 
                        1.3915817 * t - 
                        0.0130125 * t * t - 
                        0.0000333 * t * t * t +
                        0.0000014 * t * t * t * t;
        
        return ayanamsa;
    }

    /**
     * Get all available ayanamsa systems with their degrees for a given date
     * @param date Date for ayanamsa calculation
     * @returns Array of ayanamsa information including name, ID, degree, and description
     */
    getAyanamsa(date: Date): AyanamsaInfo[] {
        const jd = this.dateToJulian(date);
        
        // Swiss Ephemeris Ayanamsa Systems (SE_SIDM constants)
        const ayanamsaSystems = [
            { id: 0, name: 'Fagan/Bradley', description: 'Fagan/Bradley (Western Sidereal)' },
            { id: 1, name: 'Lahiri', description: 'Lahiri (Chitrapaksha) - Official Indian Government' },
            { id: 2, name: 'De Luce', description: 'De Luce ayanamsa' },
            { id: 3, name: 'Raman', description: 'B.V. Raman ayanamsa' },
            { id: 4, name: 'Ushashashi', description: 'Ushashashi ayanamsa' },
            { id: 5, name: 'Krishnamurti', description: 'Krishnamurti ayanamsa (KP System)' },
            { id: 6, name: 'Djwhal Khul', description: 'Djwhal Khul ayanamsa' },
            { id: 7, name: 'Yukteshwar', description: 'Sri Yukteshwar ayanamsa' },
            { id: 8, name: 'J.N. Bhasin', description: 'J.N. Bhasin ayanamsa' },
            { id: 9, name: 'Babylonian (Kugler 1)', description: 'Babylonian ayanamsa (Kugler 1)' },
            { id: 10, name: 'Babylonian (Kugler 2)', description: 'Babylonian ayanamsa (Kugler 2)' },
            { id: 11, name: 'Babylonian (Kugler 3)', description: 'Babylonian ayanamsa (Kugler 3)' },
            { id: 12, name: 'Babylonian (Huber)', description: 'Babylonian ayanamsa (Huber)' },
            { id: 13, name: 'Eta Piscium', description: 'Eta Piscium ayanamsa' },
            { id: 14, name: 'Aldebaran 15 Tau', description: 'Aldebaran at 15° Taurus' },
            { id: 15, name: 'Hipparchos', description: 'Hipparchos ayanamsa' },
            { id: 16, name: 'Sassanian', description: 'Sassanian ayanamsa' },
            { id: 17, name: 'Galact. Center (Brand)', description: 'Galactic Center ayanamsa (Brand)' },
            { id: 18, name: 'J2000', description: 'J2000.0 reference frame' },
            { id: 19, name: 'J1900', description: 'J1900.0 reference frame' },
            { id: 20, name: 'B1950', description: 'B1950.0 reference frame' },
            { id: 21, name: 'Suryasiddhanta', description: 'Suryasiddhanta ayanamsa' },
            { id: 22, name: 'Suryasiddhanta (mean Sun)', description: 'Suryasiddhanta (mean Sun)' },
            { id: 23, name: 'Aryabhata', description: 'Aryabhata ayanamsa' },
            { id: 24, name: 'Aryabhata 522', description: 'Aryabhata 522 CE ayanamsa' },
            { id: 25, name: 'Babylonian (Britton)', description: 'Babylonian ayanamsa (Britton)' },
            { id: 26, name: 'True Chitra', description: 'True Chitra ayanamsa' },
            { id: 27, name: 'True Revati', description: 'True Revati ayanamsa' },
            { id: 28, name: 'True Pushya', description: 'True Pushya ayanamsa' },
            { id: 29, name: 'Galactic (Gil Brand)', description: 'Galactic Center (Gil Brand)' },
            { id: 30, name: 'Galactic Equator (IAU1958)', description: 'Galactic Equator (IAU1958)' },
            { id: 31, name: 'Galactic Equator', description: 'Galactic Equator' },
            { id: 32, name: 'Galactic Equator (mid-Mula)', description: 'Galactic Equator at mid-Mula' },
            { id: 33, name: 'Skydram (Mardyks)', description: 'Skydram ayanamsa (Mardyks)' },
            { id: 34, name: 'True Mula', description: 'True Mula ayanamsa' },
            { id: 35, name: 'Dhruva Galactic Center', description: 'Dhruva Galactic Center ayanamsa' },
            { id: 36, name: 'Aryabhata Mean Sun', description: 'Aryabhata Mean Sun ayanamsa' },
            { id: 37, name: 'Lahiri VP285', description: 'Lahiri VP285 ayanamsa' },
            { id: 38, name: 'Krishnamurti VP291', description: 'Krishnamurti VP291 ayanamsa' },
            { id: 39, name: 'Lahiri ICRC', description: 'Lahiri ICRC ayanamsa' }
        ];

        const results: AyanamsaInfo[] = [];

        ayanamsaSystems.forEach(system => {
            try {
                // Set the ayanamsa mode
                swisseph.swe_set_sid_mode(system.id, 0, 0);
                
                // Get ayanamsa value for the given date
                const ayanamsaValue = swisseph.swe_get_ayanamsa_ut(jd);
                
                results.push({
                    name: system.name,
                    id: system.id,
                    degree: ayanamsaValue || this.getFallbackAyanamsa(system.id, date),
                    description: system.description
                });
            } catch (error) {
                // If Swiss Ephemeris fails, use fallback calculation
                results.push({
                    name: system.name,
                    id: system.id,
                    degree: this.getFallbackAyanamsa(system.id, date),
                    description: system.description
                });
            }
        });

        // Sort by degree value for easier comparison
        results.sort((a, b) => a.degree - b.degree);
        
        return results;
    }

    /**
     * Get a specific ayanamsa value by name or ID
     * @param date Date for calculation
     * @param ayanamsaId Ayanamsa ID or name
     * @returns Ayanamsa information
     */
    getSpecificAyanamsa(date: Date, ayanamsaId: number | string): AyanamsaInfo | null {
        const allAyanamsas = this.getAyanamsa(date);
        
        if (typeof ayanamsaId === 'number') {
            return allAyanamsas.find(a => a.id === ayanamsaId) || null;
        } else {
            // First try exact match
            const exactMatch = allAyanamsas.find(a => 
                a.name.toLowerCase() === ayanamsaId.toLowerCase()
            );
            
            if (exactMatch) {
                return exactMatch;
            }
            
            // Then try partial match
            return allAyanamsas.find(a => 
                a.name.toLowerCase().includes(ayanamsaId.toLowerCase())
            ) || null;
        }
    }

    private getFallbackAyanamsa(systemId: number, date: Date): number {
        const year = date.getFullYear();
        const t = (year - 1900) / 100;
        
        // Approximate calculations for different ayanamsa systems
        switch (systemId) {
            case 0: // Fagan/Bradley
                return 24.740 + 1.39 * t - 0.01 * t * t;
            case 1: // Lahiri
                return 22.460 + 1.39 * t - 0.01 * t * t;
            case 3: // Raman
                return 21.580 + 1.39 * t - 0.01 * t * t;
            case 5: // Krishnamurti
                return 23.230 + 1.39 * t - 0.01 * t * t;
            case 7: // Yukteshwar
                return 22.460 + 1.39 * t - 0.01 * t * t;
            default:
                // Default to Lahiri approximation
                return 22.460 + 1.39 * t - 0.01 * t * t;
        }
    }

    calculateSunrise(date: Date, location: Location): Date | null {
        try {
            // CRITICAL: Preserve input date context while calculating sunrise for that specific day
            return this.calculateSunriseAccurate(date, location);
        } catch (error) {
            console.warn('Sunrise calculation failed, using fallback:', error);
            return this.calculateSunriseSimple(date, location);
        }
    }
    
    private calculateSunriseAccurate(date: Date, location: Location): Date {
        // CRITICAL: Calculate sunrise for the exact date specified, preserving timezone context
        const jd = this.dateToJulian(date);
        const lat = location.latitude * Math.PI / 180;
        const lng = location.longitude * Math.PI / 180;
        
        // High-precision solar position calculation
        const n = jd - 2451545.0; // Days from J2000.0
        const L = (280.460 + 0.9856474 * n) * Math.PI / 180; // Mean longitude of Sun
        const g = (357.528 + 0.9856003 * n) * Math.PI / 180; // Mean anomaly
        const lambda = L + (1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * Math.PI / 180; // True longitude
        
        // Solar coordinates
        const alpha = Math.atan2(Math.cos(23.439 * Math.PI / 180) * Math.sin(lambda), Math.cos(lambda)); // Right ascension
        const delta = Math.asin(Math.sin(23.439 * Math.PI / 180) * Math.sin(lambda)); // Declination
        
        // Atmospheric refraction correction (standard value: -50 arcminutes)
        const h0 = -0.8333 * Math.PI / 180; // -50' in radians
        
        const cosH = (Math.sin(h0) - Math.sin(lat) * Math.sin(delta)) / (Math.cos(lat) * Math.cos(delta));
        
        // Check for polar day/night
        if (cosH > 1) {
            // Polar night - Sun never rises
            throw new Error('Polar night: Sun does not rise on this date at this location');
        }
        
        if (cosH < -1) {
            // Polar day - Sun never sets
            throw new Error('Polar day: Sun does not set on this date at this location');
        }
        
        const H = Math.acos(cosH); // Hour angle
        const t = (alpha - lng - H) / (2 * Math.PI); // Time as fraction of day
        
        // Convert to actual time, preserving the date context
        const utcTime = (jd + t - Math.floor(jd + t)) * 24;
        
        // Create sunrise time for the same calendar day as input
        const sunrise = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const hours = Math.floor(utcTime);
        const minutes = Math.floor((utcTime - hours) * 60);
        const seconds = Math.floor(((utcTime - hours) * 60 - minutes) * 60);
        
        sunrise.setUTCHours(hours, minutes, seconds, 0);
        return sunrise;
    }

    private calculateSunriseSimple(date: Date, location: Location): Date {
        // Simple fallback: assume 6 AM local time
        const sunrise = new Date(date);
        sunrise.setHours(6, 0, 0, 0);
        return sunrise;
    }

    calculateSunset(date: Date, location: Location): Date | null {
        try {
            // CRITICAL: Preserve input date context while calculating sunset for that specific day
            return this.calculateSunsetAccurate(date, location);
        } catch (error) {
            console.warn('Sunset calculation failed, using fallback:', error);
            return this.calculateSunsetSimple(date, location);
        }
    }
    
    private calculateSunsetAccurate(date: Date, location: Location): Date {
        const jd = this.dateToJulian(date);
        const lat = location.latitude * Math.PI / 180;
        const lng = location.longitude * Math.PI / 180;
        
        // More accurate solar position calculation
        const n = jd - 2451545.0;
        const L = (280.460 + 0.9856474 * n) * Math.PI / 180;
        const g = (357.528 + 0.9856003 * n) * Math.PI / 180;
        const lambda = L + (1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * Math.PI / 180;
        
        const alpha = Math.atan2(Math.cos(23.439 * Math.PI / 180) * Math.sin(lambda), Math.cos(lambda));
        const delta = Math.asin(Math.sin(23.439 * Math.PI / 180) * Math.sin(lambda));
        
        // Atmospheric refraction correction (approximately -50 arcminutes)
        const h0 = -0.8333 * Math.PI / 180;
        
        const cosH = (Math.sin(h0) - Math.sin(lat) * Math.sin(delta)) / (Math.cos(lat) * Math.cos(delta));
        
        if (cosH > 1) {
            // No sunset (polar night)
            const sunset = new Date(date);
            sunset.setHours(18, 0, 0, 0);
            return sunset;
        }
        
        if (cosH < -1) {
            // No sunset (midnight sun)
            const sunset = new Date(date);
            sunset.setHours(23, 59, 59, 999);
            return sunset;
        }
        
        const H = Math.acos(cosH);
        const t = (alpha - lng + H) / (2 * Math.PI);
        
        // Convert to actual time
        const utcTime = (jd + t - Math.floor(jd + t)) * 24;
        const sunset = new Date(date);
        const hours = Math.floor(utcTime);
        const minutes = Math.floor((utcTime - hours) * 60);
        const seconds = Math.floor(((utcTime - hours) * 60 - minutes) * 60);
        
        sunset.setUTCHours(hours, minutes, seconds, 0);
        return sunset;
    }
    
    private calculateSunsetSimple(date: Date, location: Location): Date {
        const sunset = new Date(date);
        sunset.setHours(18, 0, 0, 0);
        return sunset;
    }

    calculateNakshatra(longitude: number): { nakshatra: number; pada: number; name: string } {
        const nakshatraNames = [
            'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
            'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
            'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
            'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
            'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
        ];

        const oneNakshatra = 360 / 27;  // 13°20'
        const onePada = oneNakshatra / 4;  // 3°20'
        
        const normalizedLon = normalizeAngle(longitude);
        const nakshatraNum = Math.floor(normalizedLon / oneNakshatra) + 1;
        const remainder = normalizedLon % oneNakshatra;
        const padaNum = Math.floor(remainder / onePada) + 1;
        
        return {
            nakshatra: nakshatraNum,
            pada: padaNum,
            name: nakshatraNames[nakshatraNum - 1] || 'Unknown'
        };
    }

    private dateToJulian(date: Date): number {
        // CRITICAL: Use UTC components to ensure consistent Julian Day calculation
        // This preserves the exact moment represented by the Date object
        let year = date.getUTCFullYear();
        let month = date.getUTCMonth() + 1;
        const day = date.getUTCDate();
        const hour = date.getUTCHours() + 
                    date.getUTCMinutes() / 60 + 
                    date.getUTCSeconds() / 3600 +
                    date.getUTCMilliseconds() / 3600000;

        try {
            // Use Swiss Ephemeris for accurate Julian Day calculation
            return swisseph.swe_julday(year, month, day, hour, 1); // SE_GREG_CAL = 1
        } catch (error) {
            // High-precision fallback Julian Day calculation
            // Algorithm from Meeus "Astronomical Algorithms"
            let a: number, b: number;
            
            if (month <= 2) {
                year = year - 1;
                month = month + 12;
            }
            
            a = Math.floor(year / 100);
            b = 2 - a + Math.floor(a / 4);
            
            const jd = Math.floor(365.25 * (year + 4716)) + 
                      Math.floor(30.6001 * (month + 1)) + 
                      day + hour/24 + b - 1524.5;
            
            return jd;
        }
    }

    private julianToDate(jd: number): Date {
        try {
            const result = swisseph.swe_revjul(jd, 1); // SE_GREG_CAL = 1
            return new Date(result.year, result.month - 1, result.day, 
                          Math.floor(result.hour), 
                          Math.floor((result.hour % 1) * 60));
        } catch (error) {
            // Fallback conversion
            return new Date((jd - 2440587.5) * 86400000);
        }
    }

    private getPlanetId(body: string): number {
        return this.planetMap[body] !== undefined ? this.planetMap[body] : 0; // Default to Sun
    }

    private getFallbackPosition(body: string, date: Date): Position {
        const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
        const year = date.getFullYear();
        const centuriesFromJ2000 = (year - 2000) / 100;
        
        const basePositions: { [key: string]: { dailyMotion: number; epoch2000: number; lat: number } } = {
            'Sun': { dailyMotion: 0.985647, epoch2000: 280.460, lat: 0 },
            'Moon': { dailyMotion: 13.176396, epoch2000: 218.316, lat: 5.145 },
            'Mercury': { dailyMotion: 4.092317, epoch2000: 252.251, lat: 3.395 },
            'Venus': { dailyMotion: 1.602136, epoch2000: 181.980, lat: 3.395 },
            'Mars': { dailyMotion: 0.524071, epoch2000: 355.433, lat: 1.850 },
            'Jupiter': { dailyMotion: 0.083056, epoch2000: 34.351, lat: 1.304 },
            'Saturn': { dailyMotion: 0.033371, epoch2000: 50.078, lat: 2.489 }
        };

        const bodyData = basePositions[body] || basePositions['Sun'];
        const longitude = normalizeAngle(
            bodyData.epoch2000 + 
            bodyData.dailyMotion * dayOfYear + 
            centuriesFromJ2000 * 1.7
        );
        
        const latitude = Math.sin(dayOfYear * 0.1) * bodyData.lat;

        return { longitude, latitude };
    }

    getCurrentPlanets(date: Date = new Date(), ayanamsaId: number = 1): PlanetaryPosition[] {
        const planetary = new Planetary();
        const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
        const positions: PlanetaryPosition[] = [];

        // Get ayanamsa value for the date
        const ayanamsaInfo = this.getSpecificAyanamsa(date, ayanamsaId);
        const ayanamsa = ayanamsaInfo ? ayanamsaInfo.degree : 24.0; // Default to approximate Lahiri

        for (const planet of planets) {
            try {
                const position = this.calculatePosition(date, planet);
                
                // Convert to sidereal longitude by subtracting ayanamsa
                const siderealLongitude = normalizeAngle(position.longitude - ayanamsa);
                
                // Calculate Rashi and Nakshatra
                const rashi = planetary.calculateRashi(siderealLongitude);
                const nakshatra = planetary.calculateNakshatra(siderealLongitude);

                positions.push({
                    planet: planet,
                    longitude: siderealLongitude,
                    latitude: position.latitude,
                    rashi: rashi,
                    nakshatra: nakshatra
                });
            } catch (error) {
                console.warn(`Could not calculate position for ${planet}:`, error);
                // Add with fallback data
                const fallbackPos = this.getFallbackPosition(planet, date);
                const siderealLongitude = normalizeAngle(fallbackPos.longitude - ayanamsa);
                
                positions.push({
                    planet: planet,
                    longitude: siderealLongitude,
                    latitude: fallbackPos.latitude,
                    rashi: planetary.calculateRashi(siderealLongitude),
                    nakshatra: planetary.calculateNakshatra(siderealLongitude)
                });
            }
        }

        return positions;
    }

    cleanup(): void {
        try {
            swisseph.swe_close();
        } catch (error) {
            console.warn('Error closing Swiss Ephemeris:', error);
        }
    }
}