'use client';

import Link from 'next/link';
import { useGhostwriterState, type Draft } from '@/hooks/use-ghostwriter-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, Shuffle } from 'lucide-react';
import { format } from 'date-fns';
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


export default function DraftsPage() {
  const { drafts, deleteDraft, isInitialized } = useGhostwriterState();

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
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">My Drafts</CardTitle>
        <CardDescription>
          Here are all the content drafts you've saved. You can repurpose them for different platforms.
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
                  <TableRow key={draft.id}>
                    <TableCell className="font-medium">{draft.topic}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{draft.format}</Badge>
                    </TableCell>
                    <TableCell>{format(new Date(draft.createdAt), 'PPp')}</TableCell>
                    <TableCell className="text-right">
                       <div className="flex justify-end gap-2">
                         <Button asChild variant="outline" size="icon">
                            <Link href={`/dashboard/repurpose/${draft.id}`}>
                                <Shuffle className="h-4 w-4" />
                                <span className="sr-only">Repurpose draft</span>
                            </Link>
                         </Button>
                         <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
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
  );
}