/**
 * Manages user-specific context, like skill level and preferences,
 * to enable adaptive UI components.
 */

export type UserSkillLevel = 'beginner' | 'intermediate' | 'expert';

export interface UserContextData {
  userId: string;
  skillLevel: UserSkillLevel;
  // AI's confidence in its last suggestion, from 0 to 1
  aiConfidence: number;
  preferences: {
    useGuidedMode: boolean;
  };
}

class UserContext {
  private context: UserContextData;

  constructor() {
    // In a real app, this would be loaded from user settings
    this.context = {
      userId: 'user_123_abc',
      skillLevel: 'beginner',
      aiConfidence: 1.0,
      preferences: {
        useGuidedMode: true,
      },
    };
  }

  get(): UserContextData {
    return this.context;
  }

  setSkillLevel(level: UserSkillLevel): void {
    this.context.skillLevel = level;
  }

  setAiConfidence(score: number): void {
    this.context.aiConfidence = Math.max(0, Math.min(1, score));
  }
}

export const userContext = new UserContext(); 