const dateFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' })
const dateTimeFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' })

export const formatDate = (date: Date | any): string => {
    if (!date) return ''
    const d = date.toDate ? date.toDate() : new Date(date)
    return dateFormatter.format(d)
}

export const formatDateTime = (date: Date | any): string => {
    if (!date) return ''
    const d = date.toDate ? date.toDate() : new Date(date)
    return dateTimeFormatter.format(d)
}

export const formatTimeAgo = (timestamp: any): string => {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return dateFormatter.format(date)
}
