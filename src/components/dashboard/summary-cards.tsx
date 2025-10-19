'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, DollarSign, BarChart, Hourglass } from 'lucide-react';
import type { TimeEntry } from "@/lib/types";
import { useMemo } from "react";
import { formatDuration, intervalToDuration } from "date-fns";

type SummaryCardsProps = {
  entries: TimeEntry[] | null;
  isLoading: boolean;
};

const BILLABLE_RATE = 50; // Example billable rate

export function SummaryCards({ entries, isLoading }: SummaryCardsProps) {
  const summaryData = useMemo(() => {
    if (!entries) {
      return {
        totalDuration: 0,
        billableDuration: 0,
        billableAmount: 0,
        topProject: 'N/A',
        topProjectDuration: 0,
      };
    }
    
    const now = Date.now();
    const totalDuration = entries.reduce((acc, entry) => {
      const endTime = entry.endTime ?? now;
      return acc + (endTime - entry.startTime);
    }, 0);

    const billableDuration = entries
      .filter((entry) => entry.isBillable)
      .reduce((acc, entry) => {
        const endTime = entry.endTime ?? now;
        return acc + (endTime - entry.startTime);
      }, 0);

    const billableAmount = (billableDuration / (1000 * 3600)) * BILLABLE_RATE;

    const projectDurations: { [key: string]: number } = {};
    entries.forEach(entry => {
      if (entry.project) {
        if (!projectDurations[entry.project.name]) {
          projectDurations[entry.project.name] = 0;
        }
        const endTime = entry.endTime ?? now;
        projectDurations[entry.project.name] += (endTime - entry.startTime);
      }
    });

    let topProject = 'N/A';
    let topProjectDuration = 0;
    if (Object.keys(projectDurations).length > 0) {
       [topProject, topProjectDuration] = Object.entries(projectDurations).reduce((top, current) => current[1] > top[1] ? current : top);
    }

    return { totalDuration, billableDuration, billableAmount, topProject, topProjectDuration };
  }, [entries]);

  const formatMs = (ms: number) => {
    if (ms === 0) return "0m";
    const duration = intervalToDuration({ start: 0, end: ms });
    return formatDuration(duration, {
      format: ['hours', 'minutes'],
      zero: false,
      delimiter: ' ',
      locale: {
        formatDistance: (token, count) => ({
          xHours: `${count}h`,
          xMinutes: `${count}m`,
        }[token] || ''),
      },
    });
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader><Skeleton className="h-4 w-3/4" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /><Skeleton className="h-3 w-1/4 mt-2" /></CardContent></Card>
        <Card><CardHeader><Skeleton className="h-4 w-3/4" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /><Skeleton className="h-3 w-1/4 mt-2" /></CardContent></Card>
        <Card><CardHeader><Skeleton className="h-4 w-3/4" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /><Skeleton className="h-3 w-1/4 mt-2" /></CardContent></Card>
        <Card><CardHeader><Skeleton className="h-4 w-3/4" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /><Skeleton className="h-3 w-1/4 mt-2" /></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Time Today</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatMs(summaryData.totalDuration)}</div>
          <p className="text-xs text-muted-foreground">Across all projects</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Billable Hours</CardTitle>
          <Hourglass className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatMs(summaryData.billableDuration)}</div>
          <p className="text-xs text-muted-foreground">
            {summaryData.totalDuration > 0 ? `${Math.round((summaryData.billableDuration / summaryData.totalDuration) * 100)}% of total` : 'No time tracked'}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Billable Amount</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {summaryData.billableAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
          </div>
          <p className="text-xs text-muted-foreground">Based on ${BILLABLE_RATE}/hour rate</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Project Today</CardTitle>
          <BarChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold truncate">{summaryData.topProject}</div>
          <p className="text-xs text-muted-foreground">{formatMs(summaryData.topProjectDuration)} logged</p>
        </CardContent>
      </Card>
    </div>
  );
}