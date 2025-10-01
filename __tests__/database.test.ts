import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { join } from 'path'
import { existsSync, unlinkSync, writeFileSync, mkdirSync } from 'fs'
import { randomUUID } from 'crypto'
import { Database } from '../db/database'
import type { AssessmentResult } from '../db/database'

describe('Database', () => {
  let database: Database;
  let TEST_DB_PATH: string;
  
  // Test helper to create assessment data
  const createAssessment = (overrides = {}) => ({
    name: 'John Doe',
    email: 'john.doe@example.com',
    forestlandAmount: 100.5,
    forestlandUnit: 'acres',
    treeSpecies: ['Douglas Fir', 'Red Oak'],
    completedAt: '2025-09-29T10:00:00.000Z',
    processingTime: 3000,
    ...overrides
  });

  const sampleAssessment = createAssessment();
  const sampleAssessment2 = createAssessment({
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    forestlandAmount: 250.0,
    forestlandUnit: 'square-miles',
    treeSpecies: ['White Pine', 'Sugar Maple'],
    completedAt: '2025-09-29T11:00:00.000Z',
    processingTime: 2000
  });

  beforeEach(() => {
    // Create unique test database path for each test
    TEST_DB_PATH = join(process.cwd(), 'db', `test-${randomUUID()}.json`);
    
    // Create database instance with test path
    database = new Database(TEST_DB_PATH);
    
    // Ensure db directory exists
    const dbDir = join(process.cwd(), 'db');
    if (!existsSync(dbDir)) {
      mkdirSync(dbDir, { recursive: true });
    }
    
    // Clean up test database file if it exists
    if (existsSync(TEST_DB_PATH)) {
      unlinkSync(TEST_DB_PATH);
    }
  });

  afterEach(() => {
    // Clean up test database file after each test
    if (existsSync(TEST_DB_PATH)) {
      unlinkSync(TEST_DB_PATH);
    }
  });

  describe('initialize', () => {
    it('should create a new database file with empty assessments array', async () => {
      const db = await database.load();
      
      expect(db).toBeDefined();
      expect(db.data).toBeDefined();
      expect(db.data.assessments).toEqual([]);
      
      // The file should be created after the first write operation
      await db.write();
      expect(existsSync(TEST_DB_PATH)).toBe(true);
    });

    it('should read existing data from database file', async () => {
      // Pre-populate the test database file
      const existingData = {
        assessments: [{
          id: 'test-id-123',
          ...sampleAssessment
        }]
      };
      writeFileSync(TEST_DB_PATH, JSON.stringify(existingData, null, 2));

      const db = await database.load();
      
      expect(db.data.assessments).toHaveLength(1);
      expect(db.data.assessments[0].id).toBe('test-id-123');
      expect(db.data.assessments[0].name).toBe('John Doe');
    });

    it('should return the same database instance on multiple calls', async () => {
      const db1 = await database.load();
      const db2 = await database.load();
      
      expect(db1).toBe(db2);
    });
  });

  describe('addAssessment', () => {
    it('should add assessment with generated ID and preserve all data', async () => {
      const result = await database.addAssessment(sampleAssessment);
      
      expect(result).toMatchObject({
        ...sampleAssessment,
        id: expect.any(String)
      });
      expect(result.id).toBeTruthy();
    });

    it('should persist assessment to database', async () => {
      const added = await database.addAssessment(sampleAssessment);
      
      const assessments = await database.getAllAssessments();
      
      expect(assessments).toHaveLength(1);
      expect(assessments[0]).toMatchObject(added);
    });

    it('should generate unique IDs for multiple assessments', async () => {
      const result1 = await database.addAssessment(sampleAssessment);
      const result2 = await database.addAssessment(sampleAssessment2);
      
      expect(result1.id).not.toBe(result2.id);
    });
  });

  describe('getAllAssessments', () => {
    it('should return empty array when no assessments exist', async () => {
      const assessments = await database.getAllAssessments();
      
      expect(assessments).toEqual([]);
      expect(assessments).toHaveLength(0);
    });

    it('should return all assessments when they exist', async () => {
      await database.addAssessment(sampleAssessment);
      await database.addAssessment(sampleAssessment2);
      
      const assessments = await database.getAllAssessments();
      
      expect(assessments).toHaveLength(2);
      expect(assessments.some((a: AssessmentResult) => a.name === 'John Doe')).toBe(true);
      expect(assessments.some((a: AssessmentResult) => a.name === 'Jane Smith')).toBe(true);
    });

    it('should return assessments sorted by completedAt date (newest first)', async () => {
      // Add assessments in different order than expected sort
      const olderAssessment = createAssessment({
        completedAt: '2025-09-28T10:00:00.000Z' // Earlier date
      });
      const newerAssessment = createAssessment({
        name: 'Jane Smith',
        completedAt: '2025-09-29T15:00:00.000Z' // Later date
      });
      
      await database.addAssessment(olderAssessment);
      await database.addAssessment(newerAssessment);
      
      const assessments = await database.getAllAssessments();
      
      expect(assessments).toHaveLength(2);
      expect(assessments[0].name).toBe('Jane Smith'); // Newer should be first
      expect(assessments[1].name).toBe('John Doe'); // Older should be second
      expect(new Date(assessments[0].completedAt).getTime())
        .toBeGreaterThan(new Date(assessments[1].completedAt).getTime());
    });
  });

  describe('getAssessmentById', () => {
    it('should return undefined when assessment does not exist', async () => {
      const result = await database.getAssessmentById('nonexistent-id');
      
      expect(result).toBeUndefined();
    });

    it('should return assessment when it exists (searching by ID)', async () => {
      const addedAssessment = await database.addAssessment(sampleAssessment);
      
      const result = await database.getAssessmentById(addedAssessment.id);
      
      expect(result).toBeDefined();
      expect(result?.id).toBe(addedAssessment.id);
      expect(result?.name).toBe(sampleAssessment.name);
      expect(result?.email).toBe(sampleAssessment.email);
    });
  });
});
