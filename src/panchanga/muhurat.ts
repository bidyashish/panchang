/**
 * Muhurat calculations for Hindu calendar system
 * Provides auspicious time periods for various activities
 */

export interface MuhuratPeriods {
    abhijita: { start: Date | null; end: Date | null };
    amritKalam: Array<{ start: Date | null; end: Date | null }>;
    sarvarthaSiddhiYoga: string;
    amritSiddhiYoga: { start: Date | null; end: Date | null };
    vijaya: { start: Date | null; end: Date | null };
    godhuli: { start: Date | null; end: Date | null };
    sayahnaSandhya: { start: Date | null; end: Date | null };
    nishita: { start: Date | null; end: Date | null };
    brahma: { start: Date | null; end: Date | null };
    pratahSandhya: { start: Date | null; end: Date | null };
}

export class MuhuratCalculator {
    /**
     * Calculate all Muhurat periods for a given day
     * @param sunrise Sunrise time
     * @param sunset Sunset time
     * @param date Date for calculation
     * @returns All muhurat periods for the day
     */
    static calculateMuhurats(sunrise: Date | null, sunset: Date | null, date: Date): MuhuratPeriods {
        if (!sunrise || !sunset) {
            return {
                abhijita: { start: null, end: null },
                amritKalam: [],
                sarvarthaSiddhiYoga: 'Unknown',
                amritSiddhiYoga: { start: null, end: null },
                vijaya: { start: null, end: null },
                godhuli: { start: null, end: null },
                sayahnaSandhya: { start: null, end: null },
                nishita: { start: null, end: null },
                brahma: { start: null, end: null },
                pratahSandhya: { start: null, end: null }
            };
        }

        const dayLength = sunset.getTime() - sunrise.getTime();
        const nightLength = 24 * 60 * 60 * 1000 - dayLength;
        
        // Divide day and night into 15 muhurat periods each
        const dayMuhurat = dayLength / 15;
        const nightMuhurat = nightLength / 15;

        // Abhijita Muhurat - 8th muhurat of the day (11:30 AM - 12:18 PM approximately)
        const abhijita = {
            start: new Date(sunrise.getTime() + 7 * dayMuhurat),
            end: new Date(sunrise.getTime() + 8 * dayMuhurat)
        };

        // Amrit Kalam - Multiple periods throughout the day
        const amritKalam = [
            {
                start: new Date(sunrise.getTime() + 6 * dayMuhurat),
                end: new Date(sunrise.getTime() + 7 * dayMuhurat)
            }
        ];

        // Sarvartha Siddhi Yoga - varies by weekday and other factors
        const sarvarthaSiddhiYoga = this.calculateSarvarthaSiddhiYoga(date);

        // Amrit Siddhi Yoga - 3rd muhurat of the day
        const amritSiddhiYoga = {
            start: new Date(sunrise.getTime() + 2 * dayMuhurat),
            end: new Date(sunrise.getTime() + 3 * dayMuhurat)
        };

        // Vijaya Muhurat - 12th muhurat of the day
        const vijaya = {
            start: new Date(sunrise.getTime() + 11 * dayMuhurat),
            end: new Date(sunrise.getTime() + 12 * dayMuhurat)
        };

        // Godhuli - 48 minutes around sunset
        const godhuli = {
            start: new Date(sunset.getTime() - 24 * 60 * 1000), // 24 minutes before sunset
            end: new Date(sunset.getTime() + 24 * 60 * 1000)    // 24 minutes after sunset
        };

        // Sayahna Sandhya - Evening twilight
        const sayahnaSandhya = {
            start: new Date(sunset.getTime() - 12 * 60 * 1000), // 12 minutes before sunset
            end: new Date(sunset.getTime() + 12 * 60 * 1000)    // 12 minutes after sunset
        };

        // Nishita - Midnight muhurat (8th night muhurat)
        const nishita = {
            start: new Date(sunset.getTime() + 7 * nightMuhurat),
            end: new Date(sunset.getTime() + 8 * nightMuhurat)
        };

        // Brahma Muhurat - Pre-dawn period (14th-15th night muhurat)
        const brahma = {
            start: new Date(sunrise.getTime() - 2 * nightMuhurat),
            end: new Date(sunrise.getTime() - nightMuhurat)
        };

        // Pratah Sandhya - Morning twilight (15th night muhurat to sunrise)
        const pratahSandhya = {
            start: new Date(sunrise.getTime() - nightMuhurat),
            end: sunrise
        };

        return {
            abhijita,
            amritKalam,
            sarvarthaSiddhiYoga,
            amritSiddhiYoga,
            vijaya,
            godhuli,
            sayahnaSandhya,
            nishita,
            brahma,
            pratahSandhya
        };
    }

    /**
     * Calculate Sarvartha Siddhi Yoga based on weekday, tithi, and nakshatra
     * @param date Date for calculation
     * @returns Description of the Sarvartha Siddhi Yoga
     */
    private static calculateSarvarthaSiddhiYoga(date: Date): string {
        const weekday = date.getDay();
        
        // Simplified calculation - in reality this depends on complex combinations
        // of weekday, tithi, and nakshatra
        const yogaTypes = [
            'Ahoratri', // Sunday
            'Madhyahna', // Monday  
            'Sayahna', // Tuesday
            'Pratah', // Wednesday
            'Ahoratri', // Thursday
            'Madhyahna', // Friday
            'Sayahna' // Saturday
        ];

        return yogaTypes[weekday];
    }

    /**
     * Check if a given time falls within any auspicious muhurat
     * @param time Time to check
     * @param muhurats Muhurat periods to check against
     * @returns Array of muhurat names that contain the given time
     */
    static getActiveMusurats(time: Date, muhurats: MuhuratPeriods): string[] {
        const activeMuhurats: string[] = [];

        // Check each muhurat period
        Object.entries(muhurats).forEach(([name, period]) => {
            if (name === 'amritKalam') {
                // Handle array of periods
                const periods = period as Array<{ start: Date | null; end: Date | null }>;
                periods.forEach((p, index) => {
                    if (p.start && p.end && time >= p.start && time <= p.end) {
                        activeMuhurats.push(`${name}-${index + 1}`);
                    }
                });
            } else if (name === 'sarvarthaSiddhiYoga') {
                // Skip string values
                return;
            } else {
                // Handle single period
                const p = period as { start: Date | null; end: Date | null };
                if (p.start && p.end && time >= p.start && time <= p.end) {
                    activeMuhurats.push(name);
                }
            }
        });

        return activeMuhurats;
    }

    /**
     * Get the next upcoming auspicious muhurat
     * @param currentTime Current time
     * @param muhurats Muhurat periods
     * @returns Next muhurat name and start time
     */
    static getNextMuhurat(currentTime: Date, muhurats: MuhuratPeriods): { name: string; start: Date } | null {
        const upcomingMuhurats: Array<{ name: string; start: Date }> = [];

        // Collect all upcoming muhurats
        Object.entries(muhurats).forEach(([name, period]) => {
            if (name === 'amritKalam') {
                const periods = period as Array<{ start: Date | null; end: Date | null }>;
                periods.forEach((p, index) => {
                    if (p.start && p.start > currentTime) {
                        upcomingMuhurats.push({ name: `${name}-${index + 1}`, start: p.start });
                    }
                });
            } else if (name === 'sarvarthaSiddhiYoga') {
                return;
            } else {
                const p = period as { start: Date | null; end: Date | null };
                if (p.start && p.start > currentTime) {
                    upcomingMuhurats.push({ name, start: p.start });
                }
            }
        });

        // Sort by start time and return the earliest
        upcomingMuhurats.sort((a, b) => a.start.getTime() - b.start.getTime());
        return upcomingMuhurats[0] || null;
    }
}