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

  async initialize() {
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
    return db.data.assessments.find(assessment => assessment.id === id);
  }
}

// Export a singleton instance
export const database = new Database();
