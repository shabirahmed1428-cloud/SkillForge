
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
  AlertTriangle,
  Loader2
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
import { useFirestore, useUser } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function SharedProjectPage() {
  const { key } = useParams();
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    async function validateAndFetchProject() {
      if (!key || typeof key !== 'string' || !firestore) return;
      
      try {
        setLoading(true);
        
        // 1. Check if the key is actually a Public Project ID
        const publicProjectDoc = await getDoc(doc(firestore, 'projects_public', key));
        if (publicProjectDoc.exists()) {
          const data = publicProjectDoc.data();
          // Access allowed if public OR the current user is the owner
          if (data.visibility === 'public' || (user && data.ownerId === user.uid)) {
            setProject(data);
            setLoading(false);
            return;
          }
        }

        // 2. Check if the key is a Share Key
        const keyDoc = await getDoc(doc(firestore, 'share_keys', key));
        if (keyDoc.exists()) {
          const { projectPath } = keyDoc.data();
          const sharedProjectDoc = await getDoc(doc(firestore, projectPath));
          if (sharedProjectDoc.exists()) {
            setProject(sharedProjectDoc.data());
            setLoading(false);
            return;
          }
        }

        // 3. Check if it's a private project and the user is the owner (trying direct ID)
        if (user) {
          const privateProjectDoc = await getDoc(doc(firestore, 'users', user.uid, 'projects', key));
          if (privateProjectDoc.exists()) {
            setProject(privateProjectDoc.data());
            setLoading(false);
            return;
          }
        }

        // If no project is found or access is denied
        setProject(null);
      } catch (err) {
        console.error("Error fetching project:", err);
        setProject(null);
      } finally {
        setLoading(false);
      }
    }

    validateAndFetchProject();
  }, [key, firestore, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="text-muted-foreground font-medium animate-pulse">Verifying Access...</p>
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
            <CardTitle className="text-2xl font-bold">Access Denied</CardTitle>
            <CardDescription>
              We couldn't find the project or you don't have permission to view it. Please check your share key.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full h-11" onClick={() => router.push('/')}>Return to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOwner = user && project.ownerId === user.uid;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Button variant="ghost" className="gap-2 -ml-2 text-muted-foreground" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex gap-2">
            {isOwner && (
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                Project Owner
              </Badge>
            )}
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 flex gap-1.5 border-green-200">
              <ShieldCheck className="w-3.5 h-3.5" /> Secure Session
            </Badge>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold tracking-tight text-foreground">{project.title}</h1>
                <Badge variant="outline" className="capitalize font-semibold">{project.visibility}</Badge>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                {project.description}
              </p>
            </div>
            {project.fileURL && (
              <Button className="gap-2 h-12 px-8 shadow-lg shadow-primary/20" asChild>
                <a href={project.fileURL} target="_blank" rel="noopener noreferrer">
                  <Download className="w-4 h-4" />
                  Download Assets
                </a>
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5" /> Identity
                </CardDescription>
                <CardTitle className="text-sm font-bold truncate">
                  {isOwner ? "Your Project" : `Owner: ${project.ownerId.substring(0, 8)}...`}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" /> Status
                </CardDescription>
                <CardTitle className="text-base font-bold capitalize">{project.status}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" /> File Size
                </CardDescription>
                <CardTitle className="text-base font-bold">{project.fileSizeMB || 0} MB</CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
