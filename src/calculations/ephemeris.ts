import * as swisseph from 'swisseph';
import { Position, EclipticCoordinates, Location } from '../types/astronomical';
import { normalizeAngle } from '../utils/index';

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