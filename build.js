const { build } = require('esbuild');
const fs = require('fs');

async function buildPackage() {
  try {
    // Clean dist directory
    if (fs.existsSync('dist')) {
      fs.rmSync('dist', { recursive: true, force: true });
    }
    fs.mkdirSync('dist', { recursive: true });

    console.log('🏗️  Building @bidyashish/panchang...');

    // Build CommonJS version (main entry point) - single compressed file
    await build({
      entryPoints: ['src/index.ts'],
      bundle: true,
      platform: 'node',
      target: 'node16',
      format: 'cjs',
      outfile: 'dist/index.js',
      minify: true,
      sourcemap: true,
      external: ['swisseph'], // Keep swisseph as external dependency
      treeShaking: true,
      metafile: true,
    });

    // Build ESM version - single compressed file
    await build({
      entryPoints: ['src/index.ts'],
      bundle: true,
      platform: 'node', 
      target: 'node16',
      format: 'esm',
      outfile: 'dist/index.mjs',
      minify: true,
      sourcemap: true,
      external: ['swisseph'],
      treeShaking: true,
    });

    // Create a simple TypeScript declaration file manually
    console.log('📝 Creating TypeScript declarations...');
    
    const declarationContent = `
// Type definitions for @bidyashish/panchang
export interface Location {
    latitude: number;
    longitude: number;
    timezone: string;
    altitude?: number;
}

export interface PanchangaResult {
    tithi: { name: string; number: number };
    nakshatra: { name: string; number: number };
    yoga: { name: string; number: number };
    karana: { name: string; number: number };
    vara: { name: string; number: number };
    sunrise: string;
    sunset: string;
}

export interface PlanetPosition {
    longitude: number;
    latitude: number;
    distance: number;
    longitudeSpeed: number;
}

export declare class AstronomicalCalculator {
    constructor();
    calculatePanchanga(date: Date, latitude: number, longitude: number, timezone: string): Promise<PanchangaResult>;
    calculateSunrise(date: Date, latitude: number, longitude: number, timezone: string): Promise<Date>;
    calculateSunset(date: Date, latitude: number, longitude: number, timezone: string): Promise<Date>;
    calculatePlanetPosition(planet: string, date: Date): Promise<PlanetPosition>;
    calculateMoonPhase(date: Date): Promise<number>;
}

export declare function getPanchanga(
    date: Date, 
    latitude: number, 
    longitude: number, 
    timezone: string
): Promise<PanchangaResult>;

export declare function getPanchangaReport(
    date: Date, 
    latitude: number, 
    longitude: number, 
    timezone: string
): Promise<string>;

export * from './types/astronomical';
export * from './panchanga/index';
export * from './calculations/ephemeris';
export * from './calculations/planetary';
`;

    fs.writeFileSync('dist/index.d.ts', declarationContent.trim());

    // Copy ephemeris data files
    console.log('📂 Copying ephemeris data files...');
    const epheSourceDir = 'ephe';
    const epheDestDir = 'dist/ephe';
    
    if (fs.existsSync(epheSourceDir)) {
        fs.mkdirSync(epheDestDir, { recursive: true });
        const epheFiles = fs.readdirSync(epheSourceDir);
        epheFiles.forEach(file => {
            if (file.endsWith('.se1')) {
                fs.copyFileSync(`${epheSourceDir}/${file}`, `${epheDestDir}/${file}`);
                console.log(`  📄 Copied ${file}`);
            }
        });
    } else {
        console.warn('⚠️  Ephemeris data directory not found, Swiss Ephemeris will use built-in data');
    }

    // Create CLI script
    console.log('🔧 Creating CLI script...');
    const cliContent = `#!/usr/bin/env node
const { getPanchanga, getPanchangaReport } = require('./index.js');

function showHelp() {
  console.log(\`
🔮 Panchang Calculator CLI

Usage: npx @bidyashish/panchang [options]
  
Options:
  --lat <latitude>     Latitude in degrees (required)
  --lng <longitude>    Longitude in degrees (required) 
  --tz <timezone>      Timezone (e.g., Asia/Kolkata) (required)
  --date <date>        Date in YYYY-MM-DD format (optional, defaults to today)
  --format <format>    Output format: json|report (default: report)
  --help              Show this help message

Examples:
  npx @bidyashish/panchang --lat 28.6139 --lng 77.2090 --tz Asia/Kolkata
  npx @bidyashish/panchang --lat 49.8880 --lng -119.4960 --tz America/Vancouver --date 2025-07-19
\`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.length === 0) { showHelp(); return; }
  
  const lat = parseFloat(args[args.indexOf('--lat') + 1]);
  const lng = parseFloat(args[args.indexOf('--lng') + 1]);
  const tz = args[args.indexOf('--tz') + 1];
  const dateStr = args.includes('--date') ? args[args.indexOf('--date') + 1] : null;
  const format = args.includes('--format') ? args[args.indexOf('--format') + 1] : 'report';
  
  if (isNaN(lat) || isNaN(lng) || !tz) {
    console.error('❌ Error: --lat, --lng, and --tz are required');
    showHelp(); process.exit(1);
  }
  
  try {
    const date = dateStr ? new Date(dateStr) : new Date();
    if (format === 'json') {
      const panchanga = await getPanchanga(date, lat, lng, tz);
      console.log(JSON.stringify(panchanga, null, 2));
    } else {
      const report = await getPanchangaReport(date, lat, lng, tz);
      console.log(report);
    }
  } catch (error) {
    console.error('❌ Error calculating Panchanga:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);`;

    fs.writeFileSync('dist/cli.js', cliContent);
    fs.chmodSync('dist/cli.js', '755');

    // Get file sizes for reporting
    const cjsSize = Math.round(fs.statSync('dist/index.js').size / 1024);
    const esmSize = Math.round(fs.statSync('dist/index.mjs').size / 1024);

    console.log('✅ Build completed successfully!');
    console.log('📦 Generated files:');
    console.log(`  - dist/index.js (${cjsSize}KB, CommonJS, minified)`);
    console.log(`  - dist/index.mjs (${esmSize}KB, ESM, minified)`); 
    console.log('  - dist/index.d.ts (TypeScript declarations)');
    console.log('  - Source maps included');
    console.log('🎯 Single file bundle with tree-shaking applied');

  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildPackage();
