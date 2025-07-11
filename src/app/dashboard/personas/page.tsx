'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useGhostwriterState, type Persona } from '@/hooks/use-ghostwriter-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Users } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

const formSchema = z.object({
  name: z.string().min(3, { message: "Persona name must be at least 3 characters." }),
  description: z.string().min(20, { message: "Description must be detailed enough (min 20 characters)." }),
});

type FormValues = z.infer<typeof formSchema>;

export default function PersonasPage() {
  const { personas, addPersona, deletePersona, isInitialized } = useGhostwriterState();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    addPersona(data);
    toast({
      title: "Persona Added!",
      description: `The "${data.name}" persona has been saved.`,
    });
    form.reset();
  };

  if (!isInitialized) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-9 w-9 ml-auto" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Add New Persona</CardTitle>
            <CardDescription>
              Define a new target audience persona. Be as descriptive as possible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Persona Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Early-stage Startup Founder" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe their goals, challenges, demographics, and what they look for in content..."
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" className="font-headline w-full">
                  <PlusCircle className="mr-2" />
                  Add Persona
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Saved Personas</CardTitle>
            <CardDescription>
              These are the personas you can use to get feedback on your drafts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {personas.length > 0 ? (
                <ScrollArea className="h-[60vh]">
                    <div className="space-y-4 pr-6">
                        {personas.map(persona => (
                        <Card key={persona.id} className="bg-card-foreground/5">
                            <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-xl font-headline">{persona.name}</CardTitle>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive h-8 w-8 -mt-2 -mr-2">
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Delete persona</span>
                                    </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="font-headline">Delete {persona.name}?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                        This will permanently delete this persona. This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => deletePersona(persona.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                        Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                            </CardHeader>
                            <CardContent>
                            <p className="text-sm text-muted-foreground">{persona.description}</p>
                            </CardContent>
                        </Card>
                        ))}
                    </div>
                </ScrollArea>
            ) : (
              <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                <Users className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <p>You haven't defined any personas yet.</p>
                <p>Add one using the form to get started.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
