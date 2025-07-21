# Examples Directory

This directory contains practical examples and tests for the Astronomical Calculator library.

## Files Overview

### 📚 Core Examples
- **`usage-example.js`** - Main usage examples showing how to use the library
- **`exports-test.js`** - Comprehensive test of all exported functions
- **`validation-test.js`** - Validation against reference astronomical data
- **`today-test.ts`** - TypeScript test for today's Panchanga calculations
- **`quick-test.js`** - Quick ephemeris path test and basic Panchanga (no build required)
- **`verify-drikpanchang.js`** - Verification against DrikPanchang.com reference data
- **`kelowna-precise-test.js`** - Precise comparison with DrikPanchang for Kelowna, BC

### 🌟 Feature Demonstrations
- **`ayanamsa-example.js`** - Complete demonstration of ayanamsa systems
- **`location-name-example.js`** - Examples of location name functionality in reports
- **`planetary-positions-example.js`** - Planetary position calculations with Vedic astrology
- **`complete-astrological-report.js`** - Full astrological report generation
- **`enhanced-features-demo.js`** - Showcase of advanced features

### 🛠️ Utilities
- **`common-utils.js`** - Shared utilities, constants, and formatting functions

## Running Examples

### Prerequisites
```bash
# For most examples (requires built project)
npm run build

# For quick test only (no build required)
npm run test:quick
```

### Run Individual Examples
```bash
# Quick test (no build needed)
npm run test:quick

# Verify against DrikPanchang.com (basic, no build needed)
npm run verify:drik

# Basic usage examples
node examples/usage-example.js

# Test all exports
node examples/exports-test.js

# Validation test
node examples/validation-test.js

# Precise DrikPanchang verification (requires build)
npm run build && npm run test:kelowna
```

# Ayanamsa systems demonstration
node examples/ayanamsa-example.js

# Planetary positions
node examples/planetary-positions-example.js

# Complete astrological report
node examples/complete-astrological-report.js
```

### TypeScript Examples
```bash
# Today's Panchanga test (requires ts-node)
npm run dev examples/today-test.ts
```

## Example Categories

### 🔍 **Testing Examples**
- `exports-test.js` - Validates all package exports work correctly
- `validation-test.js` - Validates calculations against known reference data
- `today-test.ts` - Tests current date Panchanga calculation (TypeScript)
- `quick-test.js` - Quick verification without building (Node.js only)
- `verify-drikpanchang.js` - Basic verification against DrikPanchang.com
- `kelowna-precise-test.js` - Precise DrikPanchang comparison for Kelowna, BC

### 📊 **Feature Examples**
- `ayanamsa-example.js` - Shows 40+ ayanamsa systems and comparisons
- `location-name-example.js` - Demonstrates location names in reports
- `enhanced-features-demo.js` - Advanced features and historical comparisons

### 🪐 **Astrological Examples**
- `planetary-positions-example.js` - Planetary positions with Vedic interpretations
- `complete-astrological-report.js` - Full birth chart analysis

### 📝 **Basic Usage**
- `usage-example.js` - Simple API usage patterns

## Common Functions Tested

All examples demonstrate these core functions:
- `getPanchanga()` - Basic Panchanga calculation
- `getPanchangaReport()` - Formatted text reports
- `getCurrentPlanets()` - Planetary positions
- `getAyanamsa()` / `getSpecificAyanamsa()` - Ayanamsa systems
- `AstronomicalCalculator` class - Complete calculator API

## Error Handling

Examples include comprehensive error handling using the shared utilities in `common-utils.js`:
- Graceful fallbacks for missing data
- Validation of inputs and outputs
- Debug information for troubleshooting

## Data Sources

All calculations use:
- Swiss Ephemeris for high precision
- Traditional Vedic astrology interpretations
- Multiple ayanamsa systems for comparison
