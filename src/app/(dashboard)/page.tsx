
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
  AlertCircle
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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

export default function DashboardPage() {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setError("File size exceeds 500MB limit.");
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please select a file smaller than 500MB."
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

  const simulateUpload = () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          toast({
            title: "Upload complete!",
            description: `${file.name} is now part of your portfolio.`
          });
          // In a real app, redirect or update project list
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your large projects and share them securely.</p>
        </div>
        <Button className="gap-2 shadow-lg shadow-primary/20" asChild>
          <Link href="/dashboard/projects/new">
            <Plus className="w-4 h-4" />
            New Project
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-2 border-dashed border-muted bg-card/50 transition-colors">
            <CardHeader>
              <CardTitle>Project Upload</CardTitle>
              <CardDescription>Drag and drop your project assets (Max 500MB)</CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  relative border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all
                  ${isDragging ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-muted hover:border-primary/50 hover:bg-primary/5'}
                `}
              >
                <input 
                  type="file" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileChange}
                />
                
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-colors ${file ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  {file ? <File className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
                </div>

                {file ? (
                  <div className="space-y-2 w-full max-w-sm">
                    <p className="font-semibold text-lg truncate px-4">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
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
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="font-semibold text-lg">Click or drag file to this area to upload</p>
                    <p className="text-sm text-muted-foreground">Support for PDF, ZIP, DOCX, MP4 (Max 500MB)</p>
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-4 flex items-center gap-2 text-destructive text-sm bg-destructive/5 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              {file && !uploading && !error && (
                <Button className="w-full mt-6 h-12 text-lg" onClick={simulateUpload}>
                  Upload and Create Project
                </Button>
              )}

              {uploading && (
                <div className="mt-6 space-y-4">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="flex items-center gap-2"><Upload className="w-4 h-4 animate-bounce" /> Uploading...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-primary" />
                  Available Storage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">500 MB</div>
                <Progress value={24} className="h-1.5 mt-2" />
                <p className="text-[10px] text-muted-foreground mt-1">120MB used of 500MB limit</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  Security Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Encrypted</div>
                <div className="flex items-center gap-1.5 text-[10px] text-green-600 mt-2 font-medium">
                  <CheckCircle2 className="w-3 h-3" /> All share keys active
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle>Share Key Tip</CardTitle>
              <CardDescription className="text-primary-foreground/80">
                Share keys are 20-character strings used to grant secure access to private projects.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>1. Create a project</p>
              <p>2. Set visibility to Private</p>
              <p>3. Generate a Share Key</p>
              <p>4. Send key to your Mentor</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold">Recent Uploads</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {[1, 2].map(i => (
                  <div key={i} className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors">
                    <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-muted-foreground">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">project-archive-v{i}.zip</p>
                      <p className="text-[10px] text-muted-foreground">42 MB • 2 hours ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
