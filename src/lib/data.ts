import type { Project, Tag, TimeEntry } from './types';

// This file now only contains mock data for projects and tags,
// as time entries are fetched from Firebase.
// This can be removed entirely if projects and tags are also managed in Firebase.

export const projects: Project[] = [
  { id: 'proj-1', name: 'ChronoTrack UI', color: 'bg-blue-500', userId: 'mock-user' },
  { id: 'proj-2', name: 'Backend API', color: 'bg-green-500', userId: 'mock-user' },
  { id: 'proj-3', name: 'Marketing Campaign', color: 'bg-purple-500', userId: 'mock-user' },
];

export const tags: Tag[] = [
  { id: 'tag-1', name: 'development', userId: 'mock-user' },
  { id: 'tag-2', name: 'design', userId: 'mock-user' },
  { id: 'tag-3', name: 'meeting', userId: 'mock-user' },
  { id: 'tag-4', name: 'bugfix', userId: 'mock-user' },
];

// Time entries are now fetched from Firebase, so this mock data is no longer needed.
export const timeEntries: TimeEntry[] = [];
