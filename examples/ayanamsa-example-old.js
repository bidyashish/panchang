#!/usr/bin/env node

/**
 * Comprehensive Ayanamsa Systems Example
 * 
 * Demonstrates all available ayanamsa systems and their usage:
 * - Display all 40+ ayanamsa systems
 * - Compare popular systems
 * - Historical value analysis
 * - Practical usage examples
 * 
 * @author Astronomical Calculator Team
 * @version 2.0.0
 */

const { getAyanamsa, getSpecificAyanamsa, AstronomicalCalculator } = require('../dist/index.js');
const { CONFIG, FORMAT, EMOJI, ERROR_HANDLER, VALIDATOR } = require('./common-utils.js');

/**
 * Main execution function
 */
async function demonstrateAyanamsa() {
    console.log(FORMAT.section('🌟 AYANAMSA SYSTEMS DEMONSTRATION', 70));
    console.log();
    
    const currentDate = new Date();
    console.log(`${EMOJI.GENERAL.calendar} Date: ${FORMAT.date(currentDate)}`);
    console.log(`${EMOJI.GENERAL.info} Timestamp: ${currentDate.toISOString()}`);
    console.log();
    
    try {
        // Section 1: Display all ayanamsa systems
        await displayAllAyanamsaSystems(currentDate);
        
        // Section 2: Popular systems comparison
        await comparePopularSystems(currentDate);
        
        // Section 3: Historical analysis
        await historicalAnalysis();
        
        // Section 4: Practical usage with AstronomicalCalculator
        await demonstrateCalculatorUsage();
        
        // Section 5: Validation and accuracy testing
        await validateAyanamsaData(currentDate);
        
        ERROR_HANDLER.success('Ayanamsa demonstration completed successfully!');
        
    } catch (error) {
        console.error(`${EMOJI.GENERAL.error} Demonstration failed:`, error.message);
        process.exit(1);
    }
}

/**
 * Display all available ayanamsa systems in a formatted table
 */
async function displayAllAyanamsaSystems(date) {
    console.log(FORMAT.section('ALL AYANAMSA SYSTEMS'));
    console.log();
    
    const result = await ERROR_HANDLER.wrap(async () => {
        const allAyanamsas = getAyanamsa(date);
        
        if (!allAyanamsas || allAyanamsas.length === 0) {
            throw new Error('No ayanamsa systems found');
        }
        
        console.log(`${EMOJI.GENERAL.star} Found ${allAyanamsas.length} ayanamsa systems:`);
        console.log();
        
        // Table header
        const widths = [4, 28, 12, 40];
        console.log(FORMAT.tableRow(['ID', 'Name', 'Degree', 'Description'], widths));
        console.log(FORMAT.tableSeparator(widths));
        
        // Table rows
        allAyanamsas.forEach(ayanamsa => {
            const row = [
                ayanamsa.id,
                ayanamsa.name,
                `${ayanamsa.degree.toFixed(6)}°`,
                ayanamsa.description
            ];
            console.log(FORMAT.tableRow(row, widths));
        });
        
        return allAyanamsas;
    }, 'fetching all ayanamsa systems');
    
    console.log();
    return result;
}

/**
 * Compare popular ayanamsa systems
 */
async function comparePopularSystems(date) {
    console.log(FORMAT.section('POPULAR SYSTEMS COMPARISON'));
    console.log();
    
    const popularSystems = CONFIG.POPULAR_AYANAMSAS;
    
    console.log(`${EMOJI.GENERAL.telescope} Comparing ${popularSystems.length} popular systems:`);
    console.log();
    
    const results = [];
    
    for (const systemName of popularSystems) {
        const result = await ERROR_HANDLER.wrap(async () => {
            const ayanamsa = getSpecificAyanamsa(systemName, date);
            if (ayanamsa) {
                console.log(`${EMOJI.GENERAL.star} ${ayanamsa.name}:`);
                console.log(`   Degree: ${ayanamsa.degree.toFixed(6)}°`);
                console.log(`   ID: ${ayanamsa.id}`);
                console.log(`   Description: ${ayanamsa.description}`);
                console.log();
                
                // Validate the data
                const issues = VALIDATOR.ayanamsa(ayanamsa);
                if (issues.length > 0) {
                    ERROR_HANDLER.warn(`Validation issues: ${issues.join(', ')}`, ayanamsa.name);
                }
                
                return ayanamsa;
            } else {
                ERROR_HANDLER.warn(`System '${systemName}' not found`);
                return null;
            }
        }, `fetching ${systemName} ayanamsa`);
        
        if (result) {
            results.push(result);
        }
    }
    
    // Show differences
    if (results.length > 1) {
        console.log(FORMAT.subsection('Degree Differences'));
        const baseSystem = results[0];
        results.slice(1).forEach(system => {
            const diff = system.degree - baseSystem.degree;
            console.log(`${system.name} vs ${baseSystem.name}: ${diff.toFixed(6)}°`);
        });
        console.log();
    }
    
    return results;
}

/**
 * Analyze historical values of Lahiri ayanamsa
 */
async function historicalAnalysis() {
    console.log(FORMAT.section('HISTORICAL ANALYSIS'));
    console.log();
    
    const historicalDates = CONFIG.TEST_DATES.HISTORICAL;
    
    console.log(`${EMOJI.GENERAL.calendar} Lahiri Ayanamsa Historical Values:`);
    console.log();
    
    const widths = [6, 15, 12];
    console.log(FORMAT.tableRow(['Year', 'Date', 'Degree'], widths));
    console.log(FORMAT.tableSeparator(widths));
    
    const historicalValues = [];
    
    for (const date of historicalDates) {
        const result = await ERROR_HANDLER.wrap(async () => {
            const lahiri = getSpecificAyanamsa('Lahiri', date);
            if (lahiri) {
                const row = [
                    date.getFullYear(),
                    date.toISOString().split('T')[0],
                    `${lahiri.degree.toFixed(6)}°`
                ];
                console.log(FORMAT.tableRow(row, widths));
                
                return { date: date, degree: lahiri.degree };
            }
            return null;
        }, `fetching Lahiri for ${date.getFullYear()}`);
        
        if (result) {
            historicalValues.push(result);
        }
    }
    
    // Calculate average annual change
    if (historicalValues.length > 1) {
        console.log();
        console.log(FORMAT.subsection('Analysis'));
        
        for (let i = 1; i < historicalValues.length; i++) {
            const prev = historicalValues[i - 1];
            const curr = historicalValues[i];
            const yearsDiff = curr.date.getFullYear() - prev.date.getFullYear();
            const degreeDiff = curr.degree - prev.degree;
            const annualChange = degreeDiff / yearsDiff;
            
            console.log(`${prev.date.getFullYear()}-${curr.date.getFullYear()}: ${annualChange.toFixed(8)}°/year change`);
        }
    }
    
    console.log();
}

/**
 * Demonstrate usage through AstronomicalCalculator class
 */
async function demonstrateCalculatorUsage() {
    console.log(FORMAT.section('ASTRONOMICAL CALCULATOR USAGE'));
    console.log();
    
    const calculator = new AstronomicalCalculator();
    
    try {
        const testDate = CONFIG.TEST_DATES.REFERENCE;
        console.log(`${EMOJI.GENERAL.calendar} Test Date: ${testDate.toISOString()}`);
        console.log();
        
        // Get all systems through calculator
        const allSystems = await ERROR_HANDLER.wrap(async () => {
            return calculator.getAyanamsa(testDate);
        }, 'calculator.getAyanamsa()');
        
        if (allSystems) {
            console.log(`${EMOJI.GENERAL.success} Retrieved ${allSystems.length} systems via calculator`);
            
            // Show top 5 by degree value
            console.log();
            console.log(FORMAT.subsection('Top 5 Systems (by degree value)'));
            
            const sorted = allSystems
                .filter(a => a && typeof a.degree === 'number')
                .sort((a, b) => b.degree - a.degree)
                .slice(0, 5);
            
            sorted.forEach((ayanamsa, index) => {
                console.log(`${index + 1}. ${ayanamsa.name}: ${ayanamsa.degree.toFixed(6)}°`);
            });
        }
        
        console.log();
        
        // Demonstrate lookup by name and ID
        console.log(FORMAT.subsection('Lookup Examples'));
        
        const byName = await ERROR_HANDLER.wrap(async () => {
            return calculator.getSpecificAyanamsa('Krishnamurti', testDate);
        }, 'lookup by name');
        
        if (byName) {
            console.log(`By name 'Krishnamurti': ${byName.degree.toFixed(6)}° (ID: ${byName.id})`);
        }
        
        const byId = await ERROR_HANDLER.wrap(async () => {
            return calculator.getSpecificAyanamsa(5, testDate);
        }, 'lookup by ID');
        
        if (byId) {
            console.log(`By ID 5: ${byId.name} = ${byId.degree.toFixed(6)}°`);
        }
        
        // Verify they match
        if (byName && byId && byName.id === byId.id) {
            ERROR_HANDLER.success('Name and ID lookups match correctly!');
        }
        
    } finally {
        calculator.cleanup();
    }
    
    console.log();
}

/**
 * Validate ayanamsa data integrity
 */
async function validateAyanamsaData(date) {
    console.log(FORMAT.section('DATA VALIDATION'));
    console.log();
    
    const result = await ERROR_HANDLER.wrap(async () => {
        const allSystems = getAyanamsa(date);
        let validCount = 0;
        let totalIssues = 0;
        
        console.log(`${EMOJI.GENERAL.info} Validating ${allSystems.length} systems...`);
        console.log();
        
        allSystems.forEach((ayanamsa, index) => {
            const issues = VALIDATOR.ayanamsa(ayanamsa);
            
            if (issues.length === 0) {
                validCount++;
            } else {
                totalIssues += issues.length;
                console.log(`${EMOJI.GENERAL.warning} System ${index + 1} (${ayanamsa.name || 'Unknown'}): ${issues.join(', ')}`);
            }
        });
        
        console.log();
        
        if (totalIssues === 0) {
            ERROR_HANDLER.success(`All ${allSystems.length} systems passed validation!`);
        } else {
            console.log(`${EMOJI.GENERAL.info} Validation Summary:`);
            console.log(`  Valid systems: ${validCount}`);
            console.log(`  Systems with issues: ${allSystems.length - validCount}`);
            console.log(`  Total issues found: ${totalIssues}`);
        }
        
        return { valid: validCount, total: allSystems.length, issues: totalIssues };
        
    }, 'data validation');
    
    console.log();
    return result;
}

// Execute if run directly
if (require.main === module) {
    demonstrateAyanamsa().catch(error => {
        console.error(`${EMOJI.GENERAL.error} Fatal error:`, error);
        process.exit(1);
    });
}

// Export for use as module
module.exports = {
    demonstrateAyanamsa,
    displayAllAyanamsaSystems,
    comparePopularSystems,
    historicalAnalysis,
    demonstrateCalculatorUsage,
    validateAyanamsaData
};
    
    allAyanamsas.forEach(ayanamsa => {
        const id = ayanamsa.id.toString().padEnd(3);
        const name = ayanamsa.name.padEnd(25);
        const degree = `${ayanamsa.degree.toFixed(6)}°`.padEnd(10);
        const description = ayanamsa.description;
        
        console.log(`${id}| ${name}| ${degree}| ${description}`);
    });
    
    console.log('\n=== Popular Ayanamsa Systems ===\n');
    
    // Get specific popular ayanamsa systems
    const popularSystems = ['Lahiri', 'Krishnamurti', 'Raman', 'Fagan/Bradley'];
    
    popularSystems.forEach(systemName => {
        const ayanamsa = getSpecificAyanamsa(systemName, currentDate);
        if (ayanamsa) {
            console.log(`🔸 ${ayanamsa.name}: ${ayanamsa.degree.toFixed(6)}°`);
            console.log(`   ${ayanamsa.description}\n`);
        }
    });
    
    console.log('=== Historical Comparison ===\n');
    
    // Compare Lahiri ayanamsa over different years
    const historicalDates = [
        new Date('1900-01-01'),
        new Date('1950-01-01'), 
        new Date('2000-01-01'),
        new Date('2025-01-01')
    ];
    
    console.log('Lahiri Ayanamsa Historical Values:');
    historicalDates.forEach(date => {
        const lahiri = getSpecificAyanamsa('Lahiri', date);
        if (lahiri) {
            console.log(`📆 ${date.getFullYear()}: ${lahiri.degree.toFixed(6)}°`);
        }
    });
    
    console.log('\n=== Using AstronomicalCalculator Class ===\n');
    
    // Demonstrate usage through the main calculator class
    const calculator = new AstronomicalCalculator();
    
    try {
        const testDate = new Date('2013-01-18T12:00:00Z'); // Reference date from tests
        console.log(`📅 Test Date: ${testDate.toISOString()}\n`);
        
        // Get top 5 ayanamsa systems by degree value
        const top5 = calculator.getAyanamsa(testDate).slice(0, 5);
        
        console.log('🔝 Top 5 Ayanamsa Systems (by degree):');
        top5.forEach((ayanamsa, index) => {
            console.log(`${index + 1}. ${ayanamsa.name}: ${ayanamsa.degree.toFixed(6)}°`);
        });
        
        console.log('\n🎯 Specific System Lookup:');
        const krishnamurti = calculator.getSpecificAyanamsa('Krishnamurti', testDate);
        if (krishnamurti) {
            console.log(`${krishnamurti.name} (ID: ${krishnamurti.id}): ${krishnamurti.degree.toFixed(6)}°`);
        }
        
        const byId = calculator.getSpecificAyanamsa(5, testDate); // Krishnamurti by ID
        if (byId) {
            console.log(`By ID ${byId.id}: ${byId.name} = ${byId.degree.toFixed(6)}°`);
        }
        
    } finally {
        calculator.cleanup();
    }
    
    console.log('\n✅ Ayanamsa example completed successfully!');
    
} catch (error) {
    console.error('❌ Error in ayanamsa example:', error);
    process.exit(1);
}
