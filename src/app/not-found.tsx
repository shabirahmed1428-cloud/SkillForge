
"use client";

import Link from 'next/link';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md border-none shadow-2xl text-center overflow-hidden">
        <div className="h-2 bg-primary w-full" />
        <CardHeader className="pt-10">
          <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6 text-muted-foreground">
            <FileQuestion className="w-10 h-10" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Page Not Found</CardTitle>
          <CardDescription className="text-lg">
            Sorry, we couldn't find the page you're looking for.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          It might have been moved, deleted, or you might have a typo in the URL.
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pb-10">
          <Button asChild className="w-full h-11 text-base shadow-lg shadow-primary/20">
            <Link href="/" className="gap-2">
              <Home className="w-4 h-4" />
              Return to Landing Page
            </Link>
          </Button>
          <Button variant="ghost" asChild className="w-full">
            <Link href="/dashboard" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Go to Dashboard
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
