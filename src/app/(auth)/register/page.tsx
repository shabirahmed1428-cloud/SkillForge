
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, GraduationCap, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('student');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulation of registration logic
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Account created!",
        description: `Welcome to SkillForge, ${role}.`,
      });
      router.push('/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">SF</div>
            <span className="font-headline text-2xl font-bold tracking-tight">SkillForge</span>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
          <p className="text-muted-foreground">Join the elite community of builders and mentors</p>
        </div>

        <Card className="border-none shadow-xl">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Choose Your Role</CardTitle>
              <CardDescription>Select how you want to use SkillForge</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup defaultValue="student" onValueChange={setRole} className="grid grid-cols-2 gap-4">
                <div>
                  <RadioGroupItem value="student" id="student" className="peer sr-only" />
                  <Label
                    htmlFor="student"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <GraduationCap className="mb-3 h-6 w-6" />
                    <span className="text-sm font-semibold">Student</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="mentor" id="mentor" className="peer sr-only" />
                  <Label
                    htmlFor="mentor"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <Briefcase className="mb-3 h-6 w-6" />
                    <span className="text-sm font-semibold">Mentor</span>
                  </Label>
                </div>
              </RadioGroup>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="name" placeholder="John Doe" className="pl-10" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="name@company.com" className="pl-10" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="password" type="password" className="pl-10" required />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full h-11 text-base shadow-lg shadow-primary/20" disabled={loading}>
                {loading ? 'Creating account...' : 'Sign Up'}
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                Already have an account? <Link href="/login" className="text-primary font-medium hover:underline">Sign in</Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
