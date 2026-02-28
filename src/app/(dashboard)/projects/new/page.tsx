
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Upload, 
  Sparkles, 
  Eye, 
  Lock, 
  Users,
  FileText,
  Info
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
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { generateProjectDescription } from '@/ai/flows/generate-project-description-flow';

export default function NewProjectPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    visibility: 'public',
    tags: ''
  });

  const handleAiAssist = async () => {
    if (!formData.title && !formData.description) {
      toast({
        title: "Input required",
        description: "Please provide at least a title or a brief outline for the AI to work with.",
        variant: "destructive"
      });
      return;
    }

    setAiGenerating(true);
    try {
      const result = await generateProjectDescription({
        outline: formData.description || formData.title,
        keywords: formData.tags
      });
      
      setFormData(prev => ({
        ...prev,
        description: result.projectDescription
      }));
      
      toast({
        title: "AI Generation Complete",
        description: "We've enhanced your project description.",
      });
    } catch (error) {
      toast({
        title: "AI Helper Error",
        description: "Could not generate description at this time.",
        variant: "destructive"
      });
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Logic for Firebase Firestore upload would go here
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Project Created",
        description: "Your project has been successfully saved.",
      });
      router.push('/dashboard/projects');
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" className="gap-2 -ml-2 text-muted-foreground" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Project</h1>
          <p className="text-muted-foreground">Share your brilliance with the world.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>Basic information about your project.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Project Title</Label>
                <Input 
                  id="title" 
                  placeholder="e.g. SkillForge SaaS Architecture" 
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description">Description</Label>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="text-primary h-7 gap-1"
                    onClick={handleAiAssist}
                    disabled={aiGenerating}
                  >
                    <Sparkles className="w-3 h-3" />
                    {aiGenerating ? 'Generating...' : 'AI Enhance'}
                  </Button>
                </div>
                <Textarea 
                  id="description" 
                  placeholder="Describe your project, objectives and key features..." 
                  className="min-h-[200px] resize-none"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  required
                />
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Use the AI Assist button to automatically structure and enhance your description.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (Comma separated)</Label>
                <Input 
                  id="tags" 
                  placeholder="e.g. NextJS, Firebase, SaaS" 
                  value={formData.tags}
                  onChange={e => setFormData({...formData, tags: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Files & Assets</CardTitle>
              <CardDescription>Upload supporting files (Max 500MB per file).</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-muted rounded-xl p-10 flex flex-col items-center justify-center text-center space-y-4 hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer group">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground">PDF, ZIP, DOCX or MP4 up to 500MB</p>
                </div>
                <Button variant="outline" type="button" size="sm">Select Files</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Visibility</CardTitle>
              <CardDescription>Who can see this project?</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                defaultValue="public" 
                className="grid gap-4"
                onValueChange={v => setFormData({...formData, visibility: v})}
              >
                <div>
                  <RadioGroupItem value="public" id="v-public" className="peer sr-only" />
                  <Label
                    htmlFor="v-public"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <Eye className="w-5 h-5 text-primary" />
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold">Public</p>
                        <p className="text-xs text-muted-foreground leading-none">Visible to everyone</p>
                      </div>
                    </div>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="private" id="v-private" className="peer sr-only" />
                  <Label
                    htmlFor="v-private"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <Lock className="w-5 h-5 text-muted-foreground" />
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold">Private</p>
                        <p className="text-xs text-muted-foreground leading-none">Only you can see this</p>
                      </div>
                    </div>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="team" id="v-team" className="peer sr-only" />
                  <Label
                    htmlFor="v-team"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <Users className="w-5 h-5 text-muted-foreground" />
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold">Team Only</p>
                        <p className="text-xs text-muted-foreground leading-none">Your team members</p>
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Submission</CardTitle>
              <CardDescription>Submit for mentor review?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select Mentor (Optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="m1">Alex Rivera (System Design)</SelectItem>
                  <SelectItem value="m2">Sarah Chen (Frontend Architecture)</SelectItem>
                  <SelectItem value="m3">David Miller (DevOps & Scale)</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3">
            <Button type="submit" className="w-full h-11 text-base shadow-lg shadow-primary/20" disabled={loading}>
              {loading ? 'Creating Project...' : 'Publish Project'}
            </Button>
            <Button variant="outline" type="button" className="w-full" disabled={loading} onClick={() => router.push('/dashboard')}>
              Save as Draft
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
