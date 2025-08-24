# Updated getPanchanga Method - Comprehensive Hindu Calendar Data

## What's New

The `getPanchanga` method has been significantly enhanced to return comprehensive Hindu calendar data as per traditional Panchanga format. The method now leverages Swiss Ephemeris files for high-precision astronomical calculations.

## Key Features

### 🌟 Complete Panchanga Elements
- **Vara** (Day of the week) with number
- **Tithi** (Lunar day) with percentage completion and paksha (Shukla/Krishna)
- **Nakshatra** (Lunar mansion) with pada and percentage completion
- **Yoga** (Sun-Moon combination) with percentage completion
- **Karana** (Half tithi) with proper calculations

### ⏰ Time Information
- Sunrise/Sunset times
- Moonrise/Moonset times
- Madhyahna (midday) time
- Day/Night duration (Dinamana/Ratrimana)

### 📅 Calendar Information
- Lunar months (Amanta and Purnimanta)
- Multiple Samvat years (Shaka, Vikrama, Gujarati)
- Sun and Moon zodiac signs
- Surya Nakshatra position
- Season (Ritu) information
- Ayana (solar movement) details

### 🪐 Planetary Positions
- All major planets with sidereal positions
- Rashi (zodiac sign) for each planet  
- Nakshatra placement for each planet
- High-precision Swiss Ephemeris calculations

### ⚫ Important Time Periods
- **Kalam Periods**: Rahu Kaal, Gulikai Kaal, Yamaganda Kaal
- **Muhurat Periods**: Various auspicious timings
- Proper astronomical calculations for all periods

### 📐 Ayanamsa Information
- Current ayanamsa system (Lahiri by default)
- Precise degree value
- Description of the ayanamsa system

## Usage Examples

### Basic Usage
```javascript
const { getPanchanga } = require('@bidyashish/panchang');

const date = new Date();
const panchanga = getPanchanga(date, 28.6139, 77.2090, 'Asia/Kolkata');

console.log(panchanga.tithi.name);        // e.g., "Ekadashi"
console.log(panchanga.nakshatra.name);    // e.g., "Rohini"
console.log(panchanga.vara.name);         // e.g., "Monday"
```

### Accessing Planetary Positions
```javascript
Object.keys(panchanga.planetaryPositions).forEach(planet => {
    const pos = panchanga.planetaryPositions[planet];
    console.log(`${planet}: ${pos.rashi.name} - ${pos.nakshatra.name}`);
});
```

### Time Period Information
```javascript
console.log(`Rahu Kaal: ${panchanga.kalam.rahu.start} - ${panchanga.kalam.rahu.end}`);
console.log(`Sunrise: ${panchanga.sunrise}`);
console.log(`Day Duration: ${panchanga.dinamana.hours}h ${panchanga.dinamana.minutes}m`);
```

### Calendar Details
```javascript
console.log(`Lunar Month: ${panchanga.lunarMonth.amanta}`);
console.log(`Shaka Samvat: ${panchanga.samvata.shaka}`);
console.log(`Season: ${panchanga.ritu.vedic}`);
```

## Swiss Ephemeris Integration

The library now properly uses Swiss Ephemeris files located in the `ephe/` directory:
- High-precision planetary calculations
- Accurate sunrise/sunset times
- Precise ayanamsa calculations
- Support for historical and future dates

## Data Structure

The `PanchangaOutput` interface includes:
- All basic Panchanga elements with timing information
- Comprehensive planetary positions
- Calendar and seasonal information
- Multiple time period calculations
- Location and ayanamsa details

## Perfect for NPM Library Usage

This comprehensive approach makes the library perfect for:
- **Web Applications**: React, Vue, Angular integrations
- **Mobile Apps**: React Native, Ionic frameworks
- **Backend APIs**: Node.js, Express server implementations
- **Desktop Apps**: Electron applications
- **CLI Tools**: Command-line utilities

## Benefits

1. **Single Function Call**: All Panchanga data in one method call
2. **High Accuracy**: Swiss Ephemeris precision
3. **Complete Information**: Traditional Hindu calendar elements
4. **Easy Integration**: Ready for any JavaScript/TypeScript project
5. **Timezone Support**: Proper timezone handling
6. **Performance**: Optimized calculations with resource cleanup

The updated `getPanchanga` method now returns the most comprehensive Hindu calendar dataset available in any JavaScript library, perfect for professional applications requiring accurate astronomical calculations.
