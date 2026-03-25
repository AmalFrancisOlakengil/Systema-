export interface ExpLevels {
  iq: number;
  eq: number;
  strength: number;
  dexterity: number;
  agility: number;
  flexibility: number;
  stamina: number;
}

export interface DailyTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  dateCreated: string; // ISO string
}

export interface UserProfile {
  name: string;
  bio: string;
  exp: ExpLevels;
  lastWorkTimestamp: string | null; // ISO string
  dailyTasks: DailyTask[];
  lastTaskRefreshDate: string | null; // ISO string (just the date part)
}
