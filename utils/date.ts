// Reuse formatter instances to avoid expensive instantiation in loops
const dateTimeFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' });
const dateOnlyFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' });

/**
 * Formats a date/timestamp to "MMM D, YYYY, h:mm AM/PM"
 * Optimized for performance by reusing Intl.DateTimeFormat instance.
 */
export const formatDateTime = (timestamp: any): string => {
    if (!timestamp) return '';
    // Handle Firestore Timestamp (has .toDate()) or standard Date/string/number
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);

    // Check if date is valid
    if (isNaN(date.getTime())) return '';

    return dateTimeFormatter.format(date);
}

/**
 * Formats a date/timestamp to "MMM D, YYYY"
 * Optimized for performance by reusing Intl.DateTimeFormat instance.
 */
export const formatDateOnly = (timestamp: any): string => {
    if (!timestamp) return '';
    // Handle Firestore Timestamp (has .toDate()) or standard Date/string/number
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);

    // Check if date is valid
    if (isNaN(date.getTime())) return '';

    return dateOnlyFormatter.format(date);
}
