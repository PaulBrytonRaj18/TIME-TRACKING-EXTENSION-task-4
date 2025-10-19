export type Project = {
  id: string;
  name: string;
  description?: string;
  color: string;
  userId: string;
};

export type Tag = {
  id:string;
  name: string;
  userId: string;
};

export type TimeEntry = {
  id: string;
  description: string;
  startTime: number;
  endTime: number | null;
  // duration is removed, it will be calculated on the fly
  projectId: string | null;
  project?: { // Denormalized from Project
    name: string;
    color: string;
  }
  tags: string[]; // array of tag IDs
  isBillable: boolean;
  userId: string;
};

export type UserSettings = {
    id: string;
    userId: string;
    theme: 'light' | 'dark' | 'system';
    pomodoroDuration: number;
    reminderEnabled: boolean;
}
