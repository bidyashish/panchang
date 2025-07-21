# Examples Directory

This directory contains focused examples and verification scripts for the Astronomical Calculator library.

## Files Overview

### � **Verification Scripts**
- **`simple-verify.js`** - Quick Panchanga verification against DrikPanchang.com with detailed library data output
- **`library-verification.js`** - Comprehensive test of all library functions with accuracy verification

## Current Examples

### 📊 **simple-verify.js** 
**Purpose:** Simple verification of core Panchanga calculation against DrikPanchang.com

**Features:**
- Tests `getPanchanga()` function with reference date (July 20, 2025)
- Shows detailed library data for each Panchanga element
- Verifies against DrikPanchang.com reference data
- **Accuracy:** 80% perfect match (4/5 elements)
- Displays complete JSON objects for debugging

**Usage:**
```bash
npm run verify
# or
node examples/simple-verify.js
```

### 🧪 **library-verification.js**
**Purpose:** Comprehensive testing of all library functions

**Features:**
- Tests all core functions: `getPanchanga()`, `getPanchangaReport()`, `getCurrentPlanets()`, `getAyanamsa()`, `getSpecificAyanamsa()`, `AstronomicalCalculator` class
- DrikPanchang.com accuracy verification
- Transition time calculations
- Planetary positions with Rashi/Nakshatra mapping
- Swiss Ephemeris precision validation

**Usage:**
```bash
npm run example
# or  
node examples/library-verification.js
```

## Running Examples

### Prerequisites
```bash
# Build the project first
npm run build
```

### Quick Commands
```bash
# Simple verification (recommended)
npm run verify

# Comprehensive verification
npm run example
```

## Verification Results

Both scripts test against the reference date **July 20, 2025, 12:00 PM PDT** in **Kelowna, BC, Canada**:

### 🎯 **Accuracy vs DrikPanchang.com**
- ✅ **Vara:** Sunday (Perfect match)
- ✅ **Tithi:** Ekadashi (Perfect match) 
- ✅ **Nakshatra:** Krittika (Perfect match)
- ✅ **Yoga:** Ganda (Perfect match)
- 🔸 **Karana:** Balava vs Bava (Close match - 1 karana difference)
- **Overall:** 80% perfect accuracy

### 📊 **Detailed Library Data Available**
- Complete JSON objects for each element
- Numerical IDs and percentages
- Precise transition times (when elements change)
- Additional calculations (sunrise, sunset, moon phase, Rahu Kaal)

## Core Functions Tested

Both examples demonstrate these library functions:
- `getPanchanga()` - Core Panchanga calculation with transition times
- `getPanchangaReport()` - Formatted text reports  
- `getCurrentPlanets()` - Planetary positions with Vedic astrology data
- `getAyanamsa()` / `getSpecificAyanamsa()` - Ayanamsa systems (40+ available)
- `AstronomicalCalculator` class - Complete object-oriented API

## Technical Details

**Data Sources:**
- Swiss Ephemeris v0.5.17 for high-precision calculations
- Lahiri Ayanamsa (24.2140°) as primary reference
- Traditional Vedic astrology interpretations

**Key Features Verified:**
- Timezone-aware calculations (PDT/PST support)
- Transition time calculations for all elements
- Multiple ayanamsa systems support  
- Error handling and resource cleanup
- Class-based and function-based API consistency
