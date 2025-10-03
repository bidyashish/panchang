/**
 * Utility functions for astronomical calculations
 */
import { format, formatInTimeZone } from 'date-fns-tz';

/**
 * Format date as UTC string (ISO format)
 * @param date Date to format
 * @returns UTC string in ISO format
 */
export function formatDateUTC(date: Date | null): string {
    if (!date) return 'N/A';
    return date.toISOString();
}

/**
 * Format time as UTC time string
 * @param date Date to format
 * @returns UTC time string (HH:MM:SS format)
 */
export function formatTimeUTC(date: Date | null): string {
    if (!date) return 'N/A';
    return date.toISOString().substring(11, 19); // Extract HH:MM:SS from ISO string
}

/**
 * Format date/time in any timezone using date-fns-tz
 * @param date Date to format
 * @param timezone IANA timezone identifier (e.g., 'America/Vancouver', 'Asia/Kolkata')
 * @param formatPattern Format pattern (default: 'yyyy-MM-dd HH:mm:ss')
 * @returns Formatted date string in the specified timezone
 */
export function formatDateInTimezone(
    date: Date | null,
    timezone: string = 'UTC',
    formatPattern: string = 'yyyy-MM-dd HH:mm:ss'
): string {
    if (!date || isNaN(date.getTime())) return 'N/A';
    try {
        return formatInTimeZone(date, timezone, formatPattern);
    } catch (error) {
        // Fallback to UTC if timezone is invalid
        try {
            return formatInTimeZone(date, 'UTC', formatPattern);
        } catch {
            return 'N/A';
        }
    }
}

/**
 * Format time only in any timezone
 * @param date Date to format
 * @param timezone IANA timezone identifier
 * @param formatPattern Time format pattern (default: 'HH:mm:ss')
 * @returns Formatted time string in the specified timezone
 */
export function formatTimeInTimezone(
    date: Date | null,
    timezone: string = 'UTC',
    formatPattern: string = 'HH:mm:ss'
): string {
    if (!date || isNaN(date.getTime())) return 'N/A';
    try {
        return formatInTimeZone(date, timezone, formatPattern);
    } catch (error) {
        try {
            return formatInTimeZone(date, 'UTC', formatPattern);
        } catch {
            return 'N/A';
        }
    }
}

/**
 * Format date range in any timezone
 * @param startDate Start date
 * @param endDate End date
 * @param timezone IANA timezone identifier
 * @param formatPattern Format pattern for times (default: 'HH:mm:ss')
 * @returns Formatted time range string in the specified timezone
 */
export function formatTimeRangeInTimezone(
    startDate: Date | null, 
    endDate: Date | null, 
    timezone: string = 'UTC',
    formatPattern: string = 'HH:mm:ss'
): string {
    if (!startDate || !endDate) return 'N/A';
    const start = formatTimeInTimezone(startDate, timezone, formatPattern);
    const end = formatTimeInTimezone(endDate, timezone, formatPattern);
    return `${start} - ${end}`;
}

/**
 * Format date range as UTC strings (backward compatibility)
 * @param startDate Start date
 * @param endDate End date
 * @returns Formatted UTC time range string
 */
export function formatTimeRangeUTC(startDate: Date | null, endDate: Date | null): string {
    return formatTimeRangeInTimezone(startDate, endDate, 'UTC');
}

/**
 * Get formatted date object with multiple timezone representations
 * @param date Date to format
 * @param primaryTimezone Primary timezone for display
 * @returns Object with multiple format options
 */
export interface FormattedDateInfo {
    /** Original Date object */
    original: Date;
    /** UTC ISO string */
    utc: string;
    /** Formatted in primary timezone */
    local: string;
    /** Time only in primary timezone */
    localTime: string;
    /** Date only in primary timezone */
    localDate: string;
    /** Primary timezone used */
    timezone: string;
    /** Unix timestamp */
    timestamp: number;
    /** Year in primary timezone */
    year: number;
    /** Month in primary timezone (1-12) */
    month: number;
    /** Day in primary timezone (1-31) */
    day: number;
}

export function getFormattedDateInfo(
    date: Date | null,
    primaryTimezone: string = 'UTC'
): FormattedDateInfo | null {
    if (!date || isNaN(date.getTime())) return null;

    try {
        return {
            original: date,
            utc: date.toISOString(),
            local: formatDateInTimezone(date, primaryTimezone, 'yyyy-MM-dd HH:mm:ss zzz'),
            localTime: formatTimeInTimezone(date, primaryTimezone, 'HH:mm:ss'),
            localDate: formatDateInTimezone(date, primaryTimezone, 'yyyy-MM-dd'),
            timezone: primaryTimezone,
            timestamp: date.getTime(),
            year: parseInt(formatInTimeZone(date, primaryTimezone, 'yyyy')),
            month: parseInt(formatInTimeZone(date, primaryTimezone, 'MM')),
            day: parseInt(formatInTimeZone(date, primaryTimezone, 'dd'))
        };
    } catch (error) {
        return null;
    }
}

export function normalizeAngle(angle: number): number {
    let normalized = angle % 360;
    if (normalized < 0) {
        normalized += 360;
    }
    return normalized;
}