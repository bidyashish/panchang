/**
 * TypeScript usage examples for the Panchang package
 */

import { 
    getPanchanga, 
    getPanchangaReport, 
    AstronomicalCalculator, 
    PanchangaInput, 
    PanchangaOutput 
} from '../src/index';

// Example usage in a TypeScript project
async function demonstrateUsage() {
    console.log('🌟 TypeScript Usage Examples\n');

    // Define input with proper typing
    const input: PanchangaInput = {
        date: new Date('2013-01-18T12:00:00Z'),
        location: {
            latitude: 12.972,    // Bangalore, India
            longitude: 77.594,
            timezone: 'Asia/Kolkata',
            altitude: 920        // Optional altitude in meters
        }
    };

    try {
        // Using the convenience function
        const panchanga: PanchangaOutput = getPanchanga(
            input.date,
            input.location.latitude,
            input.location.longitude,
            input.location.timezone
        );

        console.log('=== Panchanga Data ===');
        console.log(`Date: ${panchanga.date.toDateString()}`);
        console.log(`Vara: ${panchanga.vara.name} (${panchanga.vara.number})`);
        console.log(`Tithi: ${panchanga.tithi.name} (${panchanga.tithi.number}) - ${panchanga.tithi.percentage.toFixed(1)}% complete`);
        console.log(`Paksha: ${panchanga.tithi.paksha}`);
        console.log(`Nakshatra: ${panchanga.nakshatra.name} (${panchanga.nakshatra.number}) - Pada ${panchanga.nakshatra.pada}`);
        console.log(`Yoga: ${panchanga.yoga.name} (${panchanga.yoga.number})`);
        console.log(`Karana: ${panchanga.karana.name} (${panchanga.karana.number})`);

        // Using the calculator class for more advanced usage
        const calculator = new AstronomicalCalculator();

        // Calculate for different dates
        const dates = [
            new Date('2013-01-18T12:00:00Z'),
            new Date('2009-07-15T12:00:00Z'),
            new Date('1985-06-09T12:00:00Z')
        ];

        console.log('\n=== Historical Panchanga Data ===');
        dates.forEach(date => {
            const result = calculator.calculatePanchanga({
                date,
                location: input.location
            });

            console.log(`\n${date.toDateString()}:`);
            console.log(`  Tithi: ${result.tithi.name}`);
            console.log(`  Nakshatra: ${result.nakshatra.name}`);
            console.log(`  Yoga: ${result.yoga.name}`);
        });

        // Planetary positions
        console.log('\n=== Planetary Positions ===');
        const planets = calculator.calculatePlanetaryPositions(input.date);
        
        Object.entries(planets).forEach(([planet, position]) => {
            console.log(`${planet}: ${position.siderealLongitude.toFixed(2)}° sidereal, ${position.longitude.toFixed(2)}° tropical`);
        });

        calculator.cleanup();

    } catch (error) {
        console.error('Error in calculation:', error);
    }
}

// Function to validate locations
function validateLocation(latitude: number, longitude: number): boolean {
    return (
        latitude >= -90 && latitude <= 90 &&
        longitude >= -180 && longitude <= 180
    );
}

// Example of using the package in a web application context
export class PanchangaService {
    private calculator: AstronomicalCalculator;

    constructor() {
        this.calculator = new AstronomicalCalculator();
    }

    /**
     * Get Panchanga for today at a specific location
     */
    public getTodaysPanchanga(latitude: number, longitude: number, timezone: string): PanchangaOutput {
        if (!validateLocation(latitude, longitude)) {
            throw new Error('Invalid coordinates provided');
        }

        return this.calculator.calculatePanchanga({
            date: new Date(),
            location: { latitude, longitude, timezone }
        });
    }

    /**
     * Get Panchanga for a date range
     */
    public getPanchangaRange(
        startDate: Date, 
        endDate: Date, 
        latitude: number, 
        longitude: number, 
        timezone: string
    ): PanchangaOutput[] {
        const results: PanchangaOutput[] = [];
        const currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            const panchanga = this.calculator.calculatePanchanga({
                date: new Date(currentDate),
                location: { latitude, longitude, timezone }
            });
            
            results.push(panchanga);
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return results;
    }

    /**
     * Check if today is an auspicious day based on Panchanga
     */
    public isAuspiciousDay(latitude: number, longitude: number, timezone: string): {
        isAuspicious: boolean;
        reasons: string[];
    } {
        const panchanga = this.getTodaysPanchanga(latitude, longitude, timezone);
        const reasons: string[] = [];
        let isAuspicious = true;

        // Example auspiciousness criteria (can be customized)
        const auspiciousTithis = ['Pratipada', 'Panchami', 'Dashami', 'Ekadashi'];
        const auspiciousNakshatras = ['Ashwini', 'Rohini', 'Punarvasu', 'Pushya'];
        
        if (!auspiciousTithis.includes(panchanga.tithi.name)) {
            reasons.push(`Tithi ${panchanga.tithi.name} is not highly auspicious`);
            isAuspicious = false;
        }

        if (!auspiciousNakshatras.includes(panchanga.nakshatra.name)) {
            reasons.push(`Nakshatra ${panchanga.nakshatra.name} is neutral`);
        }

        if (reasons.length === 0) {
            reasons.push('Day has auspicious planetary combinations');
        }

        return { isAuspicious, reasons };
    }

    public cleanup(): void {
        this.calculator.cleanup();
    }
}

// Run the demonstration
if (require.main === module) {
    demonstrateUsage();
}
