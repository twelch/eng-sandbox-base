import { describe, it, expect, vi, beforeEach } from 'vitest'
import { assessUser } from '../app/actions/assessment'

// Mock console methods to avoid noise in tests
beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('assessUser', () => {
  it('should successfully assess user with valid name', async () => {
    // Create a FormData with valid name
    const formData = new FormData()
    formData.append('name', 'John Doe')

    const result = await assessUser(formData)

    expect(result.success).toBe(true)
    expect(result.data).toBeDefined()
    expect(result.data?.name).toBe('John Doe')
    expect(result.data?.completedAt).toBeDefined()
    expect(result.data?.processingTime).toBe('3 seconds')
    expect(result.error).toBeUndefined()
  })

  it('should fail when name is missing', async () => {
    // Create a FormData without name
    const formData = new FormData()

    const result = await assessUser(formData)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Name is required')
    expect(result.data).toBeUndefined()
  })

  it('should handle processing errors gracefully', async () => {
    // Create a FormData with valid name
    const formData = new FormData()
    formData.append('name', 'Test User')

    // Mock setTimeout to throw an error instead of resolving
    vi.spyOn(global, 'setTimeout').mockImplementation(() => {
      throw new Error('Processing failed')
    })

    const result = await assessUser(formData)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Assessment processing failed. Please try again.')
    expect(result.data).toBeUndefined()

    // Restore setTimeout
    vi.restoreAllMocks()
  })
})
