/**
 * Panchanga calculations - Traditional Hindu calendar system
 * Based on the original panchanga.py implementation
 */

import { Ephemeris } from '../calculations/ephemeris';
import { Planetary, TithiInfo } from '../calculations/planetary';
import { Location } from '../types/astronomical';
import { normalizeAngle } from '../utils/index';

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
    moonrise: Date | null;
    moonset: Date | null;
    moonPhase: string;
    lunarMonth: {
        amanta: string;
        purnimanta: string;
    };
    paksha: string;
    samvata: {
        shaka: number;
        vikrama: number;
        gujarati: number;
        name: string;
    };
    sunsign: string;
    moonsign: string;
    suryaNakshatra: {
        nakshatra: number;
        pada: number;
        name: string;
    };
    nakshatraPada: {
        pada1: { start: Date; end: Date };
        pada2: { start: Date; end: Date };
        pada3: { start: Date; end: Date };
        pada4: { start: Date; end: Date };
    };
    ritu: {
        drik: string;
        vedic: string;
    };
    ayana: {
        drik: string;
        vedic: string;
    };
    madhyahna: Date | null;
    dinamana: { hours: number; minutes: number; seconds: number };
    ratrimana: { hours: number; minutes: number; seconds: number };
    muhurat: {
        abhijita: { start: Date; end: Date };
        amritKalam: { start: Date; end: Date }[];
        sarvarthaSiddhiYoga: string;
        amritSiddhiYoga: { start: Date; end: Date };
        vijaya: { start: Date; end: Date };
        godhuli: { start: Date; end: Date };
        sayahnaSandhya: { start: Date; end: Date };
        nishita: { start: Date; end: Date };
        brahma: { start: Date; end: Date };
        pratahSandhya: { start: Date; end: Date };
    };
    kalam: {
        rahu: { start: Date; end: Date };
        gulikai: { start: Date; end: Date };
        yamaganda: { start: Date; end: Date };
    };
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

        // Calculate moonrise and moonset
        const moonriseTime = this.ephemeris.calculateMoonrise(inputDate, location);
        const moonsetTime = this.ephemeris.calculateMoonset(inputDate, location);

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
            moonrise: moonriseTime,
            moonset: moonsetTime,
            moonPhase,
            lunarMonth: this.calculateLunarMonth(sunPosition.longitude, moonPosition.longitude),
            paksha: this.calculatePaksha(moonPosition.longitude, sunPosition.longitude),
            samvata: this.calculateSamvata(date),
            sunsign: this.calculateSunsign(sunPosition.longitude),
            moonsign: this.calculateMoonsign(moonPosition.longitude),
            suryaNakshatra: this.ephemeris.calculateNakshatra(sunPosition.longitude),
            nakshatraPada: this.calculateNakshatraPada(date, location),
            ritu: this.calculateRitu(sunPosition.longitude),
            ayana: this.calculateAyana(sunPosition.longitude),
            madhyahna: this.calculateMadhyahna(sunriseTime, sunsetTime),
            dinamana: this.calculateDinamana(sunriseTime, sunsetTime),
            ratrimana: this.calculateRatrimana(sunriseTime, sunsetTime),
            muhurat: this.calculateMuhurat(date, location, sunriseTime, sunsetTime),
            kalam: this.calculateKalam(date, location, sunriseTime, sunsetTime),
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
            // Use UTC methods to avoid timezone issues
            const startOfDayUTC = new Date(Date.UTC(
                baseDate.getUTCFullYear(),
                baseDate.getUTCMonth(),
                baseDate.getUTCDate(),
                0, 0, 0, 0
            ));
            
            let bestEndTime: Date | null = null;
            
            // Check every hour of the day to find nakshatra transitions
            for (let hour = 0; hour < 48; hour++) { // Check 48 hours (today + tomorrow)
                const testTime = new Date(startOfDayUTC.getTime() + hour * 60 * 60 * 1000);
                
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

    private calculateLunarMonth(sunLongitude: number, moonLongitude: number): { amanta: string; purnimanta: string } {
        // This is a simplified calculation. A more accurate calculation would require a database of lunar months.
        const lunarMonths = ['Chaitra', 'Vaisakha', 'Jyaistha', 'Ashadha', 'Shravana', 'Bhadrapada', 'Ashvina', 'Kartika', 'Margashirsha', 'Pausha', 'Magha', 'Phalguna'];
        const amantaMonthIndex = Math.floor(sunLongitude / 30);
        const purnimantaMonthIndex = Math.floor(this.normalizeAngle(moonLongitude - 180) / 30);
        return { amanta: lunarMonths[amantaMonthIndex], purnimanta: lunarMonths[purnimantaMonthIndex] };
    }

    private calculatePaksha(moonLongitude: number, sunLongitude: number): string {
        const longitudeDiff = this.normalizeAngle(moonLongitude - sunLongitude);
        return longitudeDiff < 180 ? 'Shukla Paksha' : 'Krishna Paksha';
    }

    private calculateSamvata(date: Date): { shaka: number; vikrama: number; gujarati: number; name: string } {
        // These are approximate calculations. A more accurate calculation would require a database of samvatas.
        // Use UTC year to avoid timezone issues
        const year = date.getUTCFullYear();
        const shaka = year - 78;
        const vikrama = year + 57;
        const gujarati = year + 56;
        return { shaka, vikrama, gujarati, name: 'Vishvavasu' };
    }

    private calculateSunsign(sunLongitude: number): string {
        const rashiNames = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
        const rashi = Math.floor(sunLongitude / 30);
        return rashiNames[rashi];
    }

    private calculateMoonsign(moonLongitude: number): string {
        const rashiNames = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
        const rashi = Math.floor(moonLongitude / 30);
        return rashiNames[rashi];
    }

    private calculateNakshatraPada(date: Date, location: Location): { pada1: { start: Date; end: Date }; pada2: { start: Date; end: Date }; pada3: { start: Date; end: Date }; pada4: { start: Date; end: Date } } {
        // This is a placeholder implementation. A more accurate calculation would require more complex logic.
        const nakshatraEndTime = this.calculateNakshatraEndTime(date, location);
        if (!nakshatraEndTime) {
            // Return current time for all padas as fallback
            const currentTime = new Date(date.getTime());
            return {
                pada1: { start: currentTime, end: currentTime },
                pada2: { start: currentTime, end: currentTime },
                pada3: { start: currentTime, end: currentTime },
                pada4: { start: currentTime, end: currentTime },
            };
        }
        const nakshatraStartTime = new Date(nakshatraEndTime.getTime() - 24 * 60 * 60 * 1000);
        const padaDuration = (nakshatraEndTime.getTime() - nakshatraStartTime.getTime()) / 4;
        const pada1 = { start: nakshatraStartTime, end: new Date(nakshatraStartTime.getTime() + padaDuration) };
        const pada2 = { start: pada1.end, end: new Date(pada1.end.getTime() + padaDuration) };
        const pada3 = { start: pada2.end, end: new Date(pada2.end.getTime() + padaDuration) };
        const pada4 = { start: pada3.end, end: nakshatraEndTime };
        return { pada1, pada2, pada3, pada4 };
    }

    private calculateRitu(sunLongitude: number): { drik: string; vedic: string } {
        // This is a simplified calculation. A more accurate calculation would require more complex logic.
        const rituNames = ['Vasant', 'Grishma', 'Varsha', 'Shishir', 'Hemant', 'Sharad'];
        const rituIndex = Math.floor(sunLongitude / 60);
        return { drik: rituNames[rituIndex], vedic: rituNames[rituIndex] };
    }

    private calculateAyana(sunLongitude: number): { drik: string; vedic: string } {
        // This is a simplified calculation. A more accurate calculation would require more complex logic.
        if (sunLongitude > 180) {
            return { drik: 'Dakshinayana', vedic: 'Dakshinayana' };
        } else {
            return { drik: 'Uttarayana', vedic: 'Uttarayana' };
        }
    }

    private calculateMadhyahna(sunrise: Date | null, sunset: Date | null): Date | null {
        if (!sunrise || !sunset) return null;
        const madhyahnaTime = new Date((sunrise.getTime() + sunset.getTime()) / 2);
        return madhyahnaTime;
    }

    private calculateDinamana(sunrise: Date | null, sunset: Date | null): { hours: number; minutes: number; seconds: number } {
        if (!sunrise || !sunset) return { hours: 0, minutes: 0, seconds: 0 };
        const dinamana = sunset.getTime() - sunrise.getTime();
        const hours = Math.floor(dinamana / 3600000);
        const minutes = Math.floor((dinamana % 3600000) / 60000);
        const seconds = Math.floor(((dinamana % 3600000) % 60000) / 1000);
        return { hours, minutes, seconds };
    }

    private calculateRatrimana(sunrise: Date | null, sunset: Date | null): { hours: number; minutes: number; seconds: number } {
        if (!sunrise || !sunset) return { hours: 0, minutes: 0, seconds: 0 };
        const ratrimana = 24 * 60 * 60 * 1000 - (sunset.getTime() - sunrise.getTime());
        const hours = Math.floor(ratrimana / 3600000);
        const minutes = Math.floor((ratrimana % 3600000) / 60000);
        const seconds = Math.floor(((ratrimana % 3600000) % 60000) / 1000);
        return { hours, minutes, seconds };
    }

    private calculateMuhurat(date: Date, location: Location, sunrise: Date | null, sunset: Date | null): any {
        if (!sunrise || !sunset) return {};
        const dayLength = sunset.getTime() - sunrise.getTime();
        const nightLength = 24 * 60 * 60 * 1000 - dayLength;
        const dayMuhurat = dayLength / 15;
        const nightMuhurat = nightLength / 15;

        const abhijita = { start: new Date(sunrise.getTime() + 7 * dayMuhurat), end: new Date(sunrise.getTime() + 8 * dayMuhurat) };
        const amritKalam = [{ start: new Date(sunrise.getTime() + 6 * dayMuhurat), end: new Date(sunrise.getTime() + 7 * dayMuhurat) }];
        const sarvarthaSiddhiYoga = 'Ahoratri';
        const amritSiddhiYoga = { start: new Date(sunrise.getTime() + 2 * dayMuhurat), end: new Date(sunrise.getTime() + 3 * dayMuhurat) };
        const vijaya = { start: new Date(sunrise.getTime() + 11 * dayMuhurat), end: new Date(sunrise.getTime() + 12 * dayMuhurat) };
        const godhuli = { start: new Date(sunset.getTime() - 24 * 60 * 1000), end: new Date(sunset.getTime() + 24 * 60 * 1000) };
        const sayahnaSandhya = { start: new Date(sunset.getTime() - 12 * 60 * 1000), end: new Date(sunset.getTime() + 12 * 60 * 1000) };
        const nishita = { start: new Date(sunset.getTime() + 7 * nightMuhurat), end: new Date(sunset.getTime() + 8 * nightMuhurat) };
        const brahma = { start: new Date(sunrise.getTime() - 2 * nightMuhurat), end: new Date(sunrise.getTime() - nightMuhurat) };
        const pratahSandhya = { start: new Date(sunrise.getTime() - nightMuhurat), end: sunrise };

        return { abhijita, amritKalam, sarvarthaSiddhiYoga, amritSiddhiYoga, vijaya, godhuli, sayahnaSandhya, nishita, brahma, pratahSandhya };
    }

    private calculateKalam(date: Date, location: Location, sunrise: Date | null, sunset: Date | null): any {
        if (!sunrise || !sunset) return {};
        const dayLength = sunset.getTime() - sunrise.getTime();
        const oneEighth = dayLength / 8;

        const rahuKaalPeriod = [4, 1, 6, 3, 2, 5, 0];
        const rahuStart = new Date(sunrise.getTime() + rahuKaalPeriod[date.getDay()] * oneEighth);
        const rahuEnd = new Date(rahuStart.getTime() + oneEighth);

        const gulikaiKaalPeriod = [6, 5, 4, 3, 2, 1, 0];
        const gulikaiStart = new Date(sunrise.getTime() + gulikaiKaalPeriod[date.getDay()] * oneEighth);
        const gulikaiEnd = new Date(gulikaiStart.getTime() + oneEighth);

        const yamagandaKaalPeriod = [5, 4, 3, 2, 1, 0, 6];
        const yamagandaStart = new Date(sunrise.getTime() + yamagandaKaalPeriod[date.getDay()] * oneEighth);
        const yamagandaEnd = new Date(yamagandaStart.getTime() + oneEighth);

        return { rahu: { start: rahuStart, end: rahuEnd }, gulikai: { start: gulikaiStart, end: gulikaiEnd }, yamaganda: { start: yamagandaStart, end: yamagandaEnd } };
    }

    /**
     * Generate formatted Panchanga report
     */
    generateReport(panchangaData: PanchangaData): string {
        const { date, location, tithi, nakshatra, yoga, karana, vara, sunrise, sunset, moonrise, moonset, moonPhase, lunarMonth, paksha, samvata, sunsign, moonsign, suryaNakshatra, nakshatraPada, ritu, ayana, madhyahna, dinamana, ratrimana, muhurat, kalam } = panchangaData;
        
        let report = `\n=== PANCHANGA for ${date.toDateString()} ===\n`;
        
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
            report += `SUNSET: ${sunset.toLocaleTimeString()}\n`;
        }
        if (moonrise) {
            report += `MOONRISE: ${moonrise.toLocaleTimeString()}\n`;
        }
        if (moonset) {
            report += `MOONSET: ${moonset.toLocaleTimeString()}\n\n`;
        }
        
        // Additional information
        report += `LUNAR MONTH: Amanta: ${lunarMonth.amanta}, Purnimanta: ${lunarMonth.purnimanta}\n`;
        report += `PAKSHA: ${paksha}\n`;
        report += `SAMVATA: Shaka: ${samvata.shaka}, Vikrama: ${samvata.vikrama}, Gujarati: ${samvata.gujarati}, Name: ${samvata.name}\n`;
        report += `SUNSIGN: ${sunsign}\n`;
        report += `MOONSIGN: ${moonsign}\n`;
        report += `SURYA NAKSHATRA: ${suryaNakshatra.name}, Pada: ${suryaNakshatra.pada}\n`;
        report += `NAKSHATRA PADA: 1: ${nakshatraPada.pada1.start.toLocaleTimeString()} - ${nakshatraPada.pada1.end.toLocaleTimeString()}, 2: ${nakshatraPada.pada2.start.toLocaleTimeString()} - ${nakshatraPada.pada2.end.toLocaleTimeString()}, 3: ${nakshatraPada.pada3.start.toLocaleTimeString()} - ${nakshatraPada.pada3.end.toLocaleTimeString()}, 4: ${nakshatraPada.pada4.start.toLocaleTimeString()} - ${nakshatraPada.pada4.end.toLocaleTimeString()}\n`;
        report += `RITU: Drik: ${ritu.drik}, Vedic: ${ritu.vedic}\n`;
        report += `AYANA: Drik: ${ayana.drik}, Vedic: ${ayana.vedic}\n`;
        if (madhyahna) {
            report += `MADHYAHNA: ${madhyahna.toLocaleTimeString()}\n`;
        }
        report += `DINAMANA: ${dinamana.hours}h ${dinamana.minutes}m ${dinamana.seconds}s\n`;
        report += `RATRIMANA: ${ratrimana.hours}h ${ratrimana.minutes}m ${ratrimana.seconds}s\n\n`;

        report += `MUHURAT:\n`;
        report += `  Abhijita: ${muhurat.abhijita.start.toLocaleTimeString()} - ${muhurat.abhijita.end.toLocaleTimeString()}\n`;
        report += `  Amrit Kalam: ${muhurat.amritKalam.map(m => `${m.start.toLocaleTimeString()} - ${m.end.toLocaleTimeString()}`).join(', ')}\n`;
        report += `  Sarvartha Siddhi Yoga: ${muhurat.sarvarthaSiddhiYoga}\n`;
        report += `  Amrit Siddhi Yoga: ${muhurat.amritSiddhiYoga.start.toLocaleTimeString()} - ${muhurat.amritSiddhiYoga.end.toLocaleTimeString()}\n`;
        report += `  Vijaya: ${muhurat.vijaya.start.toLocaleTimeString()} - ${muhurat.vijaya.end.toLocaleTimeString()}\n`;
        report += `  Godhuli: ${muhurat.godhuli.start.toLocaleTimeString()} - ${muhurat.godhuli.end.toLocaleTimeString()}\n`;
        report += `  Sayahna Sandhya: ${muhurat.sayahnaSandhya.start.toLocaleTimeString()} - ${muhurat.sayahnaSandhya.end.toLocaleTimeString()}\n`;
        report += `  Nishita: ${muhurat.nishita.start.toLocaleTimeString()} - ${muhurat.nishita.end.toLocaleTimeString()}\n`;
        report += `  Brahma: ${muhurat.brahma.start.toLocaleTimeString()} - ${muhurat.brahma.end.toLocaleTimeString()}\n`;
        report += `  Pratah Sandhya: ${muhurat.pratahSandhya.start.toLocaleTimeString()} - ${muhurat.pratahSandhya.end.toLocaleTimeString()}\n\n`;

        report += `KALAM:\n`;
        report += `  Rahu: ${kalam.rahu.start.toLocaleTimeString()} - ${kalam.rahu.end.toLocaleTimeString()}\n`;
        report += `  Gulikai: ${kalam.gulikai.start.toLocaleTimeString()} - ${kalam.gulikai.end.toLocaleTimeString()}\n`;
        report += `  Yamaganda: ${kalam.yamaganda.start.toLocaleTimeString()} - ${kalam.yamaganda.end.toLocaleTimeString()}\n`;

        return report;
    }

    cleanup(): void {
        this.ephemeris.cleanup();
    }
}
