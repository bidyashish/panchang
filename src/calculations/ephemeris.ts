import * as swisseph from 'swisseph';
import { Position, EclipticCoordinates, Location } from '../types/astronomical';
import { normalizeAngle } from '../utils/index';

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
        this.ephemerisPath = ephemerisPath || '/usr/share/libswe/ephe';
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
            // Set Lahiri ayanamsa
            swisseph.swe_set_sid_mode(1, 0, 0); // SE_SIDM_LAHIRI = 1
            const ayanamsa = swisseph.swe_get_ayanamsa_ut(jd);
            return ayanamsa || 24.042222; // fallback value
        } catch (error) {
            // Approximate Lahiri ayanamsa calculation
            const year = date.getFullYear();
            const t = (year - 1900) / 100;
            return 22.460 + 1.39 * t - 0.01 * t * t;
        }
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
            const jd = this.dateToJulian(date);
            
            // Simplified but more accurate sunrise calculation
            const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
            
            // Solar declination approximation
            const declination = -23.45 * Math.cos((360 * (dayOfYear + 10)) / 365.25 * Math.PI / 180);
            const lat_rad = location.latitude * Math.PI / 180;
            const decl_rad = declination * Math.PI / 180;
            
            // Hour angle calculation
            const cosHourAngle = -Math.tan(lat_rad) * Math.tan(decl_rad);
            
            // Check for polar day/night
            if (cosHourAngle > 1 || cosHourAngle < -1) {
                // Use simple approximation for extreme latitudes
                const sunrise = new Date(date);
                sunrise.setHours(6, 0, 0, 0);
                return sunrise;
            }
            
            const hourAngle = Math.acos(cosHourAngle) * 180 / Math.PI;
            const sunriseHour = 12 - hourAngle / 15 - location.longitude / 15;
            
            const sunrise = new Date(date);
            const hour = Math.floor(sunriseHour);
            const minute = Math.floor((sunriseHour - hour) * 60);
            
            sunrise.setUTCHours(hour, minute, 0, 0);
            return sunrise;
            
        } catch (error) {
            console.warn('Sunrise calculation failed:', error);
            const sunrise = new Date(date);
            sunrise.setHours(6, 0, 0, 0);
            return sunrise;
        }
    }

    calculateSunset(date: Date, location: Location): Date | null {
        try {
            const jd = this.dateToJulian(date);
            
            // Simplified but more accurate sunset calculation
            const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
            
            // Solar declination approximation
            const declination = -23.45 * Math.cos((360 * (dayOfYear + 10)) / 365.25 * Math.PI / 180);
            const lat_rad = location.latitude * Math.PI / 180;
            const decl_rad = declination * Math.PI / 180;
            
            // Hour angle calculation
            const cosHourAngle = -Math.tan(lat_rad) * Math.tan(decl_rad);
            
            // Check for polar day/night
            if (cosHourAngle > 1 || cosHourAngle < -1) {
                // Use simple approximation for extreme latitudes
                const sunset = new Date(date);
                sunset.setHours(18, 0, 0, 0);
                return sunset;
            }
            
            const hourAngle = Math.acos(cosHourAngle) * 180 / Math.PI;
            const sunsetHour = 12 + hourAngle / 15 - location.longitude / 15;
            
            const sunset = new Date(date);
            const hour = Math.floor(sunsetHour);
            const minute = Math.floor((sunsetHour - hour) * 60);
            
            sunset.setUTCHours(hour, minute, 0, 0);
            return sunset;
            
        } catch (error) {
            console.warn('Sunset calculation failed:', error);
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
        const year = date.getUTCFullYear();
        const month = date.getUTCMonth() + 1;
        const day = date.getUTCDate();
        const hour = date.getUTCHours() + 
                    date.getUTCMinutes() / 60 + 
                    date.getUTCSeconds() / 3600;

        try {
            return swisseph.swe_julday(year, month, day, hour, 1); // SE_GREG_CAL = 1
        } catch (error) {
            // Fallback Julian Day calculation
            return date.getTime() / 86400000 + 2440587.5;
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

    cleanup(): void {
        try {
            swisseph.swe_close();
        } catch (error) {
            console.warn('Error closing Swiss Ephemeris:', error);
        }
    }
}