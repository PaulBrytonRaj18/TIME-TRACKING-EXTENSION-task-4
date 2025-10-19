'use client';

import { useMemo } from 'react';
import { AppHeader } from '@/components/layout/app-header';
import { Timer } from '@/components/timer/timer';
import { TimeEntryCard } from '@/components/timer/time-entry-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Timer as TimerIcon } from 'lucide-react';
import { useCollection, useUser, useFirestore } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import type { TimeEntry } from '@/lib/types';
import { startOfToday, endOfToday } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { user } = useUser();
  const firestore = useFirestore();
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const timeEntriesQuery = useMemo(() => {
    if (!user) return null;
    const todayStart = startOfToday();
    const todayEnd = endOfToday();

    return query(
      collection(firestore, 'users', user.uid, 'timeEntries'),
      where('startTime', '>=', todayStart.getTime()),
      where('startTime', '<=', todayEnd.getTime()),
      orderBy('startTime', 'desc')
    );
  }, [user, firestore]);

  const { data: timeEntries, isLoading } = useCollection<TimeEntry>(timeEntriesQuery);

  return (
    <div className="flex flex-col h-full">
      <AppHeader title="Time Tracker" />
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <Tabs defaultValue="timer" className="w-full max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="timer">
              <TimerIcon className="w-4 h-4 mr-2" />
              Manual
            </TabsTrigger>
            <TabsTrigger value="pomodoro">
              <Clock className="w-4 h-4 mr-2" />
              Pomodoro
            </TabsTrigger>
          </TabsList>
          <TabsContent value="timer">
            <Timer />
          </TabsContent>
          <TabsContent value="pomodoro">
            <div className="flex items-center justify-center text-muted-foreground p-8">
              Pomodoro timer coming soon.
            </div>
          </TabsContent>
        </Tabs>

        <div className="max-w-4xl mx-auto mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Today</h2>
            <span className="text-muted-foreground">{today}</span>
          </div>
          <div className="space-y-4">
            {isLoading && (
              <>
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </>
            )}
            {!isLoading && timeEntries?.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No time entries for today. Start the timer to begin tracking!
              </div>
            )}
            {timeEntries?.map((entry) => (
              <TimeEntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
