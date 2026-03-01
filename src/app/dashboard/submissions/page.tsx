"use client";

import { useState } from 'react';
import { 
  FileCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Search,
  ExternalLink,
  MessageSquare,
  Filter
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  useCollection, 
  useFirestore, 
  useUser, 
  useMemoFirebase,
  useDoc
} from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import Link from 'next/link';

export default function SubmissionsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch user profile to check role
  const userDocRef = useMemoFirebase(() => {
    if (!user?.uid || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user?.uid, firestore]);

  const { data: userProfile } = useDoc(userDocRef);
  const isElevated = userProfile?.role === 'mentor' || userProfile?.role === 'admin';

  // Query projects based on role
  const projectsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    
    const baseRef = collection(firestore, 'projects_public');
    
    // If student, only show their own submissions
    if (!isElevated) {
      return query(baseRef, where('ownerId', '==', user.uid));
    }
    
    // If mentor/admin, show all (or could filter by status 'draft'/'pending' if implemented)
    return query(baseRef);
  }, [firestore, user, isElevated]);

  const { data: projects, isLoading } = useCollection(projectsQuery);

  const filteredProjects = projects?.filter(p => {
    const matchesSearch = p.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle2 className="w-3 h-3 mr-1" /> Approved</Badge>;
      case 'draft':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Draft</Badge>;
      case 'pending':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100"><AlertCircle className="w-3 h-3 mr-1" /> Pending</Badge>;
      default:
        return <Badge variant="outline">{status || 'Unknown'}</Badge>;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Project Reviews</h1>
          <p className="text-muted-foreground mt-1">
            {isElevated 
              ? "Review and provide feedback on student submissions." 
              : "Track the status of your project reviews and feedback."}
          </p>
        </div>
      </div>

      <Card className="border-none shadow-md overflow-hidden">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search projects..." 
                className="pl-10 h-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Information</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submission Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => (
                <TableRow key={project.id} className="group">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {project.title}
                      </span>
                      <span className="text-xs text-muted-foreground truncate max-w-xs">
                        {project.description}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(project.status)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {project.createdAt ? new Date(project.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" asChild className="h-8">
                        <Link href={`/shared/${project.id}`} className="gap-1.5">
                          <ExternalLink className="w-3.5 h-3.5" /> View
                        </Link>
                      </Button>
                      {isElevated && (
                        <Button variant="outline" size="sm" className="h-8 gap-1.5 border-primary/20 hover:bg-primary/5 hover:text-primary">
                          <MessageSquare className="w-3.5 h-3.5" /> Review
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {isLoading && [1, 2, 3].map((i) => (
                <TableRow key={i}>
                  <TableCell colSpan={4} className="h-16 animate-pulse bg-muted/10" />
                </TableRow>
              ))}

              {filteredProjects.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell colSpan={4} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3 opacity-40">
                      <FileCheck className="w-12 h-12 text-muted-foreground" />
                      <div className="space-y-1">
                        <p className="text-lg font-medium">No projects found</p>
                        <p className="text-sm">There are currently no projects matching your criteria.</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
