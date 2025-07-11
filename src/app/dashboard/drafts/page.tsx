'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { contentRepurposing } from '@/ai/flows/content-repurposing';
import { useGhostwriterState, type Draft } from '@/hooks/use-ghostwriter-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, Send, Loader2, Save } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
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

const formSchema = z.object({
  targetFormat: z.string({ required_error: "Please select a target format." }),
});

type FormValues = z.infer<typeof formSchema>;


export default function DraftsPage() {
  const { drafts, deleteDraft, isInitialized, addDraft, voiceProfile } = useGhostwriterState();
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);
  const [isRepurposeDialogOpen, setIsRepurposeDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [repurposedContent, setRepurposedContent] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { targetFormat: '' },
  });

  const handleRepurposeClick = (draft: Draft, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDraft(draft);
    setRepurposedContent(null);
    form.reset();
    setIsRepurposeDialogOpen(true);
  }

  const handleViewClick = (draft: Draft) => {
    setSelectedDraft(draft);
    setIsViewDialogOpen(true);
  }

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!voiceProfile || !selectedDraft) {
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
        sourceContent: selectedDraft.content,
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
    if (repurposedContent && selectedDraft) {
      addDraft({
        content: repurposedContent,
        topic: `Repurposed: ${selectedDraft.topic}`,
        format: form.getValues("targetFormat"),
      });
      toast({
        title: "Draft Saved!",
        description: "You can view your new draft in the list."
      });
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
            Here are all your saved drafts. Click a row to view, or repurpose them for different platforms.
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
              {/* Original */}
              <div className="space-y-2 flex flex-col">
                <Label>Original Draft: {selectedDraft.topic}</Label>
                <ScrollArea className="border rounded-md p-3 bg-muted/50 flex-1">
                  <p className="text-sm whitespace-pre-wrap">{selectedDraft.content}</p>
                </ScrollArea>
              </div>
              {/* Repurposed */}
              <div className="space-y-2 flex flex-col">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex flex-col flex-1">
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
                       <Button type="submit" disabled={isLoading || !form.formState.isValid} className="font-headline">
                        {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Repurposing...</> : 'Repurpose'}
                       </Button>

                       {repurposedContent && (
                          <Button onClick={handleSave} className="font-headline" variant="default">
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
    </>
  );
}
