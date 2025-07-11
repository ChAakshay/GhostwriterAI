import type { Metadata } from 'next';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import Header from '@/components/header';
import { MainNav } from '@/components/main-nav';
import Logo from '@/components/logo';
import { GhostwriterStateProvider } from '@/hooks/use-ghostwriter-state';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Ghostwriter AI Dashboard',
  description: 'Generate content in your unique voice.',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GhostwriterStateProvider>
      <SidebarProvider>
        <Sidebar>
          <div className="flex flex-col h-full">
            <Link href="/dashboard" className="block p-4 border-b border-sidebar-border">
              <Logo />
            </Link>
            <MainNav />
          </div>
        </Sidebar>
        <SidebarInset>
          <Header />
          <main className="p-4 lg:p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </GhostwriterStateProvider>
  );
}
