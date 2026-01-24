// Reuse formatter instances to avoid creation overhead
const dateFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' })
const dateTimeFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' })

export const formatDate = (timestamp: Date | string | number | { toDate: () => Date } | null | undefined): string => {
    if (!timestamp) return ''
    try {
        const date = (timestamp as any).toDate ? (timestamp as any).toDate() : new Date(timestamp as any)
        return dateFormatter.format(date)
    } catch (e) {
        console.error('Error formatting date:', e)
        return ''
    }
}

export const formatDateTime = (timestamp: Date | string | number | { toDate: () => Date } | null | undefined): string => {
    if (!timestamp) return ''
    try {
        const date = (timestamp as any).toDate ? (timestamp as any).toDate() : new Date(timestamp as any)
        return dateTimeFormatter.format(date)
    } catch (e) {
        console.error('Error formatting date time:', e)
        return ''
    }
}
