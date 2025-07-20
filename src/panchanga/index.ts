/**
 * Panchanga calculations - Traditional Hindu calendar system
 * Based on the original panchanga.py implementation
 */

import { Ephemeris } from '../calculations/ephemeris';
import { Planetary, TithiInfo } from '../calculations/planetary';
import { Location } from '../types/astronomical';
import { normalizeAngle, formatDate } from '../utils/index';

export interface PanchangaData {
    date: Date;
    location?: { latitude: number; longitude: number; timezone: string; name?: string };
    tithi: TithiInfo;
    nakshatra: { nakshatra: number; pada: number; name: string };
    yoga: { yoga: number; name: string };
    karana: { karana: number; name: string };
    vara: { vara: number; name: string };
    sunrise: Date | null;
    sunset: Date | null;
    moonPhase: string;
}

export class Panchanga {
    private ephemeris: Ephemeris;
    private planetary: Planetary;

    private varaNames = [
        'Sunday', 'Monday', 'Tuesday', 'Wednesday', 
        'Thursday', 'Friday', 'Saturday'
    ];

    // Configurable ayanamsa - defaults to Lahiri
    private currentAyanamsa: number = 1; // SE_SIDM_LAHIRI

    constructor(ayanamsa: number = 1) {
        this.ephemeris = new Ephemeris();
        this.planetary = new Planetary();
        this.currentAyanamsa = ayanamsa;
    }
    
    /**
     * Set the ayanamsa system to use for calculations
     * @param ayanamsaId Swiss Ephemeris ayanamsa ID (1 = Lahiri, 0 = Fagan/Bradley, etc.)
     */
    setAyanamsa(ayanamsaId: number): void {
        this.currentAyanamsa = ayanamsaId;
    }
    
    /**
     * Get current ayanamsa ID being used
     */
    getAyanamsa(): number {
        return this.currentAyanamsa;
    }

    calculatePanchanga(date: Date, location: Location, useSidereal: boolean = true): PanchangaData {
        // Traditional Panchanga calculations should be done at sunrise
        // This follows the Python reference implementation approach
        const jd = this.dateToJulian(date);
        
        // Calculate sunrise for this date - this is the reference time for Panchanga
        const sunriseJd = this.calculateSunriseJd(jd, location);
        
        let sunPosition: any;
        let moonPosition: any;
        
        if (useSidereal) {
            // Use configurable ayanamsa system
            const ayanamsaInfo = this.ephemeris.getSpecificAyanamsa(date, this.currentAyanamsa);
            const ayanamsa = ayanamsaInfo ? ayanamsaInfo.degree : this.ephemeris.calculateLahiriAyanamsa(date);
            
            // Get tropical positions at sunrise time
            const sunTropical = this.ephemeris.calculatePosition(this.julianToDate(sunriseJd), 'Sun');
            const moonTropical = this.ephemeris.calculatePosition(this.julianToDate(sunriseJd), 'Moon');
            
            // Convert to sidereal by subtracting ayanamsa (following Python reference)
            sunPosition = {
                longitude: this.normalizeAngle(sunTropical.longitude - ayanamsa),
                latitude: sunTropical.latitude
            };
            
            moonPosition = {
                longitude: this.normalizeAngle(moonTropical.longitude - ayanamsa),
                latitude: moonTropical.latitude
            };
        } else {
            // Use tropical positions at sunrise time
            sunPosition = this.ephemeris.calculatePosition(this.julianToDate(sunriseJd), 'Sun');
            moonPosition = this.ephemeris.calculatePosition(this.julianToDate(sunriseJd), 'Moon');
        }

        // Calculate Panchanga elements using corrected formulas following Python reference
        const tithi = this.calculateTithiPython(sunPosition.longitude, moonPosition.longitude);
        const nakshatra = this.calculateNakshatraPython(moonPosition.longitude);
        const yoga = this.calculateYogaPython(sunPosition.longitude, moonPosition.longitude);
        const karana = this.calculateKaranaPython(sunPosition.longitude, moonPosition.longitude);
        const vara = this.getVaraPython(jd); // Use Julian Day directly as in Python reference

        // Calculate sunrise and sunset for the day
        const sunriseTime = this.ephemeris.calculateSunrise(date, location);
        const sunsetTime = this.ephemeris.calculateSunset(date, location);

        // Determine moon phase based on positions (lunar_phase in Python reference)
        const moonPhase = this.getLunarPhase(sunPosition.longitude, moonPosition.longitude);
        const moonPhaseDescription = this.getMoonPhase(sunPosition.longitude, moonPosition.longitude);

        return {
            date,
            location: { 
                latitude: location.latitude, 
                longitude: location.longitude, 
                timezone: location.timezone || 'UTC',
                name: location.name
            },
            tithi,
            nakshatra,
            yoga,
            karana,
            vara,
            sunrise: sunriseTime,
            sunset: sunsetTime,
            moonPhase: moonPhaseDescription
        };
    }
    
    private normalizeAngle(angle: number): number {
        let normalized = angle % 360;
        if (normalized < 0) {
            normalized += 360;
        }
        return normalized;
    }
    
    /**
     * Calculate lunar phase as in Python reference (moon_longitude - sun_longitude)
     */
    private getLunarPhase(sunLongitude: number, moonLongitude: number): number {
        return this.normalizeAngle(moonLongitude - sunLongitude);
    }
    
    /**
     * Calculate sunrise Julian Day for given date and location
     */
    private calculateSunriseJd(jd: number, location: Location): number {
        const date = this.julianToDate(jd);
        const sunrise = this.ephemeris.calculateSunrise(date, location);
        return sunrise ? this.dateToJulian(sunrise) : jd;
    }
    
    /**
     * Convert Julian Day to Date
     */
    private julianToDate(jd: number): Date {
        return new Date((jd - 2440587.5) * 86400000);
    }
    
    /**
     * Python reference-style tithi calculation
     */
    private calculateTithiPython(sunLongitude: number, moonLongitude: number): any {
        const lunarPhase = this.getLunarPhase(sunLongitude, moonLongitude);
        
        // Each tithi spans 12 degrees
        const tithiLength = 12;
        const currentTithi = Math.ceil(lunarPhase / tithiLength);
        
        // Determine paksha and tithi number (1-15)
        let finalTithi: number;
        let isWaxing: boolean;
        let tithiName: string;
        
        if (currentTithi <= 15) {
            // Shukla Paksha (Waxing)
            isWaxing = true;
            finalTithi = currentTithi;
        } else {
            // Krishna Paksha (Waning) 
            isWaxing = false;
            finalTithi = currentTithi - 15;
        }
        
        // Handle edge cases and name assignment
        if (finalTithi === 0) finalTithi = 15;
        
        const tithiNames = [
            'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi',
            'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi',
            'Trayodashi', 'Chaturdashi', 'Purnima/Amavasya'
        ];
        
        if (finalTithi === 15 && isWaxing) {
            tithiName = 'Purnima';
        } else if (finalTithi === 15 && !isWaxing) {
            tithiName = 'Amavasya';
        } else {
            tithiName = tithiNames[finalTithi - 1];
        }
        
        // Calculate completion percentage
        const remainder = lunarPhase % tithiLength;
        const percentage = (remainder / tithiLength) * 100;
        
        return {
            tithi: finalTithi,
            name: tithiName,
            percentage: percentage,
            isWaxing: isWaxing
        };
    }
    
    /**
     * Python reference-style nakshatra calculation
     */
    private calculateNakshatraPython(moonLongitude: number): any {
        const nakshatraNames = [
            'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
            'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
            'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
            'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
            'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
        ];
        
        // 27 nakshatras span 360°, so each is 13°20' (360/27)
        const oneNakshatra = 360 / 27;
        const onePada = oneNakshatra / 4; // Each nakshatra has 4 padas
        
        const normalizedLon = this.normalizeAngle(moonLongitude);
        const nakshatraNum = Math.ceil(normalizedLon * 27 / 360); // Following Python: ceil(longitude * 27 / 360)
        const remainder = normalizedLon - ((nakshatraNum - 1) * oneNakshatra);
        const padaNum = Math.ceil(remainder * 4 / oneNakshatra);
        
        // Ensure valid ranges
        const finalNakshatra = Math.max(1, Math.min(27, nakshatraNum));
        const finalPada = Math.max(1, Math.min(4, padaNum));
        
        return {
            nakshatra: finalNakshatra,
            pada: finalPada,
            name: nakshatraNames[finalNakshatra - 1] || 'Unknown'
        };
    }
    
    /**
     * Python reference-style yoga calculation
     */
    private calculateYogaPython(sunLongitude: number, moonLongitude: number): any {
        const yogaNames = [
            'Vishkumbha', 'Preeti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda',
            'Sukarman', 'Dhriti', 'Shoola', 'Ganda', 'Vriddhi', 'Dhruva',
            'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyan',
            'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla',
            'Brahma', 'Indra', 'Vaidhriti'
        ];
        
        // Sum of Sun and Moon longitudes
        const total = this.normalizeAngle(sunLongitude + moonLongitude);
        
        // 27 yogas span 360°, so each is 13°20' (360/27)
        const yogaArc = 360 / 27;
        const yogaNumber = Math.ceil(total * 27 / 360); // Following Python: ceil(total * 27 / 360)
        
        // Ensure valid range
        const finalYoga = Math.max(1, Math.min(27, yogaNumber));
        
        return {
            yoga: finalYoga,
            name: yogaNames[finalYoga - 1] || 'Unknown'
        };
    }
    
    /**
     * Python reference-style karana calculation  
     */
    private calculateKaranaPython(sunLongitude: number, moonLongitude: number): any {
        const karanaNames = [
            'Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti',
            'Shakuni', 'Chatushpada', 'Naga', 'Kimstughna'
        ];
        
        const lunarPhase = this.getLunarPhase(sunLongitude, moonLongitude);
        
        // Each karana spans 6 degrees (half a tithi)
        const karanaArc = 6;
        const karanaNumber = Math.ceil(lunarPhase / karanaArc); // Following Python: ceil(moon_phase / 6)
        
        // Handle cyclic karanas (first 57) and fixed karanas (58-60)
        let karanaIndex: number;
        if (karanaNumber <= 56) {
            // Cyclic karanas: 7 karanas repeat 8 times
            karanaIndex = (karanaNumber - 1) % 7;
        } else if (karanaNumber <= 60) {
            // Fixed karanas: Shakuni, Chatushpada, Naga, Kimstughna
            karanaIndex = 7 + (karanaNumber - 57);
        } else {
            // Wrap around for safety
            karanaIndex = (karanaNumber - 1) % 7;
        }
        
        // Ensure valid index
        karanaIndex = Math.min(Math.max(0, karanaIndex), karanaNames.length - 1);
        
        return {
            karana: Math.min(60, Math.max(1, karanaNumber)),
            name: karanaNames[karanaIndex]
        };
    }

    private getVaraPython(jd: number): { vara: number; name: string } {
        // Python reference implementation: vaara(jd) = int(ceil(jd + 1) % 7)
        // This matches the exact formula from the Python reference
        const varaNumber = Math.floor((jd + 1) % 7);
        
        return {
            vara: varaNumber,
            name: this.varaNames[varaNumber]
        };
    }
    
    private getVara(date: Date): { vara: number; name: string } {
        const jd = this.dateToJulian(date);
        return this.getVaraPython(jd);
    }

    /**
     * Convert Date to Julian Day Number using accurate algorithm
     */
    private dateToJulian(date: Date): number {
        const year = date.getUTCFullYear();
        const month = date.getUTCMonth() + 1;
        const day = date.getUTCDate();
        const hour = date.getUTCHours();
        const minute = date.getUTCMinutes();
        const second = date.getUTCSeconds();
        const millisecond = date.getUTCMilliseconds();

        // Convert time to decimal hours
        const decimalHour = hour + minute / 60.0 + second / 3600.0 + millisecond / 3600000.0;

        // Standard Julian Day calculation algorithm
        let a = Math.floor((14 - month) / 12);
        let y = year + 4800 - a;
        let m = month + 12 * a - 3;
        
        let jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
        
        // Add the time component
        jd += (decimalHour - 12.0) / 24.0;
        
        return jd;
    }

    private getMoonPhase(sunLongitude: number, moonLongitude: number): string {
        const longitudeDiff = normalizeAngle(moonLongitude - sunLongitude);
        
        if (longitudeDiff < 45) return 'New Moon';
        if (longitudeDiff < 90) return 'Waxing Crescent';
        if (longitudeDiff < 135) return 'First Quarter';
        if (longitudeDiff < 180) return 'Waxing Gibbous';
        if (longitudeDiff < 225) return 'Full Moon';
        if (longitudeDiff < 270) return 'Waning Gibbous';
        if (longitudeDiff < 315) return 'Last Quarter';
        return 'Waning Crescent';
    }

    /**
     * Calculate Rahu Kaal (inauspicious time period)
     * Follows Python reference trikalam implementation
     */
    calculateRahuKaal(date: Date, location: Location): { start: Date | null; end: Date | null } | null {
        return this.calculateTrikalam(date, location, 'rahu');
    }
    
    /**
     * Calculate trikalam periods (Rahu, Gulika, Yamaganda Kalam)
     * Based on Python reference implementation
     */
    private calculateTrikalam(date: Date, location: Location, type: 'rahu' | 'gulika' | 'yamaganda'): { start: Date | null; end: Date | null } | null {
        const jd = this.dateToJulian(date);
        const sunrise = this.ephemeris.calculateSunrise(date, location);
        const sunset = this.ephemeris.calculateSunset(date, location);
        
        if (!sunrise || !sunset) return null;

        // Convert to Julian Day for consistent calculation
        const sunriseJd = this.dateToJulian(sunrise);
        const sunsetJd = this.dateToJulian(sunset);
        const dayDuration = sunsetJd - sunriseJd;
        
        // Weekday calculation matching Python reference
        const weekday = Math.floor((jd + 1) % 7); // 0 = Sunday
        
        // Python reference offsets for trikalam periods
        const offsets: { [key: string]: number[] } = {
            'rahu': [0.875, 0.125, 0.75, 0.5, 0.625, 0.375, 0.25],
            'gulika': [0.75, 0.625, 0.5, 0.375, 0.25, 0.125, 0.0],
            'yamaganda': [0.5, 0.375, 0.25, 0.125, 0.0, 0.75, 0.625]
        };
        
        const offset = offsets[type][weekday];
        
        // Calculate start and end times
        const startJd = sunriseJd + (dayDuration * offset);
        const endJd = startJd + (0.125 * dayDuration); // 1/8th of day duration
        
        return {
            start: this.julianToDate(startJd),
            end: this.julianToDate(endJd)
        };
    }

    /**
     * Generate formatted Panchanga report
     */
    generateReport(panchangaData: PanchangaData): string {
        const { date, location, tithi, nakshatra, yoga, karana, vara, sunrise, sunset, moonPhase } = panchangaData;
        
        let report = `\n=== PANCHANGA for ${formatDate(date)} ===\n`;
        
        // Add location information if available
        if (location) {
            if (location.name) {
                report += `Location: ${location.name}\n`;
                report += `Coordinates: ${location.latitude}°N, ${location.longitude}°E\n`;
            } else {
                report += `Location: ${location.latitude}°N, ${location.longitude}°E\n`;
            }
            if (location.timezone) {
                report += `Timezone: ${location.timezone}\n`;
            }
        }
        
        report += '\n';
        
        // Basic elements
        report += `VARA (Day): ${vara.name}\n`;
        report += `TITHI: ${tithi.name} (${tithi.percentage.toFixed(1)}% complete)\n`;
        report += `NAKSHATRA: ${nakshatra.name} (${nakshatra.nakshatra}) - Pada ${nakshatra.pada}\n`;
        report += `YOGA: ${yoga.name} (${yoga.yoga})\n`;
        report += `KARANA: ${karana.name} (${karana.karana})\n`;
        report += `MOON PHASE: ${moonPhase}\n\n`;
        
        // Sunrise/Sunset
        if (sunrise) {
            report += `SUNRISE: ${sunrise.toLocaleTimeString()}\n`;
        }
        if (sunset) {
            report += `SUNSET: ${sunset.toLocaleTimeString()}\n\n`;
        }
        
        // Additional information
        report += `Lunar Month: ${tithi.isWaxing ? 'Shukla Paksha' : 'Krishna Paksha'}\n`;
        
        return report;
    }

    /**
     * Calculate Gulika Kalam
     */
    calculateGulikaKalam(date: Date, location: Location): { start: Date | null; end: Date | null } | null {
        return this.calculateTrikalam(date, location, 'gulika');
    }
    
    /**
     * Calculate Yamaganda Kalam
     */
    calculateYamagandaKalam(date: Date, location: Location): { start: Date | null; end: Date | null } | null {
        return this.calculateTrikalam(date, location, 'yamaganda');
    }
    
    cleanup(): void {
        this.ephemeris.cleanup();
    }
}
