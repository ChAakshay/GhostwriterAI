'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useGhostwriterState } from '@/hooks/use-ghostwriter-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Send, Terminal, User, Bot } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { conversationalDrafting } from '@/ai/flows/conversational-drafting';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


const formSchema = z.object({
  prompt: z.string().min(1, { message: "Please enter a message." }),
});

type FormValues = z.infer<typeof formSchema>;

interface Message {
    role: 'user' | 'model';
    content: string;
}

export default function ChatPage() {
  const { voiceProfile, isInitialized } = useGhostwriterState();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
    },
  });

  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({
            top: scrollAreaRef.current.scrollHeight,
            behavior: 'smooth',
        });
    }
  }, [messages]);

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
    const newMessages: Message[] = [...messages, { role: 'user', content: data.prompt }];
    setMessages(newMessages);
    form.reset();

    try {
      const result = await conversationalDrafting({
        history: messages,
        prompt: data.prompt,
        voiceProfile: voiceProfile,
      });
      setMessages([...newMessages, { role: 'model', content: result.response }]);
    } catch (error) {
      console.error("Error in conversation:", error);
      toast({
        variant: "destructive",
        title: "Conversation Error",
        description: "There was an error with the AI. Please try again.",
      });
       setMessages(messages); // Revert messages on error
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isInitialized) {
     return (
       <Card className="h-[calc(100vh-10rem)] flex flex-col">
          <CardHeader>
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent className="flex-grow space-y-4">
            <div className="flex items-start gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-64" />
                </div>
            </div>
             <div className="flex items-start gap-4 flex-row-reverse">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 items-end flex flex-col">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-64" />
                </div>
            </div>
          </CardContent>
           <CardFooter>
             <div className="flex w-full items-center space-x-2">
                <Skeleton className="h-10 flex-grow" />
                <Skeleton className="h-10 w-24" />
            </div>
           </CardFooter>
        </Card>
    )
  }
  
  if (!voiceProfile) {
    return (
       <Alert>
        <Terminal className="h-4 w-4" />
        <AlertTitle className="font-headline">Voice Profile Not Found</AlertTitle>
        <AlertDescription>
          You need to define your voice profile before you can start a conversation.
          <Button asChild variant="link" className="p-0 h-auto ml-1">
            <Link href="/dashboard/voice">Go to Voice Profile page</Link>
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className="h-[calc(100vh-10rem)] flex flex-col">
        <CardHeader>
          <CardTitle className="font-headline">Conversational Drafting</CardTitle>
          <CardDescription>
            Chat with your AI ghostwriter to brainstorm, outline, and create content together.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow overflow-hidden p-0">
             <ScrollArea className="h-full p-6" ref={scrollAreaRef}>
                 <div className="space-y-6">
                    {messages.length === 0 && (
                        <div className="text-center text-muted-foreground p-8">
                            <Bot className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                            <p className="font-medium">No messages yet.</p>
                            <p>Start the conversation below!</p>
                        </div>
                    )}
                    {messages.map((message, index) => (
                        <div key={index} className={cn("flex items-start gap-4", message.role === 'user' && "flex-row-reverse")}>
                             <Avatar>
                                <AvatarFallback>{message.role === 'user' ? <User /> : <Bot/>}</AvatarFallback>
                            </Avatar>
                            <div className={cn("p-4 rounded-lg max-w-xl", message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                                <p className="whitespace-pre-wrap">{message.content}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-4">
                            <Avatar>
                                <AvatarFallback><Bot/></AvatarFallback>
                            </Avatar>
                            <div className="p-4 rounded-lg bg-muted">
                                <Loader2 className="h-5 w-5 animate-spin" />
                            </div>
                        </div>
                    )}
                 </div>
             </ScrollArea>
        </CardContent>
        <CardFooter className="pt-6 border-t">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full items-center space-x-2">
              <FormField control={form.control} name="prompt" render={({ field }) => (
                <FormItem className="flex-grow">
                  <FormControl>
                    <Input placeholder="Say something like 'Let's write a blog post about...'" {...field} autoComplete="off" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </Form>
        </CardFooter>
      </Card>
  );
}
