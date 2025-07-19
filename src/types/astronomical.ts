/**
 * Common interfaces and types for astronomical calculations
 */

export interface CelestialBody {
    name: string;
    type: 'planet' | 'star' | 'moon' | 'asteroid' | 'comet';
    magnitude?: number;
    radius?: number; // in km
}

export interface Position {
    longitude: number; // degrees
    latitude: number;  // degrees
    altitude?: number; // degrees above horizon
}

export interface EclipticCoordinates {
    longitude: number; // degrees
    latitude: number;  // degrees
    distance: number;  // AU
}

export interface EquatorialCoordinates {
    rightAscension: number; // hours
    declination: number;    // degrees
    distance: number;       // AU
}

export interface OrbitalElements {
    semiMajorAxis: number;           // AU
    eccentricity: number;            // 0-1
    inclination: number;             // degrees
    longitudeOfAscendingNode: number; // degrees
    argumentOfPeriapsis: number;     // degrees
    meanAnomaly: number;             // degrees
    epoch: Date;                     // reference date
}

export interface Location {
    latitude: number;  // degrees
    longitude: number; // degrees
    altitude?: number; // meters above sea level
    timezone?: string; // IANA timezone
}

export interface TimeRange {
    startDate: Date;
    endDate: Date;
    stepSize?: number; // days
}