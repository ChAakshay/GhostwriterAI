'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { PenSquare, AudioLines, Lightbulb, FileText } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Drafting', icon: PenSquare },
  { href: '/dashboard/voice', label: 'Voice Profile', icon: AudioLines },
  { href: '/dashboard/ideas', label: 'Content Ideas', icon: Lightbulb },
  { href: '/dashboard/drafts', label: 'My Drafts', icon: FileText },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <SidebarContent>
      <SidebarMenu>
        {navItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.href}
              className="font-headline"
            >
              <Link href={item.href}>
                <item.icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarContent>
  );
}
