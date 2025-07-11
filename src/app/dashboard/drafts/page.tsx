'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { contentRepurposing } from '@/ai/flows/content-repurposing';
import { personaFeedback, type PersonaFeedbackOutput } from '@/ai/flows/persona-feedback';
import { contentAnalysis, type ContentAnalysisOutput } from '@/ai/flows/content-analysis';
import { useGhostwriterState, type Draft, type Persona } from '@/hooks/use-ghostwriter-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, Send, Loader2, Save, MessageSquareQuote, WandSparkles, BarChartHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
} from "@/components/ui/alert-dialog"
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

const repurposeFormSchema = z.object({
  targetFormat: z.string({ required_error: "Please select a target format." }),
});
type RepurposeFormValues = z.infer<typeof repurposeFormSchema>;

const feedbackFormSchema = z.object({
  personaId: z.string({ required_error: "Please select a persona." }),
});
type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;

export default function DraftsPage() {
  const { drafts, deleteDraft, isInitialized, addDraft, voiceProfile, personas } = useGhostwriterState();
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);
  const [isRepurposeDialogOpen, setIsRepurposeDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [isAnalysisDialogOpen, setIsAnalysisDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [repurposedContent, setRepurposedContent] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<PersonaFeedbackOutput | null>(null);
  const [analysis, setAnalysis] = useState<ContentAnalysisOutput | null>(null);
  const { toast } = useToast();

  const repurposeForm = useForm<RepurposeFormValues>({
    resolver: zodResolver(repurposeFormSchema),
    defaultValues: { targetFormat: '' },
  });

  const feedbackForm = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: { personaId: '' },
  });
  
  const handleRepurposeClick = (draft: Draft, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDraft(draft);
    setRepurposedContent(null);
    repurposeForm.reset();
    setIsRepurposeDialogOpen(true);
  }

  const handleFeedbackClick = (draft: Draft, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDraft(draft);
    setFeedback(null);
    feedbackForm.reset();
    setIsFeedbackDialogOpen(true);
  }
  
  const handleAnalysisClick = async (draft: Draft, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDraft(draft);
    setAnalysis(null);
    setIsAnalysisDialogOpen(true);
    setIsLoading(true);
    try {
      const result = await contentAnalysis({ draftContent: draft.content });
      setAnalysis(result);
    } catch (error) {
      console.error("Error analyzing content:", error);
      toast({ variant: "destructive", title: "Analysis Failed", description: "There was an error analyzing the draft. Please try again." });
      setIsAnalysisDialogOpen(false);
    } finally {
      setIsLoading(false);
    }
  }

  const handleViewClick = (draft: Draft) => {
    setSelectedDraft(draft);
    setIsViewDialogOpen(true);
  }

  const onRepurposeSubmit: SubmitHandler<RepurposeFormValues> = async (data) => {
    if (!voiceProfile || !selectedDraft) {
      toast({ variant: "destructive", title: "Missing Information", description: "Your voice profile or the original draft is missing." });
      return;
    }
    setIsLoading(true);
    setRepurposedContent(null);
    try {
      const result = await contentRepurposing({
        voiceProfile: voiceProfile,
        sourceContent: selectedDraft.content,
        targetFormat: data.targetFormat,
      });
      setRepurposedContent(result.repurposedContent);
    } catch (error) {
      console.error("Error repurposing content:", error);
      toast({ variant: "destructive", title: "Repurposing Failed", description: "There was an error generating the new version. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const onFeedbackSubmit: SubmitHandler<FeedbackFormValues> = async (data) => {
    const selectedPersona = personas.find(p => p.id === data.personaId);
    if (!selectedPersona || !selectedDraft) {
      toast({ variant: "destructive", title: "Missing Information", description: "A valid persona and draft must be selected." });
      return;
    }
    setIsLoading(true);
    setFeedback(null);
    try {
      const result = await personaFeedback({
        personaDescription: selectedPersona.description,
        draftContent: selectedDraft.content,
      });
      setFeedback(result);
    } catch (error) {
      console.error("Error getting feedback:", error);
      toast({ variant: "destructive", title: "Feedback Failed", description: "There was an error generating feedback. Please try again." });
    } finally {
      setIsLoading(false);
    }
  }

  const handleSaveRepurposed = () => {
    if (repurposedContent && selectedDraft) {
      addDraft({
        content: repurposedContent,
        topic: `Repurposed: ${selectedDraft.topic}`,
        format: repurposeForm.getValues("targetFormat"),
      });
      toast({ title: "Draft Saved!", description: "You can view your new draft in the list." });
      setIsRepurposeDialogOpen(false);
    }
  };

  if (!isInitialized) {
    return (
       <Card>
        <CardHeader>
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]"><Skeleton className="h-5 w-24" /></TableHead>
                  <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                  <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                  <TableHead className="text-right"><Skeleton className="h-5 w-24 ml-auto" /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-36" /></TableCell>
                    <TableCell className="text-right">
                       <div className="flex justify-end gap-2">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">My Drafts</CardTitle>
          <CardDescription>
            Here are all your saved drafts. Click a row to view, or use the actions to get feedback and repurpose them.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {drafts.length > 0 ? (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Topic</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drafts.map((draft) => (
                    <TableRow key={draft.id} onClick={() => handleViewClick(draft)} className="cursor-pointer">
                      <TableCell className="font-medium">{draft.topic}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{draft.format}</Badge>
                      </TableCell>
                      <TableCell>{format(new Date(draft.createdAt), 'PPp')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                           <Button variant="outline" size="sm" onClick={(e) => handleAnalysisClick(draft, e)}>
                            <BarChartHorizontal className="h-3 w-3 mr-2" />
                            Analyze
                          </Button>
                          <Button variant="outline" size="sm" onClick={(e) => handleFeedbackClick(draft, e)}>
                            <MessageSquareQuote className="h-3 w-3 mr-2" />
                            Get Feedback
                          </Button>
                          <Button variant="outline" size="sm" onClick={(e) => handleRepurposeClick(draft, e)}>
                            <Send className="h-3 w-3 mr-2" />
                            Repurpose
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive h-8 w-8">
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete draft</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="font-headline">Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete this draft.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteDraft(draft.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
              <p>You haven't saved any drafts yet.</p>
              <p>Go to the Drafting page to generate and save your first one!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Draft Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        {selectedDraft && (
          <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                  <DialogTitle className="font-headline">{selectedDraft.topic}</DialogTitle>
                  <DialogDescription>
                      Format: <Badge variant="outline">{selectedDraft.format}</Badge>
                  </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh] rounded-md border p-4">
                <p className="text-sm text-foreground whitespace-pre-wrap">
                    {selectedDraft.content}
                </p>
              </ScrollArea>
          </DialogContent>
        )}
      </Dialog>

      {/* Repurpose Dialog */}
      <Dialog open={isRepurposeDialogOpen} onOpenChange={setIsRepurposeDialogOpen}>
        {selectedDraft && (
          <DialogContent className="sm:max-w-3xl grid-rows-[auto,1fr,auto]">
            <DialogHeader>
              <DialogTitle className="font-headline">Repurpose Draft</DialogTitle>
              <DialogDescription>
                Select a new format, and we'll adapt this draft while keeping your unique voice.
              </DialogDescription>
            </DialogHeader>
            <div className="grid lg:grid-cols-2 gap-6 overflow-hidden py-4">
              <div className="space-y-2 flex flex-col">
                <Label>Original Draft: {selectedDraft.topic}</Label>
                <ScrollArea className="border rounded-md p-3 bg-muted/50 flex-1">
                  <p className="text-sm whitespace-pre-wrap">{selectedDraft.content}</p>
                </ScrollArea>
              </div>
              <div className="space-y-2 flex flex-col">
                <Form {...repurposeForm}>
                  <form onSubmit={repurposeForm.handleSubmit(onRepurposeSubmit)} className="space-y-4 flex flex-col flex-1">
                    <FormField control={repurposeForm.control} name="targetFormat" render={({ field }) => (
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
                    <div className="flex-1 relative">
                       {isLoading && (
                          <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-md z-10">
                              <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          </div>
                       )}
                      <Textarea
                        placeholder="Your repurposed content will appear here..."
                        className="min-h-[250px] resize-none h-full"
                        value={repurposedContent || ''}
                        readOnly={isLoading}
                        onChange={(e) => setRepurposedContent(e.target.value)}
                      />
                    </div>
                     <div className="flex items-center justify-between">
                       <Button type="submit" disabled={isLoading || !repurposeForm.formState.isValid} className="font-headline">
                        {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Repurposing...</> : 'Repurpose'}
                       </Button>
                       {repurposedContent && (
                          <Button onClick={handleSaveRepurposed} className="font-headline" variant="default">
                            <Save className="mr-2" /> Save as New Draft
                          </Button>
                       )}
                     </div>
                  </form>
                </Form>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
      
      {/* Feedback Dialog */}
      <Dialog open={isFeedbackDialogOpen} onOpenChange={setIsFeedbackDialogOpen}>
        {selectedDraft && (
          <DialogContent className="sm:max-w-4xl">
             <DialogHeader>
              <DialogTitle className="font-headline">Get Persona Feedback</DialogTitle>
              <DialogDescription>
                Analyze how your draft resonates with a specific target audience.
              </DialogDescription>
            </DialogHeader>
            <div className="grid lg:grid-cols-2 gap-6 py-4">
                {/* Left: Form & Draft */}
                <div className="space-y-4">
                     <Form {...feedbackForm}>
                        <form onSubmit={feedbackForm.handleSubmit(onFeedbackSubmit)} className="space-y-4">
                             <FormField control={feedbackForm.control} name="personaId" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Select Audience Persona</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choose a persona to get feedback from..." />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {personas.length > 0 ? personas.map(p => (
                                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                            )) : <SelectItem value="none" disabled>No personas defined.</SelectItem>}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                             )} />
                             <Button type="submit" disabled={isLoading || !feedbackForm.formState.isValid || personas.length === 0} className="font-headline">
                                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : <><WandSparkles className="mr-2 h-4 w-4" /> Get Feedback</>}
                            </Button>
                        </form>
                     </Form>
                     <Separator />
                     <div className="space-y-2">
                         <Label>Original Draft</Label>
                         <ScrollArea className="border rounded-md p-3 bg-muted/50 h-[40vh]">
                            <p className="text-sm whitespace-pre-wrap">{selectedDraft.content}</p>
                        </ScrollArea>
                     </div>
                </div>
                {/* Right: Feedback Result */}
                <div className="relative">
                    {isLoading && (
                        <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-md z-10">
                            <div className="text-center">
                                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                                <p className="font-semibold">Analyzing draft...</p>
                                <p className="text-sm text-muted-foreground">The persona is reading your content.</p>
                            </div>
                        </div>
                    )}
                    {feedback ? (
                       <ScrollArea className="h-[65vh] pr-4">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-headline text-lg">Overall Impression</h4>
                                    <p className="text-sm text-muted-foreground">{feedback.overallImpression}</p>
                                </div>
                                <Separator />
                                <div>
                                    <h4 className="font-headline text-lg">Clarity Feedback</h4>
                                    <p className="text-sm text-muted-foreground">{feedback.clarityFeedback}</p>
                                </div>
                                <Separator />
                                <div>
                                    <h4 className="font-headline text-lg">Engagement Feedback</h4>
                                    <p className="text-sm text-muted-foreground">{feedback.engagementFeedback}</p>
                                </div>
                                <Separator />
                                <div>
                                    <h4 className="font-headline text-lg">Potential Questions</h4>
                                    <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                                        {feedback.questions.map((q, i) => <li key={i}>{q}</li>)}
                                    </ul>
                                </div>
                                 <Separator />
                                <div>
                                    <h4 className="font-headline text-lg">Improvement Suggestions</h4>
                                     <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                                        {feedback.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>
                            </div>
                       </ScrollArea>
                    ) : (
                        <div className="h-full border-2 border-dashed rounded-lg flex items-center justify-center text-center text-muted-foreground">
                            <p>Select a persona and click "Get Feedback"<br/>to see the analysis here.</p>
                        </div>
                    )}
                </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Analysis Dialog */}
      <Dialog open={isAnalysisDialogOpen} onOpenChange={setIsAnalysisDialogOpen}>
        {selectedDraft && (
          <DialogContent className="sm:max-w-4xl">
             <DialogHeader>
              <DialogTitle className="font-headline">Content Analysis</DialogTitle>
              <DialogDescription>
                Here is a breakdown of your draft's tone, readability, and suggestions for improvement.
              </DialogDescription>
            </DialogHeader>
            <div className="grid lg:grid-cols-2 gap-6 py-4">
                {/* Left: Draft */}
                <div className="space-y-2">
                    <Label>Your Draft</Label>
                    <ScrollArea className="border rounded-md p-3 bg-muted/50 h-[60vh]">
                        <p className="text-sm whitespace-pre-wrap">{selectedDraft.content}</p>
                    </ScrollArea>
                </div>
                {/* Right: Analysis Result */}
                <div className="relative">
                    {isLoading && (
                        <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-md z-10">
                            <div className="text-center">
                                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                                <p className="font-semibold">Analyzing content...</p>
                                <p className="text-sm text-muted-foreground">This may take a moment.</p>
                            </div>
                        </div>
                    )}
                    {analysis ? (
                       <ScrollArea className="h-[60vh] pr-4">
                            <div className="space-y-4">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg font-headline">Tone Analysis</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">{analysis.toneAnalysis}</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg font-headline">Readability Level</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">{analysis.readabilityLevel}</p>
                                    </CardContent>
                                </Card>

                                <div>
                                    <h4 className="font-headline text-lg mb-2">Clarity Suggestions</h4>
                                    <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                                        {analysis.claritySuggestions.map((q, i) => <li key={i}>{q}</li>)}
                                    </ul>
                                </div>
                                <Separator />
                                <div>
                                    <h4 className="font-headline text-lg mb-2">Engagement Suggestions</h4>
                                    <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                                        {analysis.engagementSuggestions.map((s, i) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>
                            </div>
                       </ScrollArea>
                    ) : (
                       !isLoading && (
                          <div className="h-full border-2 border-dashed rounded-lg flex items-center justify-center text-center text-muted-foreground">
                              <p>The analysis will appear here.</p>
                          </div>
                        )
                    )}
                </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
