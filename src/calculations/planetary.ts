import { OrbitalElements } from '../types/astronomical';
import { normalizeAngle } from '../utils/index';

export interface OrbitalParameters {
    perihelion: number;
    aphelion: number;
    eccentricity: number;
    semiMajorAxis: number;
    orbitalPeriod: number;
    inclination: number;
    longitudeOfAscendingNode: number;
    argumentOfPeriapsis: number;
}

export interface TithiInfo {
    tithi: number;
    name: string;
    percentage: number;
    isWaxing: boolean;
}

export interface RashiInfo {
    rashi: number;
    name: string;
    element: string;
    ruler: string;
    degree: number; // Position within the rashi (0-30°)
}

export interface NakshatraInfo {
    nakshatra: number;
    name: string;
    pada: number;
    ruler: string;
    deity: string;
    symbol: string;
    degree: number; // Position within nakshatra
}

export interface PlanetaryPosition {
    planet: string;
    longitude: number; // Sidereal longitude
    latitude: number;
    rashi: RashiInfo;
    nakshatra: NakshatraInfo;
}

export const RASHIS = [
    { name: "Mesha", element: "Fire", ruler: "Mars" },
    { name: "Vrishabha", element: "Earth", ruler: "Venus" },
    { name: "Mithuna", element: "Air", ruler: "Mercury" },
    { name: "Karka", element: "Water", ruler: "Moon" },
    { name: "Simha", element: "Fire", ruler: "Sun" },
    { name: "Kanya", element: "Earth", ruler: "Mercury" },
    { name: "Tula", element: "Air", ruler: "Venus" },
    { name: "Vrishchika", element: "Water", ruler: "Mars" },
    { name: "Dhanu", element: "Fire", ruler: "Jupiter" },
    { name: "Makara", element: "Earth", ruler: "Saturn" },
    { name: "Kumbha", element: "Air", ruler: "Saturn" },
    { name: "Meena", element: "Water", ruler: "Jupiter" }
];

export const NAKSHATRAS = [
    { name: "Ashwini", ruler: "Ketu", deity: "Ashwini Kumaras", symbol: "Horse's head" },
    { name: "Bharani", ruler: "Venus", deity: "Yama", symbol: "Yoni" },
    { name: "Krittika", ruler: "Sun", deity: "Agni", symbol: "Razor/flame" },
    { name: "Rohini", ruler: "Moon", deity: "Brahma", symbol: "Cart/chariot" },
    { name: "Mrigashira", ruler: "Mars", deity: "Soma", symbol: "Deer's head" },
    { name: "Ardra", ruler: "Rahu", deity: "Rudra", symbol: "Teardrop" },
    { name: "Punarvasu", ruler: "Jupiter", deity: "Aditi", symbol: "Quiver of arrows" },
    { name: "Pushya", ruler: "Saturn", deity: "Brihaspati", symbol: "Cow's udder" },
    { name: "Ashlesha", ruler: "Mercury", deity: "Nagas", symbol: "Serpent" },
    { name: "Magha", ruler: "Ketu", deity: "Pitrs", symbol: "Throne" },
    { name: "Purva Phalguni", ruler: "Venus", deity: "Bhaga", symbol: "Hammock" },
    { name: "Uttara Phalguni", ruler: "Sun", deity: "Aryaman", symbol: "Bed" },
    { name: "Hasta", ruler: "Moon", deity: "Savitar", symbol: "Hand" },
    { name: "Chitra", ruler: "Mars", deity: "Vishvakarma", symbol: "Pearl" },
    { name: "Swati", ruler: "Rahu", deity: "Vayu", symbol: "Sword" },
    { name: "Vishakha", ruler: "Jupiter", deity: "Indragni", symbol: "Triumphal arch" },
    { name: "Anuradha", ruler: "Saturn", deity: "Mitra", symbol: "Lotus" },
    { name: "Jyeshtha", ruler: "Mercury", deity: "Indra", symbol: "Earring" },
    { name: "Mula", ruler: "Ketu", deity: "Nirriti", symbol: "Bunch of roots" },
    { name: "Purva Ashadha", ruler: "Venus", deity: "Apah", symbol: "Fan" },
    { name: "Uttara Ashadha", ruler: "Sun", deity: "Vishvedevas", symbol: "Elephant tusk" },
    { name: "Shravana", ruler: "Moon", deity: "Vishnu", symbol: "Ear" },
    { name: "Dhanishtha", ruler: "Mars", deity: "Vasus", symbol: "Drum" },
    { name: "Shatabhisha", ruler: "Rahu", deity: "Varuna", symbol: "Circle" },
    { name: "Purva Bhadrapada", ruler: "Jupiter", deity: "Ajaikapat", symbol: "Front legs of bed" },
    { name: "Uttara Bhadrapada", ruler: "Saturn", deity: "Ahirbudhnya", symbol: "Back legs of bed" },
    { name: "Revati", ruler: "Mercury", deity: "Pushan", symbol: "Fish" }
];

export class Planetary {
    private readonly orbitalData: { [key: string]: OrbitalParameters } = {
        'Mercury': {
            perihelion: 0.307,
            aphelion: 0.467,
            eccentricity: 0.2056,
            semiMajorAxis: 0.387,
            orbitalPeriod: 87.97,
            inclination: 7.005,
            longitudeOfAscendingNode: 48.331,
            argumentOfPeriapsis: 29.124
        },
        'Venus': {
            perihelion: 0.718,
            aphelion: 0.728,
            eccentricity: 0.0067,
            semiMajorAxis: 0.723,
            orbitalPeriod: 224.70,
            inclination: 3.395,
            longitudeOfAscendingNode: 76.680,
            argumentOfPeriapsis: 54.884
        },
        'Earth': {
            perihelion: 0.983,
            aphelion: 1.017,
            eccentricity: 0.0167,
            semiMajorAxis: 1.000,
            orbitalPeriod: 365.26,
            inclination: 0.000,
            longitudeOfAscendingNode: 0.000,
            argumentOfPeriapsis: 114.208
        },
        'Mars': {
            perihelion: 1.381,
            aphelion: 1.666,
            eccentricity: 0.0935,
            semiMajorAxis: 1.524,
            orbitalPeriod: 686.98,
            inclination: 1.850,
            longitudeOfAscendingNode: 49.558,
            argumentOfPeriapsis: 286.502
        },
        'Jupiter': {
            perihelion: 4.950,
            aphelion: 5.455,
            eccentricity: 0.0489,
            semiMajorAxis: 5.203,
            orbitalPeriod: 4332.59,
            inclination: 1.304,
            longitudeOfAscendingNode: 100.464,
            argumentOfPeriapsis: 273.867
        },
        'Saturn': {
            perihelion: 9.020,
            aphelion: 10.054,
            eccentricity: 0.0565,
            semiMajorAxis: 9.537,
            orbitalPeriod: 10759.22,
            inclination: 2.489,
            longitudeOfAscendingNode: 113.665,
            argumentOfPeriapsis: 339.392
        },
        'Uranus': {
            perihelion: 18.324,
            aphelion: 20.110,
            eccentricity: 0.0457,
            semiMajorAxis: 19.217,
            orbitalPeriod: 30688.5,
            inclination: 0.773,
            longitudeOfAscendingNode: 74.006,
            argumentOfPeriapsis: 96.998
        },
        'Neptune': {
            perihelion: 29.820,
            aphelion: 30.330,
            eccentricity: 0.0113,
            semiMajorAxis: 30.075,
            orbitalPeriod: 60182,
            inclination: 1.770,
            longitudeOfAscendingNode: 131.784,
            argumentOfPeriapsis: 276.336
        }
    };

    calculateOrbit(planet: string, date: Date): { perihelion: number; aphelion: number; eccentricity: number } {
        const orbitalParams = this.orbitalData[planet];
        
        if (!orbitalParams) {
            // Return default values for unknown planets
            return {
                perihelion: 1.0,
                aphelion: 1.0,
                eccentricity: 0.0
            };
        }

        // Apply small variations based on date for more realistic simulation
        const daysSinceEpoch = (date.getTime() - new Date('2000-01-01').getTime()) / (1000 * 60 * 60 * 24);
        const variation = Math.sin(daysSinceEpoch / 365.25) * 0.001;

        return {
            perihelion: orbitalParams.perihelion * (1 + variation),
            aphelion: orbitalParams.aphelion * (1 + variation),
            eccentricity: orbitalParams.eccentricity * (1 + variation * 0.1)
        };
    }

    calculateTithi(sunLongitude: number, moonLongitude: number): TithiInfo {
        const tithiNames = [
            'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi',
            'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi',
            'Trayodashi', 'Chaturdashi', 'Purnima/Amavasya'
        ];

        // Calculate lunar phase (longitude difference between Moon and Sun)
        // This follows the Python reference implementation
        let moonPhase = normalizeAngle(moonLongitude - sunLongitude);
        
        // Each tithi spans 12 degrees (360° / 30 tithis)
        const tithiLength = 12;
        const tithiNumber = Math.ceil(moonPhase / tithiLength);
        const percentage = (moonPhase % tithiLength) / tithiLength * 100;
        
        // Determine paksha and adjust tithi number
        const isWaxing = tithiNumber <= 15;
        const adjustedTithi = tithiNumber <= 15 ? tithiNumber : (tithiNumber - 15);
        
        // Handle edge case for Amavasya/Purnima
        const finalTithi = adjustedTithi === 0 ? 15 : adjustedTithi;
        
        return {
            tithi: finalTithi,
            name: tithiNames[Math.min(finalTithi - 1, 14)],
            percentage: percentage,
            isWaxing: isWaxing
        };
    }

    calculateYoga(sunLongitude: number, moonLongitude: number): { yoga: number; name: string } {
        const yogaNames = [
            'Vishkumbha', 'Preeti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda',
            'Sukarman', 'Dhriti', 'Shoola', 'Ganda', 'Vriddhi', 'Dhruva',
            'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyan',
            'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla',
            'Brahma', 'Indra', 'Vaidhriti'
        ];

        const sum = normalizeAngle(sunLongitude + moonLongitude);
        const yogaNumber = Math.floor(sum / (360 / 27)) + 1;
        
        return {
            yoga: yogaNumber,
            name: yogaNames[yogaNumber - 1] || 'Unknown'
        };
    }

    calculateKarana(sunLongitude: number, moonLongitude: number): { karana: number; name: string } {
        const karanaNames = [
            'Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti',
            'Shakuni', 'Chatushpada', 'Naga', 'Kimstughna'
        ];

        // Calculate lunar phase similar to Python reference
        const moonPhase = normalizeAngle(moonLongitude - sunLongitude);
        
        // Each karana spans 6 degrees (360° / 60 karanas)
        const karanaNumber = Math.ceil(moonPhase / 6);
        
        // Handle the cyclic nature of karanas as per Python implementation
        // First 7 karanas repeat 8 times (karanas 1-56), then 4 fixed karanas (57-60)
        let karanaIndex: number;
        if (karanaNumber <= 56) {
            karanaIndex = ((karanaNumber - 1) % 7);
        } else {
            // Special karanas for the last 4 positions
            karanaIndex = 7 + ((karanaNumber - 57) % 4);
        }
        
        // Ensure we don't go beyond array bounds
        karanaIndex = Math.min(karanaIndex, karanaNames.length - 1);
        
        return {
            karana: karanaNumber,
            name: karanaNames[karanaIndex]
        };
    }

    getOrbitalPeriod(planet: string): number {
        const orbitalParams = this.orbitalData[planet];
        return orbitalParams ? orbitalParams.orbitalPeriod : 365.25;
    }

    getSemiMajorAxis(planet: string): number {
        const orbitalParams = this.orbitalData[planet];
        return orbitalParams ? orbitalParams.semiMajorAxis : 1.0;
    }

    getEccentricity(planet: string): number {
        const orbitalParams = this.orbitalData[planet];
        return orbitalParams ? orbitalParams.eccentricity : 0.0;
    }

    getInclination(planet: string): number {
        const orbitalParams = this.orbitalData[planet];
        return orbitalParams ? orbitalParams.inclination : 0.0;
    }

    calculateMeanAnomaly(planet: string, date: Date): number {
        const orbitalParams = this.orbitalData[planet];
        if (!orbitalParams) return 0;

        const daysSinceEpoch = (date.getTime() - new Date('2000-01-01').getTime()) / (1000 * 60 * 60 * 24);
        const meanMotion = 360 / orbitalParams.orbitalPeriod; // degrees per day
        
        return normalizeAngle(meanMotion * daysSinceEpoch);
    }

    calculateTrueAnomaly(planet: string, date: Date): number {
        const meanAnomaly = this.calculateMeanAnomaly(planet, date);
        const eccentricity = this.getEccentricity(planet);
        
        // Simplified calculation using first-order approximation
        // True Anomaly ≈ Mean Anomaly + 2 * eccentricity * sin(Mean Anomaly)
        const meanAnomalyRad = meanAnomaly * Math.PI / 180;
        const trueAnomalyRad = meanAnomalyRad + 2 * eccentricity * Math.sin(meanAnomalyRad);
        
        return normalizeAngle(trueAnomalyRad * 180 / Math.PI);
    }

    calculateRashi(longitude: number): RashiInfo {
        // Each rashi is 30 degrees
        const rashiNumber = Math.floor(longitude / 30);
        const degreeInRashi = longitude % 30;
        
        const rashiData = RASHIS[rashiNumber];
        
        return {
            rashi: rashiNumber + 1,
            name: rashiData.name,
            element: rashiData.element,
            ruler: rashiData.ruler,
            degree: degreeInRashi
        };
    }

    calculateNakshatra(longitude: number): NakshatraInfo {
        // Each nakshatra is 13.333... degrees (360/27)
        const nakshatraSize = 360 / 27;
        const nakshatraNumber = Math.floor(longitude / nakshatraSize);
        const degreeInNakshatra = longitude % nakshatraSize;
        
        // Each nakshatra has 4 padas
        const pada = Math.floor(degreeInNakshatra / (nakshatraSize / 4)) + 1;
        
        const nakshatraData = NAKSHATRAS[nakshatraNumber];
        
        return {
            nakshatra: nakshatraNumber + 1,
            name: nakshatraData.name,
            pada: pada,
            ruler: nakshatraData.ruler,
            deity: nakshatraData.deity,
            symbol: nakshatraData.symbol,
            degree: degreeInNakshatra
        };
    }
}