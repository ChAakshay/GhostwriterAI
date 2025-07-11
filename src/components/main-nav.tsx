'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { LayoutDashboard, PenSquare, AudioLines, Lightbulb, FileText, Users } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/drafting', label: 'Drafting', icon: PenSquare },
  { href: '/dashboard/voice', label: 'Voice Profile', icon: AudioLines },
  { href: '/dashboard/personas', label: 'Personas', icon: Users },
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
              isActive={pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard')}
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
