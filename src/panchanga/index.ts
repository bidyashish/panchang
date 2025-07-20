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

    constructor() {
        this.ephemeris = new Ephemeris();
        this.planetary = new Planetary();
    }

    calculatePanchanga(date: Date, location: Location, useSidereal: boolean = true): PanchangaData {
        // Traditional Panchanga calculations should be done at sunrise
        // This follows the Python reference implementation
        const sunrise = this.ephemeris.calculateSunrise(date, location) || date;
        
        // Calculate Sun and Moon positions at sunrise
        const sunPosition = useSidereal ? 
            this.ephemeris.calculateSiderealPosition(sunrise, 'Sun') :
            this.ephemeris.calculatePosition(sunrise, 'Sun');
            
        const moonPosition = useSidereal ?
            this.ephemeris.calculateSiderealPosition(sunrise, 'Moon') :
            this.ephemeris.calculatePosition(sunrise, 'Moon');

        // Calculate Panchanga elements
        const tithi = this.planetary.calculateTithi(sunPosition.longitude, moonPosition.longitude);
        const nakshatra = this.ephemeris.calculateNakshatra(moonPosition.longitude);
        const yoga = this.planetary.calculateYoga(sunPosition.longitude, moonPosition.longitude);
        const karana = this.planetary.calculateKarana(sunPosition.longitude, moonPosition.longitude);
        const vara = this.getVara(date); // Vara is based on the calendar date, not sunrise time

        // Calculate sunrise and sunset for the day
        const sunriseTime = this.ephemeris.calculateSunrise(date, location);
        const sunsetTime = this.ephemeris.calculateSunset(date, location);

        // Determine moon phase based on sunrise positions
        const moonPhase = this.getMoonPhase(sunPosition.longitude, moonPosition.longitude);

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
            moonPhase
        };
    }

    private getVara(date: Date): { vara: number; name: string } {
        // Follow Python reference implementation: vaara(jd) = int(ceil(jd + 1) % 7)
        const jd = this.dateToJulian(date);
        const varaNumber = Math.floor((jd + 1) % 7);
        
        return {
            vara: varaNumber,
            name: this.varaNames[varaNumber]
        };
    }

    /**
     * Convert Date to Julian Day Number (following Python reference implementation)
     */
    private dateToJulian(date: Date): number {
        const year = date.getUTCFullYear();
        const month = date.getUTCMonth() + 1;
        const day = date.getUTCDate();
        const hour = date.getUTCHours() + 
                    date.getUTCMinutes() / 60 + 
                    date.getUTCSeconds() / 3600;

        // Use the standard Julian Day calculation
        let a = Math.floor((14 - month) / 12);
        let y = year + 4800 - a;
        let m = month + 12 * a - 3;
        
        let jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
        jd += (hour / 24.0);
        
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
     */
    calculateRahuKaal(date: Date, location: Location): { start: Date | null; end: Date | null } | null {
        const sunrise = this.ephemeris.calculateSunrise(date, location);
        const sunset = this.ephemeris.calculateSunset(date, location);
        
        if (!sunrise || !sunset) return null;

        const dayLength = sunset.getTime() - sunrise.getTime();
        const oneTenth = dayLength / 8; // Divide day into 8 parts
        
        const dayOfWeek = date.getDay();
        let rahuKaalStart: number;

        // Rahu Kaal timing based on day of week
        switch (dayOfWeek) {
            case 0: rahuKaalStart = 4; break; // Sunday - 5th part
            case 1: rahuKaalStart = 1; break; // Monday - 2nd part  
            case 2: rahuKaalStart = 6; break; // Tuesday - 7th part
            case 3: rahuKaalStart = 3; break; // Wednesday - 4th part
            case 4: rahuKaalStart = 2; break; // Thursday - 3rd part
            case 5: rahuKaalStart = 5; break; // Friday - 6th part
            case 6: rahuKaalStart = 0; break; // Saturday - 1st part
            default: rahuKaalStart = 0;
        }

        const startTime = new Date(sunrise.getTime() + (rahuKaalStart * oneTenth));
        const endTime = new Date(startTime.getTime() + oneTenth);

        return { start: startTime, end: endTime };
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

    cleanup(): void {
        this.ephemeris.cleanup();
    }
}
