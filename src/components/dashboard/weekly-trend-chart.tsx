'use client';

import { Bar, BarChart, XAxis, YAxis, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { TimeEntry } from '@/lib/types';
import { useMemo } from 'react';
import { format, startOfWeek, eachDayOfInterval, endOfWeek } from 'date-fns';
import { Skeleton } from '../ui/skeleton';

type WeeklyTrendChartProps = {
  entries: TimeEntry[] | null;
  isLoading: boolean;
};

const chartConfig = {
  total: {
    label: 'Total Hours',
    color: 'hsl(var(--chart-1))',
  },
  billable: {
    label: 'Billable Hours',
    color: 'hsl(var(--chart-2))',
  },
};

export function WeeklyTrendChart({ entries, isLoading }: WeeklyTrendChartProps) {
  const chartData = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return weekDays.map(day => {
      const dayKey = format(day, 'yyyy-MM-dd');
      const dayEntries = entries?.filter(entry => format(new Date(entry.startTime), 'yyyy-MM-dd') === dayKey) || [];
      const nowMs = Date.now();

      const total = dayEntries.reduce((acc, entry) => {
        const endTime = entry.endTime ?? nowMs;
        return acc + (endTime - entry.startTime);
      }, 0) / (1000 * 3600);

      const billable = dayEntries.filter(e => e.isBillable).reduce((acc, entry) => {
        const endTime = entry.endTime ?? nowMs;
        return acc + (endTime - entry.startTime);
      }, 0) / (1000 * 3600);

      return {
        date: format(day, 'EEE'),
        total: parseFloat(total.toFixed(1)),
        billable: parseFloat(billable.toFixed(1)),
      };
    });
  }, [entries]);

  if (isLoading) {
    return (
        <Card className="lg:col-span-4">
            <CardHeader>
                <CardTitle>Weekly Summary</CardTitle>
                <CardDescription>Total and billable hours tracked this week.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <Skeleton className="h-[250px] w-full" />
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="lg:col-span-4">
      <CardHeader>
        <CardTitle>Weekly Summary</CardTitle>
        <CardDescription>Total and billable hours tracked this week.</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis tickFormatter={(value) => `${value}h`} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Legend />
            <Bar dataKey="total" fill="var(--color-total)" radius={4} />
            <Bar dataKey="billable" fill="var(--color-billable)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}