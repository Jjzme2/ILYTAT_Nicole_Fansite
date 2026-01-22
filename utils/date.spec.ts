import { describe, it, expect } from 'vitest'
import { formatTime } from './date'

describe('formatTime', () => {
    it('returns "Just now" for recent times', () => {
        const now = new Date()
        expect(formatTime(now)).toBe('Just now')
    })

    it('returns minutes ago', () => {
        const d = new Date()
        d.setMinutes(d.getMinutes() - 5)
        expect(formatTime(d)).toBe('5m ago')
    })

    it('returns hours ago', () => {
        const d = new Date()
        d.setHours(d.getHours() - 2)
        expect(formatTime(d)).toBe('2h ago')
    })

    it('returns days ago', () => {
        const d = new Date()
        d.setDate(d.getDate() - 3)
        expect(formatTime(d)).toBe('3d ago')
    })

    it('returns formatted date for older dates', () => {
        const d = new Date('2023-01-01')
        // Using strict equality might fail due to locale.
        // Just checking it's not relative time.
        const result = formatTime(d)
        expect(result).not.toContain('ago')
        expect(result).not.toBe('Just now')
    })

    it('handles Firestore timestamp-like objects', () => {
        const d = new Date()
        d.setHours(d.getHours() - 1)
        const timestamp = { toDate: () => d }
        expect(formatTime(timestamp)).toBe('1h ago')
    })
})
