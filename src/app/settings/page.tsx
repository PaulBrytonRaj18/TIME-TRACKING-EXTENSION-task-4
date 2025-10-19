'use client';

import { useMemo } from 'react';
import { doc } from 'firebase/firestore';
import { useDoc, useFirestore, useUser } from '@/firebase';
import { AppHeader } from '@/components/layout/app-header';
import { SettingsForm } from '@/components/settings/settings-form';
import type { UserSettings } from '@/lib/types';

export default function SettingsPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const settingsDocRef = useMemo(() => {
    if (!user) return null;
    // Assuming a single settings document per user with a known ID 'user-settings'
    return doc(firestore, 'users', user.uid, 'settings', 'user-settings');
  }, [user, firestore]);

  const { data: settings, isLoading } = useDoc<UserSettings>(settingsDocRef);
  
  return (
    <div className="flex flex-col h-full">
      <AppHeader title="Settings" />
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-2xl mx-auto">
          <SettingsForm settings={settings} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
