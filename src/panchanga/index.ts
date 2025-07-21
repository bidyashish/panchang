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
    tithi: TithiInfo & { endTime?: Date | null };
    nakshatra: { nakshatra: number; pada: number; name: string; endTime?: Date | null };
    yoga: { yoga: number; name: string; endTime?: Date | null };
    karana: { karana: number; name: string; endTime?: Date | null };
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
        // CRITICAL: Preserve the exact input date without any modifications
        // The input date represents the precise moment for Panchanga calculation
        const inputDate = date;
        
        // For more accurate Panchanga calculation, we might want to use sunrise time
        // as the reference point, since traditional Panchanga is calculated from sunrise
        let calculationMoment = inputDate;
        
        try {
            // Try to get sunrise for more accurate calculation
            const sunriseTime = this.ephemeris.calculateSunrise(inputDate, location);
            if (sunriseTime && Math.abs(sunriseTime.getTime() - inputDate.getTime()) < 24 * 60 * 60 * 1000) {
                // Use sunrise if it's within the same day and available
                calculationMoment = sunriseTime;
            }
        } catch (error) {
            // If sunrise calculation fails, use input date
            calculationMoment = inputDate;
        }
        
        let sunPosition: any;
        let moonPosition: any;
        
        if (useSidereal) {
            // Calculate sidereal positions using Lahiri ayanamsa at the calculation moment
            const ayanamsa = this.ephemeris.calculateLahiriAyanamsa(calculationMoment);
            
            // Get tropical positions first
            const sunTropical = this.ephemeris.calculatePosition(calculationMoment, 'Sun');
            const moonTropical = this.ephemeris.calculatePosition(calculationMoment, 'Moon');
            
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
            sunPosition = this.ephemeris.calculatePosition(calculationMoment, 'Sun');
            moonPosition = this.ephemeris.calculatePosition(calculationMoment, 'Moon');
        }

        // Calculate Panchanga elements using precise positions
        const tithi = this.planetary.calculateTithi(sunPosition.longitude, moonPosition.longitude);
        const nakshatra = this.ephemeris.calculateNakshatra(moonPosition.longitude);
        const yoga = this.planetary.calculateYoga(sunPosition.longitude, moonPosition.longitude);
        const karana = this.planetary.calculateKarana(sunPosition.longitude, moonPosition.longitude);
        const vara = this.getVara(inputDate); // Use exact input date for vara calculation

        // Calculate transition times for each element
        const tithiEndTime = this.calculateTithiEndTime(inputDate, location);
        const nakshatraEndTime = this.calculateNakshatraEndTime(inputDate, location);
        const yogaEndTime = this.calculateYogaEndTime(inputDate, location);
        const karanaEndTime = this.calculateKaranaEndTime(inputDate, location);

        // Calculate sunrise and sunset for the date (preserve timezone context)
        const sunriseTime = this.ephemeris.calculateSunrise(inputDate, location);
        const sunsetTime = this.ephemeris.calculateSunset(inputDate, location);

        // Determine moon phase based on precise longitude difference
        const moonPhase = this.getMoonPhase(sunPosition.longitude, moonPosition.longitude);

        return {
            date: inputDate, // Return the EXACT input date - no conversions or modifications
            location: { 
                latitude: location.latitude, 
                longitude: location.longitude, 
                timezone: location.timezone || 'UTC',
                name: location.name
            },
            tithi: { ...tithi, endTime: tithiEndTime },
            nakshatra: { ...nakshatra, endTime: nakshatraEndTime },
            yoga: { ...yoga, endTime: yogaEndTime },
            karana: { ...karana, endTime: karanaEndTime },
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
        // CRITICAL: Calculate Vara (weekday) from the exact input date
        // This should preserve the intended calendar date regardless of timezone
        const varaNumber = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        return {
            vara: varaNumber,
            name: this.varaNames[varaNumber]
        };
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
        
        // CRITICAL: Use the exact input date for day calculation
        const dayOfWeek = date.getDay(); // 0 = Sunday
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
     * Calculate when current Tithi ends
     */
    private calculateTithiEndTime(date: Date, location: Location): Date | null {
        try {
            // Calculate the Moon-Sun longitude difference needed for next tithi
            const currentSunPos = this.ephemeris.calculatePosition(date, 'Sun');
            const currentMoonPos = this.ephemeris.calculatePosition(date, 'Moon');
            const ayanamsa = this.ephemeris.calculateLahiriAyanamsa(date);
            
            const sunLon = this.normalizeAngle(currentSunPos.longitude - ayanamsa);
            const moonLon = this.normalizeAngle(currentMoonPos.longitude - ayanamsa);
            
            const currentElongation = this.normalizeAngle(moonLon - sunLon);
            const currentTithiNum = Math.floor(currentElongation / 12) + 1; // Each tithi = 12 degrees
            
            // Find when Moon reaches the longitude for next tithi
            const nextTithiElongation = currentTithiNum * 12; // Next tithi starts at this elongation
            const targetMoonLon = this.normalizeAngle(sunLon + nextTithiElongation);
            
            // Estimate time using Moon's daily motion (approximately 13.2 degrees per day)
            const moonDailyMotion = 13.2; // degrees per day
            const longitudeDiff = this.normalizeAngle(targetMoonLon - moonLon);
            const daysToTarget = longitudeDiff / moonDailyMotion;
            
            const endTime = new Date(date.getTime() + daysToTarget * 24 * 60 * 60 * 1000);
            return endTime;
        } catch (error) {
            return null;
        }
    }

    /**
     * Calculate when current Nakshatra ends
     */
    private calculateNakshatraEndTime(date: Date, location: Location): Date | null {
        try {
            // For more accurate timing, calculate multiple points around the date
            const baseDate = new Date(date);
            baseDate.setHours(0, 0, 0, 0); // Start of day
            
            let bestEndTime: Date | null = null;
            
            // Check every hour of the day to find nakshatra transitions
            for (let hour = 0; hour < 48; hour++) { // Check 48 hours (today + tomorrow)
                const testTime = new Date(baseDate.getTime() + hour * 60 * 60 * 1000);
                
                const moonPos = this.ephemeris.calculatePosition(testTime, 'Moon');
                const ayanamsa = this.ephemeris.calculateLahiriAyanamsa(testTime);
                const moonLon = this.normalizeAngle(moonPos.longitude - ayanamsa);
                
                const nakshatraArc = 360 / 27; // 13.333... degrees per nakshatra
                const nakshatraNum = Math.floor(moonLon / nakshatraArc) + 1;
                
                // Get current nakshatra at the input date
                const currentMoonPos = this.ephemeris.calculatePosition(date, 'Moon');
                const currentAyanamsa = this.ephemeris.calculateLahiriAyanamsa(date);
                const currentMoonLon = this.normalizeAngle(currentMoonPos.longitude - currentAyanamsa);
                const currentNakshatraNum = Math.floor(currentMoonLon / nakshatraArc) + 1;
                
                // If nakshatra changed, this is the transition time
                if (nakshatraNum !== currentNakshatraNum && testTime > date) {
                    bestEndTime = testTime;
                    break;
                }
            }
            
            return bestEndTime;
        } catch (error) {
            return null;
        }
    }

    /**
     * Calculate when current Yoga ends
     */
    private calculateYogaEndTime(date: Date, location: Location): Date | null {
        try {
            const currentSunPos = this.ephemeris.calculatePosition(date, 'Sun');
            const currentMoonPos = this.ephemeris.calculatePosition(date, 'Moon');
            const ayanamsa = this.ephemeris.calculateLahiriAyanamsa(date);
            
            const sunLon = this.normalizeAngle(currentSunPos.longitude - ayanamsa);
            const moonLon = this.normalizeAngle(currentMoonPos.longitude - ayanamsa);
            
            const currentSum = this.normalizeAngle(sunLon + moonLon);
            const yogaArc = 360 / 27; // 13.333... degrees per yoga
            const currentYogaNum = Math.floor(currentSum / yogaArc);
            
            // Find when sum reaches next yoga
            const nextYogaStart = (currentYogaNum + 1) * yogaArc;
            const longitudeDiff = this.normalizeAngle(nextYogaStart - currentSum);
            
            // Yoga changes based on combined motion of Sun and Moon
            const combinedDailyMotion = 13.2 + 0.985; // Moon + Sun daily motion
            const daysToTarget = longitudeDiff / combinedDailyMotion;
            
            const endTime = new Date(date.getTime() + daysToTarget * 24 * 60 * 60 * 1000);
            return endTime;
        } catch (error) {
            return null;
        }
    }

    /**
     * Calculate when current Karana ends
     */
    private calculateKaranaEndTime(date: Date, location: Location): Date | null {
        try {
            const currentSunPos = this.ephemeris.calculatePosition(date, 'Sun');
            const currentMoonPos = this.ephemeris.calculatePosition(date, 'Moon');
            const ayanamsa = this.ephemeris.calculateLahiriAyanamsa(date);
            
            const sunLon = this.normalizeAngle(currentSunPos.longitude - ayanamsa);
            const moonLon = this.normalizeAngle(currentMoonPos.longitude - ayanamsa);
            
            const currentElongation = this.normalizeAngle(moonLon - sunLon);
            const karanaArc = 6; // Each karana = 6 degrees (half tithi)
            const currentKaranaInCycle = Math.floor(currentElongation / karanaArc);
            
            // Find when Moon reaches next karana
            const nextKaranaStart = (currentKaranaInCycle + 1) * karanaArc;
            const longitudeDiff = this.normalizeAngle(nextKaranaStart - currentElongation);
            
            // Estimate time using Moon's daily motion relative to Sun
            const relativeDailyMotion = 13.2 - 0.985; // Moon - Sun daily motion
            const daysToTarget = longitudeDiff / relativeDailyMotion;
            
            const endTime = new Date(date.getTime() + daysToTarget * 24 * 60 * 60 * 1000);
            return endTime;
        } catch (error) {
            return null;
        }
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
