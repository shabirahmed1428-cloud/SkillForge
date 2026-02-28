
"use client";

import { useState, useRef } from 'react';
import { 
  Users, 
  Lock, 
  Plus, 
  ShieldCheck, 
  ArrowRight,
  Loader2,
  FileText,
  Upload,
  Link as LinkIcon,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  useFirestore, 
  useUser, 
  useCollection, 
  useMemoFirebase,
  setDocumentNonBlocking,
  addDocumentNonBlocking
} from '@/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  serverTimestamp,
  DocumentData
} from 'firebase/firestore';

export default function TeamHubPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [authenticatedTeam, setAuthenticatedTeam] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'create'>('login');
  
  // Login/Create form state
  const [teamName, setTeamName] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !user) return;
    setLoading(true);

    try {
      if (mode === 'login') {
        const q = query(
          collection(firestore, 'teams'),
          where('name', '==', teamName)
        );
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          throw new Error('Team not found.');
        }

        const teamData = snapshot.docs[0].data();
        if (teamData.password !== password) {
          throw new Error('Incorrect password.');
        }

        setAuthenticatedTeam({ ...teamData, id: snapshot.docs[0].id });
        toast({ title: "Authenticated", description: `Welcome to ${teamName}` });
      } else {
        // Check if name exists
        const q = query(collection(firestore, 'teams'), where('name', '==', teamName));
        const checkSnap = await getDocs(q);
        if (!checkSnap.empty) {
          throw new Error('Team name already taken.');
        }

        const teamId = doc(collection(firestore, 'teams')).id;
        const newTeam = {
          id: teamId,
          name: teamName,
          password: password,
          ownerId: user.uid,
          createdAt: new Date().toISOString()
        };

        setDocumentNonBlocking(doc(firestore, 'teams', teamId), {
          ...newTeam,
          createdAt: serverTimestamp()
        }, { merge: true });

        setAuthenticatedTeam(newTeam);
        toast({ title: "Team Created", description: `You are now the owner of ${teamName}` });
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  if (!authenticatedTeam) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl font-bold">Team Hub Access</CardTitle>
            <CardDescription>
              {mode === 'login' 
                ? "Enter your team details to access the hub." 
                : "Create a new private hub for your team."}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleAuth}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teamName">Team Name</Label>
                <Input 
                  id="teamName" 
                  placeholder="e.g. Design Ninjas" 
                  required 
                  value={teamName}
                  onChange={e => setTeamName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10" 
                    required 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {mode === 'login' ? 'Validate & Enter' : 'Create Team Hub'}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                className="text-sm"
                onClick={() => setMode(mode === 'login' ? 'create' : 'login')}
              >
                {mode === 'login' ? "Don't have a team? Create one" : "Already have a team? Sign in"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold mb-1">
            <Users className="w-4 h-4" /> Team Hub
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{authenticatedTeam.name}</h1>
          <p className="text-muted-foreground mt-1">Collaborate and share projects within this private space.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setAuthenticatedTeam(null)}>
            Exit Hub
          </Button>
          <TeamProjectUpload teamId={authenticatedTeam.id} />
        </div>
      </div>

      <TeamProjectsList teamId={authenticatedTeam.id} />
    </div>
  );
}

function TeamProjectsList({ teamId }: { teamId: string }) {
  const firestore = useFirestore();
  const projectsQuery = useMemoFirebase(() => {
    if (!firestore || !teamId) return null;
    return collection(firestore, 'teams', teamId, 'projects');
  }, [firestore, teamId]);

  const { data: projects, isLoading } = useCollection(projectsQuery);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <Card className="border-dashed py-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <CardTitle className="text-xl">No team projects yet</CardTitle>
        <CardDescription>Start by uploading a project or adding a link to this hub.</CardDescription>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project: any) => (
        <Card key={project.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <Badge variant="outline" className="text-[10px] uppercase">Team Asset</Badge>
              <LinkIcon className="w-4 h-4 text-muted-foreground" />
            </div>
            <CardTitle className="text-lg mt-2">{project.title}</CardTitle>
            <CardDescription className="line-clamp-2">{project.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="w-3 h-3" />
              Shared with team
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="secondary" className="w-full" asChild>
              <a href={project.fileURL} target="_blank" rel="noopener noreferrer">View Resource</a>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

function TeamProjectUpload({ teamId }: { teamId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: ''
  });

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore) return;
    setLoading(true);

    try {
      const colRef = collection(firestore, 'teams', teamId, 'projects');
      const projectData = {
        title: formData.title,
        description: formData.description,
        fileURL: formData.url,
        ownerId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        visibility: 'team',
        status: 'published'
      };

      await addDocumentNonBlocking(colRef, projectData);
      
      toast({ title: "Resource Added", description: "Successfully shared with your team." });
      setOpen(false);
      setFormData({ title: '', description: '', url: '' });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button className="gap-2" onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4" /> Add Link/Asset
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-md animate-in zoom-in-95 duration-200">
            <CardHeader>
              <CardTitle>Share with Team</CardTitle>
              <CardDescription>Add a project link or asset for your team members.</CardDescription>
            </CardHeader>
            <form onSubmit={handleUpload}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input 
                    required 
                    placeholder="Project Title"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Resource URL</Label>
                  <Input 
                    required 
                    type="url" 
                    placeholder="https://..."
                    value={formData.url}
                    onChange={e => setFormData({...formData, url: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Short Description</Label>
                  <Input 
                    placeholder="What is this about?"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Share
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </>
  );
}

function Badge({ children, variant, className }: any) {
  const styles = variant === 'outline' ? 'border-border text-foreground' : 'bg-primary text-primary-foreground';
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${styles} ${className}`}>
      {children}
    </span>
  );
}
