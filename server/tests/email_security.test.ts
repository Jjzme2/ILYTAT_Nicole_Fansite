import { describe, it, expect, vi, beforeEach } from 'vitest'
import { sendEmail } from '../utils/email'

// Mock dependencies
vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: vi.fn().mockResolvedValue({ messageId: 'test-id' })
    }))
  }
}))

// Mock global $fetch
const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

describe('sendEmail Security & Logic', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should use EmailJS if configured', async () => {
        const config = {
            emailjs: {
                serviceId: 'service_123',
                publicKey: 'user_123',
                privateKey: 'key_123',
                generalTemplateId: 'template_123'
            }
        }

        mockFetch.mockResolvedValueOnce({ status: 200 })

        const result = await sendEmail(config, {
            to: 'test@example.com',
            subject: 'Test',
            text: 'Hello'
        })

        expect(result.success).toBe(true)
        expect(result.provider).toBe('emailjs')
        expect(mockFetch).toHaveBeenCalledWith('https://api.emailjs.com/api/v1.0/email/send', expect.any(Object))
    })

    it('should fallback to Nodemailer if EmailJS fails', async () => {
        const config = {
            emailjs: {
                serviceId: 'service_123',
                publicKey: 'user_123',
                privateKey: 'key_123',
                generalTemplateId: 'template_123'
            },
            smtpHost: 'smtp.example.com',
            smtpUser: 'user',
            smtpPass: 'pass'
        }

        mockFetch.mockRejectedValueOnce({ message: 'EmailJS Error' })

        const result = await sendEmail(config, {
            to: 'test@example.com',
            subject: 'Test',
            text: 'Hello'
        })

        expect(result.success).toBe(true)
        expect(result.provider).toBe('nodemailer')
        expect(mockFetch).toHaveBeenCalled() // EmailJS tried
        // Nodemailer should have been called (via import mock)
    })

    it('should fail if no providers configured', async () => {
        const config = {}

        const result = await sendEmail(config, {
            to: 'test@example.com',
            subject: 'Test',
            text: 'Hello'
        })

        expect(result.success).toBe(false)
        expect(result.message).toContain('All email providers failed or are not configured')
    })
})
