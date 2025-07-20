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
        // This follows the correct Vedic astronomical principles
        const sunrise = this.ephemeris.calculateSunrise(date, location);
        const calculationTime = sunrise || date; // Use sunrise if available, otherwise input date
        
        let sunPosition: any;
        let moonPosition: any;
        
        if (useSidereal) {
            // Calculate sidereal positions using Lahiri ayanamsa
            const ayanamsa = this.ephemeris.calculateLahiriAyanamsa(calculationTime);
            
            // Get tropical positions first
            const sunTropical = this.ephemeris.calculatePosition(calculationTime, 'Sun');
            const moonTropical = this.ephemeris.calculatePosition(calculationTime, 'Moon');
            
            // Convert to sidereal by subtracting ayanamsa
            sunPosition = {
                longitude: this.normalizeAngle(sunTropical.longitude - ayanamsa),
                latitude: sunTropical.latitude
            };
            
            moonPosition = {
                longitude: this.normalizeAngle(moonTropical.longitude - ayanamsa),
                latitude: moonTropical.latitude
            };
        } else {
            // Use tropical positions
            sunPosition = this.ephemeris.calculatePosition(calculationTime, 'Sun');
            moonPosition = this.ephemeris.calculatePosition(calculationTime, 'Moon');
        }

        // Calculate Panchanga elements using corrected formulas
        const tithi = this.planetary.calculateTithi(sunPosition.longitude, moonPosition.longitude);
        const nakshatra = this.ephemeris.calculateNakshatra(moonPosition.longitude);
        const yoga = this.planetary.calculateYoga(sunPosition.longitude, moonPosition.longitude);
        const karana = this.planetary.calculateKarana(sunPosition.longitude, moonPosition.longitude);
        const vara = this.getVara(date); // Vara is based on the civil calendar date

        // Calculate sunrise and sunset for the day
        const sunriseTime = this.ephemeris.calculateSunrise(date, location);
        const sunsetTime = this.ephemeris.calculateSunset(date, location);

        // Determine moon phase based on positions
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
    
    private normalizeAngle(angle: number): number {
        let normalized = angle % 360;
        if (normalized < 0) {
            normalized += 360;
        }
        return normalized;
    }

    private getVara(date: Date): { vara: number; name: string } {
        // Correct Vara (weekday) calculation based on Julian Day Number
        // The astronomical day starts at noon, but for calendar purposes
        // we use the civil day starting at midnight
        const jd = this.dateToJulian(date);
        
        // Standard formula: vara = (JD + 1.5) mod 7
        // JD 0 corresponds to Monday, so we adjust accordingly
        const varaNumber = Math.floor((jd + 1.5) % 7);
        
        return {
            vara: varaNumber,
            name: this.varaNames[varaNumber]
        };
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
     * Rahu Kaal is 1/8th of the day length, occurring at different times based on weekday
     */
    calculateRahuKaal(date: Date, location: Location): { start: Date | null; end: Date | null } | null {
        const sunrise = this.ephemeris.calculateSunrise(date, location);
        const sunset = this.ephemeris.calculateSunset(date, location);
        
        if (!sunrise || !sunset) return null;

        const dayLength = sunset.getTime() - sunrise.getTime();
        const oneEighth = dayLength / 8; // Divide day into 8 equal parts
        
        // Get the day of week (0 = Sunday)
        const dayOfWeek = date.getDay();
        let rahuKaalPeriod: number;

        // Correct Rahu Kaal timing based on weekday
        // Each period is 1/8th of the day from sunrise
        switch (dayOfWeek) {
            case 0: rahuKaalPeriod = 4; break; // Sunday - 5th period (4th index)
            case 1: rahuKaalPeriod = 1; break; // Monday - 2nd period (1st index)
            case 2: rahuKaalPeriod = 6; break; // Tuesday - 7th period (6th index)
            case 3: rahuKaalPeriod = 3; break; // Wednesday - 4th period (3rd index)
            case 4: rahuKaalPeriod = 2; break; // Thursday - 3rd period (2nd index)
            case 5: rahuKaalPeriod = 5; break; // Friday - 6th period (5th index)
            case 6: rahuKaalPeriod = 0; break; // Saturday - 1st period (0th index)
            default: rahuKaalPeriod = 0;
        }

        const startTime = new Date(sunrise.getTime() + (rahuKaalPeriod * oneEighth));
        const endTime = new Date(startTime.getTime() + oneEighth);

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
