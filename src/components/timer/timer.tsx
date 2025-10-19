"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Play, Square, Tag, DollarSign } from 'lucide-react';
import { useTimer } from '@/hooks/use-timer';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { useUser, useFirestore, useCollection, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, where, orderBy, limit, serverTimestamp, doc } from 'firebase/firestore';
import type { Project, TimeEntry } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export function Timer() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const { time, isRunning, start, stop, reset } = useTimer();
  const [description, setDescription] = useState('');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [isBillable, setIsBillable] = useState(false);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);

  const projectsQuery = useMemo(() => {
    if (!user) return null;
    return collection(firestore, 'users', user.uid, 'projects');
  }, [user, firestore]);
  const { data: projects } = useCollection<Project>(projectsQuery);

  const activeEntryQuery = useMemo(() => {
    if (!user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'timeEntries'),
      where('endTime', '==', null),
      orderBy('startTime', 'desc'),
      limit(1)
    );
  }, [user, firestore]);

  const { data: activeEntries } = useCollection<TimeEntry>(activeEntryQuery);

  useEffect(() => {
    if (activeEntries && activeEntries.length > 0) {
      const activeEntry = activeEntries[0];
      const savedTime = Date.now() - activeEntry.startTime;
      reset(savedTime);
      start();
      setDescription(activeEntry.description);
      setSelectedProject(activeEntry.projectId);
      setIsBillable(activeEntry.isBillable);
      setActiveEntryId(activeEntry.id);
    } else {
      stop();
      reset(0);
      setActiveEntryId(null);
    }
  }, [activeEntries, start, stop, reset]);

  const handleStart = async () => {
    if (!user) {
      toast({ variant: 'destructive', title: 'You must be logged in to start the timer.' });
      return;
    }
    if (description.trim() === '') {
      toast({ variant: 'destructive', title: 'Please enter a description for your time entry.' });
      return;
    }

    const selectedProj = projects?.find(p => p.id === selectedProject);

    const newEntry: Omit<TimeEntry, 'id'> = {
      description,
      startTime: Date.now(),
      endTime: null,
      projectId: selectedProject,
      project: selectedProj ? { name: selectedProj.name, color: selectedProj.color } : undefined,
      tags: [],
      isBillable,
      userId: user.uid,
    };
    
    const timeEntriesRef = collection(firestore, 'users', user.uid, 'timeEntries');
    const docRef = await addDocumentNonBlocking(timeEntriesRef, newEntry);
    if(docRef) {
      setActiveEntryId(docRef.id);
      start();
    }
  };

  const handleStop = async () => {
    if (!user || !activeEntryId) return;

    const entryRef = doc(firestore, 'users', user.uid, 'timeEntries', activeEntryId);
    
    updateDocumentNonBlocking(entryRef, {
      endTime: Date.now(),
    });

    stop();
    reset(0);
    setDescription('');
    setSelectedProject(null);
    setIsBillable(false);
    setActiveEntryId(null);
  };
  
  const formattedTime = useMemo(() => {
    const totalSeconds = Math.floor(time / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, [time]);

  return (
    <Card className="shadow-md">
      <div className="flex flex-col md:flex-row items-center justify-between p-3 gap-4">
        <Input
          placeholder="What are you working on?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="flex-1 text-base"
          disabled={isRunning}
        />
        <div className="flex items-center gap-2 w-full md:w-auto">
           <Select onValueChange={setSelectedProject} value={selectedProject || ''} disabled={isRunning}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                {projects?.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    <div className="flex items-center">
                      <span className={cn('w-2 h-2 rounded-full mr-2', project.color)} />
                      {project.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

          <Button variant="outline" size="icon" disabled={isRunning}>
            <Tag className="h-4 w-4" />
          </Button>

          <Button 
            variant={isBillable ? "secondary" : "outline"} 
            size="icon" 
            onClick={() => setIsBillable(b => !b)}
            disabled={isRunning}
          >
            <DollarSign className={cn("h-4 w-4", isBillable && "text-green-500")} />
          </Button>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <span className="font-mono text-xl w-[90px] text-center">{formattedTime}</span>
          <Button
            size="lg"
            className={cn(
              'w-24 text-lg',
              isRunning
                ? 'bg-accent hover:bg-accent/90'
                : 'bg-primary hover:bg-primary/90'
            )}
            onClick={isRunning ? handleStop : handleStart}
          >
            {isRunning ? <Square className="mr-2 h-5 w-5 fill-white" /> : <Play className="mr-2 h-5 w-5 fill-white" />}
            {isRunning ? 'Stop' : 'Start'}
          </Button>
        </div>
      </div>
    </Card>
  );
}