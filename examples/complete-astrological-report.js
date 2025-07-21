#!/usr/bin/env node

/**
 * Complete Astrological Report Example
 * 
 * This example demonstrates how to generate comprehensive astrological reports including:
 * - Panchanga calculations
 * - Planetary positions with Nakshatra and Rashi
 * - Ayanamsa information
 * - Astrological insights and analysis
 * 
 * @author Astronomical Calculator Team
 * @version 2.0.0
 */

const { 
    getPanchanga, 
    getPanchangaReport, 
    getCurrentPlanets, 
    getAyanamsa, 
    getSpecificAyanamsa,
    AstronomicalCalculator 
} = require('../dist/index.js');

/**
 * Main execution function
 */
async function generateCompleteReport() {
    console.log('🌟 COMPLETE ASTROLOGICAL REPORT');
    console.log('='.repeat(60));
    console.log();
    
    const currentDate = new Date();
    const latitude = 12.972; // Bangalore, India
    const longitude = 77.594;
    const timezone = 'Asia/Kolkata';
    const locationName = 'Bangalore, India';
    
    console.log(`📅 Date: ${currentDate.toDateString()}`);
    console.log(`📍 Location: ${locationName}`);
    console.log(`🌍 Coordinates: ${latitude}°N, ${longitude}°E`);
    console.log(`⏰ Timezone: ${timezone}`);
    console.log();
    
    try {
        // Section 1: Panchanga Report
        await generatePanchangaReport(currentDate, latitude, longitude, timezone, locationName);
        
        // Section 2: Planetary Positions
        await generatePlanetaryReport(currentDate);
        
        // Section 3: Ayanamsa Information
        await generateAyanamsaReport(currentDate);
        
        // Section 4: Astrological Analysis
        await generateAstrologicalAnalysis(currentDate, latitude, longitude, timezone);
        
        // Section 5: Summary and Insights
        await generateSummaryAndInsights(currentDate, latitude, longitude, timezone);
        
        console.log('✅ Complete astrological report generated successfully!');
        
    } catch (error) {
        console.error('❌ Report generation failed:', error.message);
        process.exit(1);
    }
}

/**
 * Generate Panchanga report
 */
async function generatePanchangaReport(date, latitude, longitude, timezone, locationName) {
    console.log('PANCHANGA REPORT');
    console.log('-'.repeat(20));
    console.log();
    
    try {
        // Get detailed Panchanga
        const panchanga = getPanchanga(date, latitude, longitude, timezone);
        
        console.log(`📅 Date: ${panchanga.date.toDateString()}`);
        console.log(`📍 Location: ${locationName}`);
        console.log(`🌍 Coordinates: ${latitude}°N, ${longitude}°E`);
        console.log(`⏰ Timezone: ${timezone}`);
        console.log();
        
        // Vara (Weekday)
        console.log(`📅 VARA (Weekday): ${panchanga.vara.name}`);
        console.log();
        
        // Tithi (Lunar Day)
        console.log(`🌙 TITHI: ${panchanga.tithi.name} (${panchanga.tithi.percentage.toFixed(1)}% complete)`);
        console.log(`📊 PAKSHA: ${panchanga.tithi.paksha} (${panchanga.tithi.paksha === 'Shukla' ? 'Waxing' : 'Waning'})`);
        console.log();
        
        // Nakshatra (Lunar Mansion)
        console.log(`⭐ NAKSHATRA: ${panchanga.nakshatra.name} (${panchanga.nakshatra.number}) - Pada ${panchanga.nakshatra.pada}`);
        console.log();
        
        // Yoga (Astronomical Combination)
        console.log(`🔗 YOGA: ${panchanga.yoga.name} (${panchanga.yoga.number})`);
        console.log();
        
        // Karana (Half of Tithi)
        console.log(`⚡ KARANA: ${panchanga.karana.name} (${panchanga.karana.number})`);
        console.log();
        
        // Moon Phase
        console.log(`🌑 MOON PHASE: ${panchanga.moonPhase}`);
        console.log();
        
        // Sunrise and Sunset
        if (panchanga.sunrise) {
            console.log(`🌅 SUNRISE: ${panchanga.sunrise.toLocaleTimeString()}`);
        }
        if (panchanga.sunset) {
            console.log(`🌇 SUNSET: ${panchanga.sunset.toLocaleTimeString()}`);
        }
        console.log();
        
        // Rahu Kaal
        if (panchanga.rahuKaal?.start && panchanga.rahuKaal?.end) {
            console.log(`⚠️  RAHU KAAL: ${panchanga.rahuKaal.start.toLocaleTimeString()} - ${panchanga.rahuKaal.end.toLocaleTimeString()}`);
            console.log(`   (Inauspicious time period - avoid important activities)`);
        }
        console.log();
        
    } catch (error) {
        console.error('❌ Error generating Panchanga report:', error.message);
    }
}

/**
 * Generate planetary positions report
 */
async function generatePlanetaryReport(date) {
    console.log('PLANETARY POSITIONS');
    console.log('-'.repeat(25));
    console.log();
    
    try {
        const planets = getCurrentPlanets(date, 1); // Using Lahiri ayanamsa
        
        if (!planets || planets.length === 0) {
            console.log('❌ No planetary positions available');
            return;
        }
        
        console.log(`🌍 Planetary positions for ${date.toDateString()}:`);
        console.log();
        
        planets.forEach(planet => {
            const planetEmoji = getPlanetEmoji(planet.planet);
            const elementEmoji = getElementEmoji(planet.rashi.element);
            
            console.log(`${planetEmoji} ${planet.planet.toUpperCase()}:`);
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
        
    } catch (error) {
        console.error('❌ Error generating planetary report:', error.message);
    }
}

/**
 * Generate Ayanamsa report
 */
async function generateAyanamsaReport(date) {
    console.log('AYANAMSA INFORMATION');
    console.log('-'.repeat(25));
    console.log();
    
    try {
        // Get current ayanamsa (Lahiri)
        const currentAyanamsa = getSpecificAyanamsa(1, date);
        
        if (currentAyanamsa) {
            console.log(`🔭 Current Ayanamsa (Lahiri):`);
            console.log(`   Name: ${currentAyanamsa.name}`);
            console.log(`   Degree: ${currentAyanamsa.degree.toFixed(6)}°`);
            console.log(`   Description: ${currentAyanamsa.description}`);
            console.log();
        }
        
        // Get all available ayanamsa systems
        const allAyanamsa = getAyanamsa(date);
        
        if (allAyanamsa && allAyanamsa.length > 0) {
            console.log(`📊 Available Ayanamsa Systems (${allAyanamsa.length}):`);
            console.log();
            
            // Show popular systems
            const popularSystems = ['Lahiri', 'Raman', 'Krishnamurti', 'Yukteshwar'];
            popularSystems.forEach(systemName => {
                const system = allAyanamsa.find(s => s.name === systemName);
                if (system) {
                    console.log(`   ${system.name}: ${system.degree.toFixed(6)}°`);
                }
            });
            console.log();
        }
        
    } catch (error) {
        console.error('❌ Error generating Ayanamsa report:', error.message);
    }
}

/**
 * Generate astrological analysis
 */
async function generateAstrologicalAnalysis(date, latitude, longitude, timezone) {
    console.log('ASTROLOGICAL ANALYSIS');
    console.log('-'.repeat(25));
    console.log();
    
    try {
        const calculator = new AstronomicalCalculator();
        
        // Get Panchanga for analysis
        const panchanga = calculator.calculatePanchanga({
            date,
            location: { latitude, longitude, timezone }
        });
        
        // Get planetary positions
        const planets = getCurrentPlanets(date, 1);
        
        if (planets) {
            // Elemental analysis
            const elementCounts = {};
            planets.forEach(planet => {
                const element = planet.rashi.element;
                elementCounts[element] = (elementCounts[element] || 0) + 1;
            });
            
            console.log('🔥 Elemental Distribution:');
            Object.entries(elementCounts).forEach(([element, count]) => {
                const percentage = ((count / planets.length) * 100).toFixed(1);
                console.log(`   ${getElementEmoji(element)} ${element}: ${count} planets (${percentage}%)`);
            });
            console.log();
            
            // Rashi analysis
            const rashiCounts = {};
            planets.forEach(planet => {
                const rashi = planet.rashi.name;
                rashiCounts[rashi] = (rashiCounts[rashi] || 0) + 1;
            });
            
            console.log('♈ Rashi Distribution:');
            Object.entries(rashiCounts).forEach(([rashi, count]) => {
                console.log(`   ${rashi}: ${count} planet${count > 1 ? 's' : ''}`);
            });
            console.log();
            
            // Nakshatra analysis
            const nakshatraCounts = {};
            planets.forEach(planet => {
                const nakshatra = planet.nakshatra.name;
                nakshatraCounts[nakshatra] = (nakshatraCounts[nakshatra] || 0) + 1;
            });
            
            console.log('⭐ Nakshatra Distribution:');
            Object.entries(nakshatraCounts).forEach(([nakshatra, count]) => {
                console.log(`   ${nakshatra}: ${count} planet${count > 1 ? 's' : ''}`);
            });
            console.log();
        }
        
        // Panchanga insights
        console.log('📋 Panchanga Insights:');
        console.log(`   Tithi: ${panchanga.tithi.name} - ${getTithiInsight(panchanga.tithi.name)}`);
        console.log(`   Nakshatra: ${panchanga.nakshatra.name} - ${getNakshatraInsight(panchanga.nakshatra.name)}`);
        console.log(`   Yoga: ${panchanga.yoga.name} - ${getYogaInsight(panchanga.yoga.name)}`);
        console.log(`   Karana: ${panchanga.karana.name} - ${getKaranaInsight(panchanga.karana.name)}`);
        console.log();
        
        calculator.cleanup();
        
    } catch (error) {
        console.error('❌ Error generating astrological analysis:', error.message);
    }
}

/**
 * Generate summary and insights
 */
async function generateSummaryAndInsights(date, latitude, longitude, timezone) {
    console.log('SUMMARY & INSIGHTS');
    console.log('-'.repeat(20));
    console.log();
    
    try {
        const panchanga = getPanchanga(date, latitude, longitude, timezone);
        const planets = getCurrentPlanets(date, 1);
        
        console.log('🎯 Key Highlights:');
        console.log(`   • Today is ${panchanga.vara.name} - ${getVaraInsight(panchanga.vara.name)}`);
        console.log(`   • Moon is in ${panchanga.nakshatra.name} nakshatra - ${getNakshatraInsight(panchanga.nakshatra.name)}`);
        console.log(`   • Current tithi is ${panchanga.tithi.name} - ${getTithiInsight(panchanga.tithi.name)}`);
        console.log();
        
        if (planets) {
            console.log('🌍 Planetary Highlights:');
            
            // Find exalted planets
            const exaltedPlanets = planets.filter(planet => {
                const ownSigns = {
                    'Sun': 'Simha',
                    'Moon': 'Karka',
                    'Mars': 'Mesha',
                    'Mercury': 'Mithuna',
                    'Jupiter': 'Dhanu',
                    'Venus': 'Tula',
                    'Saturn': 'Makara'
                };
                return ownSigns[planet.planet] === planet.rashi.name;
            });
            
            if (exaltedPlanets.length > 0) {
                console.log(`   • Exalted planets: ${exaltedPlanets.map(p => p.planet).join(', ')}`);
            }
            
            // Find planets in their own signs
            const ownSignPlanets = planets.filter(planet => {
                const ownSigns = {
                    'Sun': ['Simha'],
                    'Moon': ['Karka'],
                    'Mercury': ['Mithuna', 'Kanya'],
                    'Venus': ['Vrishabha', 'Tula'],
                    'Mars': ['Mesha', 'Vrishchika'],
                    'Jupiter': ['Dhanu', 'Meena'],
                    'Saturn': ['Makara', 'Kumbha']
                };
                return ownSigns[planet.planet]?.includes(planet.rashi.name);
            });
            
            if (ownSignPlanets.length > 0) {
                console.log(`   • Planets in own signs: ${ownSignPlanets.map(p => p.planet).join(', ')}`);
            }
        }
        
        console.log();
        console.log('💡 General Recommendations:');
        console.log(`   • ${getGeneralRecommendation(panchanga)}`);
        console.log(`   • Pay attention to Rahu Kaal timings for important activities`);
        console.log(`   • Consider the current tithi for spiritual practices`);
        console.log();
        
    } catch (error) {
        console.error('❌ Error generating summary:', error.message);
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

/**
 * Helper function to get element emoji
 */
function getElementEmoji(element) {
    const emojis = {
        'Fire': '🔥',
        'Earth': '🌍',
        'Air': '💨',
        'Water': '💧'
    };
    return emojis[element] || '⚡';
}

/**
 * Helper function to get Vara insight
 */
function getVaraInsight(vara) {
    const insights = {
        'Sunday': 'Good for spiritual activities and leadership',
        'Monday': 'Favorable for emotional matters and creativity',
        'Tuesday': 'Good for courage, energy, and competitive activities',
        'Wednesday': 'Excellent for communication, learning, and business',
        'Thursday': 'Auspicious for education, teaching, and expansion',
        'Friday': 'Good for love, beauty, and artistic pursuits',
        'Saturday': 'Good for discipline, hard work, and patience'
    };
    return insights[vara] || 'A neutral day for general activities';
}

/**
 * Helper function to get Nakshatra insight
 */
function getNakshatraInsight(nakshatra) {
    const insights = {
        'Ashwini': 'Good for new beginnings and travel',
        'Bharani': 'Favorable for transformation and change',
        'Krittika': 'Good for purification and spiritual practices',
        'Rohini': 'Excellent for growth, nourishment, and creativity',
        'Mrigashira': 'Good for exploration and research',
        'Ardra': 'Favorable for destruction of obstacles',
        'Punarvasu': 'Good for renewal and restoration',
        'Pushya': 'Excellent for nourishment and support',
        'Ashlesha': 'Good for healing and transformation',
        'Magha': 'Favorable for authority and leadership',
        'Purva Phalguni': 'Good for celebration and enjoyment',
        'Uttara Phalguni': 'Excellent for partnership and cooperation',
        'Hasta': 'Good for skill development and craftsmanship',
        'Chitra': 'Favorable for artistic expression and beauty',
        'Swati': 'Good for independence and movement',
        'Vishakha': 'Excellent for achievement and success',
        'Anuradha': 'Good for friendship and networking',
        'Jyeshtha': 'Favorable for leadership and authority',
        'Mula': 'Good for deep transformation and research',
        'Purva Ashadha': 'Excellent for victory and achievement',
        'Uttara Ashadha': 'Good for stability and foundation',
        'Shravana': 'Favorable for learning and listening',
        'Dhanishtha': 'Good for wealth and prosperity',
        'Shatabhisha': 'Excellent for healing and medicine',
        'Purva Bhadrapada': 'Good for spiritual practices',
        'Uttara Bhadrapada': 'Favorable for humanitarian work',
        'Revati': 'Excellent for completion and fulfillment'
    };
    return insights[nakshatra] || 'A balanced nakshatra for general activities';
}

/**
 * Helper function to get Tithi insight
 */
function getTithiInsight(tithi) {
    const insights = {
        'Pratipada': 'Good for new beginnings and initiation',
        'Dwitiya': 'Favorable for partnership and cooperation',
        'Tritiya': 'Good for creativity and artistic pursuits',
        'Chaturthi': 'Excellent for spiritual practices and meditation',
        'Panchami': 'Good for learning and education',
        'Shashthi': 'Favorable for health and healing',
        'Saptami': 'Good for travel and movement',
        'Ashtami': 'Excellent for transformation and change',
        'Navami': 'Good for celebration and enjoyment',
        'Dashami': 'Favorable for victory and success',
        'Ekadashi': 'Excellent for fasting and spiritual practices',
        'Dwadashi': 'Good for devotion and worship',
        'Trayodashi': 'Favorable for courage and strength',
        'Chaturdashi': 'Good for completion and fulfillment',
        'Purnima': 'Excellent for celebration and abundance',
        'Pratipada': 'Good for new beginnings and initiation',
        'Dwitiya': 'Favorable for partnership and cooperation',
        'Tritiya': 'Good for creativity and artistic pursuits',
        'Chaturthi': 'Excellent for spiritual practices and meditation',
        'Panchami': 'Good for learning and education',
        'Shashthi': 'Favorable for health and healing',
        'Saptami': 'Good for travel and movement',
        'Ashtami': 'Excellent for transformation and change',
        'Navami': 'Good for celebration and enjoyment',
        'Dashami': 'Favorable for victory and success',
        'Ekadashi': 'Excellent for fasting and spiritual practices',
        'Dwadashi': 'Good for devotion and worship',
        'Trayodashi': 'Favorable for courage and strength',
        'Chaturdashi': 'Good for completion and fulfillment',
        'Amavasya': 'Excellent for new beginnings and transformation'
    };
    return insights[tithi] || 'A balanced tithi for general activities';
}

/**
 * Helper function to get Yoga insight
 */
function getYogaInsight(yoga) {
    return 'A balanced yoga for general activities and spiritual growth';
}

/**
 * Helper function to get Karana insight
 */
function getKaranaInsight(karana) {
    return 'A balanced karana for general activities and decision making';
}

/**
 * Helper function to get general recommendation
 */
function getGeneralRecommendation(panchanga) {
    const recommendations = [
        'Today is favorable for spiritual practices and meditation',
        'Good day for starting new projects and initiatives',
        'Favorable for learning and educational activities',
        'Excellent day for health and wellness activities',
        'Good for business and financial matters',
        'Favorable for relationships and social activities',
        'Excellent day for creative and artistic pursuits'
    ];
    
    // Simple recommendation based on vara
    const varaIndex = panchanga.vara.number;
    return recommendations[varaIndex] || recommendations[0];
}

// Run the report generation
if (require.main === module) {
    generateCompleteReport();
}
