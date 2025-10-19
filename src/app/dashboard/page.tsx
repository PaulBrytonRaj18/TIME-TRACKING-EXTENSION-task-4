'use client';

import { useMemo } from 'react';
import { collection, query, where } from 'firebase/firestore';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { AppHeader } from '@/components/layout/app-header';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { WeeklyTrendChart } from '@/components/dashboard/weekly-trend-chart';
import { TimeByProjectChart } from '@/components/dashboard/time-by-project-chart';
import { TimeEntry, Project } from '@/lib/types';
import { startOfToday, endOfToday, startOfWeek, endOfWeek } from 'date-fns';

export default function DashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const timeEntriesQuery = useMemo(() => {
    if (!user) return null;
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    return query(
      collection(firestore, 'users', user.uid, 'timeEntries'),
      where('startTime', '>=', weekStart.getTime()),
      where('startTime', '<=', weekEnd.getTime())
    );
  }, [user, firestore]);

  const projectsQuery = useMemo(() => {
    if (!user) return null;
    return collection(firestore, 'users', user.uid, 'projects');
  }, [user, firestore]);

  const { data: timeEntries, isLoading: isLoadingEntries } = useCollection<TimeEntry>(timeEntriesQuery);
  const { data: projects, isLoading: isLoadingProjects } = useCollection<Project>(projectsQuery);

  const todayEntries = useMemo(() => {
    if (!timeEntries) return [];
    const todayStartMs = startOfToday().getTime();
    const todayEndMs = endOfToday().getTime();
    return timeEntries.filter(
      (entry) => entry.startTime >= todayStartMs && entry.startTime <= todayEndMs
    );
  }, [timeEntries]);

  const isLoading = isLoadingEntries || isLoadingProjects;

  return (
    <div className="flex flex-col h-full">
      <AppHeader title="Dashboard" />
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <SummaryCards entries={todayEntries} isLoading={isLoading} />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <WeeklyTrendChart entries={timeEntries} isLoading={isLoading} />
          <TimeByProjectChart entries={todayEntries} projects={projects} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
