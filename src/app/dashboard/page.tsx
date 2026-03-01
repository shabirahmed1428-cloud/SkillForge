
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
  Trash2
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

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit as per storage rules

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

  // Fetch recent public projects owned by the user
  const projectsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'projects_public'),
      where('ownerId', '==', user.uid),
      limit(5)
    );
  }, [firestore, user]);

  const { data: recentProjects } = useCollection(projectsQuery);

  // Fetch real user profile data for storage stats
  const userDocRef = useMemoFirebase(() => {
    if (!user?.uid || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: userProfile } = useDoc(userDocRef);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError(null);
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("File size exceeds 10MB limit.");
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Your storage rules limit uploads to 10MB."
      });
      return;
    }
    setFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const generateKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 20; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleUpload = async () => {
    if (!file || !user || !firestore || !database || !storage) return;
    
    setUploading(true);
    setProgress(0);
    
    const projectId = doc(collection(firestore, 'projects_public')).id;
    const fileName = `${Date.now()}_${file.name}`;
    const fileRef = storageRef(storage, `projects/${projectId}/files/${fileName}`);
    
    const uploadTask = uploadBytesResumable(fileRef, file);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(Math.round(p));
      }, 
      (error) => {
        setUploading(false);
        toast({
          variant: "destructive",
          title: "Upload failed",
          description: error.message
        });
      }, 
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        const fileSizeMB = parseFloat((file.size / (1024 * 1024)).toFixed(2));
        const shareKey = generateKey();
        const projectRef = doc(firestore, 'projects_public', projectId);

        const projectData = {
          id: projectId,
          title: file.name,
          description: `Project file: ${file.name}`,
          ownerId: user.uid,
          visibility: 'public',
          status: 'approved',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          likesCount: 0,
          viewsCount: 0,
          fileURL: downloadURL,
          fileSizeMB: fileSizeMB,
          shareKey: shareKey,
          shareKeyEnabled: true,
          storagePath: `projects/${projectId}/files/${fileName}`
        };

        // --- FIRESTORE WRITES ---
        setDocumentNonBlocking(projectRef, {
          ...projectData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });

        setDocumentNonBlocking(doc(firestore, 'share_keys', shareKey), {
          id: shareKey,
          projectId: projectId,
          projectPath: projectRef.path,
          createdAt: serverTimestamp()
        }, { merge: true });

        if (userProfile) {
          updateDocumentNonBlocking(doc(firestore, 'users', user.uid), {
            storageUsedMB: (userProfile.storageUsedMB || 0) + fileSizeMB
          });
        }

        // --- REALTIME DATABASE WRITES ---
        set(dbRef(database, `projects/${projectId}`), projectData);
        set(dbRef(database, `share_keys/${shareKey}`), {
          projectId: projectId,
          createdAt: projectData.createdAt
        });
        if (userProfile) {
          update(dbRef(database, `users/${user.uid}`), {
            storageUsedMB: (userProfile.storageUsedMB || 0) + fileSizeMB
          });
        }

        toast({
          title: "Project published!",
          description: `${file.name} is now live in your portfolio.`
        });
        
        setUploading(false);
        setFile(null);
        setProgress(0);
      }
    );
  };

  const handleDeleteProject = async (projectId: string, fileSizeMB: number, storagePath?: string) => {
    if (!firestore || !user || !database) return;

    try {
      // 1. Delete from Storage if path exists
      if (storage && storagePath) {
        const fileRef = storageRef(storage, storagePath);
        deleteObject(fileRef).catch(e => console.warn("Storage deletion failed", e));
      }

      // 2. Delete from Firestore
      const projectRef = doc(firestore, 'projects_public', projectId);
      deleteDocumentNonBlocking(projectRef);

      // 3. Delete from Realtime Database
      remove(dbRef(database, `projects/${projectId}`));

      // 4. Update storage usage
      if (userProfile) {
        const newUsage = Math.max(0, (userProfile.storageUsedMB || 0) - (fileSizeMB || 0));
        updateDocumentNonBlocking(doc(firestore, 'users', user.uid), {
          storageUsedMB: newUsage
        });
        update(dbRef(database, `users/${user.uid}`), {
          storageUsedMB: newUsage
        });
      }

      toast({
        title: "Project deleted",
        description: "Project has been removed from your portfolio."
      });
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Deletion failed",
        description: e.message
      });
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
          <p className="text-muted-foreground mt-1">Manage your professional portfolio and secure project sharing.</p>
        </div>
        <Button className="gap-2 shadow-lg shadow-primary/20 h-11" asChild>
          <Link href="/dashboard/projects/new">
            <Plus className="w-4 h-4" />
            Create Project
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-2 border-dashed border-muted bg-card/50 transition-colors">
            <CardHeader>
              <CardTitle>Direct Upload</CardTitle>
              <CardDescription>Instantly add assets to your public portfolio (Max 10MB)</CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !uploading && fileInputRef.current?.click()}
                className={`
                  relative border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center transition-all
                  ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  ${isDragging ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-muted hover:border-primary/50 hover:bg-primary/5'}
                `}
              >
                <input 
                  type="file" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileChange}
                  disabled={uploading}
                />
                
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-colors ${file ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  {file ? <File className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
                </div>

                {file ? (
                  <div className="space-y-2 w-full max-w-sm">
                    <p className="font-semibold text-lg truncate px-4">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    {!uploading && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive h-8" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                        }}
                      >
                        <X className="w-4 h-4 mr-1" /> Remove
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="font-semibold text-lg">Click or drag file to upload</p>
                    <p className="text-sm text-muted-foreground">PDF, ZIP, DOCX, or MP4 supported</p>
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-4 flex items-center gap-2 text-destructive text-sm bg-destructive/5 p-3 rounded-lg border border-destructive/20">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              {file && !uploading && !error && (
                <Button className="w-full mt-6 h-12 text-lg shadow-xl shadow-primary/20" onClick={handleUpload}>
                  Publish Asset to Portfolio
                </Button>
              )}

              {uploading && (
                <div className="mt-6 space-y-4">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="flex items-center gap-2 text-primary font-bold">
                      <Loader2 className="w-4 h-4 animate-spin" /> Uploading to Storage...
                    </span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Card className="border-none shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-primary" />
                  Storage Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{storageLimit} MB Limit</div>
                <Progress value={storageUsagePercent} className="h-1.5 mt-2" />
                <p className="text-[10px] text-muted-foreground mt-1">
                  {storageUsed.toFixed(2)} MB used of {storageLimit} MB quota
                </p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  Security Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Verified</div>
                <div className="flex items-center gap-1.5 text-[10px] text-green-600 mt-2 font-medium">
                  <CheckCircle2 className="w-3 h-3" /> Secure session established
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="bg-primary text-primary-foreground border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Share Tip
              </CardTitle>
              <CardDescription className="text-primary-foreground/80">
                You can always access your projects directly. Use share keys only for external reviews.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-none shadow-md overflow-hidden">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="text-base font-bold">Recent Uploads</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {recentProjects?.map(project => (
                  <div key={project.id} className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors group">
                    <Link 
                      href={`/shared/${project.id}`} 
                      className="flex flex-1 items-center gap-3 min-w-0"
                    >
                      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate text-foreground">{project.title}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-medium">
                          Direct Access Enabled
                        </p>
                      </div>
                    </Link>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Project?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently remove "{project.title}" and free up {(project.fileSizeMB || 0).toFixed(2)} MB of storage.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteProject(project.id, project.fileSizeMB || 0, project.storagePath)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
                {(!recentProjects || recentProjects.length === 0) && (
                  <div className="p-8 text-center">
                    <FileText className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">No projects found.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
