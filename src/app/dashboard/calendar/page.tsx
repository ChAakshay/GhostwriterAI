'use client';

import { useState, useMemo } from 'react';
import { useGhostwriterState, type Draft } from '@/hooks/use-ghostwriter-state';
import { getSchedulingSuggestion, type SchedulingSuggestionOutput } from '@/ai/flows/scheduling-suggestions';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, isSameDay } from 'date-fns';
import { AlertCircle, Clock, Lightbulb, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type DraftWithScheduledDate = Draft & { scheduledDate: Date };

export default function CalendarPage() {
  const { drafts, scheduleDraft, unscheduleDraft, isInitialized } = useGhostwriterState();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<SchedulingSuggestionOutput | null>(null);
  const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);
  
  const scheduledDrafts = useMemo(() => {
    return drafts
      .filter((d): d is DraftWithScheduledDate => !!d.scheduledDate)
      .map(d => ({ ...d, scheduledDate: new Date(d.scheduledDate!) }))
      .sort((a,b) => a.scheduledDate.getTime() - b.scheduledDate.getTime());
  }, [drafts]);

  const unscheduledDrafts = useMemo(() => {
    return drafts.filter(d => !d.scheduledDate);
  }, [drafts]);

  const draftsOnSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return scheduledDrafts.filter(d => isSameDay(d.scheduledDate, selectedDate));
  }, [selectedDate, scheduledDrafts]);

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
  };
  
  const handleSelectDraft = async (draftId: string) => {
    setSelectedDraftId(draftId);
    setSuggestion(null);
    setIsSuggestionLoading(true);
    const draft = drafts.find(d => d.id === draftId);
    if (draft) {
        try {
            const result = await getSchedulingSuggestion({topic: draft.topic, format: draft.format});
            setSuggestion(result);
        } catch (error) {
            console.error("Error getting suggestion:", error)
        } finally {
            setIsSuggestionLoading(false);
        }
    }
  }

  const handleScheduleClick = () => {
    if (selectedDraftId && selectedDate) {
      scheduleDraft(selectedDraftId, selectedDate);
      setSelectedDraftId(null);
      setSuggestion(null);
    }
  };

  if (!isInitialized) {
     return (
        <div className="grid h-[calc(100vh-10rem)] grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardContent className="p-2 sm:p-4 h-full">
                 <Skeleton className="w-full h-full" />
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-40" />
              <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
    )
  }

  return (
    <div className="grid h-[calc(100vh-10rem)] grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Calendar View */}
      <div className="lg:col-span-2">
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="font-headline">Content Calendar</CardTitle>
                <CardDescription>Click a day to see scheduled drafts or to schedule a new one.</CardDescription>
            </CardHeader>
          <CardContent className="p-0 sm:p-2 flex-grow">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              onDayClick={handleDayClick}
              className="p-0"
              classNames={{
                root: 'h-full w-full flex flex-col',
                months: 'flex-1',
                month: 'h-full flex flex-col',
                table: 'flex-1',
                head_row: "grid grid-cols-7",
                row: 'grid grid-cols-7 h-full',
                cell: 'h-full w-full text-center text-sm p-0 relative focus-within:relative focus-within:z-20',
                day: 'h-full w-full p-1.5',
              }}
              components={{
                DayContent: ({ date }) => {
                  const scheduled = scheduledDrafts.filter(d => isSameDay(d.scheduledDate, date));
                  return (
                    <div className="flex flex-col h-full items-start">
                      <time dateTime={date.toISOString()}>{format(date, 'd')}</time>
                       <div className="mt-1 space-y-1 w-full overflow-hidden">
                        {scheduled.map(draft => (
                           <Popover key={draft.id}>
                            <PopoverTrigger asChild>
                                <div className="w-full text-left text-xs bg-primary/10 text-primary p-1 rounded-sm truncate cursor-pointer hover:bg-primary/20">
                                    {draft.topic}
                                </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                                <div className="grid gap-4">
                                <div className="space-y-2">
                                    <h4 className="font-medium leading-none">{draft.topic}</h4>
                                    <p className="text-sm text-muted-foreground">{draft.format}</p>
                                </div>
                                 <Button variant="destructive" size="sm" onClick={() => unscheduleDraft(draft.id)}>Unschedule</Button>
                                </div>
                            </PopoverContent>
                            </Popover>
                        ))}
                      </div>
                    </div>
                  );
                },
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="font-headline">
            {selectedDate ? `Schedule for ${format(selectedDate, 'PPP')}` : 'Select a Date'}
          </CardTitle>
          <CardDescription>Select a draft from below to schedule it.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col gap-4 overflow-hidden">
            <div className="space-y-2">
                <h3 className="font-semibold text-sm">Unscheduled Drafts</h3>
                <ScrollArea className="h-64 border rounded-md">
                    <div className="p-2 space-y-2">
                    {unscheduledDrafts.length > 0 ? (
                        unscheduledDrafts.map(draft => (
                        <div
                            key={draft.id}
                            onClick={() => handleSelectDraft(draft.id)}
                            className={`p-3 rounded-md cursor-pointer border ${selectedDraftId === draft.id ? 'bg-primary/10 border-primary ring-2 ring-primary' : 'bg-card hover:bg-muted/50'}`}
                        >
                            <h4 className="font-semibold text-sm">{draft.topic}</h4>
                            <p className="text-xs text-muted-foreground">{draft.format}</p>
                        </div>
                        ))
                    ) : (
                        <div className="text-center text-sm text-muted-foreground p-4">No unscheduled drafts.</div>
                    )}
                    </div>
                </ScrollArea>
            </div>
          
            {selectedDraftId && (
                <div className="space-y-4">
                     {isSuggestionLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-4 w-40" />
                        </div>
                     ) : suggestion && (
                        <Alert>
                            <Lightbulb className="h-4 w-4" />
                            <AlertTitle className="font-headline">AI Suggestion</AlertTitle>
                            <AlertDescription>
                                Post on <strong>{suggestion.suggestedDay}</strong> around <strong>{suggestion.suggestedTime}</strong>. {suggestion.reasoning}
                            </AlertDescription>
                        </Alert>
                     )}

                    <Button onClick={handleScheduleClick} disabled={!selectedDate || !selectedDraftId} className="w-full font-headline">
                        <Clock className="mr-2" />
                        Schedule on {selectedDate ? format(selectedDate, 'MMM d') : ''}
                    </...Button>
                </div>
            )}

            {draftsOnSelectedDate.length > 0 && (
                <div className="space-y-2 pt-4 border-t">
                    <h3 className="font-semibold text-sm">Scheduled on this day</h3>
                    <div className="space-y-2">
                    {draftsOnSelectedDate.map(draft => (
                         <div key={draft.id} className="p-3 rounded-md bg-muted/50 border relative">
                            <h4 className="font-semibold text-sm">{draft.topic}</h4>
                            <p className="text-xs text-muted-foreground">{draft.format}</p>
                             <Button size="xs" variant="destructive" className="absolute top-2 right-2" onClick={() => unscheduleDraft(draft.id)}>Unschedule</Button>
                        </div>
                    ))}
                    </div>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
