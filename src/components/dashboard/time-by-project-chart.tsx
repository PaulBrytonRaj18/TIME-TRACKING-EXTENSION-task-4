'use client';

import * as React from 'react';
import { Pie, PieChart } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { TimeEntry, Project } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

type TimeByProjectChartProps = {
  entries: TimeEntry[] | null;
  projects: Project[] | null;
  isLoading: boolean;
};

export function TimeByProjectChart({ entries, projects, isLoading }: TimeByProjectChartProps) {
  const chartData = React.useMemo(() => {
    if (!entries || !projects) return [];

    const projectDurations: { [key: string]: number } = {};
    const now = Date.now();

    entries.forEach(entry => {
      const projectId = entry.projectId;
      if (projectId) {
        if (!projectDurations[projectId]) {
          projectDurations[projectId] = 0;
        }
        const endTime = entry.endTime ?? now;
        projectDurations[projectId] += (endTime - entry.startTime);
      }
    });

    return Object.entries(projectDurations).map(([projectId, duration]) => {
      const project = projects.find(p => p.id === projectId);
      return {
        project: project?.name || 'Unknown',
        hours: parseFloat((duration / (1000 * 3600)).toFixed(2)),
        fill: project?.color || 'hsl(var(--muted))',
      };
    });
  }, [entries, projects]);
  
  const chartConfig = React.useMemo(() => {
    const config: any = {
        hours: {
            label: "Hours",
        },
    };
    chartData.forEach((item) => {
        config[item.project] = {
            label: item.project,
            color: item.fill,
        };
    });
    return config;
  }, [chartData]);


  if (isLoading) {
    return (
        <Card className="flex flex-col lg:col-span-3">
            <CardHeader className="items-center pb-0">
                <CardTitle>Time by Project</CardTitle>
                <CardDescription>Today's hours distribution</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0 flex items-center justify-center">
               <Skeleton className="h-[200px] w-[200px] rounded-full" />
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="flex flex-col lg:col-span-3">
      <CardHeader className="items-center pb-0">
        <CardTitle>Time by Project</CardTitle>
        <CardDescription>Today's hours distribution</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {chartData.length > 0 ? (
          <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Pie data={chartData} dataKey="hours" nameKey="project" innerRadius={60} strokeWidth={5} />
            </PieChart>
          </ChartContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
            <p>No time tracked for projects today.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}