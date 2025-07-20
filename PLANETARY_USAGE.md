# Using getCurrentPlanets Function

The `getCurrentPlanets` function provides comprehensive planetary position information with Nakshatra and Rashi details for Vedic astrology applications.

## Usage

```javascript
const { getCurrentPlanets } = require('@bidyashish/panchang');

// Basic usage - current date and Lahiri ayanamsa
const planets = getCurrentPlanets();

// Specific date
const planets = getCurrentPlanets(new Date('2024-01-15T12:00:00Z'));

// Different ayanamsa system
const planets = getCurrentPlanets(new Date(), 3); // Raman ayanamsa
```

## Return Value

Returns an array of `PlanetaryPosition` objects, each containing:

```typescript
interface PlanetaryPosition {
    planet: string;        // 'Sun', 'Moon', 'Mercury', etc.
    longitude: number;     // Sidereal longitude (0-360°)
    latitude: number;      // Celestial latitude
    rashi: RashiInfo;      // Zodiac sign information
    nakshatra: NakshatraInfo; // Lunar mansion information
}

interface RashiInfo {
    rashi: number;         // Rashi number (1-12)
    name: string;          // 'Mesha', 'Vrishabha', etc.
    element: string;       // 'Fire', 'Earth', 'Air', 'Water'
    ruler: string;         // Ruling planet
    degree: number;        // Position within rashi (0-30°)
}

interface NakshatraInfo {
    nakshatra: number;     // Nakshatra number (1-27)
    name: string;          // 'Ashwini', 'Bharani', etc.
    pada: number;          // Pada number (1-4)
    ruler: string;         // Ruling planet
    deity: string;         // Associated deity
    symbol: string;        // Traditional symbol
    degree: number;        // Position within nakshatra
}
```

## Example Output

```javascript
[
    {
        planet: "Sun",
        longitude: 93.36,
        latitude: 0.0001,
        rashi: {
            rashi: 4,
            name: "Karka",
            element: "Water",
            ruler: "Moon",
            degree: 3.36
        },
        nakshatra: {
            nakshatra: 8,
            name: "Pushya",
            pada: 1,
            ruler: "Saturn",
            deity: "Brihaspati",
            symbol: "Cow's udder",
            degree: 0.03
        }
    },
    // ... more planets
]
```

## Supported Planets

- Sun (☉)
- Moon (☽)
- Mercury (☿)
- Venus (♀)
- Mars (♂)
- Jupiter (♃)
- Saturn (♄)

## Ayanamsa Systems

The function supports 40+ ayanamsa systems. Common ones:

1. **Lahiri (1)** - Official Indian Government standard
2. **Raman (3)** - Popular in South India
3. **KP (5)** - Krishnamurti Paddhati
4. **Yukteshwar (7)** - Based on Sri Yukteshwar's calculations
5. **And many more...**

Use `getSpecificAyanamsa()` to see all available systems.

## Features

- **High Precision**: Uses Swiss Ephemeris for astronomical accuracy
- **Vedic Compatibility**: All calculations in sidereal zodiac
- **Complete Information**: Includes traditional astrological details
- **Type Safety**: Full TypeScript support with proper interfaces
- **Error Handling**: Graceful fallbacks for edge cases

## Error Handling

The function includes built-in error handling and will fall back to basic calculations if Swiss Ephemeris data is unavailable:

```javascript
try {
    const planets = getCurrentPlanets();
    console.log(`Retrieved ${planets.length} planetary positions`);
} catch (error) {
    console.error('Error:', error.message);
}
```

## Integration with Other Functions

Combine with other package functions for comprehensive analysis:

```javascript
const { getCurrentPlanets, getSpecificAyanamsa, getPanchangaReport } = require('@bidyashish/panchang');

const date = new Date();
const ayanamsa = getSpecificAyanamsa(1, date);
const planets = getCurrentPlanets(date, 1);
const panchanga = getPanchangaReport(date, 28.6139, 77.2090, 'Asia/Kolkata');

console.log(`Using ${ayanamsa.name} ayanamsa (${ayanamsa.degree.toFixed(4)}°)`);
console.log(`Found ${planets.length} planetary positions`);
```

This function is perfect for creating natal charts, transit analysis, muhurta calculations, and other Vedic astrology applications.
