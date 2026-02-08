
export enum SafetyStatus {
  SAFE = 'SAFE',
  WARNING = 'WARNING',
  BLOCKED = 'BLOCKED'
}

export interface Guideline {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export interface Violation {
  guidelineId: string;
  category: string;
  severity: 'low' | 'medium' | 'high';
  reason: string;
}

export interface ModerationResult {
  status: SafetyStatus;
  score: number; // 0-100, 100 is safest
  violations: Violation[];
}
