#!/usr/bin/env node

/**
 * Location Names in Panchanga Reports Example
 * 
 * Demonstrates how to include location names in Panchanga reports:
 * - Using location names with getPanchangaReport()
 * - Comparing reports for multiple locations
 * - Timezone handling and coordinate formatting
 * - International location support
 * 
 * @author Astronomical Calculator Team
 * @version 2.0.0
 */

const { getPanchanga, getPanchangaReport, AstronomicalCalculator } = require('../dist/index.js');
const { CONFIG, FORMAT, EMOJI, ERROR_HANDLER } = require('./common-utils.js');

/**
 * Main execution function
 */
async function demonstrateLocationNames() {
    console.log(FORMAT.section('🌍 LOCATION NAMES IN PANCHANGA REPORTS', 70));
    console.log();
    
    const testDate = new Date();
    console.log(`${EMOJI.GENERAL.calendar} Date: ${FORMAT.date(testDate)}`);
    console.log(`${EMOJI.GENERAL.info} Timestamp: ${testDate.toISOString()}`);
    console.log();
    
    try {
        // Section 1: Basic location name usage
        await demonstrateBasicLocationNames(testDate);
        
        // Section 2: Multiple locations comparison
        await compareMultipleLocations(testDate);
        
        // Section 3: International locations
        await demonstrateInternationalLocations(testDate);
        
        // Section 4: Location data validation
        await validateLocationData();
        
        // Section 5: Custom location formatting
        await demonstrateCustomFormatting(testDate);
        
        ERROR_HANDLER.success('Location names demonstration completed successfully!');
        
    } catch (error) {
        console.error(`${EMOJI.GENERAL.error} Demonstration failed:`, error.message);
        process.exit(1);
    }
}

/**
 * Demonstrate basic location name functionality
 */
async function demonstrateBasicLocationNames(date) {
    console.log(FORMAT.section('BASIC LOCATION NAME USAGE'));
    console.log();
    
    const location = CONFIG.LOCATIONS.NEW_DELHI;
    
    console.log(`${EMOJI.GENERAL.location} Testing with: ${location.name}`);
    console.log(`   Coordinates: ${FORMAT.coordinate(location.latitude, location.longitude)}`);
    console.log(`   Timezone: ${location.timezone}`);
    console.log();
    
    // Test 1: With location name
    const resultWithName = await ERROR_HANDLER.wrap(async () => {
        const report = getPanchangaReport(
            date,
            location.latitude,
            location.longitude,
            location.timezone,
            location.name
        );
        
        console.log(FORMAT.subsection('Report WITH Location Name'));
        console.log(report);
        console.log();
        
        return report;
    }, 'generating report with location name');
    
    // Test 2: Without location name
    const resultWithoutName = await ERROR_HANDLER.wrap(async () => {
        const report = getPanchangaReport(
            date,
            location.latitude,
            location.longitude,
            location.timezone
        );
        
        console.log(FORMAT.subsection('Report WITHOUT Location Name'));
        console.log(report);
        console.log();
        
        return report;
    }, 'generating report without location name');
    
    // Compare the differences
    if (resultWithName && resultWithoutName) {
        console.log(FORMAT.subsection('Comparison Analysis'));
        const hasLocationInFirst = resultWithName.includes(location.name);
        const hasLocationInSecond = resultWithoutName.includes(location.name);
        
        console.log(`Report with name parameter contains location: ${hasLocationInFirst ? 'Yes' : 'No'}`);
        console.log(`Report without name parameter contains location: ${hasLocationInSecond ? 'Yes' : 'No'}`);
        
        if (hasLocationInFirst && !hasLocationInSecond) {
            ERROR_HANDLER.success('Location name functionality working correctly!');
        }
    }
    
    console.log();
}

/**
 * Compare Panchanga reports for multiple locations
 */
async function compareMultipleLocations(date) {
    console.log(FORMAT.section('MULTIPLE LOCATIONS COMPARISON'));
    console.log();
    
    const locations = [
        CONFIG.LOCATIONS.NEW_DELHI,
        CONFIG.LOCATIONS.MUMBAI,
        CONFIG.LOCATIONS.VARANASI
    ];
    
    console.log(`${EMOJI.GENERAL.earth} Comparing Panchanga for ${locations.length} Indian cities:`);
    console.log();
    
    const results = [];
    
    for (const location of locations) {
        const result = await ERROR_HANDLER.wrap(async () => {
            console.log(`${EMOJI.GENERAL.location} ${location.name}:`);
            console.log(`   Coordinates: ${FORMAT.coordinate(location.latitude, location.longitude)}`);
            console.log(`   Timezone: ${location.timezone}`);
            console.log();
            
            // Get Panchanga data
            const panchanga = getPanchanga(
                date,
                location.latitude,
                location.longitude,
                location.timezone
            );
            
            // Get formatted report
            const report = getPanchangaReport(
                date,
                location.latitude,
                location.longitude,
                location.timezone,
                location.name
            );
            
            // Extract key information
            const sunriseTime = extractTime(report, 'SUNRISE');
            const sunsetTime = extractTime(report, 'SUNSET');
            
            console.log(`   Tithi: ${panchanga.tithi.name} (${panchanga.tithi.percentage.toFixed(1)}%)`);
            console.log(`   Nakshatra: ${panchanga.nakshatra.name}`);
            console.log(`   Sunrise: ${sunriseTime || 'N/A'}`);
            console.log(`   Sunset: ${sunsetTime || 'N/A'}`);
            console.log();
            
            return {
                location: location.name,
                coordinates: { lat: location.latitude, lon: location.longitude },
                panchanga,
                sunrise: sunriseTime,
                sunset: sunsetTime
            };
            
        }, `processing ${location.name}`);
        
        if (result) {
            results.push(result);
        }
    }
    
    // Summary comparison
    if (results.length > 0) {
        console.log(FORMAT.subsection('Comparison Summary'));
        
        const widths = [20, 15, 12, 10, 10];
        console.log(FORMAT.tableRow(['Location', 'Tithi', 'Nakshatra', 'Sunrise', 'Sunset'], widths));
        console.log(FORMAT.tableSeparator(widths));
        
        results.forEach(result => {
            const row = [
                result.location,
                result.panchanga.tithi.name,
                result.panchanga.nakshatra.name.substring(0, 11),
                result.sunrise || 'N/A',
                result.sunset || 'N/A'
            ];
            console.log(FORMAT.tableRow(row, widths));
        });
    }
    
    console.log();
    return results;
}

/**
 * Demonstrate international location support
 */
async function demonstrateInternationalLocations(date) {
    console.log(FORMAT.section('INTERNATIONAL LOCATIONS'));
    console.log();
    
    const internationalLocations = [
        CONFIG.LOCATIONS.NEW_YORK,
        CONFIG.LOCATIONS.LONDON,
        CONFIG.LOCATIONS.TOKYO
    ];
    
    console.log(`${EMOJI.GENERAL.earth} Testing international timezone handling:`);
    console.log();
    
    const results = [];
    
    for (const location of internationalLocations) {
        const result = await ERROR_HANDLER.wrap(async () => {
            console.log(`${EMOJI.GENERAL.location} ${location.name}:`);
            
            const report = getPanchangaReport(
                date,
                location.latitude,
                location.longitude,
                location.timezone,
                location.name
            );
            
            // Show only the header part of the report
            const lines = report.split('\n');
            const headerLines = lines.slice(0, 8); // First 8 lines typically contain location info
            
            headerLines.forEach(line => {
                if (line.trim()) {
                    console.log(`   ${line}`);
                }
            });
            console.log();
            
            return {
                location: location.name,
                timezone: location.timezone,
                hasLocationName: report.includes(location.name),
                hasTimezone: report.includes(location.timezone)
            };
            
        }, `processing international location ${location.name}`);
        
        if (result) {
            results.push(result);
        }
    }
    
    // Validation summary
    console.log(FORMAT.subsection('International Support Validation'));
    results.forEach(result => {
        const locationStatus = result.hasLocationName ? '✅' : '❌';
        const timezoneStatus = result.hasTimezone ? '✅' : '❌';
        
        console.log(`${result.location}:`);
        console.log(`   Location name in report: ${locationStatus}`);
        console.log(`   Timezone handled: ${timezoneStatus}`);
    });
    
    console.log();
    return results;
}

/**
 * Validate location data and coordinate ranges
 */
async function validateLocationData() {
    console.log(FORMAT.section('LOCATION DATA VALIDATION'));
    console.log();
    
    const allLocations = Object.values(CONFIG.LOCATIONS);
    
    console.log(`${EMOJI.GENERAL.info} Validating ${allLocations.length} predefined locations:`);
    console.log();
    
    let validCount = 0;
    let totalIssues = 0;
    
    allLocations.forEach(location => {
        const issues = validateLocationObject(location);
        
        if (issues.length === 0) {
            validCount++;
            console.log(`${EMOJI.GENERAL.success} ${location.name}: Valid`);
        } else {
            totalIssues += issues.length;
            console.log(`${EMOJI.GENERAL.warning} ${location.name}: ${issues.join(', ')}`);
        }
    });
    
    console.log();
    
    if (totalIssues === 0) {
        ERROR_HANDLER.success(`All ${allLocations.length} locations passed validation!`);
    } else {
        console.log(`${EMOJI.GENERAL.info} Validation Summary:`);
        console.log(`   Valid locations: ${validCount}`);
        console.log(`   Locations with issues: ${allLocations.length - validCount}`);
        console.log(`   Total issues found: ${totalIssues}`);
    }
    
    console.log();
    
    // Test edge cases
    console.log(FORMAT.subsection('Edge Case Testing'));
    
    const edgeCases = [
        {
            name: 'North Pole',
            latitude: 90.0,
            longitude: 0.0,
            timezone: 'UTC'
        },
        {
            name: 'South Pole',
            latitude: -90.0,
            longitude: 0.0,
            timezone: 'UTC'
        },
        {
            name: 'International Date Line',
            latitude: 0.0,
            longitude: 180.0,
            timezone: 'Pacific/Kiritimati'
        }
    ];
    
    for (const edgeCase of edgeCases) {
        const result = await ERROR_HANDLER.wrap(async () => {
            const testDate = new Date();
            const report = getPanchangaReport(
                testDate,
                edgeCase.latitude,
                edgeCase.longitude,
                edgeCase.timezone,
                edgeCase.name
            );
            
            return report !== null && report.includes(edgeCase.name);
        }, `testing edge case ${edgeCase.name}`);
        
        if (result) {
            console.log(`${EMOJI.GENERAL.success} ${edgeCase.name}: Handled correctly`);
        } else {
            console.log(`${EMOJI.GENERAL.warning} ${edgeCase.name}: May have issues`);
        }
    }
    
    console.log();
}

/**
 * Demonstrate custom location formatting
 */
async function demonstrateCustomFormatting(date) {
    console.log(FORMAT.section('CUSTOM LOCATION FORMATTING'));
    console.log();
    
    const baseLocation = CONFIG.LOCATIONS.NEW_DELHI;
    
    console.log(`${EMOJI.GENERAL.info} Testing different location name formats:`);
    console.log();
    
    const nameVariations = [
        'New Delhi',
        'New Delhi, India',
        'New Delhi, National Capital Territory, India',
        'नई दिल्ली (New Delhi)',
        'New Delhi (28.61°N, 77.21°E)',
        'Indian Capital - New Delhi'
    ];
    
    for (const locationName of nameVariations) {
        const result = await ERROR_HANDLER.wrap(async () => {
            const report = getPanchangaReport(
                date,
                baseLocation.latitude,
                baseLocation.longitude,
                baseLocation.timezone,
                locationName
            );
            
            console.log(`${EMOJI.GENERAL.location} Location Name: "${locationName}"`);
            
            // Extract and show only the location line from the report
            const lines = report.split('\n');
            const locationLine = lines.find(line => line.includes('Location:'));
            
            if (locationLine) {
                console.log(`   Report shows: ${locationLine.trim()}`);
            }
            
            console.log(`   Name appears in report: ${report.includes(locationName) ? 'Yes' : 'No'}`);
            console.log();
            
            return { name: locationName, success: true };
            
        }, `testing name variation "${locationName}"`);
        
        if (!result) {
            console.log(`${EMOJI.GENERAL.warning} Failed to process: "${locationName}"`);
            console.log();
        }
    }
    
    // Test special characters and encoding
    console.log(FORMAT.subsection('Special Character Handling'));
    
    const specialNames = [
        'São Paulo, Brazil',
        'München (Munich), Germany',
        'القاهرة (Cairo), Egypt',
        'москва (Moscow), Russia',
        '東京 (Tokyo), Japan'
    ];
    
    for (const specialName of specialNames) {
        const result = await ERROR_HANDLER.wrap(async () => {
            const report = getPanchangaReport(
                date,
                baseLocation.latitude,
                baseLocation.longitude,
                baseLocation.timezone,
                specialName
            );
            
            const nameInReport = report.includes(specialName);
            console.log(`${nameInReport ? '✅' : '⚠️'} "${specialName}": ${nameInReport ? 'Preserved correctly' : 'May have encoding issues'}`);
            
            return nameInReport;
        }, `testing special characters in "${specialName}"`);
    }
    
    console.log();
}

/**
 * Helper function to validate location object structure
 */
function validateLocationObject(location) {
    const issues = [];
    
    if (!location.name || typeof location.name !== 'string') {
        issues.push('Missing or invalid name');
    }
    
    if (typeof location.latitude !== 'number' || location.latitude < -90 || location.latitude > 90) {
        issues.push(`Invalid latitude: ${location.latitude}`);
    }
    
    if (typeof location.longitude !== 'number' || location.longitude < -180 || location.longitude > 180) {
        issues.push(`Invalid longitude: ${location.longitude}`);
    }
    
    if (!location.timezone || typeof location.timezone !== 'string') {
        issues.push('Missing or invalid timezone');
    }
    
    // Check if timezone format looks reasonable
    if (location.timezone && !location.timezone.includes('/') && location.timezone !== 'UTC') {
        issues.push(`Potentially invalid timezone format: ${location.timezone}`);
    }
    
    return issues;
}

/**
 * Helper function to extract time from report text
 */
function extractTime(reportText, label) {
    const lines = reportText.split('\n');
    const timeLine = lines.find(line => line.includes(label + ':'));
    
    if (timeLine) {
        const match = timeLine.match(/\d{1,2}:\d{2}:\d{2}\s*[AP]M/);
        return match ? match[0] : null;
    }
    
    return null;
}

// Execute if run directly
if (require.main === module) {
    demonstrateLocationNames().catch(error => {
        console.error(`${EMOJI.GENERAL.error} Fatal error:`, error);
        process.exit(1);
    });
}

// Export for use as module
module.exports = {
    demonstrateLocationNames,
    demonstrateBasicLocationNames,
    compareMultipleLocations,
    demonstrateInternationalLocations,
    validateLocationData,
    demonstrateCustomFormatting
};
