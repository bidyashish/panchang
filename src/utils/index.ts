/**
 * Utility functions for astronomical calculations
 */

export function formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

export function degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

export function radiansToDegrees(radians: number): number {
    return radians * (180 / Math.PI);
}

export function normalizeAngle(angle: number): number {
    let normalized = angle % 360;
    if (normalized < 0) {
        normalized += 360;
    }
    return normalized;
}

export function toDMS(degrees: number): { degrees: number; minutes: number; seconds: number } {
    const absValue = Math.abs(degrees);
    const d = Math.floor(absValue);
    const mins = (absValue - d) * 60;
    const m = Math.floor(mins);
    const s = Math.round((mins - m) * 60 * 1000) / 1000;
    
    return { 
        degrees: degrees >= 0 ? d : -d, 
        minutes: m, 
        seconds: s 
    };
}

export function julianDayToDate(jd: number): Date {
    const a = jd + 32044;
    const b = (4 * a + 3) / 146097;
    const c = a - (146097 * b) / 4;
    const d = (4 * c + 3) / 1461;
    const e = c - (1461 * d) / 4;
    const m = (5 * e + 2) / 153;
    
    const day = e - (153 * m + 2) / 5 + 1;
    const month = m + 3 - 12 * (m / 10);
    const year = 100 * b + d - 4800 + m / 10;
    
    return new Date(year, month - 1, day);
}