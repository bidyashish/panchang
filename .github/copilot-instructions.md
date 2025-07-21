# AI Coding Instructions for Panchang Library

## Project Context
This is `@bidyashish/panchang` - a TypeScript/JavaScript library for astronomical calculations with traditional Hindu Panchanga support, powered by Swiss Ephemeris. The core mission is **accuracy verification against DrikPanchang.com** - every code change must maintain or improve the 80%+ accuracy benchmark.

## Architecture Overview

### Core Components & Data Flow
- **Entry Point** (`src/index.ts`): Exports convenience functions `getPanchanga()`, `getPanchangaReport()` and `AstronomicalCalculator` class
- **Panchanga Engine** (`src/panchanga/index.ts`): Traditional Hindu calendar calculations using sunrise-based methods
- **Ephemeris Layer** (`src/calculations/ephemeris.ts`): Swiss Ephemeris wrapper for precise astronomical positions
- **Planetary Module** (`src/calculations/planetary.ts`): Lunar calendar elements (Tithi, Yoga, Karana calculations)

**Critical Path**: Date → Swiss Ephemeris → Sidereal positions → Panchanga calculations → Formatted output

### Swiss Ephemeris Integration
- **Ephemeris Files**: Uses `node_modules/swisseph/ephe` directory for data files
- **Path Resolution**: Hardcoded to `__dirname + '../../node_modules/swisseph/ephe'`
- **Cleanup Required**: Always call `.cleanup()` on `AstronomicalCalculator` instances to prevent memory leaks
- **Constants**: Use `swisseph.SE_SUN` (0), `swisseph.SE_MOON` (1), etc. for planet IDs

## Development Workflows

### Build System (Custom esbuild)
```bash
npm run build          # Creates CJS/ESM/CLI builds via build.js
npm run test           # Vitest tests against built library
npm run verify         # Quick accuracy check vs DrikPanchang.com
npm run example        # Full library verification
```

### Accuracy Verification Pattern
All examples follow this verification workflow against DrikPanchang.com:
1. Test date: `2025-07-20T12:00:00.000-07:00` (Kelowna, BC)
2. Expected values: `{vara: 'Sunday', tithi: 'Ekadashi', nakshatra: 'Krittika', yoga: 'Ganda', karana: 'Bava'}`
3. Success criteria: ≥80% accuracy (4/5 matches)
4. **Current Status**: 40% accuracy - needs significant improvement

### Testing Strategy
- **Unit Tests**: `tests/core-functionality.test.ts` tests built library (not source)
- **Verification Scripts**: `examples/simple-verify.js` and `examples/library-verification.js` for accuracy validation
- **Real-world Testing**: Examples use actual astronomical calculations, not mocked data

## Project-Specific Conventions

### Date Handling
- **Input Preservation**: Never modify input dates - they represent precise calculation moments
- **Sunrise-based Calculations**: Traditional Panchanga uses sunrise as the day boundary, not midnight
- **Timezone Awareness**: All calculations maintain timezone context throughout the pipeline

### Sidereal vs Tropical
- **Default**: Uses sidereal coordinates with Lahiri ayanamsa for Panchanga accuracy
- **Conversion Pattern**: Tropical positions → subtract ayanamsa → sidereal positions
- **Location**: `ephemeris.ts` handles ayanamsa calculations via Swiss Ephemeris

### Error Handling Pattern
```typescript
// Swiss Ephemeris operations can fail - always provide fallbacks
try {
    const result = swisseph.swe_calc_ut(jd, swisseph.SE_SUN, 0);
    if (result && result.longitude !== undefined) {
        // Use Swiss Ephemeris result
    }
} catch (error) {
    // Use simple fallback calculation
}
```

### Output Structure
- **Consistent Interfaces**: All functions return structured data with `name`, `number`, `endTime` properties
- **Transition Times**: Calculate when current Panchanga elements end (critical for real-world usage)
- **Percentage Completion**: Show how far through current element (Tithi percentage, etc.)

## Critical Issues to Fix

### Sunrise/Sunset Calculation Problems
- Current implementation gives wrong times (sunrise at 1:59 PM, sunset at 2:15 AM next day)
- Need proper Swiss Ephemeris `swe_rise_trans` implementation or accurate traditional algorithm
- DrikPanchang shows: Sunrise 05:12 AM, Sunset 08:55 PM for Kelowna on July 20, 2025

### Nakshatra Mismatch
- Library returns "Rohini" but DrikPanchang shows "Krittika"
- Issue likely in moon position calculation or nakshatra boundaries
- Check sidereal coordinate conversion and ayanamsa accuracy

### Yoga and Karana Discrepancies
- Yoga: Library shows "Vriddhi" vs expected "Ganda"
- Karana: Library shows "Kaulava" vs expected "Bava"
- Verify Sun-Moon longitude difference calculations

## Integration Points

### Swiss Ephemeris Usage
- **Core Function**: `swisseph.swe_calc_ut(jd, planetId, flags)` for planet positions
- **Julian Day**: `swisseph.swe_julday(year, month, day, hour, calendar)` for date conversion
- **Ayanamsa**: `swisseph.swe_get_ayanamsa_ut(jd)` with `swisseph.swe_set_sid_mode(1, 0, 0)` for Lahiri
- **Memory Management**: Must call `swisseph.swe_close()` for cleanup

### Package Distribution
- **Multi-format**: Exports CJS (`dist/index.js`), ESM (`dist/index.mjs`), and TypeScript declarations
- **Tree Shaking**: Build process enables tree shaking for optimal bundle sizes

## Critical Patterns

### Accuracy Verification Priority
Every change should improve accuracy towards 80%+ target:
```bash
npm run verify  # Current: 40% - needs immediate attention
npm run example # Comprehensive verification
```

### Resource Management
```typescript
const calculator = new AstronomicalCalculator();
// ... use calculator
calculator.cleanup(); // Essential for preventing memory leaks
```

### Swiss Ephemeris Error Handling
```typescript
try {
    const result = swisseph.swe_calc_ut(jd, planetId, 0);
    return { longitude: result.longitude, latitude: result.latitude };
} catch (error) {
    return fallbackCalculation(); // Always have fallbacks
}
```
