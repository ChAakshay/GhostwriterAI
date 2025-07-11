'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserNav } from '@/components/user-nav';
import { usePathname } from 'next/navigation';

function getTitleFromPathname(pathname: string): string {
  const segments = pathname.split('/');
  const lastSegment = segments.pop() || 'dashboard';

  switch (lastSegment) {
    case 'dashboard':
      return 'Dashboard';
    case 'drafting':
      return 'Content Drafting';
    case 'voice':
      return 'Voice Profile';
    case 'ideas':
      return 'Content Ideas';
    case 'drafts':
      return 'My Drafts';
    case 'personas':
      return 'Audience Personas';
    case 'calendar':
        return 'Content Calendar';
    default:
      // Handle dynamic routes like /repurpose/[id]
      if (segments.includes('repurpose')) {
        return 'Repurpose Content';
      }
      return 'Dashboard';
  }
}

export default function Header() {
  const pathname = usePathname();
  const title = getTitleFromPathname(pathname);

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 lg:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <h1 className="text-xl font-semibold font-headline">{title}</h1>
      <div className="ml-auto">
        <UserNav />
      </div>
    </header>
  );
}
