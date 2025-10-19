'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { collection, doc } from 'firebase/firestore';
import { useFirestore, useUser, addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import type { Project } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const projectFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Project name must be at least 2 characters.',
  }),
  description: z.string().optional(),
  color: z.string(),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

const colorPalette = [
  'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 
  'bg-teal-500', 'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500'
];

type ProjectDialogProps = {
  project?: Project;
  children: React.ReactNode;
};

export function ProjectDialog({ project, children }: ProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: '',
      description: '',
      color: colorPalette[0],
    },
  });

  useEffect(() => {
    if (project && open) {
      form.reset({
        name: project.name,
        description: project.description,
        color: project.color,
      });
    } else if (!project && open) {
      form.reset({
        name: '',
        description: '',
        color: colorPalette[Math.floor(Math.random() * colorPalette.length)]
      });
    }
  }, [project, open, form]);

  const onSubmit = async (data: ProjectFormValues) => {
    if (!user) return;

    try {
      if (project) {
        // Update existing project
        const projectRef = doc(firestore, 'users', user.uid, 'projects', project.id);
        setDocumentNonBlocking(projectRef, data, { merge: true });
        toast({ title: 'Project updated successfully.' });
      } else {
        // Create new project
        const projectsRef = collection(firestore, 'users', user.uid, 'projects');
        await addDocumentNonBlocking(projectsRef, data);
        toast({ title: 'Project created successfully.' });
      }
      setOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'An error occurred.',
        description: (error as Error).message,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{project ? 'Edit Project' : 'Create Project'}</DialogTitle>
          <DialogDescription>
            {project ? 'Update the details of your project.' : 'Add a new project to track your time against.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Website Redesign" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="(Optional) A brief description of the project." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      {colorPalette.map((color) => (
                        <button
                          type="button"
                          key={color}
                          className={cn(
                            'w-8 h-8 rounded-full border-2',
                            color,
                            field.value === color ? 'border-primary' : 'border-transparent'
                          )}
                          onClick={() => field.onChange(color)}
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : 'Save Project'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
