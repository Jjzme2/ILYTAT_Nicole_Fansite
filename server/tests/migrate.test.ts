import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock globals
const mockGetQuery = vi.fn()
const mockGetHeader = vi.fn()
const mockCreateError = vi.fn((err) => err)
const mockDefineEventHandler = (handler: any) => handler
const mockUseRuntimeConfig = vi.fn(() => ({
    adminSecret: 'secret',
    public: {}
}))

vi.stubGlobal('defineEventHandler', mockDefineEventHandler)
vi.stubGlobal('getQuery', mockGetQuery)
vi.stubGlobal('getHeader', mockGetHeader)
vi.stubGlobal('createError', mockCreateError)
vi.stubGlobal('useRuntimeConfig', mockUseRuntimeConfig)

// Mock logger
vi.mock('../../utils/logger', () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
    }
}))

// Use vi.hoisted for variables used in vi.mock factory
const { mockDb, mockGet, mockBatch } = vi.hoisted(() => {
    const mockUpdate = vi.fn()
    const mockCommit = vi.fn()
    const mockBatch = {
        update: mockUpdate,
        commit: mockCommit
    }
    const mockDocs = [
        {
            data: () => ({ email: 'test@example.com' }),
            ref: 'ref1'
        }
    ]
    const mockGet = vi.fn().mockResolvedValue({ docs: mockDocs })
    const mockCollection = {
        get: mockGet
    }
    const mockDb = {
        collection: vi.fn(() => mockCollection),
        batch: vi.fn(() => mockBatch)
    }
    return { mockDb, mockGet, mockBatch }
})

// Mock Firebase Admin using relative path from THIS test file
// server/tests/migrate.test.ts -> ../utils/firebaseAdmin -> server/utils/firebaseAdmin
vi.mock('../utils/firebaseAdmin', () => ({ useFirebaseAdmin: () => ({ db: mockDb }) }))


describe('System Migration Endpoint', () => {
    let migrateHandler: any;

    beforeEach(async () => {
        vi.clearAllMocks()
        mockGetQuery.mockReturnValue({ admin_email: 'admin@example.com' })

        // Re-apply defaults for hoisted mocks
        mockGet.mockResolvedValue({
            docs: [
                {
                    data: () => ({ email: 'test@example.com' }),
                    ref: 'ref1'
                }
            ]
        })

        // Dynamic import
        const module = await import('../api/system/migrate.post')
        migrateHandler = module.default
    })

    it('should REJECT migration without secret', async () => {
        mockGetHeader.mockReturnValue(undefined)

        await expect(migrateHandler({})).rejects.toEqual(expect.objectContaining({ statusCode: 401 }))
        expect(mockDb.collection).not.toHaveBeenCalled()
    })

    it('should REJECT migration with INCORRECT secret', async () => {
        mockGetHeader.mockReturnValue('wrong-secret')

        await expect(migrateHandler({})).rejects.toEqual(expect.objectContaining({ statusCode: 401 }))
        expect(mockDb.collection).not.toHaveBeenCalled()
    })

    it('should ALLOW migration with CORRECT secret', async () => {
        mockGetHeader.mockReturnValue('secret') // Matches mockUseRuntimeConfig

        await migrateHandler({})

        expect(mockDb.collection).toHaveBeenCalledWith('users')
        expect(mockGet).toHaveBeenCalled()
        expect(mockBatch.update).toHaveBeenCalled()
        expect(mockBatch.commit).toHaveBeenCalled()
    })
})
