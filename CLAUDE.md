# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is `@bidyashish/panchang`, a comprehensive TypeScript/JavaScript library for astronomical calculations with traditional Hindu Panchanga support, powered by Swiss Ephemeris. The package provides both an API library and a CLI tool for calculating Hindu calendar elements like Tithi, Nakshatra, Yoga, Karana, and Vara.

## Development Commands

### Building
- `npm run build` - Build the package using esbuild (creates CommonJS, ESM, and CLI)
- `npm run clean` - Remove the dist directory
- `npm run build:old` - Build using TypeScript compiler (legacy)

### Testing
- `npm test` - Run tests with Vitest
- `npm run test:watch` - Run tests in watch mode
- `npm run test:run` - Run tests once without watch mode

### Development
- `npm run dev` - Run development server with ts-node
- `npm start` - Start the built application
- `npm run example` - Run the usage example
- `npm run verify` - Quick accuracy verification against DrikPanchang.com

### Publishing
- `npm run prepublishOnly` - Full build, clean, and test before publishing

## Architecture

### Core Components

1. **Main Entry Point** (`src/index.ts`)
   - Exports `AstronomicalCalculator` class and convenience functions
   - Provides `getPanchanga()` and `getPanchangaReport()` for quick use
   - Handles resource cleanup automatically

2. **Enhanced Panchanga** (`src/panchanga/enhanced.ts`)
   - Core Hindu calendar calculations (Tithi, Nakshatra, Yoga, Karana, Vara)
   - Sunrise-based calculations following traditional methods
   - Rahu Kaal, Gulikai, and Yamaganda calculations
   - Muhurat (auspicious time) calculations
   - Integrates with Muhurat and Transition calculators

3. **Ephemeris Calculations** (`src/calculations/ephemeris.ts`)
   - Swiss Ephemeris integration for precise astronomical data
   - Planetary position calculations (tropical and sidereal)
   - Sunrise/sunset calculations using Swiss Ephemeris `swe_rise_trans`
   - Nakshatra and ayanamsa calculations
   - Multiple ayanamsa systems support (40 systems including Lahiri, Krishnamurti, etc.)

4. **Planetary Module** (`src/calculations/planetary.ts`)
   - Specific calculations for lunar calendar elements
   - Tithi calculations with percentage completion
   - Yoga and Karana calculations
   - Rashi (zodiac sign) and Nakshatra information
   - Planetary orbital parameters and mean anomaly calculations

5. **Type Definitions** (`src/types/astronomical.ts`)
   - Core interfaces for celestial bodies, positions, locations
   - Location, Position, and coordinate system types
   - PanchangaFullOutput interface with comprehensive output structure

6. **Muhurat Calculator** (`src/panchanga/muhurat.ts`)
   - Calculates auspicious time periods (Abhijita, Amrit Kalam, Vijaya, etc.)
   - Brahma Muhurat, Nishita, Godhuli calculations

7. **Transition Calculator** (`src/panchanga/transitions.ts`)
   - Calculates end times for Tithi, Nakshatra, Yoga, Karana
   - Provides transition tracking for Panchanga elements

### Key Architectural Patterns

- **Resource Management**: All calculator classes have `cleanup()` methods to free Swiss Ephemeris resources
- **Convenience vs Control**: Both quick functions (`getPanchanga()`) and class-based API (`AstronomicalCalculator`) are provided
- **Sidereal vs Tropical**: Supports both coordinate systems with sidereal being default for Panchanga
- **Sunrise-based Calculations**: Traditional Panchanga calculations use sunrise positions for accuracy
- **Corrected Formulas**: All Panchanga elements use proper astronomical calculations:
  - Tithi: Based on elongation (Moon - Sun longitude) with correct paksha determination
  - Yoga: Sum of Sun and Moon longitudes divided into 27 parts
  - Karana: Half-tithi calculations with proper cyclic handling
  - Rahu Kaal: 1/8th day periods with correct weekday mapping
  - Vara: Accurate Julian Day Number calculation for weekdays

### Build System

The project uses a custom esbuild configuration (`build.js`) that:
- Creates both CommonJS (`dist/index.js`) and ESM (`dist/index.mjs`) bundles
- Generates a CLI script (`dist/cli.js`) with comprehensive help system and predefined locations
- Creates TypeScript declarations manually
- Bundles and minifies for production
- Keeps `swisseph` as external dependency
- Copies Swiss Ephemeris data files (.se1) from `ephe/` directory

### Dependencies

- **Runtime**:
  - `swisseph` - Swiss Ephemeris for astronomical calculations
  - `date-fns` and `date-fns-tz` - Date manipulation and timezone handling
- **Dev**: TypeScript, Vitest for testing, esbuild for bundling, ts-node for development

### Testing

Tests are located in `/tests` directory and use Vitest:
- `core-functionality.test.ts` - Core calculation tests

### CLI Usage

The package includes a CLI tool accessible via `npx @bidyashish/panchang`:
```bash
# Use predefined locations
npx @bidyashish/panchang --location delhi --format table

# Custom coordinates with date
npx @bidyashish/panchang --lat 28.6139 --lng 77.2090 --tz Asia/Kolkata --date "2025-07-20T12:00:00Z"

# Multiple output formats
npx @bidyashish/panchang --location kelowna --format json
npx @bidyashish/panchang --location mumbai --format report --local-time

# Show all ayanamsa systems
npx @bidyashish/panchang --ayanamsa

# Show planetary positions
npx @bidyashish/panchang --location tokyo --planets
```

**Predefined Locations**: delhi, mumbai, kolkata, bangalore, varanasi, kelowna, calgary, vancouver, toronto, tokyo, dubai, bali, london, newyork, sydney

### Examples Directory

Contains comprehensive usage examples:
- Basic usage patterns
- Framework integrations (React, Vue, Node.js/Express)
- Accuracy verification scripts against DrikPanchang.com

## Important Notes

- Always call `cleanup()` on calculator instances to free Swiss Ephemeris resources
- Panchanga calculations are done at sunrise time for traditional accuracy
- The package supports Node.js 18+ (specified in package.json engines)
- Uses Lahiri ayanamsa (ID: 1) as default for sidereal calculations
- Location coordinates: latitude (+North/-South), longitude (+East/-West)
- Swiss Ephemeris integration provides high-precision planetary positions and ayanamsa values
- Date handling is critical: input dates should be preserved exactly to represent the precise calculation moment
- The package includes Swiss Ephemeris data files (.se1) covering different time periods (600-year ranges)

## Data Flow

1. User provides date, location (lat/lng/timezone)
2. `AstronomicalCalculator` creates `EnhancedPanchanga`, `Ephemeris`, and `Planetary` instances
3. Ephemeris calculates sunrise/sunset using Swiss Ephemeris
4. Planetary positions calculated (Sun, Moon) in both tropical and sidereal coordinates
5. Panchanga elements calculated from sidereal positions:
   - Tithi from Moon-Sun elongation
   - Nakshatra from Moon position
   - Yoga from Sun+Moon sum
   - Karana from half-tithi
6. Transition times calculated for each element
7. Muhurat periods and Kalam periods calculated from sunrise/sunset
8. Results formatted with timezone-aware formatters

## Swiss Ephemeris Integration

- Ephemeris files stored in `ephe/` directory with .se1 extension
- Path resolution attempts multiple locations (local ephe/, node_modules/swisseph/ephe, etc.)
- Julian Day calculations use UTC components for consistency
- Always provides fallback calculations if Swiss Ephemeris fails
- Supports 40 different ayanamsa systems
- Planetary constants: Sun=0, Moon=1, Mars=4, Mercury=2, Jupiter=5, Venus=3, Saturn=6
- Rahu (North Node)=11, Ketu calculated as 180° opposite to Rahu

## Accuracy Verification

The project emphasizes accuracy verification against DrikPanchang.com:
- Test case: July 20, 2025, Kelowna, BC, Canada
- **Current Accuracy: 100% (5/5 PERFECT MATCHES)** ✅✅✅
  - ✅ Vara (Weekday): Correct
  - ✅ Tithi: Correct
  - ✅ Nakshatra: Correct
  - ✅ Yoga: Correct
  - ✅ Karana: Correct
- Verification scripts: `examples/library-verification.js`
- Run `npm run example` for comprehensive verification
- Run `npm run verify` for time-span verification (2015-2035)

### Key Fixes Applied (October 2025)

1. **Sunrise-Based Calculations**: Fixed Panchanga to use planetary positions at sunrise instead of input time, following traditional Vedic principles
2. **Sunrise/Sunset Algorithm**: Replaced unreliable Swiss Ephemeris `swe_rise_trans` with NOAA Solar Calculator algorithm for accurate sun times
3. **UTC Date Handling**: Fixed date component extraction to use UTC methods consistently
4. **Invalid Date Handling**: Added robust validation in formatters to handle NaN dates gracefully
5. **Karana Calculation Fix**: Corrected cyclic karana counting formula from `karanaIndex % 7` to `(karanaIndex - 1) % 7` to account for Kimstughna (fixed karana #1) offset

**These fixes improved accuracy from 40% to 100% against DrikPanchang.com reference data.**

## Timezone-Aware Formatting

The library includes comprehensive timezone handling:
- All dates preserved in original timezone context
- Formatters available for converting to local timezone
- `formatInLocalTimezone()`, `formatTimeRangeInLocalTimezone()` utilities
- Separate formatters for sunrise, sunset, and Rahu Kaal times
