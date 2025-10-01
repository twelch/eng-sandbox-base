import { join } from 'path';
import { randomUUID } from 'crypto';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

export interface AssessmentResult {
  id: string;
  name: string;
  email: string;
  forestlandAmount: number;
  forestlandUnit: string;
  treeSpecies: string[];
  completedAt: string;
  processingTime: number;
}

interface DatabaseSchema {
  assessments: AssessmentResult[];
}

export class Database {
  private db: Low<DatabaseSchema> | null = null;
  private dbPath: string;

  constructor(dbPath?: string) {
    this.dbPath = dbPath || join(process.cwd(), 'db', 'db.json');
  }

  /**
   * Loads the database from the JSON file.
   * @returns The lowdb instance with the database data.
   */
  async load() {
    if (this.db) return this.db;

    const adapter = new JSONFile<DatabaseSchema>(this.dbPath);
    this.db = new Low<DatabaseSchema>(adapter, { assessments: [] });

    await this.db.read();

    // Initialize with default data if empty
    if (!this.db.data) {
      this.db.data = { assessments: [] };
      await this.db.write();
    }

    return this.db;
  }

  /**
   * Adds a new assessment to the database.
   * @param assessment - The assessment data without an ID.
   * @returns The newly added assessment with a generated ID.
   */
  async addAssessment(assessment: Omit<AssessmentResult, 'id'>) {
    const db = await this.load();
    
    const newAssessment: AssessmentResult = {
      ...assessment,
      id: randomUUID(),
    };

    db.data.assessments.push(newAssessment);
    await db.write();

    return newAssessment;
  }

  /**
   * Retrieves all assessments.
   * @returns An array of all assessment results.
   */
  async getAllAssessments(): Promise<AssessmentResult[]> {
    const db = await this.load();
    return db.data.assessments.sort((a, b) => 
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );
  }

  /**
   * Retrieves an assessment by its unique ID.
   * @param id - The unique identifier of the assessment.
   * @returns The assessment with the matching ID, or undefined if not found.
   */
  async getAssessmentById(id: string): Promise<AssessmentResult | undefined> {
    const db = await this.load();
    return db.data.assessments.find(assessment => assessment.email === id);
  }
}

// Export a singleton instance
export const database = new Database();
