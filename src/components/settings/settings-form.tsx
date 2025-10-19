'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { doc } from 'firebase/firestore';
import { useFirestore, useUser, setDocumentNonBlocking } from '@/firebase';
import type { UserSettings } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';
import { useTheme } from '@/components/theme-provider';

const settingsFormSchema = z.object({
  pomodoroDuration: z.coerce.number().min(5, "Must be at least 5 minutes").max(60, "Must be 60 minutes or less"),
  reminderEnabled: z.boolean(),
  theme: z.enum(['light', 'dark', 'system']),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

type SettingsFormProps = {
  settings: UserSettings | null;
  isLoading: boolean;
};

export function SettingsForm({ settings, isLoading }: SettingsFormProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { setTheme } = useTheme();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      pomodoroDuration: 25,
      reminderEnabled: false,
      theme: 'dark',
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset(settings);
    }
  }, [settings, form]);
  
  const onSubmit = (data: SettingsFormValues) => {
    if (!user) return;

    const settingsRef = doc(firestore, 'users', user.uid, 'settings', 'user-settings');
    setDocumentNonBlocking(settingsRef, data, { merge: true });
    
    toast({
      title: "Settings saved",
      description: "Your new settings have been saved successfully.",
    });

    if (data.theme) {
      setTheme(data.theme);
    }
  };

  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-8">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-24" />
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Settings</CardTitle>
        <CardDescription>Manage your application preferences.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="theme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Theme</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-4">
                        <Button type="button" variant={field.value === 'light' ? 'secondary' : 'ghost'} onClick={() => { field.onChange('light'); setTheme('light'); }}>Light</Button>
                        <Button type="button" variant={field.value === 'dark' ? 'secondary' : 'ghost'} onClick={() => { field.onChange('dark'); setTheme('dark'); }}>Dark</Button>
                        <Button type="button" variant={field.value === 'system' ? 'secondary' : 'ghost'} onClick={() => { field.onChange('system'); setTheme('system'); }}>System</Button>
                    </div>
                  </FormControl>
                   <FormDescription>
                    Select the theme for the application.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pomodoroDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pomodoro Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                   <FormDescription>
                    Set the length of your pomodoro focus sessions.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reminderEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Enable Reminders</FormLabel>
                    <FormDescription>
                      Get reminded to take breaks or track your time.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" disabled={form.formState.isSubmitting}>Save Settings</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
