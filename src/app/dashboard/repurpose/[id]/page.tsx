'use client';

import { useEffect, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { contentRepurposing } from '@/ai/flows/content-repurposing';
import { useGhostwriterState } from '@/hooks/use-ghostwriter-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Shuffle, Terminal, Save } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter, useParams } from 'next/navigation';
import { Label } from '@/components/ui/label';

const formSchema = z.object({
  targetFormat: z.string({ required_error: "Please select a target format." }),
});

type FormValues = z.infer<typeof formSchema>;

export default function RepurposePage() {
  const params = useParams();
  const id = params.id as string;
  const { drafts, voiceProfile, isInitialized, addDraft } = useGhostwriterState();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [repurposedContent, setRepurposedContent] = useState<string | null>(null);
  
  const originalDraft = isInitialized ? drafts.find(d => d.id === id) : undefined;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      targetFormat: '',
    },
  });

  useEffect(() => {
    if (isInitialized && !originalDraft) {
      toast({
        variant: 'destructive',
        title: 'Draft not found',
        description: 'The draft you are trying to repurpose could not be found.',
      });
      router.push('/dashboard/drafts');
    }
  }, [isInitialized, originalDraft, router, toast]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!voiceProfile || !originalDraft) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Your voice profile or the original draft is missing.",
      });
      return;
    }

    setIsLoading(true);
    setRepurposedContent(null);
    try {
      const result = await contentRepurposing({
        voiceProfile: voiceProfile,
        sourceContent: originalDraft.content,
        targetFormat: data.targetFormat,
      });
      setRepurposedContent(result.repurposedContent);
    } catch (error) {
      console.error("Error repurposing content:", error);
      toast({
        variant: "destructive",
        title: "Repurposing Failed",
        description: "There was an error generating the new version. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (repurposedContent && originalDraft) {
      addDraft({
        content: repurposedContent,
        topic: `Repurposed: ${originalDraft.topic}`,
        format: form.getValues("targetFormat"),
      });
      toast({
        title: "Draft Saved!",
        description: "You can view your new draft on the 'My Drafts' page."
      });
    }
  };

  if (!isInitialized || !originalDraft) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-24 w-full" />
              </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-40" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!voiceProfile) {
    return (
       <Alert>
        <Terminal className="h-4 w-4" />
        <AlertTitle className="font-headline">Voice Profile Not Found</AlertTitle>
        <AlertDescription>
          You need to define your voice profile before you can repurpose content.
          <Button asChild variant="link" className="p-0 h-auto ml-1">
            <Link href="/dashboard/voice">Go to Voice Profile page</Link>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Left Column: Original and Form */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Repurpose Draft</CardTitle>
            <CardDescription>
              Select a new format, and we'll adapt this draft while keeping your unique voice.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label>Original Draft: {originalDraft.topic}</Label>
                  <Textarea
                    readOnly
                    value={originalDraft.content}
                    className="min-h-[200px] bg-muted/50"
                  />
                </div>
                <FormField control={form.control} name="targetFormat" render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Format</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a new format..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Tweet Thread (3-5 tweets)">Tweet Thread (3-5 tweets)</SelectItem>
                        <SelectItem value="LinkedIn Post">LinkedIn Post</SelectItem>
                        <SelectItem value="Email Newsletter Blurb">Email Newsletter Blurb</SelectItem>
                        <SelectItem value="Instagram Post Caption">Instagram Post Caption</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" disabled={isLoading} className="font-headline">
                  {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Repurposing...</> : <><Shuffle className="mr-2" /> Repurpose Content</>}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      
      {/* Right Column: Result */}
      <div className="space-y-6">
        {isLoading && (
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
                 <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-28" />
            </CardFooter>
          </Card>
        )}

        {repurposedContent && !isLoading && (
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Repurposed Content</CardTitle>
              <CardDescription>Here's the repurposed version. You can edit it below or save it as a new draft.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                className="min-h-[300px] text-base"
                value={repurposedContent}
                onChange={(e) => setRepurposedContent(e.target.value)}
              />
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} className="font-headline"><Save className="mr-2" /> Save as New Draft</Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
