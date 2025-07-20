/**
 * Common utilities for example scripts
 * Provides shared functions and constants for consistent formatting and error handling
 */

/**
 * Common configuration and constants
 */
export const CONFIG = {
    // Common test locations
    LOCATIONS: {
        NEW_DELHI: {
            name: 'New Delhi, India',
            latitude: 28.6139,
            longitude: 77.2090,
            timezone: 'Asia/Kolkata'
        },
        MUMBAI: {
            name: 'Mumbai, Maharashtra, India',
            latitude: 19.0760,
            longitude: 72.8777,
            timezone: 'Asia/Kolkata'
        },
        VARANASI: {
            name: 'Varanasi, Uttar Pradesh, India',
            latitude: 25.3176,
            longitude: 82.9739,
            timezone: 'Asia/Kolkata'
        },
        NEW_YORK: {
            name: 'New York City, USA',
            latitude: 40.7128,
            longitude: -74.0060,
            timezone: 'America/New_York'
        },
        LONDON: {
            name: 'London, United Kingdom',
            latitude: 51.5074,
            longitude: -0.1278,
            timezone: 'Europe/London'
        },
        TOKYO: {
            name: 'Tokyo, Japan',
            latitude: 35.6762,
            longitude: 139.6503,
            timezone: 'Asia/Tokyo'
        }
    },
    
    // Popular ayanamsa systems
    POPULAR_AYANAMSAS: ['Lahiri', 'Krishnamurti', 'Raman', 'Fagan/Bradley', 'Yukteshwar'],
    
    // Test dates
    TEST_DATES: {
        CURRENT: new Date(),
        REFERENCE: new Date('2024-01-15T12:00:00Z'),
        HISTORICAL: [
            new Date('1900-01-01T12:00:00Z'),
            new Date('1950-01-01T12:00:00Z'),
            new Date('2000-01-01T12:00:00Z'),
            new Date('2025-01-01T12:00:00Z')
        ]
    }
};

/**
 * Formatting utilities
 */
export const FORMAT = {
    /**
     * Create a section header
     */
    section(title, width = 60) {
        const padding = Math.max(0, width - title.length - 2);
        const leftPad = Math.floor(padding / 2);
        const rightPad = padding - leftPad;
        return '='.repeat(leftPad) + ' ' + title + ' ' + '='.repeat(rightPad);
    },
    
    /**
     * Create a subsection header
     */
    subsection(title, width = 50) {
        return '--- ' + title + ' ---';
    },
    
    /**
     * Format a table row
     */
    tableRow(columns, widths) {
        return columns.map((col, i) => 
            String(col).padEnd(widths[i] || 15)
        ).join(' | ');
    },
    
    /**
     * Create table separator
     */
    tableSeparator(widths) {
        return widths.map(width => '-'.repeat(width)).join('-+-');
    },
    
    /**
     * Format date consistently
     */
    date(date) {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },
    
    /**
     * Format coordinate
     */
    coordinate(lat, lon) {
        const latDir = lat >= 0 ? 'N' : 'S';
        const lonDir = lon >= 0 ? 'E' : 'W';
        return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lon).toFixed(4)}°${lonDir}`;
    }
};

/**
 * Emoji mappings for consistent visual presentation
 */
export const EMOJI = {
    PLANETS: {
        'Sun': '☉',
        'Moon': '☽',
        'Mercury': '☿',
        'Venus': '♀',
        'Mars': '♂',
        'Jupiter': '♃',
        'Saturn': '♄'
    },
    
    ELEMENTS: {
        'Fire': '🔥',
        'Earth': '🌍',
        'Air': '💨',
        'Water': '💧'
    },
    
    GENERAL: {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️',
        calendar: '📅',
        location: '📍',
        telescope: '🔭',
        star: '⭐',
        earth: '🌍',
        fire: '🔥',
        water: '💧',
        air: '💨'
    }
};

/**
 * Error handling utilities
 */
export const ERROR_HANDLER = {
    /**
     * Wrap function execution with error handling
     */
    async wrap(fn, context = 'operation') {
        try {
            return await fn();
        } catch (error) {
            console.error(`${EMOJI.GENERAL.error} Error in ${context}:`, error.message);
            if (process.env.DEBUG) {
                console.error('Stack trace:', error.stack);
            }
            return null;
        }
    },
    
    /**
     * Log warning
     */
    warn(message, context = '') {
        console.warn(`${EMOJI.GENERAL.warning} ${context ? context + ': ' : ''}${message}`);
    },
    
    /**
     * Log info
     */
    info(message) {
        console.log(`${EMOJI.GENERAL.info} ${message}`);
    },
    
    /**
     * Log success
     */
    success(message) {
        console.log(`${EMOJI.GENERAL.success} ${message}`);
    }
};

/**
 * Validation utilities
 */
export const VALIDATOR = {
    /**
     * Validate planetary position data
     */
    planetaryPosition(planet) {
        const issues = [];
        
        if (!planet.planet || typeof planet.planet !== 'string') {
            issues.push('Missing or invalid planet name');
        }
        
        if (typeof planet.longitude !== 'number' || planet.longitude < 0 || planet.longitude >= 360) {
            issues.push(`Invalid longitude: ${planet.longitude}`);
        }
        
        if (!planet.rashi || planet.rashi.rashi < 1 || planet.rashi.rashi > 12) {
            issues.push(`Invalid rashi: ${planet.rashi?.rashi}`);
        }
        
        if (!planet.nakshatra || planet.nakshatra.nakshatra < 1 || planet.nakshatra.nakshatra > 27) {
            issues.push(`Invalid nakshatra: ${planet.nakshatra?.nakshatra}`);
        }
        
        if (!planet.nakshatra || planet.nakshatra.pada < 1 || planet.nakshatra.pada > 4) {
            issues.push(`Invalid pada: ${planet.nakshatra?.pada}`);
        }
        
        return issues;
    },
    
    /**
     * Validate ayanamsa data
     */
    ayanamsa(ayanamsa) {
        const issues = [];
        
        if (!ayanamsa.name || typeof ayanamsa.name !== 'string') {
            issues.push('Missing or invalid ayanamsa name');
        }
        
        if (typeof ayanamsa.degree !== 'number') {
            issues.push('Missing or invalid degree value');
        }
        
        if (!ayanamsa.description || typeof ayanamsa.description !== 'string') {
            issues.push('Missing or invalid description');
        }
        
        return issues;
    }
};

/**
 * Analysis utilities
 */
export const ANALYZER = {
    /**
     * Find planetary conjunctions
     */
    findConjunctions(planets, orbLimit = 10) {
        const conjunctions = [];
        const rashiGroups = {};
        
        // Group by rashi
        planets.forEach(planet => {
            const rashiName = planet.rashi.name;
            if (!rashiGroups[rashiName]) {
                rashiGroups[rashiName] = [];
            }
            rashiGroups[rashiName].push(planet);
        });
        
        // Find conjunctions within orb limit
        Object.entries(rashiGroups).forEach(([rashi, groupPlanets]) => {
            if (groupPlanets.length > 1) {
                const positions = groupPlanets.map(p => p.rashi.degree);
                const maxDiff = Math.max(...positions) - Math.min(...positions);
                
                if (maxDiff <= orbLimit) {
                    conjunctions.push({
                        rashi: rashi,
                        planets: groupPlanets.map(p => p.planet),
                        orb: maxDiff
                    });
                }
            }
        });
        
        return conjunctions;
    },
    
    /**
     * Analyze elemental distribution
     */
    analyzeElements(planets) {
        const elements = { 
            Fire: { count: 0, planets: [] }, 
            Earth: { count: 0, planets: [] }, 
            Air: { count: 0, planets: [] }, 
            Water: { count: 0, planets: [] } 
        };
        
        planets.forEach(planet => {
            const element = planet.rashi.element;
            if (elements[element]) {
                elements[element].count++;
                elements[element].planets.push(planet.planet);
            }
        });
        
        return elements;
    },
    
    /**
     * Find planets in same nakshatra
     */
    findNakshatraGroups(planets) {
        const groups = {};
        
        planets.forEach(planet => {
            const nakshatra = planet.nakshatra.name;
            if (!groups[nakshatra]) {
                groups[nakshatra] = [];
            }
            groups[nakshatra].push(planet.planet);
        });
        
        return Object.entries(groups).filter(([, planetList]) => planetList.length > 1);
    }
};

// CommonJS compatibility for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CONFIG,
        FORMAT,
        EMOJI,
        ERROR_HANDLER,
        VALIDATOR,
        ANALYZER
    };
}
