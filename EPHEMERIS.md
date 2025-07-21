# Ephemeris Data Setup

This document explains how the astronomical calculator handles Swiss Ephemeris data files.

## Overview

The library uses Swiss Ephemeris for high-precision astronomical calculations. The ephemeris data files (`*.se1`) contain precomputed planetary positions and are essential for accurate calculations.

## Automatic Path Resolution

The library automatically resolves the ephemeris data path in the following order:

1. **Project-relative path**: `./ephe/` (relative to project root)
2. **Current working directory**: `./ephe/` (relative to where the program is run)
3. **Distribution path**: `./dist/ephe/` (when using built/compiled version)
4. **System fallback**: `/usr/share/libswe/ephe` (system-wide installation)

## Ephemeris Data Files

The included ephemeris files cover different time ranges:

- `semo_*.se1` - Main planet ephemeris files
- `sepl_*.se1` - Planetary ephemeris files

File naming convention:
- `*_12.se1` - Covers years 1200-2399 CE
- `*_18.se1` - Covers years 1800-2399 CE  
- `*_24.se1` - Covers years 2400-2999 CE

## Custom Ephemeris Path

You can specify a custom ephemeris path when creating an Ephemeris instance:

```typescript
import { Ephemeris } from '@bidyashish/panchang';

// Use custom path
const ephemeris = new Ephemeris('/path/to/your/ephemeris/data');

// Use default auto-detection
const ephemeris = new Ephemeris();
```

## Build Process

During the build process (`npm run build`), the ephemeris data files are automatically copied from the `ephe/` directory to `dist/ephe/` to ensure they're available in the distributed package.

## Troubleshooting

If you encounter ephemeris-related errors:

1. Verify that the `ephe/` directory contains `.se1` files
2. Check that the date range of your calculations falls within the ephemeris coverage
3. For custom deployments, ensure ephemeris files are accessible at runtime

## Development

When developing locally, the ephemeris files are loaded from the project's `ephe/` directory. This ensures consistent behavior between development and production environments.
