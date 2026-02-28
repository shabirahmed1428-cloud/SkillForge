
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Eye, 
  Lock, 
  Users,
  Key,
  RefreshCw,
  Copy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function NewProjectPage() {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [shareKey, setShareKey] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    visibility: 'public'
  });

  const generateSecureKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 20; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setShareKey(result);
    toast({
      title: "Key Generated",
      description: "Secure 20-character key is ready."
    });
  };

  const copyKey = () => {
    navigator.clipboard.writeText(shareKey);
    toast({
      title: "Copied!",
      description: "Key copied to clipboard."
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const projectId = doc(collection(firestore, 'projects_public')).id;
      const projectRef = formData.visibility === 'public' 
        ? doc(firestore, 'projects_public', projectId)
        : doc(firestore, 'users', user.uid, 'projects', projectId);

      const projectData = {
        id: projectId,
        title: formData.title,
        description: formData.description,
        ownerId: user.uid,
        visibility: formData.visibility,
        status: 'draft',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        likesCount: 0,
        viewsCount: 0,
        fileURL: 'https://placeholder.com/file',
        fileSizeMB: 0,
        shareKey: shareKey || '',
        shareKeyEnabled: !!shareKey
      };

      await setDoc(projectRef, projectData);

      if (shareKey) {
        await setDoc(doc(firestore, 'share_keys', shareKey), {
          id: shareKey,
          projectId: projectId,
          projectPath: projectRef.path,
          createdAt: serverTimestamp()
        });
      }

      toast({
        title: "Project Created",
        description: "Your portfolio item is now live.",
      });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create project."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <Button variant="ghost" className="gap-2 -ml-2 text-muted-foreground" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Project</h1>
        <p className="text-muted-foreground">Add details to build your portfolio.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  placeholder="e.g. Fullstack E-commerce Platform" 
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Describe your role, tech stack, and results..." 
                  className="min-h-[150px]"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5 text-primary" />
                Secure Share Key
              </CardTitle>
              <CardDescription>Generate a special key to share private projects.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-2">
                <Input 
                  value={shareKey} 
                  readOnly 
                  placeholder="Click generate to get a secure key"
                  className="font-mono text-sm"
                />
                <Button type="button" variant="outline" size="icon" onClick={generateSecureKey}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
                {shareKey && (
                  <Button type="button" variant="outline" size="icon" onClick={copyKey}>
                    <Copy className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground italic">
                * Note: Access is granted only if the visitor provides this exact key.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Visibility</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                defaultValue="public" 
                className="grid gap-3"
                onValueChange={v => setFormData({...formData, visibility: v})}
              >
                {[
                  { id: 'public', label: 'Public', icon: Eye, desc: 'Anyone can see' },
                  { id: 'private', label: 'Private', icon: Lock, desc: 'Key-only access' },
                  { id: 'team', label: 'Team', icon: Users, desc: 'Shared with team' }
                ].map((item) => (
                  <div key={item.id}>
                    <RadioGroupItem value={item.id} id={item.id} className="peer sr-only" />
                    <Label
                      htmlFor={item.id}
                      className="flex items-center gap-3 rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent peer-data-[state=checked]:border-primary cursor-pointer transition-colors"
                    >
                      <item.icon className="w-4 h-4 text-muted-foreground" />
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold">{item.label}</p>
                        <p className="text-[10px] text-muted-foreground leading-none">{item.desc}</p>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Button type="submit" className="w-full h-11 text-base shadow-lg shadow-primary/20" disabled={loading}>
              {loading ? 'Creating...' : 'Publish Project'}
            </Button>
            <Button variant="outline" type="button" className="w-full" onClick={() => router.push('/dashboard')}>
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
