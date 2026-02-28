
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  Lock, 
  FileText, 
  Download, 
  Calendar, 
  ArrowLeft,
  User,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function SharedProjectPage() {
  const { key } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    // Simulate backend key validation
    const timer = setTimeout(() => {
      if (typeof key === 'string' && key.length >= 20) {
        setValid(true);
      } else {
        setValid(false);
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "This share key is invalid or has been revoked."
        });
      }
      setLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, [key, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground font-medium">Validating Secure Key...</p>
        </div>
      </div>
    );
  }

  if (!valid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center border-destructive/20 shadow-xl shadow-destructive/5">
          <CardHeader>
            <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <CardTitle className="text-2xl font-bold">Invalid Access Key</CardTitle>
            <CardDescription>The key you provided does not grant access to any project.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => router.push('/')}>Return to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Button variant="ghost" className="gap-2 -ml-2 text-muted-foreground" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 flex gap-1.5 border-green-200">
            <ShieldCheck className="w-3.5 h-3.5" /> Secure Session
          </Badge>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold tracking-tight">Enterprise Scale SaaS Architecture</h1>
                <Badge variant="outline">Private</Badge>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl">
                A detailed study on scaling cloud-native applications with high availability and disaster recovery patterns.
              </p>
            </div>
            <Button className="gap-2 h-12 px-8 shadow-lg shadow-primary/20">
              <Download className="w-4 h-4" />
              Download Project (42MB)
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5" /> Owner
                </CardDescription>
                <CardTitle className="text-base font-bold">Jane Doe</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" /> Uploaded
                </CardDescription>
                <CardTitle className="text-base font-bold">Oct 24, 2023</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" /> Format
                </CardDescription>
                <CardTitle className="text-base font-bold">ZIP / PDF Documentation</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Detailed Project Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                This project covers the implementation of a microservices architecture using modern containerization and orchestration tools. 
                The primary objective was to ensure zero-downtime deployments and regional failover capabilities.
              </p>
              <p>
                Key technical highlights include:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Multi-region Kubernetes deployment strategy</li>
                <li>Distributed tracing with OpenTelemetry</li>
                <li>Custom ingress controller for specialized traffic routing</li>
                <li>Automated performance benchmarking suite</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
