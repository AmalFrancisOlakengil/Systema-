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

  async generateDailyTasks(bio: string, currentExp: ExpLevels, count: number, vibe?: string): Promise<DailyTask[]> {
    const prompt = `
      The user's bio is: "${bio}".
      Their current EXP stats are: ${JSON.stringify(currentExp)}.
      ${vibe ? `The user's current vibe/context is: "${vibe}". Generate tasks that fit this vibe.` : ''}
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

  async evolveBio(currentBio: string, completedTasks: string[], currentExp: ExpLevels): Promise<string> {
    const prompt = `
      The user's current bio is: "${currentBio}".
      In the last week, they completed these tasks: ${JSON.stringify(completedTasks)}.
      Their current stats are: ${JSON.stringify(currentExp)}.
      Suggest a "Bio Evolution" - a slightly updated version of their bio that reflects their growth, 
      making their journey feel more specialized or advanced. Keep it concise (1-2 sentences).
      Return ONLY the new bio text.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text().trim();
    } catch (e) {
      console.error('Failed to evolve bio', e);
      return currentBio;
    }
  }

  async rerollTask(bio: string, currentExp: ExpLevels, vibe: string): Promise<DailyTask | null> {
    const prompt = `
      The user wants to reroll a daily task. 
      Their bio: "${bio}".
      Current stats: ${JSON.stringify(currentExp)}.
      User's current vibe/context: "${vibe}".
      Generate ONE new personalized daily task (title and description) that fits this vibe.
      Return the result strictly as a JSON object.
      Example: {"title": "Indoor Yoga", "description": "A calm flexibility session for a rainy day"}
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      const jsonStr = text.match(/\{.*\}/s)?.[0] || text;
      const task = JSON.parse(jsonStr);
      return {
        ...task,
        id: Math.random().toString(36).substring(7),
        completed: false,
        dateCreated: new Date().toISOString(),
      };
    } catch (e) {
      console.error('Failed to reroll task', e);
      return null;
    }
  }
}
