'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateContentIdeas } from '@/ai/flows/content-idea-generation';
import { useGhostwriterState } from '@/hooks/use-ghostwriter-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Lightbulb, Terminal } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  trendingTopics: z.string().min(3, {
    message: "Please enter a topic.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function IdeasPage() {
  const { voiceProfile, isInitialized } = useGhostwriterState();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [ideas, setIdeas] = useState<string[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      trendingTopics: "",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!voiceProfile) {
      toast({
        variant: "destructive",
        title: "Voice Profile Missing",
        description: "Please define your voice profile first before generating ideas.",
      });
      return;
    }

    setIsLoading(true);
    setIdeas([]);
    try {
      const result = await generateContentIdeas({
        userVoiceProfile: voiceProfile,
        trendingTopics: data.trendingTopics,
      });
      setIdeas(result.contentIdeas);
    } catch (error) {
      console.error("Error generating ideas:", error);
      toast({
        variant: "destructive",
        title: "Idea Generation Failed",
        description: "There was an error generating ideas. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isInitialized) {
    return (
       <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-36" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!voiceProfile) {
    return (
       <Alert>
        <Terminal className="h-4 w-4" />
        <AlertTitle className="font-headline">Voice Profile Not Found</AlertTitle>
        <AlertDescription>
          You need to define your voice profile before you can generate content ideas.
          <Button asChild variant="link" className="p-0 h-auto ml-1">
            <Link href="/dashboard/voice">Go to Voice Profile page</Link>
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Generate Content Ideas</CardTitle>
          <CardDescription>
            Enter some topics you're interested in. We'll combine them with your voice profile to brainstorm content ideas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="trendingTopics"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topics or Keywords</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., AI in marketing, future of remote work, ..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="font-headline">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Lightbulb className="mr-2" />
                    Generate Ideas
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && 
        <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-5/6" />
                  </CardContent>
                </Card>
              ))}
            </div>
        </div>
      }

      {ideas.length > 0 && !isLoading && (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold font-headline">Your Generated Ideas</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ideas.map((idea, index) => (
                <Card key={index} className="flex">
                    <CardContent className="p-6 flex items-center">
                        <p className="text-foreground">{idea}</p>
                    </CardContent>
                </Card>
            ))}
            </div>
        </div>
      )}
    </div>
  );
}
