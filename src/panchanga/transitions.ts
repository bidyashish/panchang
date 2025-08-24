/**
 * Transition Time Calculations for Panchanga Elements
 * Calculates when current Tithi, Nakshatra, Yoga, and Karana end
 */

import { Ephemeris } from '../calculations/ephemeris';
import { Planetary } from '../calculations/planetary';
import { Location } from '../types/astronomical';

export class TransitionCalculator {
    private ephemeris: Ephemeris;
    private planetary: Planetary;

    constructor() {
        this.ephemeris = new Ephemeris();
        this.planetary = new Planetary();
    }

    /**
     * Calculate when current Tithi ends
     */
    calculateTithiEndTime(date: Date, location: Location): Date | null {
        try {
            // Get current Sun and Moon positions
            const sunPos = this.ephemeris.calculateSiderealPosition(date, 'Sun');
            const moonPos = this.ephemeris.calculateSiderealPosition(date, 'Moon');
            
            const currentTithi = this.planetary.calculateTithi(sunPos.longitude, moonPos.longitude);
            const currentTithiNum = currentTithi.tithi;
            
            // Each Tithi is 12 degrees of Moon's motion relative to Sun
            const targetElongation = (currentTithiNum % 30) * 12;
            const nextTargetElongation = ((currentTithiNum % 30) + 1) * 12;
            
            // Search for when the next Tithi begins (binary search approach)
            return this.findTransitionTime(
                date,
                location,
                'tithi',
                nextTargetElongation,
                24 * 60 * 60 * 1000 // Search within next 24 hours
            );
        } catch (error) {
            console.warn('Could not calculate Tithi end time:', error);
            return null;
        }
    }

    /**
     * Calculate when current Nakshatra ends
     */
    calculateNakshatraEndTime(date: Date, location: Location): Date | null {
        try {
            const moonPos = this.ephemeris.calculateSiderealPosition(date, 'Moon');
            const currentNakshatra = this.ephemeris.calculateNakshatra(moonPos.longitude);
            const currentNakshatraNum = currentNakshatra.nakshatra;
            
            // Each Nakshatra is 13.33333... degrees (800/60)
            const nakshatraWidth = 360 / 27; // 13.333... degrees
            const nextNakshatraBoundary = ((currentNakshatraNum % 27) + 1) * nakshatraWidth;
            
            return this.findMoonTransition(
                date,
                location,
                nextNakshatraBoundary,
                3 * 24 * 60 * 60 * 1000 // Search within next 3 days (max time for Moon to move 13+ degrees)
            );
        } catch (error) {
            console.warn('Could not calculate Nakshatra end time:', error);
            return null;
        }
    }

    /**
     * Calculate when current Yoga ends
     */
    calculateYogaEndTime(date: Date, location: Location): Date | null {
        try {
            const sunPos = this.ephemeris.calculateSiderealPosition(date, 'Sun');
            const moonPos = this.ephemeris.calculateSiderealPosition(date, 'Moon');
            const currentYoga = this.planetary.calculateYoga(sunPos.longitude, moonPos.longitude);
            const currentYogaNum = currentYoga.yoga;
            
            // Each Yoga is 13.33333... degrees of combined Sun-Moon motion
            const yogaWidth = 360 / 27; // 13.333... degrees
            const nextYogaBoundary = ((currentYogaNum % 27) + 1) * yogaWidth;
            
            return this.findTransitionTime(
                date,
                location,
                'yoga',
                nextYogaBoundary,
                24 * 60 * 60 * 1000 // Search within next 24 hours
            );
        } catch (error) {
            console.warn('Could not calculate Yoga end time:', error);
            return null;
        }
    }

    /**
     * Calculate when current Karana ends
     */
    calculateKaranaEndTime(date: Date, location: Location): Date | null {
        try {
            const sunPos = this.ephemeris.calculateSiderealPosition(date, 'Sun');
            const moonPos = this.ephemeris.calculateSiderealPosition(date, 'Moon');
            const currentKarana = this.planetary.calculateKarana(sunPos.longitude, moonPos.longitude);
            
            // Karana changes twice per Tithi (every 6 degrees of Moon-Sun elongation)
            const currentElongation = this.calculateMoonSunElongation(date);
            const nextKaranaBoundary = Math.ceil(currentElongation / 6) * 6;
            
            return this.findTransitionTime(
                date,
                location,
                'karana',
                nextKaranaBoundary,
                12 * 60 * 60 * 1000 // Search within next 12 hours (max half Tithi duration)
            );
        } catch (error) {
            console.warn('Could not calculate Karana end time:', error);
            return null;
        }
    }

    /**
     * Calculate specific time-based Karana transitions for the day
     */
    calculateKaranaTransitions(date: Date, location: Location): Array<{ karana: string; startTime: Date; endTime: Date | null }> {
        const transitions: Array<{ karana: string; startTime: Date; endTime: Date | null }> = [];
        
        try {
            // Start from midnight of the given date
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            
            // Check every hour throughout the day for Karana changes
            let currentTime = new Date(startOfDay);
            let sunPos = this.ephemeris.calculateSiderealPosition(currentTime, 'Sun');
            let moonPos = this.ephemeris.calculateSiderealPosition(currentTime, 'Moon');
            let currentKarana = this.planetary.calculateKarana(sunPos.longitude, moonPos.longitude);
            let transitionStart = new Date(currentTime);
            
            for (let hour = 1; hour <= 24; hour++) {
                currentTime = new Date(startOfDay.getTime() + hour * 60 * 60 * 1000);
                sunPos = this.ephemeris.calculateSiderealPosition(currentTime, 'Sun');
                moonPos = this.ephemeris.calculateSiderealPosition(currentTime, 'Moon');
                const newKarana = this.planetary.calculateKarana(sunPos.longitude, moonPos.longitude);
                
                if (newKarana.name !== currentKarana.name) {
                    // Karana changed, record the transition
                    transitions.push({
                        karana: currentKarana.name,
                        startTime: transitionStart,
                        endTime: new Date(currentTime)
                    });
                    
                    currentKarana = newKarana;
                    transitionStart = new Date(currentTime);
                }
            }
            
            // Add the final Karana of the day
            if (currentKarana) {
                transitions.push({
                    karana: currentKarana.name,
                    startTime: transitionStart,
                    endTime: null // Continues into next day
                });
            }
            
            return transitions;
        } catch (error) {
            console.warn('Could not calculate Karana transitions:', error);
            return [];
        }
    }

    /**
     * Generic transition finder using binary search
     */
    private findTransitionTime(
        startDate: Date,
        location: Location,
        elementType: 'tithi' | 'yoga' | 'karana',
        targetValue: number,
        searchDuration: number
    ): Date | null {
        let left = startDate.getTime();
        let right = startDate.getTime() + searchDuration;
        const precision = 60 * 1000; // 1 minute precision
        
        while (right - left > precision) {
            const mid = Math.floor((left + right) / 2);
            const midDate = new Date(mid);
            
            let currentValue: number;
            
            switch (elementType) {
                case 'tithi':
                    currentValue = this.calculateMoonSunElongation(midDate);
                    break;
                case 'yoga':
                    currentValue = this.calculateSunMoonCombinedMotion(midDate);
                    break;
                case 'karana':
                    currentValue = this.calculateMoonSunElongation(midDate);
                    break;
                default:
                    return null;
            }
            
            if (currentValue < targetValue) {
                left = mid;
            } else {
                right = mid;
            }
        }
        
        return new Date(right);
    }

    /**
     * Find Moon position transition (for Nakshatra changes)
     */
    private findMoonTransition(
        startDate: Date,
        location: Location,
        targetLongitude: number,
        searchDuration: number
    ): Date | null {
        let left = startDate.getTime();
        let right = startDate.getTime() + searchDuration;
        const precision = 60 * 1000; // 1 minute precision
        
        while (right - left > precision) {
            const mid = Math.floor((left + right) / 2);
            const midDate = new Date(mid);
            
            const moonPos = this.ephemeris.calculateSiderealPosition(midDate, 'Moon');
            const currentLongitude = moonPos.longitude;
            
            if (currentLongitude < targetLongitude) {
                left = mid;
            } else {
                right = mid;
            }
        }
        
        return new Date(right);
    }

    /**
     * Calculate Moon-Sun elongation (for Tithi and Karana)
     */
    private calculateMoonSunElongation(date: Date): number {
        const sunPos = this.ephemeris.calculateSiderealPosition(date, 'Sun');
        const moonPos = this.ephemeris.calculateSiderealPosition(date, 'Moon');
        
        let elongation = moonPos.longitude - sunPos.longitude;
        if (elongation < 0) elongation += 360;
        
        return elongation;
    }

    /**
     * Calculate combined Sun-Moon motion (for Yoga)
     */
    private calculateSunMoonCombinedMotion(date: Date): number {
        const sunPos = this.ephemeris.calculateSiderealPosition(date, 'Sun');
        const moonPos = this.ephemeris.calculateSiderealPosition(date, 'Moon');
        
        let combined = sunPos.longitude + moonPos.longitude;
        return combined % 360;
    }
}
