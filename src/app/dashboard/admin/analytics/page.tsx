"use client";

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { HardDrive, TrendingUp, Users } from 'lucide-react';

export default function StorageAnalyticsPage() {
  const firestore = useFirestore();

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'));
  }, [firestore]);

  const { data: users, isLoading } = useCollection(usersQuery);

  // Prepare chart data: Top 10 storage users
  const chartData = users
    ?.sort((a, b) => (b.storageUsedMB || 0) - (a.storageUsedMB || 0))
    .slice(0, 10)
    .map(u => ({
      name: u.name?.split(' ')[0] || 'Unknown',
      storage: parseFloat((u.storageUsedMB || 0).toFixed(2))
    })) || [];

  const totalStorage = users?.reduce((acc, u) => acc + (u.storageUsedMB || 0), 0) || 0;
  const avgStorage = users?.length ? totalStorage / users.length : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Storage Analytics</h1>
        <p className="text-muted-foreground mt-1">Detailed overview of resource consumption across the platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-primary" />
              Total Storage Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStorage.toFixed(2)} MB</div>
            <p className="text-xs text-muted-foreground mt-1">Sum of all user assets</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              Average Per User
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgStorage.toFixed(2)} MB</div>
            <p className="text-xs text-muted-foreground mt-1">Platform average consumption</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Total Consumers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Active registered accounts</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle>Top 10 Storage Consumers</CardTitle>
          <CardDescription>Users utilizing the most platform resources (MB).</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--muted)/0.1)' }}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="storage" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? 'hsl(var(--primary))' : 'hsl(var(--primary)/0.7)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
