import { GoogleGenerativeAI } from '@google/generative-ai';
import { ExpLevels, DailyTask } from '../types/app';

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  async validateApiKey(): Promise<boolean> {
    try {
      const result = await this.model.generateContent('Hello');
      return !!result.response.text();
    } catch (e) {
      console.error('API Key validation failed', e);
      return false;
    }
  }

  async analyzeWork(work: string, bio: string): Promise<Partial<ExpLevels>> {
    const prompt = `
      The user has completed the following task: "${work}".
      The user's bio is: "${bio}".
      Based on this, assign experience points (EXP) in the following categories:
      - iq (mental effort, learning, problem-solving)
      - eq (emotional intelligence, social, empathy)
      - strength (physical power, lifting)
      - dexterity (fine motor skills, precision)
      - agility (speed, quickness)
      - flexibility (stretching, range of motion)
      - stamina (endurance, cardio)

      Assign a value between 0 and 50 for each category based on the task description.
      Return the result strictly as a JSON object.
      Example: {"iq": 10, "eq": 0, "strength": 5, "dexterity": 2, "agility": 0, "flexibility": 0, "stamina": 8}
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      const jsonStr = text.match(/\{.*\}/s)?.[0] || text;
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to analyze work', e);
      return {};
    }
  }

  async generateDailyTasks(bio: string, currentExp: ExpLevels, count: number): Promise<DailyTask[]> {
    const prompt = `
      The user's bio is: "${bio}".
      Their current EXP stats are: ${JSON.stringify(currentExp)}.
      Suggest ${count} personalized daily tasks to help them improve their stats.
      Each task should have a "title" and a short "description".
      Return the result strictly as a JSON array of objects.
      Example: [{"title": "Solve 3 Sudokus", "description": "Mental workout for IQ"}, {"title": "Jog for 15 mins", "description": "Boost your stamina"}]
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      const jsonStr = text.match(/\[.*\]/s)?.[0] || text;
      const tasks = JSON.parse(jsonStr);
      return tasks.map((t: any) => ({
        ...t,
        id: Math.random().toString(36).substring(7),
        completed: false,
        dateCreated: new Date().toISOString(),
      }));
    } catch (e) {
      console.error('Failed to generate daily tasks', e);
      return [];
    }
  }
}
