# Panchang - Hindu Calendar & Astronomical Calculator

A comprehensive TypeScript/JavaScript library for astronomical calculations with traditional Hindu Panchanga support, powered by Swiss Ephemeris.

[![Node.js Package](https://github.com/bidyashish/panchang/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/bidyashish/panchang/actions/workflows/npm-publish.yml)
[![npm version](https://badge.fury.io/js/@bidyashish%2Fpanchang.svg)](https://badge.fury.io/js/@bidyashish%2Fpanchang)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub](https://img.shields.io/badge/GitHub-bidyashish%2Fpanchang-blue)](https://github.com/bidyashish/panchang)

## Features

- ✨ **Complete Panchanga Calculations**: Tithi, Nakshatra, Yoga, Karana, Vara
- 🌍 **Location-based Calculations**: Accurate sunrise/sunset times
- 🌙 **Lunar Calendar**: Moon phases and lunar mansions
- ⏰ **Rahu Kaal**: Inauspicious time periods
- 🎯 **High Accuracy**: Uses Swiss Ephemeris for precise calculations
- 📦 **Easy to Use**: Simple API for integration into any project
- 🔧 **TypeScript Support**: Full type definitions included

## Installation

```bash
npm install @bidyashish/panchang
```

## Quick Start

### JavaScript (CommonJS)

```javascript
const { getPanchanga, getPanchangaReport } = require('@bidyashish/panchang');

// Calculate Panchanga for a specific date and location
const date = new Date('2024-01-01T12:00:00Z');
const latitude = 12.972;  // Bangalore, India
const longitude = 77.594;
const timezone = 'Asia/Kolkata';

// Get Panchanga data
const panchanga = getPanchanga(date, latitude, longitude, timezone);

console.log(`Tithi: ${panchanga.tithi.name}`);
console.log(`Nakshatra: ${panchanga.nakshatra.name}`);
console.log(`Yoga: ${panchanga.yoga.name}`);
console.log(`Sunrise: ${panchanga.sunrise?.toLocaleTimeString()}`);

// Get formatted report
const report = getPanchangaReport(date, latitude, longitude, timezone);
console.log(report);
```

### TypeScript

```typescript
import { 
    getPanchanga, 
    AstronomicalCalculator, 
    PanchangaInput, 
    PanchangaOutput 
} from '@bidyashish/panchang';

const input: PanchangaInput = {
    date: new Date('2024-01-01T12:00:00Z'),
    location: {
        latitude: 12.972,
        longitude: 77.594,
        timezone: 'Asia/Kolkata'
    }
};

const calculator = new AstronomicalCalculator();
const panchanga: PanchangaOutput = calculator.calculatePanchanga(input);

console.log(`Today's Tithi: ${panchanga.tithi.name}`);
console.log(`Completion: ${panchanga.tithi.percentage.toFixed(1)}%`);

calculator.cleanup();
```

## Framework Integration

### React.js Example

```jsx
import React, { useState, useEffect } from 'react';
import { getPanchanga, getPanchangaReport } from '@bidyashish/panchang';

function PanchangaWidget({ latitude, longitude, timezone }) {
  const [panchanga, setPanchanga] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPanchanga() {
      try {
        setLoading(true);
        const data = await getPanchanga(new Date(), latitude, longitude, timezone);
        setPanchanga(data);
      } catch (error) {
        console.error('Error fetching Panchanga:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPanchanga();
  }, [latitude, longitude, timezone]);

  if (loading) return <div>Loading Panchanga...</div>;
  if (!panchanga) return <div>Error loading Panchanga</div>;

  return (
    <div className="panchanga-widget">
      <h2>Today's Panchanga</h2>
      <p><strong>Tithi:</strong> {panchanga.tithi.name}</p>
      <p><strong>Nakshatra:</strong> {panchanga.nakshatra.name}</p>
      <p><strong>Vara:</strong> {panchanga.vara.name}</p>
      <p><strong>Yoga:</strong> {panchanga.yoga.name}</p>
      <p><strong>Karana:</strong> {panchanga.karana.name}</p>
    </div>
  );
}

export default PanchangaWidget;
```

### Vue.js Example

```vue
<template>
  <div class="panchanga-component">
    <h2>Panchanga Calculator</h2>
    <div v-if="loading">Loading...</div>
    <div v-else-if="panchanga" class="panchanga-data">
      <div class="element">
        <span class="label">Tithi:</span>
        <span class="value">{{ panchanga.tithi.name }}</span>
      </div>
      <div class="element">
        <span class="label">Nakshatra:</span>
        <span class="value">{{ panchanga.nakshatra.name }}</span>
      </div>
      <div class="element">
        <span class="label">Vara:</span>
        <span class="value">{{ panchanga.vara.name }}</span>
      </div>
      <button @click="refreshPanchanga">Refresh</button>
    </div>
  </div>
</template>

<script>
import { getPanchanga } from '@bidyashish/panchang';

export default {
  name: 'PanchangaComponent',
  props: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    timezone: { type: String, required: true }
  },
  data() {
    return {
      panchanga: null,
      loading: false
    };
  },
  async created() {
    await this.fetchPanchanga();
  },
  methods: {
    async fetchPanchanga() {
      this.loading = true;
      try {
        this.panchanga = await getPanchanga(
          new Date(), 
          this.latitude, 
          this.longitude, 
          this.timezone
        );
      } catch (error) {
        console.error('Error:', error);
      } finally {
        this.loading = false;
      }
    },
    async refreshPanchanga() {
      await this.fetchPanchanga();
    }
  }
};
</script>
```

### Node.js/Express API

```javascript
const express = require('express');
const { getPanchanga, getPanchangaReport } = require('@bidyashish/panchang');
const app = express();

app.get('/api/panchanga', async (req, res) => {
  try {
    const { lat, lng, tz, date, format } = req.query;
    
    if (!lat || !lng || !tz) {
      return res.status(400).json({ 
        error: 'Missing required parameters: lat, lng, tz' 
      });
    }

    const targetDate = date ? new Date(date) : new Date();
    
    if (format === 'report') {
      const report = await getPanchangaReport(
        targetDate, 
        parseFloat(lat), 
        parseFloat(lng), 
        tz
      );
      res.type('text/plain').send(report);
    } else {
      const panchanga = await getPanchanga(
        targetDate, 
        parseFloat(lat), 
        parseFloat(lng), 
        tz
      );
      res.json(panchanga);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Panchanga API running on port 3000');
});
```

### CLI Usage

```bash
# Install globally for CLI access
npm install -g @bidyashish/panchang

# Or use with npx (no installation needed)
npx @bidyashish/panchang --lat 28.6139 --lng 77.2090 --tz Asia/Kolkata

# Get JSON output
npx @bidyashish/panchang --lat 28.6139 --lng 77.2090 --tz Asia/Kolkata --format json

# Specific date
npx @bidyashish/panchang --lat 28.6139 --lng 77.2090 --tz Asia/Kolkata --date 2025-07-19
```

## API Reference

### Quick Functions

#### `getPanchanga(date, latitude, longitude, timezone)`

Calculate Panchanga for a specific date and location.

**Parameters:**
- `date` (Date): The date for calculation
- `latitude` (number): Latitude in degrees (-90 to 90)
- `longitude` (number): Longitude in degrees (-180 to 180)
- `timezone` (string): IANA timezone identifier (e.g., 'Asia/Kolkata')

**Returns:** `PanchangaOutput` object

#### `getPanchangaReport(date, latitude, longitude, timezone)`

Generate a formatted text report.

**Returns:** Formatted string report

### AstronomicalCalculator Class

For advanced usage and multiple calculations:

```javascript
const calculator = new AstronomicalCalculator();

// Calculate Panchanga
const panchanga = calculator.calculatePanchanga({
    date: new Date(),
    location: {
        latitude: 28.6139,    // Delhi
        longitude: 77.2090,
        timezone: 'Asia/Kolkata'
    }
});

// Calculate planetary positions  
const positions = calculator.calculatePlanetaryPositions(
    new Date(), 
    ['Sun', 'Moon', 'Mars', 'Jupiter']
);

// Always cleanup when done
calculator.cleanup();
```

## Output Format

The `PanchangaOutput` object contains:

```typescript
{
    date: Date;
    vara: {
        name: string;        // e.g., "Friday"
        number: number;      // 1-7
    };
    tithi: {
        name: string;        // e.g., "Saptami"
        number: number;      // 1-15
        percentage: number;  // 0-100
        paksha: 'Shukla' | 'Krishna';
    };
    nakshatra: {
        name: string;        // e.g., "Revati"
        number: number;      // 1-27
        pada: number;        // 1-4
    };
    yoga: {
        name: string;        // e.g., "Siddha"
        number: number;      // 1-27
    };
    karana: {
        name: string;        // e.g., "Bava"
        number: number;      // 1-60
    };
    moonPhase: string;       // e.g., "Waxing Crescent"
    sunrise: Date | null;
    sunset: Date | null;
    rahuKaal: {
        start: Date | null;
        end: Date | null;
    } | null;
}
```

## Examples & Verification

### Quick Verification

Test the library accuracy against DrikPanchang.com reference data:

```bash
# Quick verification (recommended)
npm run verify

# Comprehensive testing of all functions  
npm run example
```

The verification scripts test with **July 20, 2025** in **Kelowna, BC, Canada** and achieve **80% perfect accuracy** against DrikPanchang.com (4/5 Panchanga elements match exactly).

### Multiple Locations

```javascript
const { AstronomicalCalculator } = require('@bidyashish/panchang');

const calculator = new AstronomicalCalculator();
const date = new Date();

const locations = [
    { name: 'Delhi', lat: 28.6139, lon: 77.2090, tz: 'Asia/Kolkata' },
    { name: 'Mumbai', lat: 19.0760, lon: 72.8777, tz: 'Asia/Kolkata' },
    { name: 'New York', lat: 40.7128, lon: -74.0060, tz: 'America/New_York' }
];

locations.forEach(loc => {
    const panchanga = calculator.calculatePanchanga({
        date,
        location: { latitude: loc.lat, longitude: loc.lon, timezone: loc.tz }
    });
    
    console.log(`${loc.name}: ${panchanga.tithi.name}, ${panchanga.nakshatra.name}`);
});

calculator.cleanup();
```

### Date Range Analysis

```javascript
function getPanchangaForWeek(startDate, location) {
    const calculator = new AstronomicalCalculator();
    const results = [];
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        const panchanga = calculator.calculatePanchanga({ date, location });
        results.push({
            date: date.toDateString(),
            tithi: panchanga.tithi.name,
            nakshatra: panchanga.nakshatra.name,
            tithiEndTime: panchanga.tithi.endTime // Transition times available
        });
    }
    
    calculator.cleanup();
    return results;
}
```

### Detailed Data Inspection

```javascript
const { getPanchanga } = require('@bidyashish/panchang');

const date = new Date('2025-07-20T12:00:00.000-07:00');
const panchanga = getPanchanga(date, 49.888, -119.496, 'America/Vancouver');

// Access detailed data for each element
console.log('Tithi Details:', {
    name: panchanga.tithi.name,
    number: panchanga.tithi.number,
    percentage: panchanga.tithi.percentage,
    endTime: panchanga.tithi.endTime
});

console.log('Nakshatra Details:', {
    name: panchanga.nakshatra.name,
    number: panchanga.nakshatra.number,
    pada: panchanga.nakshatra.pada,
    endTime: panchanga.nakshatra.endTime
});
```

## Popular Locations

Here are timezone identifiers for common locations:

- **India**: `Asia/Kolkata`
- **USA East**: `America/New_York`
- **USA West**: `America/Los_Angeles`
- **UK**: `Europe/London`
- **Australia**: `Australia/Sydney`
- **Japan**: `Asia/Tokyo`
- **Germany**: `Europe/Berlin`

## Coordinate Examples

| City | Latitude | Longitude |
|------|----------|-----------|
| Delhi, India | 28.6139 | 77.2090 |
| Mumbai, India | 19.0760 | 72.8777 |
| New York, USA | 40.7128 | -74.0060 |
| London, UK | 51.5074 | -0.1278 |
| Tokyo, Japan | 35.6762 | 139.6503 |

## Understanding Panchanga

**Panchanga** (Sanskrit: पञ्चाङ्ग) means "five limbs" and refers to the five key elements:

1. **Vara** (वार): Day of the week
2. **Tithi** (तिथि): Lunar day (1-15, in Shukla/Krishna paksha)
3. **Nakshatra** (नक्षत्र): Lunar mansion (1-27)
4. **Yoga** (योग): Astronomical combination of Sun and Moon (1-27)
5. **Karana** (करण): Half of a tithi (1-60)

**Additional Elements:**
- **Paksha**: Lunar fortnight (Shukla = waxing, Krishna = waning)
- **Rahu Kaal**: Inauspicious time period each day

## Requirements

- Node.js 16.0.0 or higher
- Swiss Ephemeris data files (automatically handled)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- Swiss Ephemeris library for accurate astronomical calculations
- Traditional Vedic astronomical principles
- Based on the drik-panchanga Python implementation by Satish BD
