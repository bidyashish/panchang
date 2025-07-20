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

### Publishing
- `npm run prepublishOnly` - Full build, clean, and test before publishing

## Architecture

### Core Components

1. **Main Entry Point** (`src/index.ts`)
   - Exports `AstronomicalCalculator` class and convenience functions
   - Provides `getPanchanga()` and `getPanchangaReport()` for quick use
   - Handles resource cleanup automatically

2. **Panchanga Calculations** (`src/panchanga/index.ts`)
   - Core Hindu calendar calculations (Tithi, Nakshatra, Yoga, Karana, Vara)
   - Sunrise-based calculations following traditional methods
   - Rahu Kaal calculations

3. **Ephemeris Calculations** (`src/calculations/ephemeris.ts`)
   - Swiss Ephemeris integration for precise astronomical data
   - Planetary position calculations (tropical and sidereal)
   - Sunrise/sunset calculations
   - Nakshatra and ayanamsa calculations

4. **Planetary Module** (`src/calculations/planetary.ts`) 
   - Specific calculations for lunar calendar elements
   - Tithi calculations with percentage completion
   - Yoga and Karana calculations

5. **Type Definitions** (`src/types/astronomical.ts`)
   - Core interfaces for celestial bodies, positions, locations
   - Location, Position, and coordinate system types

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
- Generates a CLI script (`dist/cli.js`) with help system
- Creates TypeScript declarations manually
- Bundles and minifies for production
- Keeps `swisseph` as external dependency

### Dependencies

- **Runtime**: `swisseph` (Swiss Ephemeris for astronomical calculations)
- **Dev**: TypeScript, Vitest for testing, esbuild for bundling, ts-node for development

### Testing

Tests are located in `/tests` directory and use Vitest:
- `ayanamsa.test.ts` - Ayanamsa system tests
- `calculations.test.ts` - Core calculation tests  
- `panchanga.test.ts` - Panchanga calculation tests
- `planetary-positions.test.ts` - Planetary position tests
- `setup.test.ts` - Test environment setup

### CLI Usage

The package includes a CLI tool accessible via `npx @bidyashish/panchang`:
```bash
npx @bidyashish/panchang --lat 28.6139 --lng 77.2090 --tz Asia/Kolkata
npx @bidyashish/panchang --lat 28.6139 --lng 77.2090 --tz Asia/Kolkata --format json
```

### Examples Directory

Contains comprehensive usage examples:
- Basic usage patterns
- Framework integrations (React, Vue, Node.js/Express)
- Ayanamsa calculations
- Planetary position examples
- TypeScript usage examples

## Important Notes

- Always call `cleanup()` on calculator instances to free Swiss Ephemeris resources
- Panchanga calculations are done at sunrise time for traditional accuracy
- The package supports Node.js 18+ (specified in package.json engines)
- Uses Lahiri ayanamsa (ID: 1) as default for sidereal calculations with improved accuracy
- Location coordinates: latitude (+North/-South), longitude (+East/-West)
- All calculations have been corrected for proper Tithi, Nakshatra, Yoga, Karana, and Rahu Kaal computation
- Swiss Ephemeris integration provides high-precision planetary positions and ayanamsa values