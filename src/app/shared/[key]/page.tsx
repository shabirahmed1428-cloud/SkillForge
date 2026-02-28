
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
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
import { useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function SharedProjectPage() {
  const { key } = useParams();
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    async function validateKey() {
      if (!key || typeof key !== 'string') return;
      
      try {
        const keyDoc = await getDoc(doc(firestore, 'share_keys', key));
        if (!keyDoc.exists()) {
          setProject(null);
          setLoading(false);
          return;
        }

        const { projectPath } = keyDoc.data();
        const projectDoc = await getDoc(doc(firestore, projectPath));
        
        if (projectDoc.exists()) {
          setProject(projectDoc.data());
        } else {
          setProject(null);
        }
      } catch (err) {
        console.error(err);
        setProject(null);
      } finally {
        setLoading(false);
      }
    }

    validateKey();
  }, [key, firestore]);

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

  if (!project) {
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
                <h1 className="text-4xl font-bold tracking-tight">{project.title}</h1>
                <Badge variant="outline">{project.visibility}</Badge>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl">
                {project.description}
              </p>
            </div>
            <Button className="gap-2 h-12 px-8 shadow-lg shadow-primary/20">
              <Download className="w-4 h-4" />
              Download Project
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5" /> Owner ID
                </CardDescription>
                <CardTitle className="text-sm font-bold truncate">{project.ownerId}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" /> Status
                </CardDescription>
                <CardTitle className="text-base font-bold capitalize">{project.status}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" /> Views
                </CardDescription>
                <CardTitle className="text-base font-bold">{project.viewsCount}</CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
