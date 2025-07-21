const swisseph = require('swisseph');

// Set ephemeris path
swisseph.swe_set_ephe_path(__dirname + '/ephe');

// Test date: July 20, 2025, 12:00 PM PDT
const testDate = new Date('2025-07-20T12:00:00.000-07:00');
console.log('Test date:', testDate.toISOString());

// Convert to Julian Day
const year = testDate.getUTCFullYear();
const month = testDate.getUTCMonth() + 1;
const day = testDate.getUTCDate();
const hour = testDate.getUTCHours() + testDate.getUTCMinutes()/60;

const jd = swisseph.swe_julday(year, month, day, hour, swisseph.SE_GREG_CAL);
console.log('Julian Day:', jd);

// Calculate positions
const sunPos = swisseph.swe_calc_ut(jd, swisseph.SE_SUN, swisseph.SEFLG_SWIEPH);
const moonPos = swisseph.swe_calc_ut(jd, swisseph.SE_MOON, swisseph.SEFLG_SWIEPH);

console.log('\n--- Tropical Positions ---');
console.log('Sun longitude:', sunPos.longitude);
console.log('Moon longitude:', moonPos.longitude);

// Get Lahiri ayanamsa
swisseph.swe_set_sid_mode(swisseph.SE_SIDM_LAHIRI, 0, 0);
const ayanamsa = swisseph.swe_get_ayanamsa_ut(jd);
console.log('Lahiri Ayanamsa:', ayanamsa);

// Calculate sidereal positions
const sunSidereal = (sunPos.longitude - ayanamsa + 360) % 360;
const moonSidereal = (moonPos.longitude - ayanamsa + 360) % 360;

console.log('\n--- Sidereal Positions ---');
console.log('Sun sidereal longitude:', sunSidereal);
console.log('Moon sidereal longitude:', moonSidereal);

// Calculate Yoga
const yogaSum = (sunSidereal + moonSidereal) % 360;
const yogaIndex = Math.floor(yogaSum / (360/27));
const yogaNames = [
    'Vishkumbha', 'Preeti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda',
    'Sukarman', 'Dhriti', 'Shoola', 'Ganda', 'Vriddhi', 'Dhruva',
    'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyan',
    'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla',
    'Brahma', 'Indra', 'Vaidhriti'
];

console.log('\n--- Yoga Calculation ---');
console.log('Yoga sum (Sun + Moon):', yogaSum);
console.log('Yoga arc per yoga (360/27):', 360/27);
console.log('Yoga index (0-based):', yogaIndex);
console.log('Yoga name:', yogaNames[yogaIndex], '(' + (yogaIndex + 1) + ')');

// Calculate Karana
const elongation = (moonSidereal - sunSidereal + 360) % 360;
const karanaIndex = Math.floor(elongation / 6);
const karanaNames = [
    'Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti',
    'Shakuni', 'Chatushpada', 'Naga', 'Kimstughna'
];

console.log('\n--- Karana Calculation ---');
console.log('Elongation (Moon - Sun):', elongation);
console.log('Karana arc per karana (6°):', 6);
console.log('Raw karana index:', karanaIndex);

let finalKaranaIndex;
if (karanaIndex < 57) {
    finalKaranaIndex = karanaIndex % 7;
} else {
    finalKaranaIndex = 7 + Math.min(3, karanaIndex - 57);
}

console.log('Final karana index:', finalKaranaIndex);
console.log('Karana name:', karanaNames[finalKaranaIndex]);

// Calculate Tithi
const tithiIndex = Math.floor(elongation / 12);
const tithiNames = [
    'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi',
    'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi',
    'Trayodashi', 'Chaturdashi', 'Purnima/Amavasya'
];

console.log('\n--- Tithi Calculation ---');
console.log('Tithi index (0-based):', tithiIndex);

let finalTithi, tithiName, isWaxing;
if (tithiIndex < 15) {
    isWaxing = true;
    finalTithi = tithiIndex + 1;
    tithiName = (finalTithi === 15) ? 'Purnima' : tithiNames[tithiIndex];
} else {
    isWaxing = false;
    finalTithi = tithiIndex - 14;
    tithiName = (finalTithi === 15) ? 'Amavasya' : tithiNames[finalTithi - 1];
}

console.log('Final tithi number:', finalTithi);
console.log('Paksha:', isWaxing ? 'Shukla' : 'Krishna');
console.log('Tithi name:', tithiName);

console.log('\n--- Expected vs Calculated ---');
console.log('Expected: Yoga=Ganda, Karana=Bava, Tithi=Ekadashi');
console.log('Calculated: Yoga=' + yogaNames[yogaIndex] + ', Karana=' + karanaNames[finalKaranaIndex] + ', Tithi=' + tithiName);

swisseph.swe_close();
