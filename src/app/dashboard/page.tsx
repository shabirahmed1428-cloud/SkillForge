
"use client";

import { useState, useRef } from 'react';
import { 
  Plus, 
  Upload, 
  FileText, 
  ShieldCheck, 
  HardDrive,
  X,
  File,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  DollarSign,
  Eye,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { 
  useFirestore, 
  useUser, 
  useCollection, 
  useDoc, 
  useMemoFirebase, 
  useDatabase, 
  useStorage, 
  setDocumentNonBlocking, 
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking
} from '@/firebase';
import { collection, query, where, limit, doc, serverTimestamp } from 'firebase/firestore';
import { ref as dbRef, set, update, remove } from 'firebase/database';
import { ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

export default function DashboardPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const database = useDatabase();
  const storage = useStorage();
  
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fast upload options
  const [visibility, setVisibility] = useState('public');
  const [price, setPrice] = useState('');
  const [sellerAccount, setSellerAccount] = useState('');

  const projectsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'projects_public'),
      where('ownerId', '==', user.uid),
      limit(10)
    );
  }, [firestore, user]);

  const { data: recentProjects } = useCollection(projectsQuery);

  const userDocRef = useMemoFirebase(() => {
    if (!user?.uid || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: userProfile } = useDoc(userDocRef);

  const validateAndSetFile = (selectedFile: File) => {
    setError(null);
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("File size exceeds 10MB limit.");
      return;
    }
    setFile(selectedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !user || !firestore || !database || !storage) {
      toast({
        variant: "destructive",
        title: "Configuration error",
        description: "Firebase services are not ready. Please refresh."
      });
      return;
    }
    
    setUploading(true);
    setProgress(0);
    
    try {
      const projectId = doc(collection(firestore, 'projects_public')).id;
      const fileName = `${Date.now()}_${file.name}`;
      const fRef = storageRef(storage, `projects/${projectId}/files/${fileName}`);
      
      const uploadTask = uploadBytesResumable(fRef, file);

      uploadTask.on('state_changed', 
        (snapshot) => {
          const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(Math.round(p));
        }, 
        (err) => {
          setUploading(false);
          setError(err.message);
          toast({
            variant: "destructive",
            title: "Upload failed",
            description: err.message
          });
        }, 
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const fileSizeMB = parseFloat((file.size / (1024 * 1024)).toFixed(2));
          const projectRef = doc(firestore, 'projects_public', projectId);

          const basePrice = parseFloat(price) || 0;

          const projectData = {
            id: projectId,
            title: file.name,
            description: `Project file: ${file.name}`,
            ownerId: user.uid,
            visibility: visibility,
            status: 'approved',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            price: visibility === 'public' ? basePrice : 0,
            isForSale: visibility === 'public' && basePrice > 0,
            sellerAccount: sellerAccount,
            fileURL: downloadURL,
            fileSizeMB: fileSizeMB,
            storagePath: `projects/${projectId}/files/${fileName}`
          };

          setDocumentNonBlocking(projectRef, projectData, { merge: true });

          if (userProfile) {
            const newUsage = (userProfile.storageUsedMB || 0) + fileSizeMB;
            updateDocumentNonBlocking(doc(firestore, 'users', user.uid), {
              storageUsedMB: newUsage
            });
            update(dbRef(database, `users/${user.uid}`), {
              storageUsedMB: newUsage
            });
          }

          set(dbRef(database, `projects/${projectId}`), {
            ...projectData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });

          toast({
            title: "Project published!",
            description: `${file.name} is now live.`
          });
          
          setUploading(false);
          setFile(null);
          setPrice('');
          setSellerAccount('');
          setProgress(0);
        }
      );
    } catch (err: any) {
      setUploading(false);
      setError(err.message);
    }
  };

  const handleDeleteProject = async (projectId: string, fileSizeMB: number, storagePath?: string) => {
    if (!firestore || !user || !database || !storage) return;
    try {
      if (storagePath) {
        deleteObject(storageRef(storage, storagePath)).catch(() => {});
      }
      deleteDocumentNonBlocking(doc(firestore, 'projects_public', projectId));
      remove(dbRef(database, `projects/${projectId}`));
      if (userProfile) {
        const newUsage = Math.max(0, (userProfile.storageUsedMB || 0) - (fileSizeMB || 0));
        updateDocumentNonBlocking(doc(firestore, 'users', user.uid), { storageUsedMB: newUsage });
        update(dbRef(database, `users/${user.uid}`), { storageUsedMB: newUsage });
      }
      toast({ title: "Project deleted" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Deletion failed", description: e.message });
    }
  };

  const storageUsed = userProfile?.storageUsedMB ?? 0;
  const storageLimit = userProfile?.storageLimitMB ?? 500;
  const storageUsagePercent = Math.min((storageUsed / storageLimit) * 100, 100);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
          <p className="text-muted-foreground mt-1">Quick-publish assets and manage your portfolio.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/dashboard/billing">Upgrade Storage</Link>
          </Button>
          <Button className="shadow-lg shadow-primary/20" asChild>
            <Link href="/dashboard/projects/new">
              <Plus className="w-4 h-4 mr-2" /> New Project
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-2 border-dashed border-muted bg-card/50">
            <CardHeader>
              <CardTitle>Fast Upload & Store</CardTitle>
              <CardDescription>Instantly publish files to your portfolio.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div 
                onClick={() => !uploading && fileInputRef.current?.click()}
                className={`
                  border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer
                  ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50 hover:bg-primary/5'}
                `}
              >
                <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} disabled={uploading} />
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${file ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  {file ? <File className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
                </div>
                {file ? (
                  <div className="space-y-1">
                    <p className="font-semibold text-sm truncate max-w-[200px]">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <p className="text-sm font-medium">Click to select asset (Max 10MB)</p>
                )}
              </div>

              {file && !uploading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t animate-in fade-in slide-in-from-top-4">
                  <div className="space-y-4">
                    <Label className="text-xs font-bold uppercase">Visibility</Label>
                    <RadioGroup defaultValue="public" className="flex gap-4" onValueChange={setVisibility}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="public" id="p-public" />
                        <Label htmlFor="p-public" className="text-xs cursor-pointer flex items-center gap-1"><Eye className="w-3 h-3" /> Public</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="private" id="p-private" />
                        <Label htmlFor="p-private" className="text-xs cursor-pointer flex items-center gap-1"><Lock className="w-3 h-3" /> Private</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {visibility === 'public' && (
                    <div className="space-y-3">
                      <Label className="text-xs font-bold uppercase">Listing Price (RS)</Label>
                      <Input 
                        placeholder="0 for Free" 
                        type="number" 
                        className="h-8 text-xs"
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                      />
                      {parseFloat(price) > 0 && (
                        <div className="space-y-2">
                          <Label className="text-[10px] text-muted-foreground font-bold uppercase">Payout Account</Label>
                          <Input 
                            placeholder="EasyPaisa/Bank ID" 
                            className="h-8 text-xs"
                            value={sellerAccount}
                            onChange={e => setSellerAccount(e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="md:col-span-2 pt-2">
                    <Button className="w-full h-10 shadow-lg shadow-primary/20" onClick={handleUpload}>
                      Confirm & Publish Asset
                    </Button>
                  </div>
                </div>
              )}

              {uploading && (
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex justify-between text-xs font-bold text-primary">
                    <span className="flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> Uploading...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-1.5" />
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 text-destructive text-[10px] bg-destructive/5 p-2 rounded border border-destructive/20">
                  <AlertCircle className="w-3 h-3" /> {error}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-none shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold flex items-center gap-2">
                  <HardDrive className="w-3 h-3 text-primary" /> Storage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{storageUsed.toFixed(2)} / {storageLimit} MB</div>
                <Progress value={storageUsagePercent} className="h-1 mt-2" />
              </CardContent>
            </Card>
            <Card className="border-none shadow-md bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold flex items-center gap-2">
                  <ShieldCheck className="w-3 h-3 text-primary" /> Session
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">Encrypted</div>
                <p className="text-[10px] text-green-600 mt-1 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Live connection active
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-md overflow-hidden">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="text-sm font-bold">Recent Portfolio Items</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {recentProjects?.map(project => (
                  <div key={project.id} className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors group">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{project.title}</p>
                      <p className="text-[9px] text-muted-foreground uppercase mt-0.5">
                        {project.isForSale ? `RS ${(project.price || 0) * 1.1}` : 'Free'} • {project.visibility}
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Project?</AlertDialogTitle>
                          <AlertDialogDescription>This will free up {(project.fileSizeMB || 0).toFixed(2)} MB of storage.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteProject(project.id, project.fileSizeMB || 0, project.storagePath)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
                {(!recentProjects || recentProjects.length === 0) && (
                  <div className="p-8 text-center text-muted-foreground text-[10px]">No projects found.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
