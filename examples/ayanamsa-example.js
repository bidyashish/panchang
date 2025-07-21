#!/usr/bin/env node

/**
 * Ayanamsa Example - Demonstrates different ayanamsa systems
 * 
 * This example shows how to:
 * - Get all available ayanamsa systems
 * - Get specific ayanamsa values
 * - Compare different ayanamsa systems
 * - Calculate planetary positions with different ayanamsa
 * 
 * @author Astronomical Calculator Team
 * @version 2.0.0
 */

const { getAyanamsa, getSpecificAyanamsa, getCurrentPlanets } = require('../dist/index.js');

/**
 * Main execution function
 */
async function demonstrateAyanamsa() {
    console.log('🌟 AYANAMSA SYSTEMS DEMONSTRATION');
    console.log('='.repeat(60));
    console.log();
    
    const currentDate = new Date();
    console.log(`📅 Date: ${currentDate.toDateString()}`);
    console.log(`⏰ Timestamp: ${currentDate.toISOString()}`);
    console.log();
    
    try {
        // Section 1: List all available ayanamsa systems
        await listAllAyanamsaSystems(currentDate);
        
        // Section 2: Get specific ayanamsa values
        await getSpecificAyanamsaValues(currentDate);
        
        // Section 3: Compare ayanamsa systems
        await compareAyanamsaSystems(currentDate);
        
        // Section 4: Planetary positions with different ayanamsa
        await planetaryPositionsWithAyanamsa(currentDate);
        
        // Section 5: Historical ayanamsa comparison
        await historicalAyanamsaComparison();
        
        console.log('✅ Ayanamsa demonstration completed successfully!');
        
    } catch (error) {
        console.error('❌ Demonstration failed:', error.message);
        process.exit(1);
    }
}

/**
 * List all available ayanamsa systems
 */
async function listAllAyanamsaSystems(date) {
    console.log('ALL AVAILABLE AYANAMSA SYSTEMS');
    console.log('-'.repeat(35));
    console.log();
    
    try {
        const ayanamsaSystems = getAyanamsa(date);
        
        console.log(`📊 Found ${ayanamsaSystems.length} ayanamsa systems:`);
        console.log();
        
        ayanamsaSystems.forEach((system, index) => {
            console.log(`${index + 1}. ${system.name} (ID: ${system.id})`);
            console.log(`   Degree: ${system.degree.toFixed(6)}°`);
            console.log(`   Description: ${system.description}`);
            console.log();
        });
        
        // Summary table
        console.log('📋 Summary Table:');
        console.log('ID  | Name                    | Degree (°)');
        console.log('----|-------------------------|-----------');
        ayanamsaSystems.forEach(system => {
            console.log(`${system.id.toString().padStart(2)}  | ${system.name.padEnd(23)} | ${system.degree.toFixed(6)}`);
        });
        console.log();
        
    } catch (error) {
        console.error('❌ Error listing ayanamsa systems:', error.message);
    }
}

/**
 * Get specific ayanamsa values by ID and name
 */
async function getSpecificAyanamsaValues(date) {
    console.log('SPECIFIC AYANAMSA VALUES');
    console.log('-'.repeat(30));
    console.log();
    
    try {
        // Get by ID
        const lahiriById = getSpecificAyanamsa(1, date);
        const ramanById = getSpecificAyanamsa(2, date);
        const kpById = getSpecificAyanamsa(5, date);
        
        console.log('🔍 Ayanamsa by ID:');
        if (lahiriById) {
            console.log(`   ID 1: ${lahiriById.name} = ${lahiriById.degree.toFixed(6)}°`);
        }
        if (ramanById) {
            console.log(`   ID 2: ${ramanById.name} = ${ramanById.degree.toFixed(6)}°`);
        }
        if (kpById) {
            console.log(`   ID 5: ${kpById.name} = ${kpById.degree.toFixed(6)}°`);
        }
        console.log();
        
        // Get by name
        const lahiriByName = getSpecificAyanamsa('Lahiri', date);
        const ramanByName = getSpecificAyanamsa('Raman', date);
        
        console.log('🔍 Ayanamsa by name:');
        if (lahiriByName) {
            console.log(`   Lahiri: ${lahiriByName.degree.toFixed(6)}°`);
        }
        if (ramanByName) {
            console.log(`   Raman: ${ramanByName.degree.toFixed(6)}°`);
        }
        console.log();
        
        // Verify consistency
        if (lahiriById && lahiriByName) {
            const diff = Math.abs(lahiriById.degree - lahiriByName.degree);
            console.log(`✅ Lahiri consistency check: ${diff < 0.000001 ? 'PASSED' : 'FAILED'} (diff: ${diff.toFixed(8)}°)`);
        }
        console.log();
        
    } catch (error) {
        console.error('❌ Error getting specific ayanamsa values:', error.message);
    }
}

/**
 * Compare different ayanamsa systems
 */
async function compareAyanamsaSystems(date) {
    console.log('AYANAMSA SYSTEM COMPARISON');
    console.log('-'.repeat(30));
    console.log();
    
    try {
        const ayanamsaIds = [1, 2, 5]; // Lahiri, Raman, KP
        const systems = [];
        
        console.log('🔄 Comparing ayanamsa systems:');
        console.log();
        
        for (const id of ayanamsaIds) {
            const system = getSpecificAyanamsa(id, date);
            if (system) {
                systems.push(system);
                console.log(`🔸 ${system.name}: ${system.degree.toFixed(6)}°`);
            }
        }
        
        if (systems.length > 1) {
            console.log();
            console.log('📊 Differences from Lahiri:');
            
            const lahiri = systems.find(s => s.id === 1);
            if (lahiri) {
                systems.forEach(system => {
                    if (system.id !== 1) {
                        const diff = system.degree - lahiri.degree;
                        console.log(`   ${system.name} - Lahiri: ${diff.toFixed(6)}°`);
                    }
                });
            }
            
            console.log();
            console.log('📈 Range Analysis:');
            const degrees = systems.map(s => s.degree);
            const min = Math.min(...degrees);
            const max = Math.max(...degrees);
            const range = max - min;
            console.log(`   Minimum: ${min.toFixed(6)}°`);
            console.log(`   Maximum: ${max.toFixed(6)}°`);
            console.log(`   Range: ${range.toFixed(6)}°`);
        }
        console.log();
        
    } catch (error) {
        console.error('❌ Error comparing ayanamsa systems:', error.message);
    }
}

/**
 * Calculate planetary positions with different ayanamsa
 */
async function planetaryPositionsWithAyanamsa(date) {
    console.log('PLANETARY POSITIONS WITH DIFFERENT AYANAMSA');
    console.log('-'.repeat(45));
    console.log();
    
    try {
        const ayanamsaIds = [1, 2]; // Lahiri and Raman
        const planets = ['Sun', 'Moon', 'Mars'];
        
        console.log(`🌍 Calculating positions for: ${planets.join(', ')}`);
        console.log();
        
        for (const ayanamsaId of ayanamsaIds) {
            const ayanamsa = getSpecificAyanamsa(ayanamsaId, date);
            if (!ayanamsa) continue;
            
            console.log(`🔭 Using ${ayanamsa.name} Ayanamsa (${ayanamsa.degree.toFixed(6)}°):`);
            
            const planetaryPositions = getCurrentPlanets(date, ayanamsaId);
            if (planetaryPositions) {
                planets.forEach(planetName => {
                    const planet = planetaryPositions.find(p => p.planet === planetName);
                    if (planet) {
                        console.log(`   ${getPlanetEmoji(planetName)} ${planetName}: ${planet.longitude.toFixed(4)}°`);
                    }
                });
            }
            console.log();
        }
        
        // Show differences
        console.log('📊 Position Differences (Raman - Lahiri):');
        const lahiriPlanets = getCurrentPlanets(date, 1);
        const ramanPlanets = getCurrentPlanets(date, 2);
        
        if (lahiriPlanets && ramanPlanets) {
            planets.forEach(planetName => {
                const lahiriPlanet = lahiriPlanets.find(p => p.planet === planetName);
                const ramanPlanet = ramanPlanets.find(p => p.planet === planetName);
                
                if (lahiriPlanet && ramanPlanet) {
                    const diff = ramanPlanet.longitude - lahiriPlanet.longitude;
                    console.log(`   ${getPlanetEmoji(planetName)} ${planetName}: ${diff.toFixed(4)}°`);
                }
            });
        }
        console.log();
        
    } catch (error) {
        console.error('❌ Error calculating planetary positions:', error.message);
    }
}

/**
 * Historical ayanamsa comparison
 */
async function historicalAyanamsaComparison() {
    console.log('HISTORICAL AYANAMSA COMPARISON');
    console.log('-'.repeat(35));
    console.log();
    
    try {
        const dates = [
            new Date('1900-01-01'),
            new Date('1950-01-01'),
            new Date('2000-01-01'),
            new Date('2025-01-01')
        ];
        
        console.log('📅 Ayanamsa values over time (Lahiri):');
        console.log();
        
        dates.forEach(date => {
            const ayanamsa = getSpecificAyanamsa(1, date);
            if (ayanamsa) {
                console.log(`   ${date.getFullYear()}: ${ayanamsa.degree.toFixed(6)}°`);
            }
        });
        
        console.log();
        console.log('📈 Ayanamsa progression:');
        
        for (let i = 1; i < dates.length; i++) {
            const prevAyanamsa = getSpecificAyanamsa(1, dates[i - 1]);
            const currAyanamsa = getSpecificAyanamsa(1, dates[i]);
            
            if (prevAyanamsa && currAyanamsa) {
                const yearsDiff = dates[i].getFullYear() - dates[i - 1].getFullYear();
                const ayanamsaDiff = currAyanamsa.degree - prevAyanamsa.degree;
                const annualRate = ayanamsaDiff / yearsDiff;
                
                console.log(`   ${dates[i - 1].getFullYear()}-${dates[i].getFullYear()}: ${ayanamsaDiff.toFixed(6)}° (${annualRate.toFixed(6)}°/year)`);
            }
        }
        console.log();
        
    } catch (error) {
        console.error('❌ Error in historical comparison:', error.message);
    }
}

/**
 * Helper function to get planet emoji
 */
function getPlanetEmoji(planet) {
    const emojis = {
        'Sun': '☀️',
        'Moon': '🌙',
        'Mars': '🔴',
        'Mercury': '☿',
        'Jupiter': '♃',
        'Venus': '♀️',
        'Saturn': '♄',
        'Rahu': '☊',
        'Ketu': '☋'
    };
    return emojis[planet] || '🌟';
}

// Run the demonstration
if (require.main === module) {
    demonstrateAyanamsa();
}
