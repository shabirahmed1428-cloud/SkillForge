
"use client";

import { 
  Plus, 
  ArrowUpRight, 
  FileText, 
  MessageSquare, 
  Heart, 
  Eye,
  MoreVertical,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

const stats = [
  { label: 'Active Projects', value: '12', icon: FileText, trend: '+2 this month' },
  { label: 'Pending Reviews', value: '3', icon: ShieldCheck, trend: '1 requires action' },
  { label: 'Total Views', value: '1.2k', icon: Eye, trend: '+12% from last week' },
  { label: 'Likes Received', value: '45', icon: Heart, trend: 'Top 5% of users' },
];

const recentProjects = [
  {
    id: '1',
    title: 'Modern E-commerce Architecture',
    description: 'A comprehensive study on scalable e-commerce microservices using Next.js and Go.',
    status: 'In Review',
    visibility: 'Public',
    updatedAt: '2 hours ago',
    likes: 24,
    views: 156,
    tags: ['Next.js', 'Architecture']
  },
  {
    id: '2',
    title: 'SkillForge Design System',
    description: 'UI/UX components and design language for the SkillForge platform.',
    status: 'Draft',
    visibility: 'Private',
    updatedAt: 'Yesterday',
    likes: 0,
    views: 0,
    tags: ['Design', 'Figma']
  }
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, Jane!</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening with your projects today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="hidden sm:flex">View Portfolio</Button>
          <Button className="gap-2 shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" />
            Create Project
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Projects */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Recent Projects</h2>
            <Button variant="link" className="text-primary p-0">View all</Button>
          </div>
          
          <div className="grid gap-4">
            {recentProjects.map((project) => (
              <Card key={project.id} className="overflow-hidden group hover:shadow-md transition-shadow">
                <CardHeader className="p-5 flex flex-row items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {project.title}
                      </CardTitle>
                      <Badge variant={project.visibility === 'Public' ? 'default' : 'secondary'} className="text-[10px] h-4">
                        {project.visibility}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2 max-w-xl">
                      {project.description}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit Project</DropdownMenuItem>
                      <DropdownMenuItem>Share Link</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="px-5 pb-5 flex flex-wrap gap-2">
                  {project.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="bg-muted/50 font-normal">
                      {tag}
                    </Badge>
                  ))}
                </CardContent>
                <CardFooter className="px-5 py-3 bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {project.views}</span>
                    <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {project.likes}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {project.updatedAt}</span>
                  </div>
                  <Badge className="bg-accent/20 text-accent-foreground border-accent/20">
                    {project.status}
                  </Badge>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        {/* Sidebar Activity/Tips */}
        <div className="space-y-6">
          <Card className="bg-primary text-primary-foreground overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg">Upgrade to Pro</CardTitle>
              <CardDescription className="text-primary-foreground/80">
                Unlock 5GB of storage and priority support for your projects.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><ArrowUpRight className="w-3 h-3" /> 5GB Storage Quota</li>
                <li className="flex items-center gap-2"><ArrowUpRight className="w-3 h-3" /> Priority Mentor Review</li>
                <li className="flex items-center gap-2"><ArrowUpRight className="w-3 h-3" /> White-label Portfolio</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-white text-primary hover:bg-white/90">Upgrade Now</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Help</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded bg-accent/20 flex items-center justify-center text-accent shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Idea Assistant</p>
                  <p className="text-xs text-muted-foreground">Use AI to polish your project descriptions.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Safe Sharing</p>
                  <p className="text-xs text-muted-foreground">Generate temporary share keys for secure viewing.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
