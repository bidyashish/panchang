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
    name?: string;     // optional location name for display
}

export interface TimeRange {
    startDate: Date;
    endDate: Date;
    stepSize?: number; // days
}

export interface PanchangaFullOutput {
  sunMoon: {
    sunrise: Date | null;
    sunset: Date | null;
    moonrise?: Date | null;
    moonset?: Date | null;
  };
  tithi: {
    name: string;
    number: number;
    endTime?: Date | null;
    next?: { name: string; number: number };
  };
  nakshatra: {
    name: string;
    number: number;
    pada: number;
    endTime?: Date | null;
    next?: { name: string; number: number; pada: number };
  };
  yoga: {
    name: string;
    number: number;
    endTime?: Date | null;
    next?: { name: string; number: number };
  };
  karana: {
    name: string;
    number: number;
    endTime?: Date | null;
    next?: { name: string; number: number };
  };
  weekday: string;
  lunarMonth: {
    amanta: string;
    purnimanta: string;
    paksha: string;
    monthNumber?: number;
  };
  samvata: {
    shaka: string;
    vikrama: string;
    gujarati: string;
  };
  ayana: {
    drik: string;
    vedic: string;
  };
  ritu: {
    drik: string;
    vedic: string;
  };
  muhurta: {
    abhijit: { start: Date | null; end: Date | null };
    amritKalam: { start: Date | null; end: Date | null };
    brahma: { start: Date | null; end: Date | null };
    godhuli: { start: Date | null; end: Date | null };
    nishita: { start: Date | null; end: Date | null };
    pratash: { start: Date | null; end: Date | null };
    sayana: { start: Date | null; end: Date | null };
    vijaya: { start: Date | null; end: Date | null };
    sarvarthaSiddhi: { start: Date | null; end: Date | null };
    // ...add others as needed
  };
  rahuKalam: { start: Date | null; end: Date | null };
  gulikaKalam: { start: Date | null; end: Date | null };
  yamaganda: { start: Date | null; end: Date | null };
  // ...add any other fields from the screenshot
}