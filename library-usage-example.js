/**
 * Example showing how to use @bidyashish/panchang as an npm library
 * with the comprehensive getPanchanga method
 */

// Basic usage example
const { getPanchanga } = require('./dist/index.js');

// Example 1: Quick usage
console.log('📦 USING @bidyashish/panchang AS NPM LIBRARY\n');

const date = new Date(); // Current date
const latitude = 28.6139; // Delhi, India
const longitude = 77.2090;
const timezone = 'Asia/Kolkata';

console.log('🔸 Example 1: Basic Usage');
const panchanga = getPanchanga(date, latitude, longitude, timezone);

console.log({
    vara: panchanga.vara.name,
    tithi: panchanga.tithi.name,
    nakshatra: panchanga.nakshatra.name,
    yoga: panchanga.yoga.name,
    karana: panchanga.karana.name,
    moonPhase: panchanga.moonPhase,
    sunrise: panchanga.sunrise?.toLocaleTimeString(),
    sunset: panchanga.sunset?.toLocaleTimeString(),
    ayanamsa: `${panchanga.ayanamsa.name}: ${panchanga.ayanamsa.degree.toFixed(4)}°`
});

console.log('\n🔸 Example 2: Planetary Positions');
console.log('Planetary Positions (Sidereal):');
Object.keys(panchanga.planetaryPositions).forEach(planet => {
    const pos = panchanga.planetaryPositions[planet];
    console.log(`  ${planet}: ${pos.siderealLongitude.toFixed(2)}° in ${pos.rashi.name} (${pos.nakshatra.name})`);
});

console.log('\n🔸 Example 3: Time Periods');
console.log('Kalam Periods:');
console.log(`  Rahu Kaal: ${panchanga.kalam.rahu.start?.toLocaleTimeString()} - ${panchanga.kalam.rahu.end?.toLocaleTimeString()}`);
console.log(`  Gulikai Kaal: ${panchanga.kalam.gulikai.start?.toLocaleTimeString()} - ${panchanga.kalam.gulikai.end?.toLocaleTimeString()}`);

console.log('\n🔸 Example 4: Calendar Information');
console.log('Calendar Details:');
console.log(`  Lunar Month: ${panchanga.lunarMonth.amanta} (Amanta), ${panchanga.lunarMonth.purnimanta} (Purnimanta)`);
console.log(`  Shaka Samvat: ${panchanga.samvata.shaka}`);
console.log(`  Vikrama Samvat: ${panchanga.samvata.vikrama}`);
console.log(`  Sun Sign: ${panchanga.sunsign}, Moon Sign: ${panchanga.moonsign}`);
console.log(`  Season (Ritu): ${panchanga.ritu.vedic} (Vedic)`);

console.log('\n✅ All data available through a single getPanchanga() call!');
console.log('🌟 Perfect for integration into websites, mobile apps, and APIs');
console.log('📱 Use in React, Vue, Node.js, Express, and more!');
