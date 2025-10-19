'use client';

import { useState } from 'react';
import { Clock, DollarSign, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { format, formatDuration, intervalToDuration } from 'date-fns';
import { doc } from 'firebase/firestore';

import { useFirestore, useUser, deleteDocumentNonBlocking } from '@/firebase';
import type { TimeEntry } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
// We will create this component later if needed, for now, we focus on delete.
// import { TimeEntryDialog } from './time-entry-dialog';


type TimeEntryCardProps = {
  entry: TimeEntry;
};

export function TimeEntryCard({ entry }: TimeEntryCardProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const now = Date.now();
  const endTime = entry.endTime ?? now;
  const durationMs = endTime - entry.startTime;

  const duration = intervalToDuration({ start: 0, end: durationMs });
  const formattedDuration = formatDuration(duration, {
    format: ['hours', 'minutes', 'seconds'],
    zero: false,
    delimiter: ' ',
    locale: {
      formatDistance: (token, count) => {
        return {
          xHours: `${count}h`,
          xMinutes: `${count}m`,
          xSeconds: `${count}s`,
        }[token] || '';
      },
    },
  }) || '0s';
  
  const handleDelete = () => {
    if (!user) return;
    const entryRef = doc(firestore, 'users', user.uid, 'timeEntries', entry.id);
    deleteDocumentNonBlocking(entryRef);
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <Card className={cn(entry.endTime === null && 'border-primary border-2')}>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 flex-1 min-w-0">
            <span className="font-medium flex-1 truncate" title={entry.description}>{entry.description || 'No description'}</span>
            
            <div className="flex items-center gap-4 text-muted-foreground">
              {entry.project && (
                <div className="flex items-center gap-2">
                  <span className={cn('w-2.5 h-2.5 rounded-full', entry.project.color)} />
                  <span className="text-sm">{entry.project.name}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                {/* Placeholder for tags if they are implemented as a separate collection */}
              </div>

              {entry.isBillable && <DollarSign className="w-4 h-4 text-green-500" />}
            </div>
          </div>

          <div className="flex items-center gap-4 ml-4">
            <div className="text-sm text-muted-foreground hidden md:flex items-center gap-2">
              <span>{format(entry.startTime, 'HH:mm')}</span>
              <span>-</span>
              <span>{entry.endTime ? format(entry.endTime, 'HH:mm') : 'Now'}</span>
            </div>
            <span className="font-bold text-base w-24 text-right">{formattedDuration}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this time entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* 
        The TimeEntryDialog would be similar to ProjectDialog. 
        It would be a form to edit the time entry details.
        For now, we have just the delete functionality.
        
        {isEditDialogOpen && (
          <TimeEntryDialog
            entry={entry}
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
          />
        )}
      */}
    </>
  );
}
