'use client';

import { useMemo } from 'react';
import { collection } from 'firebase/firestore';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { AppHeader } from '@/components/layout/app-header';
import type { Project } from '@/lib/types';
import { ProjectList } from '@/components/projects/project-list';
import { ProjectDialog } from '@/components/projects/project-dialog';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function ProjectsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  
  const projectsQuery = useMemo(() => {
    if (!user) return null;
    return collection(firestore, 'users', user.uid, 'projects');
  }, [user, firestore]);

  const { data: projects, isLoading } = useCollection<Project>(projectsQuery);

  return (
    <div className="flex flex-col h-full">
      <AppHeader title="Projects" />
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-end mb-4">
            <ProjectDialog>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </ProjectDialog>
          </div>
          <ProjectList projects={projects} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
