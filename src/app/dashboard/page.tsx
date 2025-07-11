'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { contentDrafting } from '@/ai/flows/content-drafting';
import { useGhostwriterState } from '@/hooks/use-ghostwriter-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, PenSquare, Terminal, Download, Save } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  topic: z.string().min(5, { message: "Please provide a more descriptive topic." }),
  format: z.string({ required_error: "Please select a format." }),
});

type FormValues = z.infer<typeof formSchema>;

export default function DraftingPage() {
  const { voiceProfile, isInitialized, addDraft } = useGhostwriterState();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
      format: '',
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!voiceProfile) {
      toast({
        variant: "destructive",
        title: "Voice Profile Missing",
        description: "Please define your voice profile first.",
      });
      return;
    }

    setIsLoading(true);
    setDraft(null);
    try {
      const result = await contentDrafting({
        voiceProfile: voiceProfile,
        topic: data.topic,
        format: data.format,
      });
      setDraft(result.draftContent);
    } catch (error) {
      console.error("Error drafting content:", error);
      toast({
        variant: "destructive",
        title: "Drafting Failed",
        description: "There was an error generating your draft. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (draft && form.getValues("topic") && form.getValues("format")) {
      addDraft({
        content: draft,
        topic: form.getValues("topic"),
        format: form.getValues("format"),
      });
      toast({
        title: "Draft Saved!",
        description: "You can view your saved drafts on the 'My Drafts' page."
      });
    }
  };

  const handleDownload = () => {
    if (draft) {
      const blob = new Blob([draft], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${form.getValues('topic').replace(/\s+/g, '_')}_draft.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };
  
  if (!isInitialized) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  if (!voiceProfile) {
    return (
       <Alert>
        <Terminal className="h-4 w-4" />
        <AlertTitle className="font-headline">Voice Profile Not Found</AlertTitle>
        <AlertDescription>
          You need to define your voice profile before you can generate content.
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
          <CardTitle className="font-headline">Create a New Draft</CardTitle>
          <CardDescription>
            Tell us your topic and desired format. We'll generate a draft in your unique voice.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="topic" render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., The impact of AI on creative writing" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="format" render={({ field }) => (
                <FormItem>
                  <FormLabel>Content Format</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a format..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Tweet">Tweet</SelectItem>
                      <SelectItem value="LinkedIn Post">LinkedIn Post</SelectItem>
                      <SelectItem value="Blog Post Outline">Blog Post Outline</SelectItem>
                      <SelectItem value="Short-form Blog Post">Short-form Blog Post</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" disabled={isLoading} className="font-headline">
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><PenSquare className="mr-2" /> Generate Draft</>}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {isLoading && <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}

      {draft && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Generated Draft</CardTitle>
            <CardDescription>Here's the draft we generated for you. Feel free to edit it below.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea className="min-h-[300px] text-base" value={draft} onChange={(e) => setDraft(e.target.value)} />
          </CardContent>
          <CardFooter className="gap-2">
            <Button onClick={handleSave} className="font-headline"><Save className="mr-2"/> Save Draft</Button>
            <Button onClick={handleDownload} variant="outline" className="font-headline"><Download className="mr-2"/> Download .txt</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
