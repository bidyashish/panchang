/**
 * Enhanced Panchanga calculations with all advanced features
 * Traditional Hindu calendar system with Muhurat, Transitions, and more
 */

import { Ephemeris } from '../calculations/ephemeris';
import { Planetary, TithiInfo } from '../calculations/planetary';
import { Location } from '../types/astronomical';
import { normalizeAngle } from '../utils/index';
import { MuhuratCalculator, MuhuratPeriods } from './muhurat';
import { TransitionCalculator } from './transitions';

export interface EnhancedPanchangaData {
    date: Date;
    location?: { latitude: number; longitude: number; timezone: string; name?: string };
    tithi: TithiInfo & { endTime?: Date | null };
    nakshatra: { nakshatra: number; pada: number; name: string; endTime?: Date | null; percentage: number };
    yoga: { yoga: number; name: string; endTime?: Date | null; percentage: number };
    karana: { karana: number; name: string; endTime?: Date | null };
    karanaTransitions: Array<{ karana: string; startTime: Date; endTime: Date | null }>;
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
    muhurat: MuhuratPeriods;
    kalam: {
        rahu: { start: Date | null; end: Date | null };
        gulikai: { start: Date | null; end: Date | null };
        yamaganda: { start: Date | null; end: Date | null };
    };
}

export class EnhancedPanchanga {
    private ephemeris: Ephemeris;
    private planetary: Planetary;
    private transitionCalculator: TransitionCalculator;

    private varaNames = [
        'Sunday', 'Monday', 'Tuesday', 'Wednesday', 
        'Thursday', 'Friday', 'Saturday'
    ];

    private lunarMonths = [
        'Chaitra', 'Vaisakha', 'Jyaistha', 'Ashadha',
        'Shravana', 'Bhadrapada', 'Ashwin', 'Kartika',
        'Margashirsha', 'Pausha', 'Magha', 'Phalguna'
    ];

    private seasons = ['Vasanta', 'Grishma', 'Varsha', 'Sharad', 'Shishira', 'Hemanta'];

    constructor() {
        this.ephemeris = new Ephemeris();
        this.planetary = new Planetary();
        this.transitionCalculator = new TransitionCalculator();
    }

    calculatePanchanga(date: Date, location: Location, useSidereal: boolean = true): EnhancedPanchangaData {
        const inputDate = date;

        try {
            // Calculate sunrise/sunset and other solar events for the given date
            const sunrise = this.ephemeris.calculateSunrise(inputDate, location);
            const sunset = this.ephemeris.calculateSunset(inputDate, location);
            const moonrise = this.ephemeris.calculateMoonrise(inputDate, location);
            const moonset = this.ephemeris.calculateMoonset(inputDate, location);

            // Calculate day/night durations and madhyahna
            const { dinamana, ratrimana, madhyahna } = this.calculateTimeIntervals(sunrise, sunset);

            // Calculate Muhurat periods
            const muhurat = MuhuratCalculator.calculateMuhurats(sunrise, sunset, inputDate);

            // Calculate Kalam periods
            const kalam = this.calculateKalamPeriods(sunrise, sunset, inputDate);

            // CRITICAL: Traditional Panchanga uses positions at SUNRISE, not the input time
            // This is a fundamental principle of Vedic Panchanga calculations
            // If sunrise calculation fails or returns invalid date, use inputDate at local sunrise time (6 AM local)
            let calculationTime: Date;
            if (sunrise && !isNaN(sunrise.getTime())) {
                calculationTime = sunrise;
            } else {
                // Fallback: Use inputDate but set time to approximate sunrise (6 AM local time)
                calculationTime = new Date(inputDate);
                calculationTime.setHours(6, 0, 0, 0);
            }

            // Get celestial positions at sunrise for accurate Panchanga
            const sunPos = this.ephemeris.calculateSiderealPosition(calculationTime, 'Sun');
            const moonPos = this.ephemeris.calculateSiderealPosition(calculationTime, 'Moon');

            // Calculate basic Panchanga elements
            const tithiData = this.planetary.calculateTithi(sunPos.longitude, moonPos.longitude);
            const nakshatraData = this.ephemeris.calculateNakshatra(moonPos.longitude);
            const yogaData = this.planetary.calculateYoga(sunPos.longitude, moonPos.longitude);
            const karanaData = this.planetary.calculateKarana(sunPos.longitude, moonPos.longitude);
            
            // Calculate transition times for each element
            const tithiWithEnd = {
                ...tithiData,
                endTime: this.transitionCalculator.calculateTithiEndTime(inputDate, location)
            };

            const nakshatraWithEnd = {
                ...nakshatraData,
                endTime: this.transitionCalculator.calculateNakshatraEndTime(inputDate, location),
                percentage: this.calculateNakshatraPercentage(moonPos.longitude, nakshatraData.nakshatra)
            };

            const yogaWithEnd = {
                ...yogaData,
                endTime: this.transitionCalculator.calculateYogaEndTime(inputDate, location),
                percentage: this.calculateYogaPercentage(sunPos.longitude, moonPos.longitude, yogaData.yoga)
            };

            const karanaWithEnd = {
                ...karanaData,
                endTime: this.transitionCalculator.calculateKaranaEndTime(inputDate, location)
            };

            // Calculate detailed Karana transitions for the day
            const karanaTransitions = this.transitionCalculator.calculateKaranaTransitions(inputDate, location);
            
            // Calculate vara (day of week)
            const vara = this.calculateVara(inputDate);
            
            // Moon phase
            const moonPhase = this.calculateMoonPhase(sunPos.longitude, moonPos.longitude);
            
            // Calculate lunar month
            const lunarMonth = this.calculateLunarMonth(sunPos.longitude, moonPos.longitude);
            
            // Calculate Paksha
            const paksha = this.calculatePaksha(sunPos.longitude, moonPos.longitude);
            
            // Calculate Samvata years
            const samvata = this.calculateSamvata(inputDate);
            
            // Calculate sun and moon signs
            const sunsign = this.calculateSunSign(sunPos.longitude);
            const moonsign = this.calculateMoonSign(moonPos.longitude);
            
            // Calculate Surya Nakshatra
            const suryaNakshatra = this.ephemeris.calculateNakshatra(sunPos.longitude);
            
            // Calculate seasons and Ayana
            const ritu = this.calculateRitu(sunPos.longitude);
            const ayana = this.calculateAyana(sunPos.longitude);

            return {
                date: inputDate,
                location: {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    timezone: location.timezone || 'UTC'
                },
                tithi: tithiWithEnd,
                nakshatra: nakshatraWithEnd,
                yoga: yogaWithEnd,
                karana: karanaWithEnd,
                karanaTransitions,
                vara,
                sunrise,
                sunset,
                moonrise,
                moonset,
                moonPhase,
                lunarMonth,
                paksha,
                samvata,
                sunsign,
                moonsign,
                suryaNakshatra,
                ritu,
                ayana,
                madhyahna,
                dinamana,
                ratrimana,
                muhurat,
                kalam
            };
        } catch (error) {
            console.error('Error calculating Enhanced Panchanga:', error);
            throw error;
        }
    }

    private calculateTimeIntervals(sunrise: Date | null, sunset: Date | null) {
        let dinamana = { hours: 12, minutes: 0, seconds: 0 };
        let ratrimana = { hours: 12, minutes: 0, seconds: 0 };
        let madhyahna: Date | null = null;

        if (sunrise && sunset) {
            const dayDuration = sunset.getTime() - sunrise.getTime();
            const totalHours = dayDuration / (1000 * 60 * 60);
            
            dinamana = {
                hours: Math.floor(totalHours),
                minutes: Math.floor((totalHours % 1) * 60),
                seconds: Math.floor(((totalHours % 1) * 60 % 1) * 60)
            };

            const nightDuration = 24 * 60 * 60 * 1000 - dayDuration;
            const nightHours = nightDuration / (1000 * 60 * 60);
            
            ratrimana = {
                hours: Math.floor(nightHours),
                minutes: Math.floor((nightHours % 1) * 60),
                seconds: Math.floor(((nightHours % 1) * 60 % 1) * 60)
            };

            madhyahna = new Date(sunrise.getTime() + dayDuration / 2);
        }

        return { dinamana, ratrimana, madhyahna };
    }

    private calculateKalamPeriods(sunrise: Date | null, sunset: Date | null, date: Date) {
        if (!sunrise || !sunset) {
            return {
                rahu: { start: null, end: null },
                gulikai: { start: null, end: null },
                yamaganda: { start: null, end: null }
            };
        }

        const dayLength = sunset.getTime() - sunrise.getTime();
        const oneEighth = dayLength / 8;
        const dayOfWeek = date.getDay();

        // Rahu Kaal periods based on weekday
        const rahuPeriods = [4, 1, 6, 3, 2, 5, 0]; // Sun, Mon, Tue, Wed, Thu, Fri, Sat
        const rahuStart = new Date(sunrise.getTime() + rahuPeriods[dayOfWeek] * oneEighth);
        const rahuEnd = new Date(rahuStart.getTime() + oneEighth);

        // Gulikai Kaal periods
        const gulikaiPeriods = [6, 4, 2, 1, 3, 0, 5];
        const gulikaiStart = new Date(sunrise.getTime() + gulikaiPeriods[dayOfWeek] * oneEighth);
        const gulikaiEnd = new Date(gulikaiStart.getTime() + oneEighth);

        // Yamaganda periods
        const yamagandaPeriods = [5, 3, 1, 4, 6, 2, 0];
        const yamagandaStart = new Date(sunrise.getTime() + yamagandaPeriods[dayOfWeek] * oneEighth);
        const yamagandaEnd = new Date(yamagandaStart.getTime() + oneEighth);

        return {
            rahu: { start: rahuStart, end: rahuEnd },
            gulikai: { start: gulikaiStart, end: gulikaiEnd },
            yamaganda: { start: yamagandaStart, end: yamagandaEnd }
        };
    }

    private calculateNakshatraPercentage(moonLongitude: number, nakshatraNumber: number): number {
        const nakshatraWidth = 360 / 27;
        const nakshatraStart = (nakshatraNumber - 1) * nakshatraWidth;
        const positionInNakshatra = normalizeAngle(moonLongitude - nakshatraStart);
        return (positionInNakshatra / nakshatraWidth) * 100;
    }

    private calculateYogaPercentage(sunLongitude: number, moonLongitude: number, yogaNumber: number): number {
        const combined = normalizeAngle(sunLongitude + moonLongitude);
        const yogaWidth = 360 / 27;
        const yogaStart = (yogaNumber - 1) * yogaWidth;
        const positionInYoga = normalizeAngle(combined - yogaStart);
        return (positionInYoga / yogaWidth) * 100;
    }

    private calculateVara(date: Date): { vara: number; name: string } {
        const varaNumber = date.getDay();
        return {
            vara: varaNumber,
            name: this.varaNames[varaNumber]
        };
    }

    private calculateMoonPhase(sunLongitude: number, moonLongitude: number): string {
        const elongation = normalizeAngle(moonLongitude - sunLongitude);
        
        if (elongation < 45) return 'New Moon';
        if (elongation < 90) return 'Waxing Crescent';
        if (elongation < 135) return 'First Quarter';
        if (elongation < 180) return 'Waxing Gibbous';
        if (elongation < 225) return 'Full Moon';
        if (elongation < 270) return 'Waning Gibbous';
        if (elongation < 315) return 'Last Quarter';
        return 'Waning Crescent';
    }

    private calculateLunarMonth(sunLongitude: number, moonLongitude: number): { amanta: string; purnimanta: string } {
        // Simplified lunar month calculation based on Sun's position
        const sunRashi = Math.floor(sunLongitude / 30);
        const amantaIndex = sunRashi;
        const purniIndex = (sunRashi + 1) % 12;
        
        return {
            amanta: this.lunarMonths[amantaIndex],
            purnimanta: this.lunarMonths[purniIndex]
        };
    }

    private calculatePaksha(sunLongitude: number, moonLongitude: number): string {
        const elongation = normalizeAngle(moonLongitude - sunLongitude);
        return elongation < 180 ? 'Shukla' : 'Krishna';
    }

    private calculateSamvata(date: Date): { shaka: number; vikrama: number; gujarati: number; name: string } {
        const year = date.getFullYear();
        return {
            shaka: year - 78,
            vikrama: year + 57,
            gujarati: year - 57,
            name: 'Kalayukta' // Simplified - actual calculation requires more complex logic
        };
    }

    private calculateSunSign(sunLongitude: number): string {
        const rashis = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya',
                       'Tula', 'Vrischika', 'Dhanus', 'Makara', 'Kumbha', 'Meena'];
        return rashis[Math.floor(sunLongitude / 30)];
    }

    private calculateMoonSign(moonLongitude: number): string {
        const rashis = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya',
                       'Tula', 'Vrischika', 'Dhanus', 'Makara', 'Kumbha', 'Meena'];
        return rashis[Math.floor(moonLongitude / 30)];
    }

    private calculateRitu(sunLongitude: number): { drik: string; vedic: string } {
        // Simplified season calculation
        const season = Math.floor((sunLongitude / 60) % 6);
        return {
            drik: this.seasons[season],
            vedic: this.seasons[season]
        };
    }

    private calculateAyana(sunLongitude: number): { drik: string; vedic: string } {
        const ayana = sunLongitude >= 180 ? 'Dakshinayana' : 'Uttarayana';
        return {
            drik: ayana,
            vedic: ayana
        };
    }
}

// For backward compatibility, export both old and new interfaces
export { EnhancedPanchangaData as PanchangaData };
export { EnhancedPanchanga as Panchanga };
