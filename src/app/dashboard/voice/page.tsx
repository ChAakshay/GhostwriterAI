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
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2, UploadCloud } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  content: z.string().optional(),
  file: z
    .custom<FileList>()
    .refine(files => files === undefined || files.length === 0 || files[0].type === 'text/plain', 'Only .txt files are allowed.')
    .optional(),
})
.refine(data => data.content && data.content.length >= 200 || data.file && data.file.length > 0, {
  message: "Please either paste at least 200 characters of text or upload a .txt file.",
  path: ['content'], // Assign error to a field
});

type FormValues = z.infer<typeof formSchema>;

export default function VoicePage() {
  const { voiceProfile, setVoiceProfile, isInitialized } = useGhostwriterState();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);

    let textContent = data.content || "";

    if (data.file && data.file.length > 0) {
      const file = data.file[0];
      try {
        textContent = await file.text();
      } catch (error) {
        console.error('Error reading file:', error);
        toast({
          variant: 'destructive',
          title: 'File Read Error',
          description: 'Could not read the uploaded file. Please try again.',
        });
        setIsLoading(false);
        return;
      }
    }

    if (textContent.length < 200) {
        toast({
            variant: "destructive",
            title: "Insufficient Content",
            description: "The provided text or file content must be at least 200 characters long.",
        });
        setIsLoading(false);
        return;
    }

    try {
      const result = await personalizedVoiceStyleLearning({ content: textContent });
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

  const fileRef = form.register("file");

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
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-40 w-full" />
              </div>
               <Skeleton className="h-10 w-36" />
          </CardContent>
        </Card>
        <Card>
           <CardHeader>
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Define Your Voice</CardTitle>
          <CardDescription>
            Paste a sample of your writing below, or upload a .txt file. Our AI will analyze it to learn your unique tone and style.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
               <FormField
                control={form.control}
                name="file"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upload a .txt file</FormLabel>
                     <FormControl>
                        <div className="relative">
                            <Input 
                                type="file"
                                {...fileRef}
                                className="w-full h-20 border-dashed border-2 flex items-center justify-center p-4 cursor-pointer text-sm text-muted-foreground"
                                accept=".txt"
                                onChange={(e) => {
                                    field.onChange(e.target.files);
                                    if (e.target.files && e.target.files.length > 0) {
                                        setFileName(e.target.files[0].name);
                                    } else {
                                        setFileName('');
                                    }
                                }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-center text-muted-foreground">
                                    <UploadCloud className="mx-auto h-6 w-6 mb-1" />
                                    {fileName ? <span>{fileName}</span> : <span>Click or drag to upload file</span>}
                                </div>
                            </div>
                        </div>
                     </FormControl>
                  </FormItem>
                )}
              />

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or</span>
                </div>
             </div>

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paste Your Writing Sample</FormLabel>
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
