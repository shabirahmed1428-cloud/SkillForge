
"use client";

import { useState } from 'react';
import { Bell, Search, Key, ChevronRight, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useMemoFirebase, useAuth } from '@/firebase';
import { doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

export function TopNav() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const [accessKey, setAccessKey] = useState('');

  // Fetch real user profile data
  const userDocRef = useMemoFirebase(() => {
    if (!user?.uid || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user?.uid, firestore]);

  const { data: userProfile } = useDoc(userDocRef);

  const handleAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessKey.length < 20) {
      toast({
        variant: "destructive",
        title: "Invalid Key",
        description: "Access keys must be at least 20 characters long."
      });
      return;
    }
    router.push(`/shared/${accessKey}`);
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <header className="h-16 border-b border-border bg-card px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="md:hidden" />
        <div className="relative hidden sm:block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search projects..." 
            className="pl-9 w-[180px] lg:w-[240px] h-9 bg-muted/50 border-none focus-visible:ring-1" 
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Special Access Key Input */}
        <form onSubmit={handleAccess} className="hidden lg:flex items-center gap-2 bg-muted/50 rounded-md px-2 h-9 border border-border/50">
          <Key className="w-3.5 h-3.5 text-primary" />
          <input 
            type="text" 
            placeholder="Enter Access Key..." 
            className="bg-transparent text-xs outline-none w-40 font-mono"
            value={accessKey}
            onChange={(e) => setAccessKey(e.target.value)}
          />
          <Button type="submit" variant="ghost" size="icon" className="h-7 w-7 hover:bg-primary/10 hover:text-primary">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </form>

        <div className="h-4 w-px bg-border mx-1" />

        <Button variant="ghost" size="icon" className="relative text-muted-foreground">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-card" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full overflow-hidden w-8 h-8 p-0 border border-border">
              <img 
                src={userProfile?.photoURL || `https://picsum.photos/seed/${user?.uid || '1'}/100/100`} 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userProfile?.name || 'User'}</p>
                <p className="text-xs leading-none text-muted-foreground capitalize">{userProfile?.role || 'member'}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>Profile Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive flex items-center gap-2" onClick={handleLogout}>
              <LogOut className="w-4 h-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
