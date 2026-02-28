"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  FileCheck, 
  LogOut,
  TrendingUp,
  HardDrive,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent
} from '@/components/ui/sidebar';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

const navItems = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Team Hub', href: '/dashboard/teams', icon: Users },
  { name: 'Reviews', href: '/dashboard/submissions', icon: FileCheck },
];

const adminItems = [
  { name: 'Admin Dashboard', href: '/dashboard/admin', icon: ShieldCheck },
  { name: 'User Management', href: '/dashboard/admin/users', icon: Users },
  { name: 'Storage Analytics', href: '/dashboard/admin/analytics', icon: Activity },
];

interface DashboardSidebarProps {
  userRole?: string;
  userName?: string;
  storageUsed?: number;
  storageLimit?: number;
}

export function DashboardSidebar({ 
  userRole = 'student', 
  userName = 'User',
  storageUsed = 0, 
  storageLimit = 500 
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const auth = useAuth();
  const router = useRouter();
  const usagePercent = (storageUsed / storageLimit) * 100;

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <Sidebar variant="sidebar" className="border-r border-sidebar-border">
      <SidebarHeader className="h-16 flex items-center px-6 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">SF</div>
          <span className="font-headline text-lg font-bold tracking-tight text-sidebar-foreground">SkillForge</span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href} className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {userRole === 'admin' && (
          <SidebarGroup className="mt-4">
            <SidebarGroupLabel>Admin Controls</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={pathname === item.href}>
                      <Link href={item.href} className="flex items-center gap-3">
                        <item.icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border bg-sidebar-accent/30">
        <div className="space-y-4">
          {userRole !== 'admin' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <HardDrive className="w-3 h-3" />
                  Storage Usage
                </span>
                <span className="text-foreground">{storageUsed}MB / {storageLimit}MB</span>
              </div>
              <Progress value={usagePercent} className="h-1.5" />
              <Button variant="outline" size="sm" className="w-full text-xs h-8 mt-2" asChild>
                <Link href="/dashboard/billing">Upgrade Storage</Link>
              </Button>
            </div>
          )}
          
          <div className="flex items-center gap-3 py-2 px-1">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
              {getInitials(userName)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{userName}</p>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 capitalize">{userRole}</Badge>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}