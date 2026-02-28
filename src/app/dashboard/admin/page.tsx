"use client";

import { 
  Users, 
  TrendingUp, 
  HardDrive, 
  ShieldCheck, 
  FileText, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Search
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, limit } from 'firebase/firestore';

export default function AdminDashboardPage() {
  const firestore = useFirestore();

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'), limit(5));
  }, [firestore]);

  const { data: recentUsers, isLoading: usersLoading } = useCollection(usersQuery);

  const stats = [
    { 
      title: "Total Users", 
      value: "1,284", 
      change: "+12.5%", 
      trend: "up", 
      icon: Users,
      color: "text-blue-600"
    },
    { 
      title: "Storage Used", 
      value: "842.5 GB", 
      change: "+4.2%", 
      trend: "up", 
      icon: HardDrive,
      color: "text-purple-600"
    },
    { 
      title: "Active Projects", 
      value: "452", 
      change: "-2.1%", 
      trend: "down", 
      icon: FileText,
      color: "text-green-600"
    },
    { 
      title: "System Health", 
      value: "99.9%", 
      change: "Stable", 
      trend: "neutral", 
      icon: Activity,
      color: "text-orange-600"
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Console</h1>
        <p className="text-muted-foreground mt-1">Platform-wide oversight and management.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs mt-1 flex items-center gap-1">
                {stat.trend === 'up' && <ArrowUpRight className="w-3 h-3 text-green-500" />}
                {stat.trend === 'down' && <ArrowDownRight className="w-3 h-3 text-red-500" />}
                <span className={stat.trend === 'up' ? 'text-green-500' : stat.trend === 'down' ? 'text-red-500' : 'text-muted-foreground'}>
                  {stat.change}
                </span>
                <span className="text-muted-foreground ml-1">from last month</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Users Table */}
        <Card className="lg:col-span-2 border-none shadow-md overflow-hidden">
          <CardHeader className="bg-muted/30 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Recent Users</CardTitle>
                <CardDescription>Latest signups across the platform.</CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search users..." className="pl-9 h-9 w-[200px]" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentUsers?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{user.name}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">{user.role}</Badge>
                    </TableCell>
                    <TableCell className="capitalize">{user.subscriptionPlanId}</TableCell>
                    <TableCell>
                      <Badge variant={user.isBanned ? "destructive" : "outline"} className="bg-green-50 text-green-700 border-green-200">
                        {user.isBanned ? "Banned" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Manage</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {usersLoading && [1, 2, 3].map((i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5} className="h-12 animate-pulse bg-muted/20" />
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Security / System Alerts */}
        <div className="space-y-6">
          <Card className="border-none shadow-md bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="w-5 h-5" />
                Platform Security
              </CardTitle>
              <CardDescription className="text-primary-foreground/80">
                All systems functional. 0 suspicious activities detected in the last 24h.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full">Security Audit</Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-base font-bold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Users className="w-4 h-4" /> Export User Data
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <TrendingUp className="w-4 h-4" /> Generate Report
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10">
                <ShieldCheck className="w-4 h-4" /> Global Maintenance Mode
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}