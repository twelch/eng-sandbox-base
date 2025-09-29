import { describe, it, expect, vi, beforeEach } from 'vitest'
import { assessUser } from '../app/actions/assessment'

// Mock the database
vi.mock('../db/database', () => ({
  database: {
    addAssessment: vi.fn()
  }
}))

// Mock console methods to avoid noise in tests
beforeEach(async () => {
  // Set up the database mock to return a successful response based on input
  const { database } = await import('../db/database')
  vi.mocked(database.addAssessment).mockImplementation(async (assessmentData) => {
    return {
      id: 'test-id-123',
      ...assessmentData
    }
  })
})

describe('assessUser', () => {
  const createValidFormData = () => {
    const formData = new FormData()
    formData.append('name', 'John Doe')
    formData.append('email', 'john.doe@example.com')
    formData.append('forestlandAmount', '100.5')
    formData.append('forestlandUnit', 'acres')
    formData.append('treeSpecies', 'Douglas Fir')
    formData.append('treeSpecies', 'Red Oak')
    return formData
  }

  it('should successfully assess user with all valid fields', async () => {
    const formData = createValidFormData()

    const result = await assessUser(formData)

    expect(result.success).toBe(true)
    expect(result.data).toBeDefined()
    expect(result.data?.name).toBe('John Doe')
    expect(result.data?.email).toBe('john.doe@example.com')
    expect(result.data?.forestlandAmount).toBe(100.5)
    expect(result.data?.forestlandUnit).toBe('acres')
    expect(result.data?.treeSpecies).toEqual(['Douglas Fir', 'Red Oak'])
    expect(result.data?.completedAt).toBeDefined()
    expect(result.data?.processingTime).toBe('3 seconds')
    expect(result.error).toBeUndefined()
  })

  it('should work with square-miles unit', async () => {
    const formData = createValidFormData()
    formData.set('forestlandUnit', 'square-miles')
    formData.set('forestlandAmount', '2.5')

    const result = await assessUser(formData)

    expect(result.success).toBe(true)
    expect(result.data?.forestlandAmount).toBe(2.5)
    expect(result.data?.forestlandUnit).toBe('square-miles')
  })

  it('should work with single tree species', async () => {
    const formData = new FormData()
    formData.append('name', 'Jane Smith')
    formData.append('email', 'jane@example.com')
    formData.append('forestlandAmount', '50')
    formData.append('forestlandUnit', 'acres')
    formData.append('treeSpecies', 'White Pine')

    const result = await assessUser(formData)

    expect(result.success).toBe(true)
    expect(result.data?.treeSpecies).toEqual(['White Pine'])
  })

  // Validation tests for name
  it('should fail when name is missing', async () => {
    const formData = createValidFormData()
    formData.delete('name')

    const result = await assessUser(formData)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Name is required')
    expect(result.data).toBeUndefined()
  })

  it('should fail when name is empty string', async () => {
    const formData = createValidFormData()
    formData.set('name', '')

    const result = await assessUser(formData)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Name is required')
    expect(result.data).toBeUndefined()
  })

  // Validation tests for email
  it('should fail when email is missing', async () => {
    const formData = createValidFormData()
    formData.delete('email')

    const result = await assessUser(formData)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Valid email address is required')
    expect(result.data).toBeUndefined()
  })

  it('should fail when email is empty string', async () => {
    const formData = createValidFormData()
    formData.set('email', '')

    const result = await assessUser(formData)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Valid email address is required')
    expect(result.data).toBeUndefined()
  })

  it('should fail when email is invalid (no @ symbol)', async () => {
    const formData = createValidFormData()
    formData.set('email', 'invalid-email')

    const result = await assessUser(formData)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Valid email address is required')
    expect(result.data).toBeUndefined()
  })

  // Validation tests for forestland amount
  it('should fail when forestland amount is missing', async () => {
    const formData = createValidFormData()
    formData.delete('forestlandAmount')

    const result = await assessUser(formData)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Valid forestland amount is required')
    expect(result.data).toBeUndefined()
  })

  it('should fail when forestland amount is empty string', async () => {
    const formData = createValidFormData()
    formData.set('forestlandAmount', '')

    const result = await assessUser(formData)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Valid forestland amount is required')
    expect(result.data).toBeUndefined()
  })

  it('should fail when forestland amount is not a number', async () => {
    const formData = createValidFormData()
    formData.set('forestlandAmount', 'not-a-number')

    const result = await assessUser(formData)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Valid forestland amount is required')
    expect(result.data).toBeUndefined()
  })

  it('should fail when forestland amount is zero', async () => {
    const formData = createValidFormData()
    formData.set('forestlandAmount', '0')

    const result = await assessUser(formData)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Valid forestland amount is required')
    expect(result.data).toBeUndefined()
  })

  it('should fail when forestland amount is negative', async () => {
    const formData = createValidFormData()
    formData.set('forestlandAmount', '-10')

    const result = await assessUser(formData)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Valid forestland amount is required')
    expect(result.data).toBeUndefined()
  })

  // Validation tests for forestland unit
  it('should fail when forestland unit is missing', async () => {
    const formData = createValidFormData()
    formData.delete('forestlandUnit')

    const result = await assessUser(formData)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Valid forestland unit is required')
    expect(result.data).toBeUndefined()
  })

  it('should fail when forestland unit is invalid', async () => {
    const formData = createValidFormData()
    formData.set('forestlandUnit', 'hectares')

    const result = await assessUser(formData)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Valid forestland unit is required')
    expect(result.data).toBeUndefined()
  })

  // Validation tests for tree species
  it('should fail when no tree species are selected', async () => {
    const formData = createValidFormData()
    formData.delete('treeSpecies')

    const result = await assessUser(formData)

    expect(result.success).toBe(false)
    expect(result.error).toBe('At least one tree species must be selected')
    expect(result.data).toBeUndefined()
  })

  it('should handle processing errors gracefully', async () => {
    const formData = createValidFormData()

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
