/**
 * TypeScript Example: Current Planetary Positions with Type Safety
 * 
 * This example demonstrates how to use the getCurrentPlanets function
 * in a TypeScript project with full type safety.
 */

import { getCurrentPlanets, getSpecificAyanamsa, PlanetaryPosition } from '../src/index';

interface PlanetAnalysis {
    planet: string;
    isExalted: boolean;
    isDebilitated: boolean;
    strength: 'Strong' | 'Medium' | 'Weak';
    description: string;
}

function analyzePlanetaryPositions(): void {
    console.log('🔮 TypeScript Planetary Analysis');
    console.log('=' .repeat(50));

    const now = new Date();
    console.log(`\n📅 Analysis Date: ${now.toLocaleDateString()}`);

    try {
        // Get planetary positions with type safety
        const planets: PlanetaryPosition[] = getCurrentPlanets(now);
        
        // Show ayanamsa being used
        const ayanamsa = getSpecificAyanamsa(1, now);
        if (ayanamsa) {
            console.log(`🔭 Using ${ayanamsa.name} Ayanamsa: ${ayanamsa.degree.toFixed(4)}°`);
        }

        console.log('\n🌟 Detailed Analysis:');
        console.log('-'.repeat(50));

        // Analyze each planet
        const analyses: PlanetAnalysis[] = planets.map(planet => 
            analyzePlanet(planet)
        );

        analyses.forEach(analysis => {
            console.log(`\n${analysis.planet}:`);
            console.log(`  Strength: ${analysis.strength}`);
            console.log(`  Status: ${getStatus(analysis)}`);
            console.log(`  ${analysis.description}`);
        });

        // Summary statistics
        console.log('\n📈 Summary Statistics:');
        console.log('-'.repeat(30));
        
        const strongPlanets = analyses.filter(a => a.strength === 'Strong').length;
        const mediumPlanets = analyses.filter(a => a.strength === 'Medium').length;
        const weakPlanets = analyses.filter(a => a.strength === 'Weak').length;
        
        console.log(`Strong planets: ${strongPlanets}`);
        console.log(`Medium planets: ${mediumPlanets}`);
        console.log(`Weak planets: ${weakPlanets}`);

        // Find interesting patterns
        findPatterns(planets);

    } catch (error) {
        console.error('❌ Error in analysis:', error);
    }
}

function analyzePlanet(position: PlanetaryPosition): PlanetAnalysis {
    const { planet, rashi, nakshatra } = position;
    
    // Basic strength analysis based on traditional rules
    let strength: 'Strong' | 'Medium' | 'Weak' = 'Medium';
    let isExalted = false;
    let isDebilitated = false;
    let description = '';

    // Exaltation and debilitation analysis
    const exaltationSigns: Record<string, string> = {
        'Sun': 'Mesha',
        'Moon': 'Vrishabha',
        'Mercury': 'Kanya',
        'Venus': 'Meena',
        'Mars': 'Makara',
        'Jupiter': 'Karka',
        'Saturn': 'Tula'
    };

    const debilitationSigns: Record<string, string> = {
        'Sun': 'Tula',
        'Moon': 'Vrishchika',
        'Mercury': 'Meena',
        'Venus': 'Kanya',
        'Mars': 'Karka',
        'Jupiter': 'Makara',
        'Saturn': 'Mesha'
    };

    // Own sign analysis
    const ownSigns: Record<string, string[]> = {
        'Sun': ['Simha'],
        'Moon': ['Karka'],
        'Mercury': ['Mithuna', 'Kanya'],
        'Venus': ['Vrishabha', 'Tula'],
        'Mars': ['Mesha', 'Vrishchika'],
        'Jupiter': ['Dhanu', 'Meena'],
        'Saturn': ['Makara', 'Kumbha']
    };

    if (exaltationSigns[planet] === rashi.name) {
        isExalted = true;
        strength = 'Strong';
        description = `Exalted in ${rashi.name} - maximum strength and positive results`;
    } else if (debilitationSigns[planet] === rashi.name) {
        isDebilitated = true;
        strength = 'Weak';
        description = `Debilitated in ${rashi.name} - reduced strength, needs support`;
    } else if (ownSigns[planet]?.includes(rashi.name)) {
        strength = 'Strong';
        description = `In own sign ${rashi.name} - comfortable and powerful`;
    } else if (rashi.ruler === planet) {
        strength = 'Strong';
        description = `Ruling ${rashi.name} - authoritative position`;
    } else {
        // Check if friendly sign (simplified)
        const friendlyWith = getFriendlyPlanets(planet);
        if (friendlyWith.includes(rashi.ruler)) {
            strength = 'Medium';
            description = `In friendly sign ${rashi.name} ruled by ${rashi.ruler}`;
        } else {
            strength = 'Weak';
            description = `In neutral/unfavorable sign ${rashi.name}`;
        }
    }

    // Add nakshatra information
    description += `. In ${nakshatra.name} nakshatra (ruled by ${nakshatra.ruler})`;

    return {
        planet,
        isExalted,
        isDebilitated,
        strength,
        description
    };
}

function getFriendlyPlanets(planet: string): string[] {
    // Simplified friendship rules
    const friendships: Record<string, string[]> = {
        'Sun': ['Moon', 'Mars', 'Jupiter'],
        'Moon': ['Sun', 'Mercury'],
        'Mercury': ['Sun', 'Venus'],
        'Venus': ['Mercury', 'Saturn'],
        'Mars': ['Sun', 'Moon', 'Jupiter'],
        'Jupiter': ['Sun', 'Moon', 'Mars'],
        'Saturn': ['Mercury', 'Venus']
    };
    
    return friendships[planet] || [];
}

function getStatus(analysis: PlanetAnalysis): string {
    if (analysis.isExalted) return '⬆️ Exalted';
    if (analysis.isDebilitated) return '⬇️ Debilitated';
    return '➡️ Regular';
}

function findPatterns(planets: PlanetaryPosition[]): void {
    console.log('\n🔍 Pattern Analysis:');
    console.log('-'.repeat(25));

    // Element distribution
    const elements: Record<string, string[]> = {};
    planets.forEach(planet => {
        const element = planet.rashi.element;
        if (!elements[element]) elements[element] = [];
        elements[element].push(planet.planet);
    });

    console.log('\n🌊 Element Distribution:');
    Object.entries(elements).forEach(([element, planetList]) => {
        console.log(`  ${element}: ${planetList.join(', ')} (${planetList.length})`);
    });

    // Nakshatra rulers
    const nakshatraRulers: Record<string, string[]> = {};
    planets.forEach(planet => {
        const ruler = planet.nakshatra.ruler;
        if (!nakshatraRulers[ruler]) nakshatraRulers[ruler] = [];
        nakshatraRulers[ruler].push(planet.planet);
    });

    console.log('\n⭐ Nakshatra Rulers:');
    Object.entries(nakshatraRulers).forEach(([ruler, planetList]) => {
        if (planetList.length > 1) {
            console.log(`  ${ruler}: ${planetList.join(', ')}`);
        }
    });
}

// Run the analysis
analyzePlanetaryPositions();
