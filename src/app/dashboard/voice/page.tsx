'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { personalizedVoiceStyleLearning } from '@/ai/flows/personalized-voice-style-learning';
import { useGhostwriterState } from '@/hooks/use-ghostwriter-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2 } from 'lucide-react';

const formSchema = z.object({
  content: z.string().min(200, {
    message: "Please provide at least 200 characters of sample text for an effective analysis.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function VoicePage() {
  const { voiceProfile, setVoiceProfile, isInitialized } = useGhostwriterState();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    // Do not clear the old profile until the new one is successfully generated
    // setVoiceProfile(null); 
    try {
      const result = await personalizedVoiceStyleLearning({ content: data.content });
      setVoiceProfile(result.voiceProfile);
      toast({
        title: "Voice Profile Updated!",
        description: "Your unique writing style has been analyzed and saved.",
      });
    } catch (error) {
      console.error("Error learning voice profile:", error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "There was an error analyzing your text. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isInitialized) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Define Your Voice</CardTitle>
          <CardDescription>
            Paste a sample of your writing below (the more, the better). Our AI will analyze it to learn your unique tone and style.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Writing Sample</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste your blog posts, articles, or any other text here..."
                        className="min-h-[250px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="font-headline">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2" />
                    Learn My Style
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {voiceProfile && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Your Current Voice Profile</CardTitle>
            <CardDescription>This is how our AI understands your writing style. This profile will be used to generate content.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/90 whitespace-pre-wrap">{voiceProfile}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
