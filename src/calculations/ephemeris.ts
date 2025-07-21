import * as swisseph from 'swisseph';
import { Position, EclipticCoordinates, Location } from '../types/astronomical';
import { normalizeAngle } from '../utils/index';
import { PlanetaryPosition, Planetary } from './planetary';
import * as path from 'path';

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
        // Use hardcoded path to node_modules ephemeris files
        if (!ephemerisPath) {
            this.ephemerisPath = path.join(__dirname, '../node_modules/swisseph/ephe');
        } else {
            this.ephemerisPath = ephemerisPath;
        }

        this.initializeSwissEph();
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
                result = swisseph.swe_calc_ut(jd, swisseph.SE_MEAN_NODE, swisseph.SEFLG_SWIEPH);
                if (result && 'longitude' in result) {
                    const ketuLongitude = normalizeAngle(result.longitude + 180);
                    return {
                        longitude: ketuLongitude,
                        latitude: -result.latitude // Opposite latitude
                    };
                }
            } else {
                result = swisseph.swe_calc_ut(jd, planetId, swisseph.SEFLG_SWIEPH);
            }
            
            if (result && 'longitude' in result) {
                return {
                    longitude: normalizeAngle(result.longitude),
                    latitude: result.latitude
                };
            }
            
            // Fallback if Swiss Ephemeris fails
            return this.getFallbackPosition(body, date);
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
            swisseph.swe_set_sid_mode(swisseph.SE_SIDM_LAHIRI, jd, 0);
            const ayanamsa = swisseph.swe_get_ayanamsa_ut(jd);
            return ayanamsa || this.getFallbackLahiriAyanamsa(date);
        } catch (error) {
            return this.getFallbackLahiriAyanamsa(date);
        }
    }

    private getFallbackLahiriAyanamsa(date: Date): number {
        // Simple Lahiri ayanamsa fallback
        const year = date.getFullYear() + (date.getMonth() + 1) / 12 + date.getDate() / 365.25;
        const t = (year - 1900.0) / 100.0;
        return 22.46000 + 1.3915817 * t - 0.0130125 * t * t;
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
                swisseph.swe_set_sid_mode(system.id, jd, 0);
                
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
            const jd = this.dateToJulian(date);
            
            // Simplified approach: Find when Sun's altitude crosses sunrise horizon
            // Using Swiss Ephemeris for accurate Sun position
            for (let hour = 0; hour < 24; hour += 0.1) {
                const testJd = jd - 0.5 + hour / 24; // Start from midnight
                const sunPos = swisseph.swe_calc_ut(testJd, swisseph.SE_SUN, swisseph.SEFLG_SWIEPH);
                
                if (sunPos && 'longitude' in sunPos && sunPos.longitude !== undefined) {
                    // Calculate Sun's altitude at this time
                    const altitude = this.calculateSunAltitude(sunPos.longitude, sunPos.latitude, location, testJd);
                    
                    // Sunrise occurs when Sun's center crosses -50 arcminutes (with refraction)
                    if (altitude > -0.8333 && hour > 3) { // Must be after 3 AM to avoid sunset
                        return this.julianToDate(testJd);
                    }
                }
            }
            
            return null;
        } catch (error) {
            console.warn('Swiss Ephemeris sunrise calculation failed:', error);
            // Simple fallback calculation - approximate sunrise at 6 AM local time
            const sunrise = new Date(date);
            sunrise.setHours(6, 0, 0, 0);
            return sunrise;
        }
    }

    private calculateSunAltitude(sunLon: number, sunLat: number, location: Location, jd: number): number {
        // Convert ecliptic coordinates to equatorial
        const obliquity = 23.43929111; // Mean obliquity of ecliptic for J2000
        const sunLonRad = sunLon * Math.PI / 180;
        const sunLatRad = sunLat * Math.PI / 180;
        const oblRad = obliquity * Math.PI / 180;
        
        // Calculate right ascension and declination
        const ra = Math.atan2(
            Math.sin(sunLonRad) * Math.cos(oblRad) - Math.tan(sunLatRad) * Math.sin(oblRad),
            Math.cos(sunLonRad)
        );
        const dec = Math.asin(
            Math.sin(sunLatRad) * Math.cos(oblRad) + Math.cos(sunLatRad) * Math.sin(oblRad) * Math.sin(sunLonRad)
        );
        
        // Calculate Greenwich Mean Sidereal Time
        const t = (jd - 2451545.0) / 36525;
        const gmst0 = 100.46061837 + 36000.770053608 * t + 0.000387933 * t * t - t * t * t / 38710000;
        const gmst = gmst0 + 15.04106864 * ((jd - Math.floor(jd)) * 24);
        const lst = (gmst + location.longitude + 360) % 360;
        
        // Calculate hour angle
        const ha = (lst - ra * 180 / Math.PI) * Math.PI / 180;
        
        // Calculate altitude
        const latRad = location.latitude * Math.PI / 180;
        const altitude = Math.asin(
            Math.sin(latRad) * Math.sin(dec) + Math.cos(latRad) * Math.cos(dec) * Math.cos(ha)
        );
        
        return altitude * 180 / Math.PI;
    }


    calculateSunset(date: Date, location: Location): Date | null {
        try {
            const jd = this.dateToJulian(date);
            
            // Find when Sun's altitude crosses sunset horizon
            // Using Swiss Ephemeris for accurate Sun position
            for (let hour = 12; hour < 36; hour += 0.1) { // Start from noon, go to next day
                const testJd = jd - 0.5 + hour / 24;
                const sunPos = swisseph.swe_calc_ut(testJd, swisseph.SE_SUN, swisseph.SEFLG_SWIEPH);
                
                if (sunPos && 'longitude' in sunPos && sunPos.longitude !== undefined) {
                    // Calculate Sun's altitude at this time
                    const altitude = this.calculateSunAltitude(sunPos.longitude, sunPos.latitude, location, testJd);
                    
                    // Sunset occurs when Sun's center crosses -50 arcminutes (with refraction)
                    if (altitude < -0.8333 && hour > 15) { // Must be after 3 PM to avoid sunrise
                        return this.julianToDate(testJd);
                    }
                }
            }
            
            return null;
        } catch (error) {
            console.warn('Swiss Ephemeris sunset calculation failed:', error);
            // Simple fallback calculation - approximate sunset at 6 PM local time
            const sunset = new Date(date);
            sunset.setHours(18, 0, 0, 0);
            return sunset;
        }
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
            return swisseph.swe_julday(year, month, day, hour, swisseph.SE_GREG_CAL);
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
            const result = swisseph.swe_revjul(jd, swisseph.SE_GREG_CAL);
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
        // Simple fallback using basic orbital elements
        const daysSinceEpoch = (date.getTime() - new Date(2000, 0, 1).getTime()) / 86400000;
        
        const positions: { [key: string]: { lon: number; motion: number } } = {
            'Sun': { lon: 280.460, motion: 0.985647 },
            'Moon': { lon: 218.316, motion: 13.176396 },
            'Mercury': { lon: 252.251, motion: 4.092317 },
            'Venus': { lon: 181.980, motion: 1.602136 },
            'Mars': { lon: 355.433, motion: 0.524071 },
            'Jupiter': { lon: 34.351, motion: 0.083056 },
            'Saturn': { lon: 50.078, motion: 0.033371 }
        };

        const bodyData = positions[body] || positions['Sun'];
        const longitude = normalizeAngle(bodyData.lon + bodyData.motion * daysSinceEpoch);
        
        return { longitude, latitude: 0 };
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