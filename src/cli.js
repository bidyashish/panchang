/**
 * CLI interface for @bidyashish/panchang - Astronomical Calculator
 * Usage: npx @bidyashish/panchang [options]
 */

const { getPanchanga, getPanchangaReport, getAyanamsa, getCurrentPlanets } = require('./index.js');
const { format } = require('date-fns');
const { toZonedTime, formatInTimeZone } = require('date-fns-tz');

// CLI argument parsing
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        date: null,
        latitude: null,
        longitude: null,
        timezone: 'UTC',
        location: null,
        format: 'json', // json | report | table
        help: false,
        version: false,
        ayanamsa: false,
        planets: false,
        useLocalTimezone: false,
        useNow: false
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        const nextArg = args[i + 1];

        switch (arg) {
            case '--help':
            case '-h':
                options.help = true;
                break;
            case '--version':
            case '-v':
                options.version = true;
                break;
            case '--date':
            case '-d':
                options.date = nextArg;
                i++;
                break;
            case '--latitude':
            case '--lat':
                options.latitude = parseFloat(nextArg);
                i++;
                break;
            case '--longitude':
            case '--lng':
                options.longitude = parseFloat(nextArg);
                i++;
                break;
            case '--timezone':
            case '--tz':
                options.timezone = nextArg;
                i++;
                break;
            case '--location':
            case '-l':
                options.location = nextArg;
                i++;
                break;
            case '--format':
            case '-f':
                options.format = nextArg;
                i++;
                break;
            case '--ayanamsa':
                options.ayanamsa = true;
                break;
            case '--planets':
                options.planets = true;
                break;
            case '--local-time':
                options.useLocalTimezone = true;
                break;
            case '--now':
            case '-n':
                options.useNow = true;
                break;
            default:
                if (arg.startsWith('-')) {
                    console.error(`Unknown option: ${arg}`);
                    process.exit(1);
                }
        }
    }

    return options;
}

// Predefined locations for convenience
const LOCATIONS = {
    'delhi': { latitude: 28.6139, longitude: 77.2090, timezone: 'Asia/Kolkata', name: 'Delhi, India' },
    'mumbai': { latitude: 19.0760, longitude: 72.8777, timezone: 'Asia/Kolkata', name: 'Mumbai, India' },
    'kolkata': { latitude: 22.5726, longitude: 88.3639, timezone: 'Asia/Kolkata', name: 'Kolkata, India' },
    'bangalore': { latitude: 12.9716, longitude: 77.5946, timezone: 'Asia/Kolkata', name: 'Bangalore, India' },
    'varanasi': { latitude: 25.3176, longitude: 82.9739, timezone: 'Asia/Kolkata', name: 'Varanasi, India' },
    'kelowna': { latitude: 49.888, longitude: -119.496, timezone: 'America/Vancouver', name: 'Kelowna, BC, Canada' },
    'calgary': { latitude: 51.0447, longitude: -114.0719, timezone: 'America/Edmonton', name: 'Calgary, AB, Canada' },
    'vancouver': { latitude: 49.2827, longitude: -123.1207, timezone: 'America/Vancouver', name: 'Vancouver, BC, Canada' },
    'toronto': { latitude: 43.6532, longitude: -79.3832, timezone: 'America/Toronto', name: 'Toronto, ON, Canada' },
    'tokyo': { latitude: 35.6762, longitude: 139.6503, timezone: 'Asia/Tokyo', name: 'Tokyo, Japan' },
    'dubai': { latitude: 25.2048, longitude: 55.2708, timezone: 'Asia/Dubai', name: 'Dubai, UAE' },
    'bali': { latitude: -8.3405, longitude: 115.0920, timezone: 'Asia/Makassar', name: 'Bali, Indonesia' },
    'london': { latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London', name: 'London, UK' },
    'newyork': { latitude: 40.7128, longitude: -74.0060, timezone: 'America/New_York', name: 'New York, USA' },
    'sydney': { latitude: -33.8688, longitude: 151.2093, timezone: 'Australia/Sydney', name: 'Sydney, Australia' }
};

// Helper function to format time in local timezone
function formatTimeInTimezone(date, timezone, useLocal = false) {
    if (!date) return 'N/A';
    
    if (useLocal) {
        return `${formatInTimeZone(date, timezone, 'yyyy-MM-dd HH:mm:ss')} (${timezone})`;
    } else {
        return `${date.toISOString()} UTC`;
    }
}

// Show help
function showHelp() {
    console.log(`
📅 @bidyashish/panchang - Astronomical Calculator CLI
====================================================

USAGE:
  npx @bidyashish/panchang [options]

OPTIONS:
  -d, --date <date>        Date for calculation (ISO format, e.g., 2025-07-20T12:00:00-07:00)
                          Defaults to current date/time
  -n, --now               Use current date and time (same as not specifying --date)
  
  --lat, --latitude <lat>  Latitude in degrees (required unless using --location)
  --lng, --longitude <lng> Longitude in degrees (required unless using --location)
  --tz, --timezone <tz>    Timezone (e.g., Asia/Kolkata, America/New_York)
                          Defaults to UTC
  
  -l, --location <name>    Use predefined location (delhi, mumbai, kolkata, 
                          bangalore, varanasi, kelowna, calgary, vancouver, 
                          toronto, tokyo, dubai, bali, london, newyork, sydney)
  
  -f, --format <format>    Output format: json | report | table
                          Defaults to json
  
  --local-time            Display times in local timezone instead of UTC
  --ayanamsa              Show all ayanamsa systems
  --planets               Show planetary positions
  
  -h, --help              Show this help
  -v, --version           Show version

EXAMPLES:
  # Calculate Panchanga for current date/time in Delhi
  npx @bidyashish/panchang --location delhi --now
  
  # Calculate for Kelowna, Canada with current time
  npx @bidyashish/panchang --location kelowna --format table
  
  # Calculate for specific date and location with formatted report
  npx @bidyashish/panchang --date "2025-07-20T12:00:00-07:00" \\
    --lat 49.888 --lng -119.496 --tz "America/Vancouver" \\
    --format report --local-time
  
  # Get table format for Calgary
  npx @bidyashish/panchang --location calgary --format table --now
  
  # Show all ayanamsa systems
  npx @bidyashish/panchang --ayanamsa
  
  # Show planetary positions for Toronto
  npx @bidyashish/panchang --location toronto --planets

PREDEFINED LOCATIONS:
  India: delhi, mumbai, kolkata, bangalore, varanasi
  Canada: kelowna, calgary, vancouver, toronto
  Asia: tokyo, dubai, bali
  Others: london (UK), newyork (USA), sydney (Australia)
`);
}

// Show version
function showVersion() {
    try {
        const packageJson = require('./package.json');
        console.log(`@bidyashish/panchang v${packageJson.version}`);
    } catch (error) {
        console.log('@bidyashish/panchang CLI');
    }
}

// Format output as table
function formatAsTable(panchanga, useLocalTime = false) {
    console.log('');
    console.log('📅 PANCHANGA CALCULATION RESULTS');
    console.log('=' .repeat(50));
    console.log('');
    
    // Basic info
    console.log('📍 LOCATION & DATE:');
    console.log(`   Date: ${panchanga.date.toDateString()} (${panchanga.date.toISOString()})`);
    console.log(`   Location: ${panchanga.location.latitude}°N, ${panchanga.location.longitude}°E`);
    console.log(`   Timezone: ${panchanga.location.timezone}`);
    if (panchanga.location.name) {
        console.log(`   Name: ${panchanga.location.name}`);
    }
    console.log('');

    // Panchanga elements
    console.log('🔮 PANCHANGA ELEMENTS:');
    console.log(`   Vara (Day):    ${panchanga.vara.name}`);
    console.log(`   Tithi:         ${panchanga.tithi.name} (${panchanga.tithi.percentage.toFixed(1)}% complete)`);
    console.log(`   Paksha:        ${panchanga.tithi.paksha} (${panchanga.tithi.paksha === 'Shukla' ? 'Waxing' : 'Waning'})`);
    console.log(`   Nakshatra:     ${panchanga.nakshatra.name} - Pada ${panchanga.nakshatra.pada}`);
    console.log(`   Yoga:          ${panchanga.yoga.name}`);
    console.log(`   Karana:        ${panchanga.karana.name}`);
    console.log(`   Moon Phase:    ${panchanga.moonPhase}`);
    console.log('');

    // Time information with better formatting
    console.log('🌅 TIME INFORMATION:');
    if (panchanga.sunrise) {
        console.log(`   Sunrise:       ${formatTimeInTimezone(panchanga.sunrise, panchanga.location.timezone, useLocalTime)}`);
    }
    if (panchanga.sunset) {
        console.log(`   Sunset:        ${formatTimeInTimezone(panchanga.sunset, panchanga.location.timezone, useLocalTime)}`);
    }
    console.log('');

    // Calendar info
    console.log('📆 CALENDAR INFORMATION:');
    console.log(`   Lunar Month:   ${panchanga.lunarMonth.amanta} (Amanta)`);
    console.log(`   Sun Sign:      ${panchanga.sunsign}`);
    console.log(`   Moon Sign:     ${panchanga.moonsign}`);
    console.log(`   Ayanamsa:      ${panchanga.ayanamsa.name} (${panchanga.ayanamsa.degree.toFixed(4)}°)`);
    console.log('');
}

// Format ayanamsa table
function formatAyanamsaTable(ayanamsas) {
    console.log('');
    console.log('📐 AYANAMSA SYSTEMS');
    console.log('=' .repeat(60));
    console.log('');
    console.log('ID   Name                     Degree      Description');
    console.log('-'.repeat(80));
    
    ayanamsas.forEach(a => {
        const id = a.id.toString().padEnd(4);
        const name = a.name.padEnd(24);
        const degree = (a.degree.toFixed(4) + '°').padEnd(11);
        const desc = a.description || '';
        console.log(`${id} ${name} ${degree} ${desc}`);
    });
    console.log('');
}

// Format planetary positions table
function formatPlanetsTable(planets) {
    console.log('');
    console.log('🪐 PLANETARY POSITIONS');
    console.log('=' .repeat(70));
    console.log('');
    console.log('Planet    Longitude   Sidereal    Rashi        Nakshatra');
    console.log('-'.repeat(70));
    
    planets.forEach(p => {
        const planet = p.planet.padEnd(9);
        const longitude = (p.longitude.toFixed(2) + '°').padEnd(11);
        const sidereal = (p.siderealLongitude.toFixed(2) + '°').padEnd(11);
        const rashi = p.rashi.name.padEnd(12);
        const nakshatra = p.nakshatra.name;
        console.log(`${planet} ${longitude} ${sidereal} ${rashi} ${nakshatra}`);
    });
    console.log('');
}

// Main CLI function
async function main() {
    const options = parseArgs();

    // Handle special commands
    if (options.help) {
        showHelp();
        return;
    }

    if (options.version) {
        showVersion();
        return;
    }

    // Handle ayanamsa display
    if (options.ayanamsa) {
        try {
            const date = options.date ? new Date(options.date) : new Date();
            const ayanamsas = getAyanamsa(date);
            
            if (options.format === 'json') {
                console.log(JSON.stringify(ayanamsas, null, 2));
            } else {
                formatAyanamsaTable(ayanamsas);
            }
        } catch (error) {
            console.error('❌ Error getting ayanamsa data:', error.message);
            process.exit(1);
        }
        return;
    }

    // Handle planets display
    if (options.planets) {
        try {
            const date = options.date ? new Date(options.date) : new Date();
            const planets = getCurrentPlanets(date, 1); // Lahiri ayanamsa
            
            if (options.format === 'json') {
                console.log(JSON.stringify(planets, null, 2));
            } else {
                formatPlanetsTable(planets);
            }
        } catch (error) {
            console.error('❌ Error getting planetary positions:', error.message);
            process.exit(1);
        }
        return;
    }

    // Determine location
    let latitude = options.latitude;
    let longitude = options.longitude;
    let timezone = options.timezone;
    let locationName = options.location;

    if (options.location) {
        const loc = LOCATIONS[options.location.toLowerCase()];
        if (!loc) {
            console.error(`❌ Unknown location: ${options.location}`);
            console.error('Available locations:', Object.keys(LOCATIONS).join(', '));
            process.exit(1);
        }
        latitude = loc.latitude;
        longitude = loc.longitude;
        timezone = loc.timezone;
        locationName = loc.name;
    }

    // Validate required parameters
    if (latitude === null || longitude === null) {
        console.error('❌ Error: Latitude and longitude are required');
        console.error('Use --lat and --lng options, or --location with a predefined location');
        console.error('Run with --help for more information');
        process.exit(1);
    }

    // Parse date
    let date;
    if (options.useNow || !options.date) {
        // Use current date/time
        date = new Date();
    } else {
        date = new Date(options.date);
        if (isNaN(date.getTime())) {
            console.error(`❌ Invalid date format: ${options.date}`);
            console.error('Use ISO format like: 2025-07-20T12:00:00-07:00');
            process.exit(1);
        }
    }

    try {
        // Calculate Panchanga
        if (options.format === 'report') {
            const report = getPanchangaReport(
                date, 
                latitude, 
                longitude, 
                timezone, 
                locationName,
                options.useLocalTimezone
            );
            console.log(report);
        } else {
            const panchanga = getPanchanga(date, latitude, longitude, timezone);
            
            // Add location name if provided
            if (locationName && !panchanga.location.name) {
                panchanga.location.name = locationName;
            }

            if (options.format === 'table') {
                formatAsTable(panchanga, options.useLocalTimezone);
            } else {
                // JSON format (default)
                console.log(JSON.stringify(panchanga, null, 2));
            }
        }
    } catch (error) {
        console.error('❌ Error calculating Panchanga:', error.message);
        process.exit(1);
    }
}

// Run CLI
if (require.main === module) {
    main().catch(error => {
        console.error('❌ CLI Error:', error.message);
        process.exit(1);
    });
}

module.exports = { main, parseArgs, LOCATIONS };
