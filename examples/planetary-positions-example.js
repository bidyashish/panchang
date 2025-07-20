#!/usr/bin/env node

/**
 * Comprehensive Planetary Positions Example
 * 
 * Demonstrates the getCurrentPlanets() function with:
 * - Current planetary positions with Nakshatra and Rashi information
 * - Multiple ayanamsa system comparisons
 * - Astrological analysis and insights
 * - Data validation and accuracy testing
 * 
 * @author Astronomical Calculator Team
 * @version 2.0.0
 */

const { getCurrentPlanets, getSpecificAyanamsa } = require('../dist/index.js');
const { CONFIG, FORMAT, EMOJI, ERROR_HANDLER, VALIDATOR, ANALYZER } = require('./common-utils.js');

/**
 * Main execution function
 */
async function demonstratePlanetaryPositions() {
    console.log(FORMAT.section('🌟 PLANETARY POSITIONS WITH NAKSHATRA & RASHI', 70));
    console.log();
    
    const currentDate = new Date();
    console.log(`${EMOJI.GENERAL.calendar} Date: ${FORMAT.date(currentDate)}`);
    console.log(`${EMOJI.GENERAL.info} Timestamp: ${currentDate.toISOString()}`);
    console.log();
    
    try {
        // Section 1: Current planetary positions
        await displayCurrentPositions(currentDate);
        
        // Section 2: Ayanamsa system comparison
        await compareAyanamsaSystems(currentDate);
        
        // Section 3: Detailed planetary analysis
        await detailedPlanetaryAnalysis(currentDate);
        
        // Section 4: Astrological insights
        await generateAstrologicalInsights(currentDate);
        
        // Section 5: Data validation
        await validatePlanetaryData(currentDate);
        
        // Section 6: Historical comparison
        await historicalPositionComparison();
        
        ERROR_HANDLER.success('Planetary positions demonstration completed successfully!');
        
    } catch (error) {
        console.error(`${EMOJI.GENERAL.error} Demonstration failed:`, error.message);
        process.exit(1);
    }
}

/**
 * Display current planetary positions with detailed information
 */
async function displayCurrentPositions(date) {
    console.log(FORMAT.section('CURRENT PLANETARY POSITIONS'));
    console.log();
    
    const result = await ERROR_HANDLER.wrap(async () => {
        // Get ayanamsa information
        const ayanamsa = getSpecificAyanamsa(1, date); // Lahiri
        if (ayanamsa) {
            console.log(`${EMOJI.GENERAL.telescope} Using ${ayanamsa.name} Ayanamsa: ${ayanamsa.degree.toFixed(6)}°`);
            console.log(`   Description: ${ayanamsa.description}`);
            console.log();
        }
        
        // Get planetary positions
        const planets = getCurrentPlanets(date, 1); // Lahiri ayanamsa
        
        if (!planets || planets.length === 0) {
            throw new Error('No planetary positions retrieved');
        }
        
        console.log(`${EMOJI.GENERAL.star} Retrieved ${planets.length} planetary positions:`);
        console.log();
        
        // Detailed display for each planet
        planets.forEach(planet => {
            const emoji = EMOJI.PLANETS[planet.planet] || '🌟';
            const elementEmoji = EMOJI.ELEMENTS[planet.rashi.element] || '';
            
            console.log(`${emoji} ${planet.planet.toUpperCase()}:`);
            console.log(`   Sidereal Longitude: ${planet.longitude.toFixed(4)}°`);
            console.log(`   Latitude: ${planet.latitude.toFixed(4)}°`);
            console.log(`   ${elementEmoji} Rashi: ${planet.rashi.name} (${planet.rashi.rashi}) - ${planet.rashi.element} sign`);
            console.log(`   Position in Rashi: ${planet.rashi.degree.toFixed(2)}°`);
            console.log(`   Rashi Ruler: ${planet.rashi.ruler}`);
            console.log(`   ⭐ Nakshatra: ${planet.nakshatra.name} (${planet.nakshatra.nakshatra})`);
            console.log(`   Pada: ${planet.nakshatra.pada}/4`);
            console.log(`   Position in Nakshatra: ${planet.nakshatra.degree.toFixed(2)}°`);
            console.log(`   Nakshatra Ruler: ${planet.nakshatra.ruler}`);
            console.log(`   Deity: ${planet.nakshatra.deity}`);
            console.log(`   Symbol: ${planet.nakshatra.symbol}`);
            console.log();
        });
        
        return planets;
    }, 'fetching current planetary positions');
    
    return result;
}

/**
 * Compare planetary positions across different ayanamsa systems
 */
async function compareAyanamsaSystems(date) {
    console.log(FORMAT.section('AYANAMSA SYSTEM COMPARISON'));
    console.log();
    
    const ayanamsaIds = [1, 3, 5]; // Lahiri, Raman, KP
    const results = [];
    
    console.log(`${EMOJI.GENERAL.telescope} Comparing Sun position across different ayanamsa systems:`);
    console.log();
    
    const widths = [20, 15, 20, 15];
    console.log(FORMAT.tableRow(['Ayanamsa', 'Value (°)', 'Sun Longitude (°)', 'Sun Rashi'], widths));
    console.log(FORMAT.tableSeparator(widths));
    
    for (const id of ayanamsaIds) {
        const result = await ERROR_HANDLER.wrap(async () => {
            const ayanamsa = getSpecificAyanamsa(id, date);
            const planets = getCurrentPlanets(date, id);
            
            if (ayanamsa && planets && planets.length > 0) {
                const sun = planets.find(p => p.planet === 'Sun');
                
                if (sun) {
                    const row = [
                        ayanamsa.name,
                        ayanamsa.degree.toFixed(4),
                        sun.longitude.toFixed(4),
                        sun.rashi.name
                    ];
                    console.log(FORMAT.tableRow(row, widths));
                    
                    return { ayanamsa, sun };
                }
            }
            return null;
        }, `comparing ayanamsa ID ${id}`);
        
        if (result) {
            results.push(result);
        }
    }
    
    // Show differences
    if (results.length > 1) {
        console.log();
        console.log(FORMAT.subsection('Position Differences'));
        
        const base = results[0];
        results.slice(1).forEach(current => {
            const ayanamsaDiff = current.ayanamsa.degree - base.ayanamsa.degree;
            const positionDiff = current.sun.longitude - base.sun.longitude;
            
            console.log(`${current.ayanamsa.name} vs ${base.ayanamsa.name}:`);
            console.log(`   Ayanamsa difference: ${ayanamsaDiff.toFixed(6)}°`);
            console.log(`   Sun position difference: ${positionDiff.toFixed(6)}°`);
        });
    }
    
    console.log();
    return results;
}

/**
 * Detailed analysis of planetary data
 */
async function detailedPlanetaryAnalysis(date) {
    console.log(FORMAT.section('DETAILED PLANETARY ANALYSIS'));
    console.log();
    
    const result = await ERROR_HANDLER.wrap(async () => {
        const planets = getCurrentPlanets(date, 1);
        
        if (!planets) {
            throw new Error('Could not retrieve planetary positions');
        }
        
        // Summary table
        console.log(`${EMOJI.GENERAL.star} Summary Table:`);
        console.log();
        
        const widths = [10, 16, 16, 6, 12];
        console.log(FORMAT.tableRow(['Planet', 'Rashi', 'Nakshatra', 'Pada', 'Ruler'], widths));
        console.log(FORMAT.tableSeparator(widths));
        
        planets.forEach(planet => {
            const row = [
                planet.planet,
                planet.rashi.name,
                planet.nakshatra.name,
                planet.nakshatra.pada,
                planet.nakshatra.ruler
            ];
            console.log(FORMAT.tableRow(row, widths));
        });
        
        console.log();
        
        // Strength analysis
        console.log(FORMAT.subsection('Planetary Strength Analysis'));
        
        planets.forEach(planet => {
            const strength = analyzePlanetStrength(planet);
            const emoji = EMOJI.PLANETS[planet.planet] || '🌟';
            
            console.log(`${emoji} ${planet.planet}: ${strength.level} ${strength.indicator}`);
            if (strength.note) {
                console.log(`   ${strength.note}`);
            }
        });
        
        console.log();
        return planets;
        
    }, 'detailed planetary analysis');
    
    return result;
}

/**
 * Generate astrological insights from planetary positions
 */
async function generateAstrologicalInsights(date) {
    console.log(FORMAT.section('ASTROLOGICAL INSIGHTS'));
    console.log();
    
    const result = await ERROR_HANDLER.wrap(async () => {
        const planets = getCurrentPlanets(date, 1);
        
        if (!planets) {
            throw new Error('Could not retrieve planetary positions for analysis');
        }
        
        // Conjunctions analysis
        const conjunctions = ANALYZER.findConjunctions(planets);
        if (conjunctions.length > 0) {
            console.log(`${EMOJI.GENERAL.star} Planetary Conjunctions:`);
            conjunctions.forEach(conj => {
                console.log(`   • ${conj.planets.join(' + ')} in ${conj.rashi} (${conj.orb.toFixed(1)}° orb)`);
            });
            console.log();
        }
        
        // Elemental analysis
        console.log(`${EMOJI.GENERAL.earth} Elemental Distribution:`);
        const elements = ANALYZER.analyzeElements(planets);
        
        Object.entries(elements).forEach(([element, data]) => {
            const percentage = (data.count / planets.length * 100).toFixed(1);
            const elementEmoji = EMOJI.ELEMENTS[element] || '';
            
            console.log(`   ${elementEmoji} ${element.padEnd(6)}: ${data.count} planets (${percentage}%) - ${data.planets.join(', ')}`);
        });
        
        console.log();
        
        // Nakshatra groupings
        const nakshatraGroups = ANALYZER.findNakshatraGroups(planets);
        if (nakshatraGroups.length > 0) {
            console.log(`${EMOJI.GENERAL.star} Nakshatra Groupings:`);
            nakshatraGroups.forEach(([nakshatra, planetList]) => {
                console.log(`   • ${planetList.join(' & ')} in ${nakshatra} nakshatra`);
            });
            console.log();
        }
        
        // Special observations
        console.log(`${EMOJI.GENERAL.info} Special Observations:`);
        const observations = generateSpecialObservations(planets);
        observations.forEach(obs => {
            console.log(`   • ${obs}`);
        });
        
        console.log();
        return { conjunctions, elements, nakshatraGroups, observations };
        
    }, 'astrological insights generation');
    
    return result;
}

/**
 * Validate planetary data integrity
 */
async function validatePlanetaryData(date) {
    console.log(FORMAT.section('DATA VALIDATION'));
    console.log();
    
    const result = await ERROR_HANDLER.wrap(async () => {
        const planets = getCurrentPlanets(date, 1);
        
        if (!planets) {
            throw new Error('Could not retrieve planetary data for validation');
        }
        
        console.log(`${EMOJI.GENERAL.info} Validating ${planets.length} planetary positions...`);
        console.log();
        
        let validCount = 0;
        let totalIssues = 0;
        
        planets.forEach(planet => {
            const issues = VALIDATOR.planetaryPosition(planet);
            
            if (issues.length === 0) {
                validCount++;
                console.log(`${EMOJI.GENERAL.success} ${planet.planet}: Valid`);
            } else {
                totalIssues += issues.length;
                console.log(`${EMOJI.GENERAL.warning} ${planet.planet}: ${issues.join(', ')}`);
            }
        });
        
        console.log();
        
        if (totalIssues === 0) {
            ERROR_HANDLER.success(`All ${planets.length} planetary positions passed validation!`);
        } else {
            console.log(`${EMOJI.GENERAL.info} Validation Summary:`);
            console.log(`  Valid positions: ${validCount}`);
            console.log(`  Positions with issues: ${planets.length - validCount}`);
            console.log(`  Total issues found: ${totalIssues}`);
        }
        
        return { valid: validCount, total: planets.length, issues: totalIssues };
        
    }, 'planetary data validation');
    
    console.log();
    return result;
}

/**
 * Compare planetary positions across different dates
 */
async function historicalPositionComparison() {
    console.log(FORMAT.section('HISTORICAL POSITION COMPARISON'));
    console.log();
    
    const dates = [
        CONFIG.TEST_DATES.REFERENCE,
        CONFIG.TEST_DATES.CURRENT
    ];
    
    console.log(`${EMOJI.GENERAL.calendar} Comparing Sun position across dates:`);
    console.log();
    
    const results = [];
    
    for (const date of dates) {
        const result = await ERROR_HANDLER.wrap(async () => {
            const planets = getCurrentPlanets(date, 1);
            const sun = planets?.find(p => p.planet === 'Sun');
            
            if (sun) {
                console.log(`📅 ${date.toISOString().split('T')[0]}:`);
                console.log(`   Position: ${sun.longitude.toFixed(4)}°`);
                console.log(`   Rashi: ${sun.rashi.name} (${sun.rashi.degree.toFixed(2)}°)`);
                console.log(`   Nakshatra: ${sun.nakshatra.name} (Pada ${sun.nakshatra.pada})`);
                console.log();
                
                return { date, sun };
            }
            return null;
        }, `fetching positions for ${date.toISOString()}`);
        
        if (result) {
            results.push(result);
        }
    }
    
    // Calculate movement
    if (results.length === 2) {
        const [older, newer] = results;
        const timeDiff = (newer.date.getTime() - older.date.getTime()) / (1000 * 60 * 60 * 24); // days
        const positionDiff = newer.sun.longitude - older.sun.longitude;
        const dailyMotion = positionDiff / timeDiff;
        
        console.log(FORMAT.subsection('Motion Analysis'));
        console.log(`Time difference: ${timeDiff.toFixed(1)} days`);
        console.log(`Position change: ${positionDiff.toFixed(6)}°`);
        console.log(`Average daily motion: ${dailyMotion.toFixed(6)}°/day`);
    }
    
    console.log();
    return results;
}

/**
 * Helper function to analyze planetary strength
 */
function analyzePlanetStrength(planet) {
    // Exaltation signs
    const exaltation = {
        'Sun': 'Mesha', 'Moon': 'Vrishabha', 'Mercury': 'Kanya',
        'Venus': 'Meena', 'Mars': 'Makara', 'Jupiter': 'Karka', 'Saturn': 'Tula'
    };
    
    // Own signs
    const ownSigns = {
        'Sun': ['Simha'], 'Moon': ['Karka'], 'Mercury': ['Mithuna', 'Kanya'],
        'Venus': ['Vrishabha', 'Tula'], 'Mars': ['Mesha', 'Vrishchika'],
        'Jupiter': ['Dhanu', 'Meena'], 'Saturn': ['Makara', 'Kumbha']
    };
    
    if (exaltation[planet.planet] === planet.rashi.name) {
        return { level: 'Excellent', indicator: '⭐⭐⭐', note: 'Exalted - Maximum strength' };
    } else if (ownSigns[planet.planet]?.includes(planet.rashi.name)) {
        return { level: 'Very Good', indicator: '⭐⭐', note: 'Own sign - Strong' };
    } else if (planet.rashi.ruler === planet.planet) {
        return { level: 'Good', indicator: '⭐', note: 'Comfortable position' };
    } else {
        return { level: 'Average', indicator: '○', note: null };
    }
}

/**
 * Generate special observations from planetary data
 */
function generateSpecialObservations(planets) {
    const observations = [];
    
    // Element dominance
    const elements = ANALYZER.analyzeElements(planets);
    const maxElement = Object.entries(elements).reduce((max, [element, data]) => 
        data.count > max.count ? { element, count: data.count } : max, { element: '', count: 0 });
    
    if (maxElement.count >= 3) {
        observations.push(`${maxElement.element} element dominance with ${maxElement.count} planets`);
    }
    
    // Rashi distribution analysis
    const rashiGroups = {};
    planets.forEach(planet => {
        const rashiName = planet.rashi.name;
        rashiGroups[rashiName] = (rashiGroups[rashiName] || 0) + 1;
    });
    
    const maxRashi = Object.entries(rashiGroups).reduce((max, [rashi, count]) => 
        count > max.count ? { rashi, count } : max, { rashi: '', count: 0 });
    
    if (maxRashi.count >= 2) {
        observations.push(`Multiple planets (${maxRashi.count}) in ${maxRashi.rashi} rashi`);
    }
    
    // Check for planets at rashi boundaries (last 3 degrees or first 3 degrees)
    const boundaryPlanets = planets.filter(planet => 
        planet.rashi.degree <= 3 || planet.rashi.degree >= 27
    );
    
    if (boundaryPlanets.length > 0) {
        observations.push(`${boundaryPlanets.length} planet(s) near rashi boundaries: ${boundaryPlanets.map(p => p.planet).join(', ')}`);
    }
    
    return observations;
}

// Execute if run directly
if (require.main === module) {
    demonstratePlanetaryPositions().catch(error => {
        console.error(`${EMOJI.GENERAL.error} Fatal error:`, error);
        process.exit(1);
    });
}

// Export for use as module
module.exports = {
    demonstratePlanetaryPositions,
    displayCurrentPositions,
    compareAyanamsaSystems,
    detailedPlanetaryAnalysis,
    generateAstrologicalInsights,
    validatePlanetaryData,
    historicalPositionComparison
};
