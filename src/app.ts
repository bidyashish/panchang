import { Ephemeris } from './calculations/ephemeris';
import { Planetary } from './calculations/planetary';
import { Panchanga, PanchangaData } from './panchanga/index';
import { formatDate } from './utils/index';
import { CelestialBody, Position, Location } from './types/astronomical';

/**
 * Main application class for astronomical calculations
 * Includes traditional Panchanga calculations and modern ephemeris
 */
class AstronomicalCalculator {
    private ephemeris: Ephemeris;
    private planetary: Planetary;
    private panchanga: Panchanga;

    constructor() {
        this.ephemeris = new Ephemeris();
        this.planetary = new Planetary();
        this.panchanga = new Panchanga();
    }

    /**
     * Calculate positions for multiple celestial bodies
     */
    public calculateCelestialPositions(date: Date, bodies: string[]): void {
        console.log(`\n=== Astronomical Calculations for ${formatDate(date)} ===\n`);

        bodies.forEach(body => {
            try {
                const position = this.ephemeris.calculatePosition(date, body);
                const siderealPosition = this.ephemeris.calculateSiderealPosition(date, body);
                
                console.log(`${body}:`);
                console.log(`  Tropical Longitude: ${position.longitude.toFixed(6)}°`);
                console.log(`  Sidereal Longitude: ${siderealPosition.longitude.toFixed(6)}°`);
                console.log(`  Latitude: ${position.latitude.toFixed(6)}°`);
                
                // Add nakshatra information for Moon
                if (body === 'Moon') {
                    const nakshatra = this.ephemeris.calculateNakshatra(siderealPosition.longitude);
                    console.log(`  Nakshatra: ${nakshatra.name} (${nakshatra.nakshatra}) - Pada ${nakshatra.pada}`);
                }
                
                console.log('');
            } catch (error) {
                console.error(`Error calculating position for ${body}:`, error);
            }
        });
    }

    /**
     * Calculate orbital parameters for planets
     */
    public calculatePlanetaryOrbits(date: Date, planets: string[]): void {
        console.log(`\n=== Planetary Orbital Parameters ===\n`);

        planets.forEach(planet => {
            try {
                const orbit = this.planetary.calculateOrbit(planet, date);
                const period = this.planetary.getOrbitalPeriod(planet);
                const semiMajor = this.planetary.getSemiMajorAxis(planet);
                const inclination = this.planetary.getInclination(planet);
                
                console.log(`${planet} Orbital Parameters:`);
                console.log(`  Semi-major Axis: ${semiMajor.toFixed(3)} AU`);
                console.log(`  Perihelion: ${orbit.perihelion.toFixed(3)} AU`);
                console.log(`  Aphelion: ${orbit.aphelion.toFixed(3)} AU`);
                console.log(`  Eccentricity: ${orbit.eccentricity.toFixed(6)}`);
                console.log(`  Inclination: ${inclination.toFixed(3)}°`);
                console.log(`  Orbital Period: ${period.toFixed(2)} days`);
                console.log('');
            } catch (error) {
                console.error(`Error calculating orbit for ${planet}:`, error);
            }
        });
    }

    /**
     * Calculate traditional Panchanga for a given date and location
     */
    public calculatePanchanga(date: Date, location: Location): void {
        console.log(`\n=== PANCHANGA CALCULATION ===\n`);
        
        try {
            const panchangaData = this.panchanga.calculatePanchanga(date, location, true);
            const report = this.panchanga.generateReport(panchangaData);
            console.log(report);

            // Calculate Rahu Kaal
            const rahuKaal = this.panchanga.calculateRahuKaal(date, location);
            if (rahuKaal?.start && rahuKaal?.end) {
                console.log(`RAHU KAAL: ${rahuKaal.start.toLocaleTimeString()} - ${rahuKaal.end.toLocaleTimeString()}\n`);
            }
        } catch (error) {
            console.error('Error calculating Panchanga:', error);
        }
    }

    /**
     * Calculate advanced Vedic astrology elements
     */
    public calculateVedicElements(date: Date): void {
        console.log(`\n=== VEDIC ASTROLOGY ELEMENTS ===\n`);
        
        try {
            const sunPos = this.ephemeris.calculateSiderealPosition(date, 'Sun');
            const moonPos = this.ephemeris.calculateSiderealPosition(date, 'Moon');
            
            // Tithi calculation
            const tithi = this.planetary.calculateTithi(sunPos.longitude, moonPos.longitude);
            console.log(`Tithi: ${tithi.name} (${tithi.percentage.toFixed(1)}% complete)`);
            console.log(`Paksha: ${tithi.isWaxing ? 'Shukla (Waxing)' : 'Krishna (Waning)'}\n`);
            
            // Yoga calculation
            const yoga = this.planetary.calculateYoga(sunPos.longitude, moonPos.longitude);
            console.log(`Yoga: ${yoga.name} (${yoga.yoga})\n`);
            
            // Karana calculation
            const karana = this.planetary.calculateKarana(sunPos.longitude, moonPos.longitude);
            console.log(`Karana: ${karana.name} (${karana.karana})\n`);
            
        } catch (error) {
            console.error('Error calculating Vedic elements:', error);
        }
    }

    /**
     * Run comprehensive demonstration calculations
     */
    public runDemo(): void {
        const currentDate = new Date();
        const specificDate = new Date('2024-01-01T12:00:00Z');
        
        // Default location (Delhi, India)
        const location: Location = {
            latitude: 28.6139,
            longitude: 77.2090,
            altitude: 216,
            timezone: 'Asia/Kolkata'
        };

        console.log('🌟 Astronomical Calculator with Panchanga Support Starting...\n');

        // Calculate positions for common celestial bodies
        const celestialBodies = ['Sun', 'Moon', 'Mars', 'Venus', 'Jupiter', 'Saturn', 'Rahu', 'Ketu'];
        this.calculateCelestialPositions(specificDate, celestialBodies);

        // Calculate planetary orbits
        const planets = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
        this.calculatePlanetaryOrbits(specificDate, planets);

        // Calculate Panchanga for specific date
        this.calculatePanchanga(specificDate, location);
        
        // Calculate Vedic elements
        this.calculateVedicElements(specificDate);

        // Current date calculations
        console.log(`\n=== Current Date Analysis (${formatDate(currentDate)}) ===\n`);
        this.calculateCelestialPositions(currentDate, ['Sun', 'Moon']);
        this.calculatePanchanga(currentDate, location);
    }

    /**
     * Cleanup resources
     */
    public cleanup(): void {
        this.ephemeris.cleanup();
        this.panchanga.cleanup();
    }
}

/**
 * Main function to run the application
 */
function main(): void {
    console.log('🌟 Astronomical Calculator with Panchanga Starting...\n');
    
    const calculator = new AstronomicalCalculator();
    
    try {
        calculator.runDemo();
        console.log('\n✅ All calculations completed successfully!');
    } catch (error) {
        console.error('❌ Error running astronomical calculations:', error);
        process.exit(1);
    } finally {
        calculator.cleanup();
    }
}

// Run the application if this file is executed directly
if (require.main === module) {
    main();
}

export { AstronomicalCalculator };