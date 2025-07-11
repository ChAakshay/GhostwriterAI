'use client';

import { useGhostwriterState } from '@/hooks/use-ghostwriter-state';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileText, Lightbulb, PenSquare, User, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { voiceProfile, drafts, isInitialized } = useGhostwriterState();

  if (!isInitialized) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="flex flex-col">
            <CardHeader className="flex-row items-center gap-4 space-y-0">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full mt-2" />
              <Skeleton className="h-4 w-3/4 mt-2" />
            </CardContent>
            <div className="p-6 pt-0">
               <Skeleton className="h-10 w-full" />
            </div>
          </Card>
           <Card className="flex flex-col justify-between">
            <CardHeader>
               <Skeleton className="h-12 w-12 rounded-full mb-2" />
               <Skeleton className="h-6 w-32" />
               <Skeleton className="h-4 w-48" />
            </CardHeader>
            <div className="p-6 pt-0">
               <Skeleton className="h-10 w-full" />
            </div>
          </Card>
          <Card className="flex flex-col justify-between">
            <CardHeader>
               <Skeleton className="h-12 w-12 rounded-full mb-2" />
               <Skeleton className="h-6 w-32" />
               <Skeleton className="h-4 w-48" />
            </CardHeader>
            <div className="p-6 pt-0">
               <Skeleton className="h-10 w-full" />
            </div>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Recent Drafts</CardTitle>
            <CardDescription>Your three most recently created drafts.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-card-foreground/5">
                <div className="space-y-2 w-full">
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </div>
               <div className="flex items-center justify-between p-3 rounded-lg bg-card-foreground/5">
                <div className="space-y-2 w-full">
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </div>
               <div className="flex items-center justify-between p-3 rounded-lg bg-card-foreground/5">
                <div className="space-y-2 w-full">
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-headline text-primary">Welcome to your Dashboard</h1>
        <p className="text-muted-foreground">Here's a quick overview of your Ghostwriter AI workspace.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Voice Profile Card */}
        <Card className="flex flex-col">
          <CardHeader className="flex-row items-center gap-4 space-y-0">
            <div className="p-3 rounded-full bg-primary/10 text-primary">
              <User className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="font-headline">Voice Profile</CardTitle>
              <CardDescription>Your unique writing style</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex-grow">
            {voiceProfile ? (
              <p className="text-sm text-foreground/80 line-clamp-3">
                {voiceProfile}
              </p>
            ) : (
               <Alert variant="destructive" className="border-none bg-transparent p-0">
                 <AlertCircle className="h-4 w-4" />
                <AlertTitle className="font-headline text-destructive">No Profile Found</AlertTitle>
                <AlertDescription className="text-destructive/90">
                  Define your voice to start generating content.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <div className="p-6 pt-0">
            <Button asChild variant="outline" className="w-full font-headline">
              <Link href="/dashboard/voice">
                {voiceProfile ? 'Update Voice Profile' : 'Create Voice Profile'}
              </Link>
            </Button>
          </div>
        </Card>
        
        {/* Quick Action Cards */}
        <Card className="flex flex-col justify-between">
           <CardHeader>
             <div className="p-3 rounded-full bg-primary/10 text-primary w-fit mb-2">
                <Lightbulb className="h-6 w-6" />
            </div>
            <CardTitle className="font-headline">Brainstorm Ideas</CardTitle>
            <CardDescription>Generate new content ideas based on topics and your voice.</CardDescription>
          </CardHeader>
          <div className="p-6 pt-0">
            <Button asChild className="w-full font-headline">
              <Link href="/dashboard/ideas">Generate Ideas</Link>
            </Button>
          </div>
        </Card>
         <Card className="flex flex-col justify-between">
           <CardHeader>
             <div className="p-3 rounded-full bg-primary/10 text-primary w-fit mb-2">
                <PenSquare className="h-6 w-6" />
            </div>
            <CardTitle className="font-headline">Create New Draft</CardTitle>
            <CardDescription>Generate a new draft for a blog post, tweet, or more.</CardDescription>
          </CardHeader>
          <div className="p-6 pt-0">
            <Button asChild className="w-full font-headline">
              <Link href="/dashboard/drafting">Create Draft</Link>
            </Button>
          </div>
        </Card>
      </div>

      {/* Recent Drafts */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Recent Drafts</CardTitle>
          <CardDescription>Your three most recently created drafts.</CardDescription>
        </CardHeader>
        <CardContent>
          {drafts.length > 0 ? (
            <div className="space-y-4">
              {drafts.slice(0, 3).map((draft) => (
                <div key={draft.id} className="flex items-center justify-between p-3 rounded-lg bg-card-foreground/5">
                  <div className="space-y-1">
                     <p className="font-medium">{draft.topic}</p>
                     <div className="text-sm text-muted-foreground">
                        <Badge variant="secondary" className="mr-2">{draft.format}</Badge>
                        Created on {format(new Date(draft.createdAt), 'MMM d, yyyy')}
                    </div>
                  </div>
                </div>
              ))}
               {drafts.length > 3 && (
                 <div className="pt-4">
                    <Button asChild variant="secondary" className="font-headline">
                        <Link href="/dashboard/drafts">View All Drafts</Link>
                    </Button>
                 </div>
                )}
            </div>
          ) : (
            <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg flex flex-col items-center justify-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="font-medium">No drafts yet!</p>
                <p className="mb-4">Your saved drafts will appear here.</p>
                <Button asChild>
                    <Link href="/dashboard/drafting">Create your first draft</Link>
                </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
