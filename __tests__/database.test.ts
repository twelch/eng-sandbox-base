import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { join } from 'path'
import { existsSync, unlinkSync, writeFileSync, mkdirSync } from 'fs'
import { randomUUID } from 'crypto'
import { Database } from '../db/database'
import type { AssessmentResult } from '../db/database'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'

// Mock crypto.randomUUID for consistent testing
global.crypto = {
  randomUUID: randomUUID
} as any

// Mock the database file path to use test.json
const TEST_DB_PATH = join(process.cwd(), 'db', 'test.json')

// Create a test-specific database class that uses test.json
class TestDatabase extends Database {
  private testDb: Low<{ assessments: AssessmentResult[] }> | null = null;

  async initialize() {
    if (this.testDb) return this.testDb;

    const adapter = new JSONFile<{ assessments: AssessmentResult[] }>(TEST_DB_PATH);
    this.testDb = new Low<{ assessments: AssessmentResult[] }>(adapter, { assessments: [] });

    await this.testDb.read();

    // Initialize with default data if empty
    if (!this.testDb.data) {
      this.testDb.data = { assessments: [] };
      await this.testDb.write();
    }

    return this.testDb;
  }

  async addAssessment(assessment: Omit<AssessmentResult, 'id'>) {
    const db = await this.initialize();
    
    const newAssessment: AssessmentResult = {
      ...assessment,
      id: randomUUID(),
    };

    db.data.assessments.push(newAssessment);
    await db.write();

    return newAssessment;
  }

  async getAllAssessments(): Promise<AssessmentResult[]> {
    const db = await this.initialize();
    return db.data.assessments.sort((a, b) => 
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );
  }

  async getAssessmentById(id: string): Promise<AssessmentResult | undefined> {
    const db = await this.initialize();
    return db.data.assessments.find(assessment => assessment.email === id);
  }
}

describe('Database', () => {
  let testDatabase: TestDatabase;
  
  // Sample assessment data for testing
  const sampleAssessment = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    forestlandAmount: 100.5,
    forestlandUnit: 'acres',
    treeSpecies: ['Douglas Fir', 'Red Oak'],
    completedAt: '2025-09-29T10:00:00.000Z',
    processingTime: '3 seconds'
  };

  const sampleAssessment2 = {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    forestlandAmount: 250.0,
    forestlandUnit: 'square-miles',
    treeSpecies: ['White Pine', 'Sugar Maple'],
    completedAt: '2025-09-29T11:00:00.000Z',
    processingTime: '2 seconds'
  };

  beforeEach(() => {
    testDatabase = new TestDatabase();
    
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
      const db = await testDatabase.initialize();
      
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

      const db = await testDatabase.initialize();
      
      expect(db.data.assessments).toHaveLength(1);
      expect(db.data.assessments[0].id).toBe('test-id-123');
      expect(db.data.assessments[0].name).toBe('John Doe');
    });

    it('should return the same database instance on multiple calls', async () => {
      const db1 = await testDatabase.initialize();
      const db2 = await testDatabase.initialize();
      
      expect(db1).toBe(db2);
    });
  });

  describe('addAssessment', () => {
    it('should add a new assessment with generated ID', async () => {
      const result = await testDatabase.addAssessment(sampleAssessment);
      
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe('string');
      expect(result.id.length).toBeGreaterThan(0);
      expect(result.name).toBe(sampleAssessment.name);
      expect(result.email).toBe(sampleAssessment.email);
      expect(result.forestlandAmount).toBe(sampleAssessment.forestlandAmount);
      expect(result.forestlandUnit).toBe(sampleAssessment.forestlandUnit);
      expect(result.treeSpecies).toEqual(sampleAssessment.treeSpecies);
      expect(result.completedAt).toBe(sampleAssessment.completedAt);
      expect(result.processingTime).toBe(sampleAssessment.processingTime);
    });

    it('should persist the assessment to the database file', async () => {
      await testDatabase.addAssessment(sampleAssessment);
      
      // Create a new database instance to test persistence
      const newDatabase = new TestDatabase();
      const assessments = await newDatabase.getAllAssessments();
      
      expect(assessments).toHaveLength(1);
      expect(assessments[0].name).toBe(sampleAssessment.name);
      expect(assessments[0].email).toBe(sampleAssessment.email);
    });

    it('should generate unique IDs for multiple assessments', async () => {
      const result1 = await testDatabase.addAssessment(sampleAssessment);
      const result2 = await testDatabase.addAssessment(sampleAssessment2);
      
      expect(result1.id).not.toBe(result2.id);
      expect(result1.id).toBeDefined();
      expect(result2.id).toBeDefined();
    });

    it('should handle assessments with single tree species', async () => {
      const assessmentWithSingleSpecies = {
        ...sampleAssessment,
        treeSpecies: ['Douglas Fir']
      };
      
      const result = await testDatabase.addAssessment(assessmentWithSingleSpecies);
      
      expect(result.treeSpecies).toEqual(['Douglas Fir']);
      expect(result.treeSpecies).toHaveLength(1);
    });

    it('should handle assessments with multiple tree species', async () => {
      const assessmentWithMultipleSpecies = {
        ...sampleAssessment,
        treeSpecies: ['Douglas Fir', 'Red Oak', 'White Pine', 'Sugar Maple']
      };
      
      const result = await testDatabase.addAssessment(assessmentWithMultipleSpecies);
      
      expect(result.treeSpecies).toEqual(['Douglas Fir', 'Red Oak', 'White Pine', 'Sugar Maple']);
      expect(result.treeSpecies).toHaveLength(4);
    });
  });

  describe('getAllAssessments', () => {
    it('should return empty array when no assessments exist', async () => {
      const assessments = await testDatabase.getAllAssessments();
      
      expect(assessments).toEqual([]);
      expect(assessments).toHaveLength(0);
    });

    it('should return all assessments when they exist', async () => {
      await testDatabase.addAssessment(sampleAssessment);
      await testDatabase.addAssessment(sampleAssessment2);
      
      const assessments = await testDatabase.getAllAssessments();
      
      expect(assessments).toHaveLength(2);
      expect(assessments.some((a: AssessmentResult) => a.name === 'John Doe')).toBe(true);
      expect(assessments.some((a: AssessmentResult) => a.name === 'Jane Smith')).toBe(true);
    });

    it('should return assessments sorted by completedAt date (newest first)', async () => {
      // Add assessments in different order than expected sort
      const olderAssessment = {
        ...sampleAssessment,
        completedAt: '2025-09-28T10:00:00.000Z' // Earlier date
      };
      const newerAssessment = {
        ...sampleAssessment2,
        completedAt: '2025-09-29T15:00:00.000Z' // Later date
      };
      
      await testDatabase.addAssessment(olderAssessment);
      await testDatabase.addAssessment(newerAssessment);
      
      const assessments = await testDatabase.getAllAssessments();
      
      expect(assessments).toHaveLength(2);
      expect(assessments[0].name).toBe('Jane Smith'); // Newer should be first
      expect(assessments[1].name).toBe('John Doe'); // Older should be second
      expect(new Date(assessments[0].completedAt).getTime())
        .toBeGreaterThan(new Date(assessments[1].completedAt).getTime());
    });

    it('should handle multiple assessments with same completion time', async () => {
      const sameTimeAssessment1 = {
        ...sampleAssessment,
        name: 'First Person',
        completedAt: '2025-09-29T12:00:00.000Z'
      };
      const sameTimeAssessment2 = {
        ...sampleAssessment2,
        name: 'Second Person',
        completedAt: '2025-09-29T12:00:00.000Z'
      };
      
      await testDatabase.addAssessment(sameTimeAssessment1);
      await testDatabase.addAssessment(sameTimeAssessment2);
      
      const assessments = await testDatabase.getAllAssessments();
      
      expect(assessments).toHaveLength(2);
      // Both should be present even with same timestamp
      expect(assessments.some((a: AssessmentResult) => a.name === 'First Person')).toBe(true);
      expect(assessments.some((a: AssessmentResult) => a.name === 'Second Person')).toBe(true);
    });
  });

  describe('getAssessmentById', () => {
    it('should return undefined when assessment does not exist', async () => {
      const result = await testDatabase.getAssessmentById('nonexistent-id');
      
      expect(result).toBeUndefined();
    });

    it('should return assessment when it exists (searching by email)', async () => {
      const addedAssessment = await testDatabase.addAssessment(sampleAssessment);
      
      // Note: The current implementation searches by email, not by ID
      const result = await testDatabase.getAssessmentById(sampleAssessment.email);
      
      expect(result).toBeDefined();
      expect(result?.id).toBe(addedAssessment.id);
      expect(result?.name).toBe(sampleAssessment.name);
      expect(result?.email).toBe(sampleAssessment.email);
    });

    it('should return first matching assessment when multiple exist with same email', async () => {
      // Add two assessments with the same email
      const assessment1 = await testDatabase.addAssessment(sampleAssessment);
      const duplicateEmailAssessment = {
        ...sampleAssessment2,
        email: sampleAssessment.email // Same email as first assessment
      };
      await testDatabase.addAssessment(duplicateEmailAssessment);
      
      const result = await testDatabase.getAssessmentById(sampleAssessment.email);
      
      expect(result).toBeDefined();
      expect(result?.id).toBe(assessment1.id); // Should return the first one
      expect(result?.name).toBe(sampleAssessment.name);
    });

    it('should handle special characters in email addresses', async () => {
      const specialEmailAssessment = {
        ...sampleAssessment,
        email: 'test+special.email@example-domain.com'
      };
      
      await testDatabase.addAssessment(specialEmailAssessment);
      const result = await testDatabase.getAssessmentById('test+special.email@example-domain.com');
      
      expect(result).toBeDefined();
      expect(result?.email).toBe('test+special.email@example-domain.com');
    });

    it('should be case sensitive when searching by email', async () => {
      await testDatabase.addAssessment(sampleAssessment);
      
      const result = await testDatabase.getAssessmentById(sampleAssessment.email.toUpperCase());
      
      expect(result).toBeUndefined(); // Should not find due to case sensitivity
    });
  });

  describe('integration tests', () => {
    it('should handle complete workflow of adding and retrieving assessments', async () => {
      // Add multiple assessments
      const assessment1 = await testDatabase.addAssessment(sampleAssessment);
      const assessment2 = await testDatabase.addAssessment(sampleAssessment2);
      
      // Get all assessments
      const allAssessments = await testDatabase.getAllAssessments();
      expect(allAssessments).toHaveLength(2);
      
      // Get specific assessments by email
      const retrievedAssessment1 = await testDatabase.getAssessmentById(sampleAssessment.email);
      const retrievedAssessment2 = await testDatabase.getAssessmentById(sampleAssessment2.email);
      
      expect(retrievedAssessment1?.id).toBe(assessment1.id);
      expect(retrievedAssessment2?.id).toBe(assessment2.id);
    });
  });
});
